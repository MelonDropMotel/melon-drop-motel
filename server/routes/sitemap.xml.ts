import { defineEventHandler, setHeader } from "h3";
import { buildSitemapXml } from "../../src/lib/sitemap";

export default defineEventHandler(async (event) => {
  setHeader(event, "content-type", "application/xml; charset=utf-8");
  setHeader(event, "cache-control", "public, max-age=300");
  return await buildSitemapXml();
});
