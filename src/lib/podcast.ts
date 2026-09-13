import { createServerFn } from "@tanstack/react-start";
import { SITE } from "@/data/site";

export type Tape = {
  id: string;
  ep?: number;
  title: string;
  date: string;
  blurb: string;
  audioUrl: string;
  duration: string;
  durationSec: number;
  pageUrl: string;
};

const TTL_MS = 5 * 60 * 1000;
let cache: { at: number; data: Tape[] } | null = null;

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

function tag(block: string, name: string) {
  const m = block.match(
    new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"),
  );
  return decode((m?.[1] ?? "").trim());
}

function attr(block: string, name: string, key: string) {
  const m = block.match(
    new RegExp(`<${name}[^>]*\\s${key}="([^"]+)"`, "i"),
  );
  return m?.[1] ?? "";
}

function stripHtml(s: string) {
  return decode(s)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDuration(raw: string) {
  const p = raw.split(":").map((n) => Number(n) || 0);
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
  if (p.length === 2) return p[0] * 60 + p[1];
  return p[0] || 0;
}

function clock(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h) return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function formatTapeClock(sec: number) {
  return clock(sec);
}

export function parsePodcastFeed(xml: string): Tape[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  const tapes: Tape[] = [];
  for (const [, body] of items) {
    const audioUrl = attr(body, "enclosure", "url");
    if (!audioUrl) continue;
    const title = stripHtml(tag(body, "title")) || "Untitled tape";
    const guid = stripHtml(tag(body, "guid")) || audioUrl;
    const pub = stripHtml(tag(body, "pubDate"));
    const date = pub ? new Date(pub).toISOString().slice(0, 10) : "";
    const durRaw = stripHtml(tag(body, "itunes:duration"));
    const durationSec = parseDuration(durRaw);
    tapes.push({
      id: guid,
      title,
      date,
      blurb: stripHtml(tag(body, "description") || tag(body, "itunes:summary")),
      audioUrl,
      duration: durationSec ? clock(durationSec) : durRaw,
      durationSec,
      pageUrl: stripHtml(tag(body, "link")),
    });
  }
  tapes.sort((a, b) => {
    const d = (a.date || "").localeCompare(b.date || "");
    if (d) return d;
    return a.id.localeCompare(b.id);
  });
  tapes.forEach((t, i) => {
    t.ep = i + 1;
  });
  return tapes.reverse();
}

async function pull(fresh = false): Promise<Tape[]> {
  if (!fresh && cache && Date.now() - cache.at < TTL_MS) return cache.data;
  try {
    const res = await fetch(SITE.podcastRss, {
      headers: { "user-agent": "MelonDropMotel/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`podcast ${res.status}`);
    const data = parsePodcastFeed(await res.text());
    cache = { at: Date.now(), data };
    return data;
  } catch {
    return cache?.data ?? [];
  }
}

export async function loadPodcastEpisodes(fresh = false) {
  return pull(fresh);
}

export const getPodcastEpisodes = createServerFn({ method: "GET" })
  .validator((d: unknown) => {
    if (!d || typeof d !== "object") return { fresh: false };
    return { fresh: Boolean((d as { fresh?: boolean }).fresh) };
  })
  .handler(async ({ data }) => pull(data.fresh));
