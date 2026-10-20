/**
 * Pure helpers for the Live page: which player to show, and one merged VOD list
 * from YouTube + Twitch with dual-streamed broadcasts collapsed into a single
 * entry (YouTube preferred, "also on Twitch" kept as a link). No I/O here, so it
 * is unit tested in scripts/live-merge.test.mjs.
 */

export type Platform = "youtube" | "twitch";

export type LiveVod = {
  platform: Platform;
  id: string;
  title: string;
  /** broadcast start, ISO 8601 */
  startedAt: string;
  /** length in seconds (0 = unknown) */
  seconds: number;
  thumb: string;
  url: string;
};

export type MergedVod = LiveVod & {
  /** the same broadcast on the other platform, when it was dual-streamed */
  alsoOn?: { platform: Platform; url: string; id: string };
};

export type LiveNow = {
  twitch: { live: boolean; title?: string; viewers?: number };
  youtube: { live: boolean; videoId?: string; title?: string; viewers?: number };
};

export type PlayerChoice = "twitch" | "youtube" | "none";

/** both live -> Twitch player; one live -> that one; none -> offline state */
export function pickPlayer(now: LiveNow): PlayerChoice {
  if (now.twitch.live) return "twitch";
  if (now.youtube.live && now.youtube.videoId) return "youtube";
  return "none";
}

export const DEDUP = {
  /** start times within this many minutes can be the same broadcast */
  startWindowMin: 45,
  /** durations within this fraction of the longer one */
  durationTolerance: 0.15,
  /** when a duration is unknown: tighter start window + titles must look alike */
  unknownDurationWindowMin: 20,
  minTitleSimilarity: 0.5,
};

const words = (s: string) =>
  new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1),
  );

/** Jaccard similarity of the title words, 0..1 */
export function titleSimilarity(a: string, b: string) {
  const A = words(a),
    B = words(b);
  if (!A.size && !B.size) return 1;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter || 1);
}

/** null = not the same broadcast; otherwise a match score (lower is better) */
export function matchScore(yt: LiveVod, tw: LiveVod, rules = DEDUP): number | null {
  const ta = Date.parse(yt.startedAt),
    tb = Date.parse(tw.startedAt);
  if (!isFinite(ta) || !isFinite(tb)) return null;
  const dtMin = Math.abs(ta - tb) / 60000;
  const sim = titleSimilarity(yt.title, tw.title);
  if (!yt.seconds || !tw.seconds) {
    if (dtMin > rules.unknownDurationWindowMin || sim < rules.minTitleSimilarity) return null;
    return dtMin / rules.unknownDurationWindowMin + (1 - sim);
  }
  if (dtMin > rules.startWindowMin) return null;
  const dRel = Math.abs(yt.seconds - tw.seconds) / Math.max(yt.seconds, tw.seconds);
  if (dRel > rules.durationTolerance) return null;
  // start gap and duration gap dominate; the title only breaks near-ties
  return dtMin / rules.startWindowMin + dRel / rules.durationTolerance + 0.25 * (1 - sim);
}

/** One list, newest first; a dual-streamed broadcast appears once (the YouTube copy). */
export function mergeVods(youtube: LiveVod[], twitch: LiveVod[], rules = DEDUP): MergedVod[] {
  const pairs: { y: number; t: number; s: number }[] = [];
  youtube.forEach((y, yi) =>
    twitch.forEach((t, ti) => {
      const s = matchScore(y, t, rules);
      if (s != null) pairs.push({ y: yi, t: ti, s });
    }),
  );
  pairs.sort((a, b) => a.s - b.s);
  const yUsed = new Map<number, number>(),
    tUsed = new Set<number>();
  for (const p of pairs) {
    if (yUsed.has(p.y) || tUsed.has(p.t)) continue;
    yUsed.set(p.y, p.t);
    tUsed.add(p.t);
  }
  const out: MergedVod[] = youtube.map((y, yi) => {
    const ti = yUsed.get(yi);
    if (ti == null) return { ...y };
    const t = twitch[ti];
    return { ...y, alsoOn: { platform: "twitch", url: t.url, id: t.id } };
  });
  twitch.forEach((t, ti) => {
    if (!tUsed.has(ti)) out.push({ ...t });
  });
  return out.sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
}

/** "3h2m10s" (Twitch Helix) or "PT3H2M10S" (YouTube ISO 8601) -> seconds */
export function parseDuration(s: string | undefined | null): number {
  if (!s) return 0;
  const m = /^P?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i.exec(s.replace(/^PT/i, "").toUpperCase());
  if (!m) return 0;
  return Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
}
