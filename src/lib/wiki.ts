import { createServerFn } from "@tanstack/react-start";
import { SITE } from "@/data/site";

export const WIKI_KINDS = [
  "person",
  "place",
  "thing",
  "action",
  "event",
] as const;

export type WikiKind = (typeof WIKI_KINDS)[number];

export type WikiArticle = {
  title: string;
  kind: WikiKind;
  extract: string;
  description: string;
  thumb: string;
  url: string;
};

const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${SITE.youtubeChannelId}`;
const UA =
  "MelonDropMotel/1.0 (https://melondropmotel.com; mdmpod69@gmail.com)";

const SEEDS: { url: string; kind: WikiKind }[] = [
  // Person
  { url: "https://en.wikipedia.org/wiki/Bill_Cosby", kind: "person" },
  { url: "https://en.wikipedia.org/wiki/Donald_Trump", kind: "person" },
  { url: "https://en.wikipedia.org/wiki/Alex_Jones", kind: "person" },
  { url: "https://en.wikipedia.org/wiki/Nicolas_Cage", kind: "person" },
  { url: "https://en.wikipedia.org/wiki/Sarah_Silverman", kind: "person" },
  // Place
  { url: "https://en.wikipedia.org/wiki/Bohemian_Grove", kind: "place" },
  { url: "https://en.wikipedia.org/wiki/Area_51", kind: "place" },
  { url: "https://en.wikipedia.org/wiki/Mars", kind: "place" },
  { url: "https://en.wikipedia.org/wiki/Disneyland", kind: "place" },
  { url: "https://en.wikipedia.org/wiki/Filling_station", kind: "place" },
  { url: "https://en.wikipedia.org/wiki/The_Backrooms", kind: "place" },
  // Thing
  { url: "https://en.wikipedia.org/wiki/Watermelon", kind: "thing" },
  { url: "https://en.wikipedia.org/wiki/The_Cosby_Show", kind: "thing" },
  { url: "https://en.wikipedia.org/wiki/Fat_Albert_and_the_Cosby_Kids", kind: "thing" },
  { url: "https://en.wikipedia.org/wiki/Pudding_Pop", kind: "thing" },
  { url: "https://en.wikipedia.org/wiki/Jell-O", kind: "thing" },
  { url: "https://en.wikipedia.org/wiki/Labubu", kind: "thing" },
  { url: "https://en.wikipedia.org/wiki/Cube_(1997_film)", kind: "thing" },
  { url: "https://en.wikipedia.org/wiki/Evil_Dead", kind: "thing" },
  { url: "https://en.wikipedia.org/wiki/Reddit", kind: "thing" },
  { url: "https://en.wikipedia.org/wiki/Central_Intelligence_Agency", kind: "thing" },
  { url: "https://en.wikipedia.org/wiki/Cigarette", kind: "thing" },
  // Action
  { url: "https://en.wikipedia.org/wiki/Meditation", kind: "action" },
  { url: "https://en.wikipedia.org/wiki/Catfishing", kind: "action" },
  { url: "https://en.wikipedia.org/wiki/Propaganda", kind: "action" },
  { url: "https://en.wikipedia.org/wiki/Prank", kind: "action" },
  { url: "https://en.wikipedia.org/wiki/Internet_troll", kind: "action" },
  { url: "https://en.wikipedia.org/wiki/Dating", kind: "action" },
  // Event
  { url: "https://en.wikipedia.org/wiki/MKUltra", kind: "event" },
  { url: "https://en.wikipedia.org/wiki/Roswell_UFO_incident", kind: "event" },
  { url: "https://en.wikipedia.org/wiki/Alien_abduction", kind: "event" },
  { url: "https://en.wikipedia.org/wiki/Satanic_panic", kind: "event" },
  { url: "https://en.wikipedia.org/wiki/Myocardial_infarction", kind: "event" },
];

const PERSON_Q = new Set(["Q5"]);
const PLACE_Q = new Set([
  "Q515",
  "Q6256",
  "Q3624078",
  "Q486972",
  "Q23442",
  "Q82794",
  "Q41176",
  "Q3947",
  "Q123705",
  "Q5107",
  "Q355304",
]);
const EVENT_Q = new Set(["Q1656682", "Q1190554", "Q132241", "Q18608583"]);
const ACTION_Q = new Set(["Q19167", "Q61788060", "Q1914636", "Q451967"]);

const TTL_MS = 10 * 60 * 1000;
let cache: { at: number; data: WikiArticle[] } | null = null;

function decode(s: string) {
  return s
    .replace(/&/g, "&")
    .replace(/"/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

export function normalizeWikiUrl(raw: string) {
  const cleaned = decode(raw).replace(/[).,;]+$/, "").split("#")[0] ?? raw;
  try {
    const u = new URL(
      cleaned.startsWith("http") ? cleaned : `https://${cleaned}`,
    );
    const parts = u.pathname.split("/wiki/");
    const title = parts[1];
    if (!title) return "";
    return `https://en.wikipedia.org/wiki/${title}`;
  } catch {
    return "";
  }
}

