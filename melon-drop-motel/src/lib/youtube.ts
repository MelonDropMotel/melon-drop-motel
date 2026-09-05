import { createServerFn } from "@tanstack/react-start";
import { CLIPS, EPISODES, LATEST, SITE, type Video } from "@/data/site";

export type ChannelCatalog = {
  episodes: Video[];
  clips: Video[];
  latest: Video;
};

const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${SITE.youtubeChannelId}`;
const TTL_MS = 5 * 60 * 1000;

let cache: { at: number; data: ChannelCatalog } | null = null;

function decode(s: string) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(
    /&(#x[0-9a-fA-F]+|#\d+|[a-z]+);/g,
    (_, name: string) => {
      if (name === "amp") return "&";
      if (name === "lt") return "<";
      if (name === "gt") return ">";
      if (name === "quot") return '"';
      if (name === "apos") return "'";
      if (name.startsWith("#x")) {
        return String.fromCharCode(Number.parseInt(name.slice(2), 16));
      }
      if (name.startsWith("#")) {
        return String.fromCharCode(Number(name.slice(1)));
      }
      return name;
    },
  );
}

function stripHashtags(s: string) {
  return s
    .replace(/#[\p{L}\p{N}_]+/gu, "")
    .replace(/\s+/g, " ")
    .replace(/[.,;:!?]+$/g, "")
    .trim();
}

function cleanTitle(raw: string) {
  return stripHashtags(
    raw
      .replace(/\s*\[[^\]]*(?:MELON\s*DROP|MDM|PODCAST)[^\]]*\]\s*/gi, " ")
      .replace(/\s*EP\.?\s*\d+\s*/gi, " ")
      .replace(/\s+[|\u2013\u2014]\s+.*$/, "")
      .replace(/\s+/g, " "),
  );
}

function episodeFromTitle(rawTitle: string): { title: string; ep: number } | null {
  const stripped = rawTitle
    .replace(/\s*\[[^\]]*(?:MELON\s*DROP|MDM|PODCAST)[^\]]*\]\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const fromEnd = stripped.match(/^(.*?)(?:\s+EP\.?\s*0*(\d+))\s*$/i);
  if (fromEnd?.[1]) {
    return { ep: Number(fromEnd[2]), title: cleanTitle(fromEnd[1]) };
  }

  const fromStart = stripped.match(/^EP\.?\s*0*(\d+)\s+(.+)$/i);
  if (fromStart) {
    return { ep: Number(fromStart[1]), title: cleanTitle(fromStart[2]) };
  }

  return null;
}

function cleanDescription(desc: string) {
  const body = desc.split(/Tags for algo/i)[0] ?? desc;
  const stop =
    /^(FOLLOW US|TWITCH:|INSTAGRAM:|TIKTOK:|REDDIT:|X:|If you stuck|SUBSCRIBE)/i;
  const drop =
    /^(MELON DROP MOTEL PODCAST\b|\d{1,2}\/\d{4}|🍉+$)/i;
  const chapter = /^\d{1,2}:\d{2}(?::\d{2})?\s+\S/;
  const lines: string[] = [];
  for (const line of body.split(/\n/)) {
    const t = line.trim();
    if (!t) {
      if (lines.length && lines[lines.length - 1] !== "") lines.push("");
      continue;
    }
    if (stop.test(t)) break;
    if (drop.test(t) || chapter.test(t)) continue;
    if (/^#/.test(t) && !stripHashtags(t)) continue;
    lines.push(stripHashtags(t) || t);
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function knownEpisodes() {
  const map = new Map<string, Video>();
  for (const v of EPISODES) map.set(v.id, v);
  return map;
}

function fallback(): ChannelCatalog {
  return { episodes: EPISODES, clips: CLIPS, latest: LATEST };
}

export function mergeFeed(xml: string): ChannelCatalog {
  const known = knownEpisodes();
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];
  const fromFeed: Video[] = [];

  for (const [, body] of entries) {
    const id = body.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    if (!id) continue;
    const rawTitle = decode(body.match(/<title>([^<]+)<\/title>/)?.[1] ?? "").trim();
    const published = body.match(/<published>([^<]+)<\/published>/)?.[1];
    const desc = decode(
      body.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] ??
        "",
    ).trim();
    const isShort = /\/shorts\//.test(body);
    const parsed = isShort ? null : episodeFromTitle(rawTitle);
    if (!isShort && !parsed && /\b(?:live\s*(?:stream|show|nite|night)|livestream|streams?)\b/i.test(rawTitle)) {
      continue;
    }
    const hit = known.get(id);
    const date = published ? published.slice(0, 10) : (hit?.date ?? "");

    if (parsed) {
      fromFeed.push({
        id,
        date,
        kind: "episode",
        ep: parsed.ep,
        title: parsed.title || cleanTitle(rawTitle),
        blurb: cleanDescription(desc),
      });
    } else {
      fromFeed.push({
        id,
        date,
        kind: "clip",
        title: cleanTitle(rawTitle) || rawTitle,
        blurb: cleanDescription(desc),
      });
    }
  }

  const seen = new Set(fromFeed.map((v) => v.id));
  const archived = EPISODES.filter((v) => !seen.has(v.id)).map((v) => ({
    ...v,
    title: cleanTitle(v.title) || v.title,
  }));
  const episodes = [
    ...fromFeed.filter((v) => v.kind === "episode"),
    ...archived,
  ];
  const clips = fromFeed.filter((v) => v.kind === "clip");
  const latest = episodes[0] ?? fromFeed[0] ?? LATEST;
  return { episodes, clips, latest };
}

async function pull(fresh = false): Promise<ChannelCatalog> {
  if (!fresh && cache && Date.now() - cache.at < TTL_MS) return cache.data;
  try {
    const res = await fetch(FEED, {
      headers: { "user-agent": "MelonDropMotel/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`feed ${res.status}`);
    const data = mergeFeed(await res.text());
    cache = { at: Date.now(), data };
    return data;
  } catch {
    return cache?.data ?? fallback();
  }
}

export const getChannelVideos = createServerFn({ method: "GET" })
  .validator((d: unknown) => {
    if (!d || typeof d !== "object") return { fresh: false };
    return { fresh: Boolean((d as { fresh?: boolean }).fresh) };
  })
  .handler(async ({ data }) => pull(data.fresh));
