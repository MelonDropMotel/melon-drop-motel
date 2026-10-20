// Unit tests for src/lib/live-merge.ts (player choice + VOD merge / dual-stream dedup).
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const js = execFileSync(process.execPath, ["-e", `
  const ts=require("typescript"),fs=require("fs");
  process.stdout.write(ts.transpileModule(fs.readFileSync("src/lib/live-merge.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText);
`]).toString();
const mod = { exports: {} };
new Function("module", "exports", js)(mod, mod.exports);
const { pickPlayer, mergeVods, parseDuration, matchScore } = mod.exports;

const yt = (id, startedAt, seconds, title = "Movie night") => ({ platform: "youtube", id, title, startedAt, seconds, thumb: "", url: `https://youtu.be/${id}` });
const tw = (id, startedAt, seconds, title = "Movie night") => ({ platform: "twitch", id, title, startedAt, seconds, thumb: "", url: `https://www.twitch.tv/videos/${id}` });

test("player: twitch only, youtube only, both, none", () => {
  assert.equal(pickPlayer({ twitch: { live: true }, youtube: { live: false } }), "twitch");
  assert.equal(pickPlayer({ twitch: { live: false }, youtube: { live: true, videoId: "abc" } }), "youtube");
  assert.equal(pickPlayer({ twitch: { live: true }, youtube: { live: true, videoId: "abc" } }), "twitch");
  assert.equal(pickPlayer({ twitch: { live: false }, youtube: { live: false } }), "none");
  assert.equal(pickPlayer({ twitch: { live: false }, youtube: { live: true } }), "none", "youtube live without a video id can't be embedded");
});

test("twitch-only VODs pass through, newest first", () => {
  const out = mergeVods([], [tw("1", "2026-10-01T03:00:00Z", 7200), tw("2", "2026-10-08T03:00:00Z", 5400)]);
  assert.deepEqual(out.map((v) => v.id), ["2", "1"]);
  assert.ok(out.every((v) => v.platform === "twitch" && !v.alsoOn));
});

test("youtube-only VODs pass through, newest first", () => {
  const out = mergeVods([yt("a", "2026-09-01T03:00:00Z", 3600), yt("b", "2026-09-20T03:00:00Z", 3600)], []);
  assert.deepEqual(out.map((v) => v.id), ["b", "a"]);
});

test("overlapping dual-stream VODs collapse into one YouTube entry with an 'also on Twitch' link", () => {
  const out = mergeVods(
    [yt("y1", "2026-10-10T03:02:00Z", 7400, "Backrooms movie night"), yt("y0", "2026-10-03T03:00:00Z", 3000)],
    [tw("t1", "2026-10-10T02:58:30Z", 7650, "MOVIE NIGHT: Backrooms"), tw("t9", "2026-09-26T03:00:00Z", 3000)],
  );
  assert.deepEqual(out.map((v) => v.id), ["y1", "y0", "t9"]);
  assert.equal(out[0].platform, "youtube");
  assert.deepEqual(out[0].alsoOn, { platform: "twitch", url: "https://www.twitch.tv/videos/t1", id: "t1" });
  assert.equal(out.filter((v) => v.alsoOn).length, 1);
});

test("near-but-different streams stay separate", () => {
  // same evening, 2 h apart (start gap too big)
  let out = mergeVods([yt("y", "2026-10-10T03:00:00Z", 3600)], [tw("t", "2026-10-10T05:00:00Z", 3600)]);
  assert.equal(out.length, 2);
  // close start, very different length (a short clip-y stream vs the full night)
  out = mergeVods([yt("y", "2026-10-10T03:00:00Z", 1800)], [tw("t", "2026-10-10T03:10:00Z", 7200)]);
  assert.equal(out.length, 2);
  // unknown duration: needs a close start AND alike titles
  out = mergeVods([yt("y", "2026-10-10T03:00:00Z", 0, "Q&A")], [tw("t", "2026-10-10T03:05:00Z", 3600, "Movie night: Cube")]);
  assert.equal(out.length, 2);
});

test("title breaks a tie between two candidates", () => {
  const out = mergeVods(
    [yt("y", "2026-10-10T03:00:00Z", 3600, "Evil Dead Burn watch party")],
    [tw("a", "2026-10-10T03:05:00Z", 3700, "Just chatting"), tw("b", "2026-10-10T03:05:00Z", 3700, "Evil Dead Burn watch party")],
  );
  assert.equal(out.find((v) => v.id === "y").alsoOn.id, "b");
  assert.ok(out.some((v) => v.id === "a"));
});

test("each Twitch VOD pairs with at most one YouTube VOD", () => {
  const out = mergeVods([yt("y1", "2026-10-10T03:00:00Z", 3600), yt("y2", "2026-10-10T03:20:00Z", 3600)], [tw("t", "2026-10-10T03:01:00Z", 3600)]);
  assert.equal(out.filter((v) => v.alsoOn).length, 1);
  assert.equal(out.find((v) => v.alsoOn).id, "y1");
  assert.equal(matchScore(yt("x", "bad", 1), tw("y", "2026-10-10T03:00:00Z", 1)), null);
});

test("durations: Twitch Helix and YouTube ISO formats", () => {
  assert.equal(parseDuration("3h2m10s"), 10930);
  assert.equal(parseDuration("45m"), 2700);
  assert.equal(parseDuration("PT1H30M9S"), 5409);
  assert.equal(parseDuration("PT59S"), 59);
  assert.equal(parseDuration(""), 0);
});
