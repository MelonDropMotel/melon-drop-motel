// Unit tests for src/lib/paginate.ts (page math behind every paginated video list).
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const js = execFileSync(process.execPath, ["-e", `
  const ts=require("typescript"),fs=require("fs");
  process.stdout.write(ts.transpileModule(fs.readFileSync("src/lib/paginate.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText);
`]).toString();
const mod = { exports: {} };
new Function("module", "exports", js)(mod, mod.exports);
const { paginate, pageItems, parsePage, pageParam, PER_PAGE } = mod.exports;

test("20 per page", () => assert.equal(PER_PAGE, 20));

test("slices: first, middle, last partial page", () => {
  assert.deepEqual(paginate(45, 1), { page: 1, pages: 3, start: 0, end: 20, prev: null, next: 2 });
  assert.deepEqual(paginate(45, 2), { page: 2, pages: 3, start: 20, end: 40, prev: 1, next: 3 });
  assert.deepEqual(paginate(45, 3), { page: 3, pages: 3, start: 40, end: 45, prev: 2, next: null });
});

test("exact multiple and empty lists", () => {
  assert.equal(paginate(40, 2).end, 40);
  assert.equal(paginate(40, 2).next, null);
  assert.deepEqual(paginate(0, 1), { page: 1, pages: 1, start: 0, end: 0, prev: null, next: null });
  assert.equal(paginate(20, 1).pages, 1);
});

test("out-of-range and junk pages clamp", () => {
  assert.equal(paginate(45, 99).page, 3);
  assert.equal(paginate(45, 0).page, 1);
  assert.equal(paginate(45, -4).page, 1);
  assert.equal(paginate(45, "abc").page, 1);
  assert.equal(paginate(45, "2").page, 2);
  assert.equal(parsePage(2.7), 2);
  assert.equal(parsePage(undefined), 1);
});

test("numbered links with gaps", () => {
  assert.deepEqual(pageItems(1, 1), [1]);
  assert.deepEqual(pageItems(3, 1), [1, 2, 3]);
  assert.deepEqual(pageItems(5, 1), [1, 2, "gap", 5]);
  assert.deepEqual(pageItems(5, 3), [1, 2, 3, 4, 5]);
  assert.deepEqual(pageItems(12, 5), [1, "gap", 4, 5, 6, "gap", 12]);
  assert.deepEqual(pageItems(12, 12), [1, "gap", 11, 12]);
});

test("page 1 has no query param", () => {
  assert.equal(pageParam(1), undefined);
  assert.equal(pageParam(2), 2);
});
