/** Page math for every video listing (pure; tested in scripts/paginate.test.mjs). */

export const PER_PAGE = 20;

export type PageSlice = {
  /** current page, clamped to 1..pages */
  page: number;
  pages: number;
  start: number;
  end: number;
  prev: number | null;
  next: number | null;
};

/** parse ?page= (string/number/garbage) -> integer >= 1 */
export function parsePage(raw: unknown): number {
  const n = typeof raw === "number" ? raw : Number.parseInt(String(raw ?? ""), 10);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export function paginate(total: number, page: unknown, perPage = PER_PAGE): PageSlice {
  const pages = Math.max(1, Math.ceil(Math.max(0, total) / perPage));
  const p = Math.min(parsePage(page), pages);
  const start = (p - 1) * perPage;
  return {
    page: p,
    pages,
    start,
    end: Math.min(start + perPage, Math.max(0, total)),
    prev: p > 1 ? p - 1 : null,
    next: p < pages ? p + 1 : null,
  };
}

/** numbered links: first, last, current +/- 1, with "gap" between runs; e.g. 1 … 4 5 6 … 12 */
export function pageItems(pages: number, current: number, around = 1): (number | "gap")[] {
  const keep = new Set<number>([1, pages]);
  for (let i = current - around; i <= current + around; i++) if (i >= 1 && i <= pages) keep.add(i);
  const nums = [...keep].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  nums.forEach((n, i) => {
    if (i > 0) {
      const d = n - nums[i - 1];
      if (d === 2) out.push(n - 1); // a single hidden page: just show it
      else if (d > 2) out.push("gap");
    }
    out.push(n);
  });
  return out;
}

/** page 1 has no ?page= (keeps the existing URL as the canonical first page) */
export const pageParam = (n: number) => (n > 1 ? n : undefined);
