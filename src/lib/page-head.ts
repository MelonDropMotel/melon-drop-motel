import { SITE } from "@/data/site";
import { parsePage } from "@/lib/paginate";

/**
 * <head> additions for page 2+ of a paginated listing: "… · Page N" title and a
 * self-referencing canonical with ?page=N. Page 1 adds nothing (existing SEO unchanged).
 */
export function pageHead(label: string, path: string, search: Record<string, unknown>, params: string[]) {
  const pages = params.map((p) => [p, parsePage(search[p])] as const).filter(([, n]) => n > 1);
  if (!pages.length) return {};
  const qs = new URLSearchParams();
  if (typeof search.tab === "string") qs.set("tab", search.tab);
  for (const [p, n] of pages) qs.set(p, String(n));
  const title = `${label} · Page ${pages.map(([, n]) => n).join(" / ")} · ${SITE.name}`;
  return {
    meta: [{ title }, { property: "og:title", content: title }],
    links: [{ rel: "canonical", href: `${SITE.url}${path}?${qs}` }],
  };
}
