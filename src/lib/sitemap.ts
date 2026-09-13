import { SITE } from "@/data/site";
import { loadChannelCatalog } from "@/lib/youtube";
import { loadPodcastEpisodes } from "@/lib/podcast";

function esc(s: string) {
  return s
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
}

function loc(path: string) {
  return `${SITE.url}${path}`;
}

function url(
  path: string,
  opts: { lastmod?: string; changefreq?: string; priority?: string } = {},
) {
  const last = opts.lastmod
    ? `\n    <lastmod>${esc(opts.lastmod)}</lastmod>`
    : "";
  const freq = opts.changefreq
    ? `\n    <changefreq>${opts.changefreq}</changefreq>`
    : "";
  const pri = opts.priority
    ? `\n    <priority>${opts.priority}</priority>`
    : "";
  return `  <url>\n    <loc>${esc(loc(path))}</loc>${last}${freq}${pri}\n  </url>`;
}

export async function buildSitemapXml() {
  const [catalog, tapes] = await Promise.all([
    loadChannelCatalog(),
    loadPodcastEpisodes(),
  ]);

  const pages = [
    url("/", { changefreq: "daily", priority: "1.0" }),
    url("/watch", { changefreq: "daily", priority: "0.9" }),
    url("/watch?tab=clips", { changefreq: "weekly", priority: "0.7" }),
    url("/watch?tab=tapes", { changefreq: "daily", priority: "0.8" }),
    url("/live", { changefreq: "daily", priority: "0.7" }),
    url("/wiki", { changefreq: "weekly", priority: "0.5" }),
    url("/about", { changefreq: "monthly", priority: "0.5" }),
    url("/desk", { changefreq: "monthly", priority: "0.4" }),
    url("/shop", { changefreq: "monthly", priority: "0.3" }),
  ];

  for (const ep of catalog.episodes) {
    pages.push(
      url(`/watch?v=${encodeURIComponent(ep.id)}`, {
        lastmod: ep.date || undefined,
        changefreq: "monthly",
        priority: "0.8",
      }),
    );
  }
  for (const clip of catalog.clips) {
    pages.push(
      url(`/watch?v=${encodeURIComponent(clip.id)}&tab=clips`, {
        lastmod: clip.date || undefined,
        changefreq: "monthly",
        priority: "0.6",
      }),
    );
  }
  for (const tape of tapes) {
    pages.push(
      url(`/watch?tab=tapes&tape=${encodeURIComponent(tape.id)}`, {
        lastmod: tape.date || undefined,
        changefreq: "monthly",
        priority: "0.7",
      }),
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${pages.join("\n")}
</urlset>
`;
}
