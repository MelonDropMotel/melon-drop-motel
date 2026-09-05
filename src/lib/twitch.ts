import { createServerFn } from "@tanstack/react-start";
import { SITE } from "@/data/site";

export type TwitchVod = {
  id: string;
  title: string;
  date: string;
  seconds: number;
  thumb: string;
};

export type TwitchChannel = {
  live: boolean;
  title: string;
  viewers: number;
  vods: TwitchVod[];
};

const GQL = "https://gql.twitch.tv/gql";
const CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko";
const QUERY = `query ($login: String!) {
  user(login: $login) {
    stream { id title viewersCount }
    videos(first: 12, type: ARCHIVE) {
      edges {
        node {
          id
          title
          publishedAt
          lengthSeconds
          previewThumbnailURL(width: 640, height: 360)
        }
      }
    }
  }
}`;

const TTL_MS = 2 * 60 * 1000;
let cache: { at: number; data: TwitchChannel } | null = null;

function empty(): TwitchChannel {
  return { live: false, title: "", viewers: 0, vods: [] };
}

function parse(json: unknown): TwitchChannel {
  const user = (json as {
    data?: {
      user?: {
        stream?: { title?: string; viewersCount?: number } | null;
        videos?: {
          edges?: Array<{
            node?: {
              id?: string;
              title?: string;
              publishedAt?: string;
              lengthSeconds?: number;
              previewThumbnailURL?: string;
            };
          }>;
        };
      } | null;
    };
  }).data?.user;

  if (!user) return empty();

  const vods: TwitchVod[] = (user.videos?.edges ?? [])
    .map((e) => e.node)
    .filter((n): n is NonNullable<typeof n> => Boolean(n?.id && n.title))
    .map((n) => ({
      id: String(n.id),
      title: n.title ?? "",
      date: (n.publishedAt ?? "").slice(0, 10),
      seconds: Number(n.lengthSeconds ?? 0),
      thumb: n.previewThumbnailURL ?? "",
    }));

  return {
    live: Boolean(user.stream),
    title: user.stream?.title ?? "",
    viewers: Number(user.stream?.viewersCount ?? 0),
    vods,
  };
}

async function pull(fresh = false): Promise<TwitchChannel> {
  if (!fresh && cache && Date.now() - cache.at < TTL_MS) return cache.data;
  try {
    const res = await fetch(GQL, {
      method: "POST",
      headers: {
        "Client-ID": CLIENT_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { login: SITE.twitchHandle },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`twitch ${res.status}`);
    const data = parse(await res.json());
    cache = { at: Date.now(), data };
    return data;
  } catch {
    return cache?.data ?? empty();
  }
}

export const getTwitchChannel = createServerFn({ method: "GET" })
  .validator((d: unknown) => {
    if (!d || typeof d !== "object") return { fresh: false };
    return { fresh: Boolean((d as { fresh?: boolean }).fresh) };
  })
  .handler(async ({ data }) => pull(data.fresh));
