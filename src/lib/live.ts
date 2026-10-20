import { createServerFn } from "@tanstack/react-start";
import { EPISODES, SITE } from "@/data/site";
import {
  mergeVods,
  parseDuration,
  pickPlayer,
  type LiveNow,
  type LiveVod,
  type MergedVod,
  type PlayerChoice,
} from "@/lib/live-merge";
import { loadTwitchChannel } from "@/lib/twitch";

/**
 * Live page data: who is live (Twitch / YouTube) + one merged VOD list.
 * Server-only; keys never reach the client. Cached in memory per instance.
 *
 * Env (all optional, set in Vercel > Project > Settings > Environment Variables):
 *   TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET  Twitch Helix, app access token (client credentials)
 *   TWITCH_BROADCASTER_ID                   optional, skips the /users lookup
 *   YOUTUBE_API_KEY                         YouTube Data API v3 key (videos/playlistItems)
 * Without keys: Twitch falls back to the site's existing public lookup (lib/twitch.ts),
 * YouTube live + past live VODs are read from the channel's public /streams tab and watch pages.
 */

export type LiveState = {
  player: PlayerChoice;
  now: LiveNow;
  vods: MergedVod[];
  /** which sources answered, for the footnote */
  sources: { twitch: "helix" | "public" | "none"; youtube: "api" | "page" | "none" };
  mock?: string;
};

const TTL_MS = 2 * 60 * 1000;
let cache: { at: number; data: LiveState } | null = null;
const env = (k: string) => (typeof process !== "undefined" ? process.env[k] : undefined) || "";

/* ---------------- Twitch ---------------- */

let appToken: { token: string; exp: number } | null = null;

async function helixToken(id: string, secret: string) {
  if (appToken && Date.now() < appToken.exp - 60_000) return appToken.token;
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: "client_credentials" }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`twitch token ${res.status}`);
  const j = (await res.json()) as { access_token: string; expires_in: number };
  appToken = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return appToken.token;
}

async function helix<T>(path: string, id: string, token: string): Promise<T> {
  const res = await fetch(`https://api.twitch.tv/helix/${path}`, {
    headers: { "Client-Id": id, Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(8000),
  });
  if (res.status === 401) appToken = null;
  if (!res.ok) throw new Error(`helix ${path} ${res.status}`);
  return (await res.json()) as T;
}

const twitchThumb = (u: string) => u.replace("%{width}", "640").replace("%{height}", "360");

async function twitchData(): Promise<{ live: LiveNow["twitch"]; vods: LiveVod[]; src: LiveState["sources"]["twitch"] }> {
  const id = env("TWITCH_CLIENT_ID"),
    secret = env("TWITCH_CLIENT_SECRET");
  if (id && secret) {
    try {
      const token = await helixToken(id, secret);
      let uid = env("TWITCH_BROADCASTER_ID");
      if (!uid) {
        const u = await helix<{ data: { id: string }[] }>(`users?login=${SITE.twitchHandle}`, id, token);
        uid = u.data[0]?.id ?? "";
      }
      const [streams, videos] = await Promise.all([
        helix<{ data: { title: string; viewer_count: number }[] }>(`streams?user_id=${uid}`, id, token),
        helix<{ data: { id: string; title: string; created_at: string; duration: string; thumbnail_url: string; url: string }[] }>(
          `videos?user_id=${uid}&type=archive&first=20`,
          id,
          token,
        ),
      ]);
      const s = streams.data[0];
      return {
        live: s ? { live: true, title: s.title, viewers: s.viewer_count } : { live: false },
        vods: videos.data.map((v) => ({
          platform: "twitch",
          id: v.id,
          title: v.title,
          startedAt: v.created_at,
          seconds: parseDuration(v.duration),
          thumb: twitchThumb(v.thumbnail_url),
          url: v.url,
        })),
        src: "helix",
      };
    } catch {
      /* fall through to the public lookup */
    }
  }
  try {
    const c = await loadTwitchChannel();
    return {
      live: { live: c.live, title: c.title, viewers: c.viewers },
      vods: c.vods.map((v) => ({
        platform: "twitch",
        id: v.id,
        title: v.title,
        startedAt: v.startedAt || (v.date ? `${v.date}T00:00:00Z` : ""),
        seconds: v.seconds,
        thumb: v.thumb,
        url: `https://www.twitch.tv/videos/${v.id}`,
      })),
      src: "public",
    };
  } catch {
    return { live: { live: false }, vods: [], src: "none" };
  }
}

/* ---------------- YouTube ---------------- */

type YtVideo = {
  id: string;
  snippet: { title: string; liveBroadcastContent: string; thumbnails: Record<string, { url: string }> };
  contentDetails?: { duration: string };
  liveStreamingDetails?: { actualStartTime?: string; actualEndTime?: string; concurrentViewers?: string };
};

async function youtubeData(): Promise<{ live: LiveNow["youtube"]; vods: LiveVod[]; src: LiveState["sources"]["youtube"] }> {
  const key = env("YOUTUBE_API_KEY");
  const channel = SITE.youtubeChannelId;
  if (key) {
    try {
      // uploads playlist = channel id with UC -> UU (1 quota unit), then videos.list (1 unit)
      const uploads = `UU${channel.slice(2)}`;
      const pl = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${uploads}&key=${key}`,
        { signal: AbortSignal.timeout(8000) },
      ).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`yt ${r.status}`))));
      const ids = (pl.items ?? []).map((i: { contentDetails: { videoId: string } }) => i.contentDetails.videoId).join(",");
      const vs = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,liveStreamingDetails&id=${ids}&key=${key}`,
        { signal: AbortSignal.timeout(8000) },
      ).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`yt ${r.status}`))));
      const items = (vs.items ?? []) as YtVideo[];
      const liveNow = items.find(
        (v) => v.snippet.liveBroadcastContent === "live" && v.liveStreamingDetails?.actualStartTime && !v.liveStreamingDetails.actualEndTime,
      );
      const vods = items
        .filter((v) => v.liveStreamingDetails?.actualStartTime && v.liveStreamingDetails.actualEndTime)
        .map<LiveVod>((v) => ({
          platform: "youtube",
          id: v.id,
          title: v.snippet.title,
          startedAt: v.liveStreamingDetails!.actualStartTime!,
          seconds: parseDuration(v.contentDetails?.duration),
          thumb: v.snippet.thumbnails.maxres?.url ?? v.snippet.thumbnails.high?.url ?? `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${v.id}`,
        }));
      return {
        live: liveNow
          ? {
              live: true,
              videoId: liveNow.id,
              title: liveNow.snippet.title,
              viewers: Number(liveNow.liveStreamingDetails?.concurrentViewers ?? 0),
            }
          : { live: false },
        vods,
        src: "api",
      };
    } catch {
      /* fall through */
    }
  }
  // keyless: the channel's public "Live" (/streams) tab lists past + current broadcasts;
  // each watch page then gives the exact start/end time and length for dedup.
  try {
    return { ...(await youtubeKeyless(channel)), src: "page" };
  } catch {
    return { live: { live: false }, vods: [], src: "none" };
  }
}