export function harvestWikiUrls(text: string) {
  const found = new Set<string>();
  const re =
    /(?:https?:\/\/)?(?:[a-z]{2,3}\.)?(?:m\.)?wikipedia\.org\/wiki\/[^\s<>"'\]&]+/gi;
  for (const m of text.matchAll(re)) {
    const url = normalizeWikiUrl(m[0]);
    if (url) found.add(url);
  }
  return [...found];
}

function kindFromQid(id: string): WikiKind | null {
  if (PERSON_Q.has(id)) return "person";
  if (PLACE_Q.has(id)) return "place";
  if (EVENT_Q.has(id)) return "event";
  if (ACTION_Q.has(id)) return "action";
  return null;
}

function kindFromText(description: string, extract: string): WikiKind {
  const d = `${description} ${extract}`.toLowerCase();
  if (
    /\b(comedian|actor|actress|singer|rapper|politician|athlete|writer|musician|person|born \d)\b/.test(
      d,
    )
  ) {
    return "person";
  }
  if (
    /\b(city|country|town|village|state of|capital of|located in|building in|river in)\b/.test(
      d,
    )
  ) {
    return "place";
  }
  if (/\b(battle|election|scandal|trial|incident|riot|festival|war)\b/.test(d)) {
    return "event";
  }
  if (/\b(process of|practice of|act of|activity|sport)\b/.test(d)) {
    return "action";
  }
  return "thing";
}

async function wikidataKind(qid: string): Promise<WikiKind | null> {
  try {
    const res = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${qid}&props=claims&format=json`,
      { headers: { "user-agent": UA }, signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      entities?: Record<
        string,
        {
          claims?: {
            P31?: Array<{
              mainsnak?: { datavalue?: { value?: { id?: string } } };
            }>;
          };
        }
      >;
    };
    const claims = json.entities?.[qid]?.claims?.P31 ?? [];
    for (const c of claims) {
      const id = c.mainsnak?.datavalue?.value?.id;
      if (id) {
        const kind = kindFromQid(id);
        if (kind) return kind;
      }
    }
    return "thing";
  } catch {
    return null;
  }
}

async function loadArticle(url: string): Promise<WikiArticle | null> {
  const title = url.split("/wiki/")[1];
  if (!title) return null;
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`,
      { headers: { "user-agent": UA, accept: "application/json" }, signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      title?: string;
      extract?: string;
      description?: string;
      thumbnail?: { source?: string };
      content_urls?: { desktop?: { page?: string } };
      wikibase_item?: string;
      type?: string;
    };
    if (json.type === "disambiguation") return null;
    const description = json.description ?? "";
    let extract = json.extract ?? "";
    try {
      const extra = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&explaintext=1&exchars=1600&redirects=1&titles=${title}`,
        { headers: { "user-agent": UA }, signal: AbortSignal.timeout(8000) },
      );
      if (extra.ok) {
        const data = (await extra.json()) as {
          query?: { pages?: Record<string, { extract?: string }> };
        };
        const longer = Object.values(data.query?.pages ?? {})[0]?.extract;
        if (longer && longer.length > extract.length) extract = longer;
      }
    } catch {
      /* keep summary extract */
    }
    const qid = json.wikibase_item;
    const kind =
      (qid ? await wikidataKind(qid) : null) ??
      kindFromText(description, extract);
    return {
      title: json.title || decodeURIComponent(title.replace(/_/g, " ")),
      kind,
      extract,
      description,
      thumb: json.thumbnail?.source ?? "",
      url: json.content_urls?.desktop?.page || url,
    };
  } catch {
    return null;
  }
}

async function urlsFromYouTube() {
  try {
    const res = await fetch(FEED, {
      headers: { "user-agent": "MelonDropMotel/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    return harvestWikiUrls(await res.text());
  } catch {
    return [];
  }
}

async function pull(fresh = false): Promise<WikiArticle[]> {
  if (!fresh && cache && Date.now() - cache.at < TTL_MS) return cache.data;
  const seedKind = new Map(SEEDS.map((s) => [s.url, s.kind]));
  const urls = [...new Set([...SEEDS.map((s) => s.url), ...(await urlsFromYouTube())])];
  const articles = (
    await Promise.all(
      urls.map(async (url) => {
        const article = await loadArticle(url);
        if (!article) return null;
        const forced = seedKind.get(url);
        if (forced) article.kind = forced;
        return article;
      }),
    )
  ).filter((a): a is WikiArticle => Boolean(a));
  cache = { at: Date.now(), data: articles };
  return articles;
}

export const getWikiRack = createServerFn({ method: "GET" })
  .validator((d: unknown) => {
    if (!d || typeof d !== "object") return { fresh: false };
    return { fresh: Boolean((d as { fresh?: boolean }).fresh) };
  })
  .handler(async ({ data }) => pull(data.fresh));
