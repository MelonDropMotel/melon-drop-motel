// The site's colour shift must land on the same theme as the OBS stream kit at the same instant.
// Runs the kit's own engine (mdm-stream-kit/assets/js/mdm.js, SHIFT-CORE block, verbatim) against
// src/lib/stream-theme.ts for ~2 days of instants. Skips if the kit isn't on this machine.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const KIT = process.env.MDM_KIT || "/workspace/mdm-stream-kit/assets/js/mdm.js";

test("site theme schedule matches the stream kit", { skip: !existsSync(KIT) && "stream kit not present" }, () => {
  const src = readFileSync(KIT, "utf8");
  const core = src.slice(src.indexOf("/* SHIFT-CORE BEGIN"), src.indexOf("/* SHIFT-CORE END */"));
  const kit = new Function(`${core}; return { shiftLevel, SHIFT_TZ, SHIFT_TN, SHIFT_ACCENT };`)();
  // the site module is TypeScript; strip types with the TS compiler that's already a devDependency
  const ts = execFileSync(process.execPath, ["-e", `
    const ts=require("typescript"),fs=require("fs");
    process.stdout.write(ts.transpileModule(fs.readFileSync("src/lib/stream-theme.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText);
  `]).toString();
  const mod = { exports: {} };
  new Function("module", "exports", ts)(mod, mod.exports);
  const site = mod.exports;

  assert.equal(site.SHIFT_TZ, kit.SHIFT_TZ);
  assert.deepEqual(site.THEME_NAMES, kit.SHIFT_TN);
  assert.deepEqual(site.SHIFT_ACCENT, kit.SHIFT_ACCENT);
  const start = Date.parse("2026-10-19T00:00:00-08:00");
  let n = 0;
  for (let t = start; t < start + 2 * 864e5; t += 7_000) {
    const a = kit.shiftLevel(180, 360, 30, new Date(t));
    const b = site.themeAt(t);
    assert.deepEqual([b.from, b.to, b.fading], [a.from, a.to, a.fading], `mismatch at ${new Date(t).toISOString()}`);
    assert.ok(Math.abs(a.e - b.e) < 1e-9);
    n++;
  }
  assert.ok(n > 20000);
});