const YT_HEADERS = { "user-agent": "Mozilla/5.0 (MelonDropMotel live check)", "accept-language": "en" };

function initialData(html: string): unknown {
  const m = /var ytInitialData = (\{.*?\});<\/script>/s.exec(html);
  return m ? JSON.parse(m[1]) : null;
}

function collect(o: unknown, key: string, out: Record<string, unknown>[] = []) {
  if (Array.isArray(o)) o.forEach((x) => collect(x, key, out));
  else if (o && typeof o === "object") {
    const r = o as Record<string, unknown>;
    if (r[key] && typeof r[key] === "object") out.push(r[key] as Record<string, unknown>);
    for (const v of Object.values(r)) collect(v, key, out);
  }
  return out;
}

async function youtubeKeyless(channel: string): Promise<{ live: LiveNow["youtube"]; vods: LiveVod[] }> {
  const html = await fetch(`https://www.youtube.com/channel/${channel}/streams`, {
    headers: YT_HEADERS,
    signal: AbortSignal.timeout(8000),
  }).then((r) => (r.ok ? r.text() : Promise.reject(new Error(`yt streams ${r.status}`))));
  const lockups = collect(initialData(html), "lockupViewModel");
  const list = lockups
    .map((l) => {
      const id = String(l.contentId ?? "");
      const meta = (l.metadata as { lockupMetadataViewModel?: { title?: { content?: string } } })?.lockupMetadataViewModel;
      return { id, title: meta?.title?.content ?? "" };
    })
    .filter((v, i, a) => /^[\w-]{11}$/.test(v.id) && v.title && a.findIndex((x) => x.id === v.id) === i)
    .slice(0, 30);

  let live: LiveNow["youtube"] = { live: false };
  const vods: LiveVod[] = [];
  await Promise.all(
    list.map(async (v) => {
      try {
        const w = await fetch(`https://www.youtube.com/watch?v=${v.id}`, {
          headers: YT_HEADERS,
          signal: AbortSignal.timeout(8000),
        }).then((r) => r.text());
        const lb = /"liveBroadcastDetails":(\{[^}]*\})/.exec(w)?.[1];
        const d = lb ? (JSON.parse(lb) as { isLiveNow?: boolean; startTimestamp?: string; endTimestamp?: string }) : null;
        if (!d?.startTimestamp) return;
        if (d.isLiveNow) {
          live = { live: true, videoId: v.id, title: v.title };
          return;
        }
        if (!d.endTimestamp) return; // upcoming / scheduled
        const len = Number(/"lengthSeconds":"(\d+)"/.exec(w)?.[1] ?? 0);
        vods.push({
          platform: "youtube",
          id: v.id,
          title: v.title,
          startedAt: new Date(d.startTimestamp).toISOString(),
          seconds: len || Math.round((Date.parse(d.endTimestamp) - Date.parse(d.startTimestamp)) / 1000),
          thumb: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${v.id}`,
        });
      } catch {
        /* skip this one */
      }
    }),
  );
  return { live, vods };
}

/* ---------------- preview-only mock ---------------- */

export const LIVE_MOCKS = ["twitch", "youtube", "both", "off"] as const;
export type LiveMock = (typeof LIVE_MOCKS)[number];

/** never in production; on for local dev and Vercel preview deployments */
export const mockAllowed = () => env("VERCEL_ENV") !== "production";

function mockState(kind: LiveMock): LiveState {
  const ep = EPISODES.slice(0, 4);
  const day = (n: number, h: number) => new Date(Date.UTC(2026, 9, n, h + 8)).toISOString();
  const yt = (i: number, n: number, secs: number): LiveVod => ({
    platform: "youtube",
    id: `${ep[i].id}`,
    title: `${ep[i].title} (mock stream)`,
    startedAt: day(n, 19),
    seconds: secs,
    thumb: `https://i.ytimg.com/vi/${ep[i].id}/hqdefault.jpg`,
    url: `https://www.youtube.com/watch?v=${ep[i].id}`,
  });
  const youtube = [yt(0, 16, 2 * 3600 + 5 * 60), yt(1, 9, 95 * 60)];
  const twitch: LiveVod[] = [
    // same broadcast as youtube[0]: started 2 min earlier, 3 min longer -> folds into the YouTube entry
    { ...yt(0, 16, 2 * 3600 + 8 * 60), platform: "twitch", id: "mock-tw-1", startedAt: new Date(Date.parse(day(16, 19)) - 120000).toISOString(), url: SITE.twitchUrl },
    // Twitch-only late stream the same night, 3 h after -> stays separate
    { ...yt(2, 16, 70 * 60), platform: "twitch", id: "mock-tw-2", title: "Late movie night (mock stream)", startedAt: day(16, 22), url: SITE.twitchUrl },
    { ...yt(3, 2, 3 * 3600), platform: "twitch", id: "mock-tw-3", title: "Lobby hangout (mock stream)", url: SITE.twitchUrl },
  ];
  const now: LiveNow = {
    twitch: kind === "twitch" || kind === "both" ? { live: true, title: "Movie night (mock)", viewers: 42 } : { live: false },
    youtube:
      kind === "youtube" || kind === "both"
        ? { live: true, videoId: ep[0].id, title: `${ep[0].title} (mock live)`, viewers: 17 }
        : { live: false },
  };
  return {
    player: pickPlayer(now),
    now,
    vods: mergeVods(youtube, twitch),
    sources: { twitch: "none", youtube: "none" },
    mock: kind,
  };
}

/* ---------------- entry ---------------- */

async function pull(fresh = false): Promise<LiveState> {
  if (!fresh && cache && Date.now() - cache.at < TTL_MS) return cache.data;
  const [tw, yt] = await Promise.all([twitchData(), youtubeData()]);
  const now: LiveNow = { twitch: tw.live, youtube: yt.live };
  const data: LiveState = {
    player: pickPlayer(now),
    now,
    vods: mergeVods(yt.vods, tw.vods),
    sources: { twitch: tw.src, youtube: yt.src },
  };
  cache = { at: Date.now(), data };
  return data;
}

export const getLiveState = createServerFn({ method: "GET" })
  .validator((d: unknown) => {
    const o = (d && typeof d === "object" ? d : {}) as { fresh?: boolean; mock?: string };
    const mock = LIVE_MOCKS.includes(o.mock as LiveMock) ? (o.mock as LiveMock) : undefined;
    return { fresh: Boolean(o.fresh), mock };
  })
  .handler(async ({ data }) => {
    if (data.mock && mockAllowed()) return mockState(data.mock);
    return pull(data.fresh);
  });
