"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SITE } from "@/data/site";
import { Button } from "@/components/ui/button";
import { formatAirDate, formatDuration } from "@/lib/utils";
import { getLiveState, type LiveState } from "@/lib/live";
import type { MergedVod } from "@/lib/live-merge";
import { TvArt } from "@/components/tv-art";
import { Pager } from "@/components/pager";
import { paginate, parsePage } from "@/lib/paginate";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/live")({
  // ?livemock=twitch|youtube|both|off  preview-only (ignored in production by the server)
  validateSearch: (s: Record<string, unknown>): { livemock?: string; page?: number } => ({
    ...(typeof s.livemock === "string" ? { livemock: s.livemock } : {}),
    ...(parsePage(s.page) > 1 ? { page: parsePage(s.page) } : {}),
  }),
  loaderDeps: ({ search }) => ({ mock: search.livemock }),
  loader: ({ deps }) => getLiveState({ data: { mock: deps.mock } }),
  head: ({ match }) => pageHead("Live", "/live", match.search as Record<string, unknown>, ["page"]),
  component: Live,
});

function twitchPlayerSrc(channel: string) {
  const hosts = new Set<string>();
  const addHost = (raw: string) => {
    let host = raw.trim().toLowerCase();
    if (!host) return;
    try {
      if (host.includes("://")) host = new URL(host).hostname;
    } catch {
      return;
    }
    host = host.replace(/:\d+$/, "").replace(/^www\./, "");
    if (!host || host === "null") return;
    if (host === "[::1]" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      hosts.add("localhost");
      return;
    }
    hosts.add(host);
    hosts.add(`www.${host}`);
  };

  addHost(window.location.hostname);
  addHost(window.location.host);
  try {
    const ancestors = window.location.ancestorOrigins;
    if (ancestors) {
      for (let i = 0; i < ancestors.length; i++) addHost(ancestors[i]);
    }
  } catch {
    /* ignore */
  }
  try {
    if (document.referrer) addHost(document.referrer);
  } catch {
    /* ignore */
  }

  const parents = [...hosts]
    .map((h) => `parent=${encodeURIComponent(h)}`)
    .join("&");
  return `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&${parents}&autoplay=true&muted=true`;
}

function TwitchPlayer() {
  const [src, setSrc] = useState("");

  useEffect(() => {
    setSrc(twitchPlayerSrc(SITE.twitchHandle));
  }, []);

  return (
    <div className="crt-bezel relative">
      <div className="crt-screen">
        {src ? (
          <iframe
            title="Melon Drop Motel on Twitch"
            src={src}
            className="absolute inset-0 h-full w-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="origin"
            scrolling="no"
          />
        ) : null}
      </div>
    </div>
  );
}

function YouTubeLivePlayer({ id, title }: { id: string; title?: string }) {
  return (
    <div className="crt-bezel relative">
      <div className="crt-screen">
        <iframe
          title={title || "Melon Drop Motel live on YouTube"}
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&mute=1&playsinline=1`}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function PlatformBadge({ platform }: { platform: "youtube" | "twitch" }) {
  return (
    <span className={`platform-badge platform-${platform}`}>
      {platform === "youtube" ? "YouTube" : "Twitch"}
    </span>
  );
}

/** start time -> YYYY-MM-DD on the motel clock (Etc/GMT+8) */
const motelDay = (iso: string) => {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? new Date(t - 8 * 3600_000).toISOString().slice(0, 10) : "";
};

function VodCard({ v }: { v: MergedVod }) {
  const day = motelDay(v.startedAt);
  return (
    <li className="video-card flex flex-col">
      <a href={v.url} target="_blank" rel="noreferrer" className="group block">
        <span className="relative block aspect-video overflow-hidden bg-black">
          {v.thumb ? (
            <img src={v.thumb} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : null}
          {v.seconds ? (
            <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs tracking-[0.12em] text-fg">
              {formatDuration(v.seconds)}
            </span>
          ) : null}
        </span>
        <span className="video-card-body block">
          <span className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <PlatformBadge platform={v.platform} />
            {v.alsoOn ? <PlatformBadge platform={v.alsoOn.platform} /> : null}
            {day ? <span>{formatAirDate(day)}</span> : null}
          </span>
          <span className="mt-2 block font-display text-2xl leading-tight tracking-[0.06em] transition-colors group-hover:text-primary">
            {v.title}
          </span>
        </span>
      </a>
      {v.alsoOn ? (
        <a
          href={v.alsoOn.url}
          target="_blank"
          rel="noreferrer"
          className="mx-5 -mt-2 mb-4 self-start text-sm tracking-[0.12em] text-primary hover:underline"
        >
          Also on Twitch
        </a>
      ) : null}
    </li>
  );
}

function Live() {
  const initial = Route.useLoaderData();
  const { livemock, page } = Route.useSearch();
  const [live, setLive] = useState<LiveState>(initial);

  useEffect(() => {
    setLive(initial);
  }, [initial]);

  useEffect(() => {
    if (livemock) return;
    let cancelled = false;
    const poll = window.setInterval(() => {
      getLiveState({ data: { fresh: true } })
        .then((c) => {
          if (!cancelled) setLive(c);
        })
        .catch(() => {});
    }, 2 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, [livemock]);

  const { player, now, vods } = live;
  const slice = paginate(vods.length, page);
  const isLive = player !== "none";
  const liveTitle = player === "twitch" ? now.twitch.title : player === "youtube" ? now.youtube.title : "";
  const viewers = player === "twitch" ? now.twitch.viewers : player === "youtube" ? now.youtube.viewers : 0;

  return (
    <div className="flex flex-col gap-10">
      <section className="relative overflow-hidden bg-bg/70 shadow-border">
        <img
          src="/images/banner.jpg"
          alt=""
          className="h-72 w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <p className="hud-label">Live</p>
          <h1 className="font-display text-5xl tracking-[0.08em] chromatic sm:text-7xl">
            Watch with us
          </h1>
          <p className="mt-2 max-w-xl text-xl text-fg">
            Movie nights and late streams on Twitch. Check out what's on the
            only channel here.
          </p>
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="hud-label">On the marquee</p>
            <h2 className="font-display text-4xl tracking-[0.08em]">
              {isLive ? liveTitle || "We're live" : "Lobby TV"}
            </h2>
          </div>
          <span className="flex items-center gap-2 text-sm tracking-[0.16em]">
            <span
              className={`rec-dot size-2 rounded-full ${isLive ? "dot-red" : "bg-muted"}`}
            />
            <span className={isLive ? "text-[var(--color-red)]" : "text-muted"}>
              {isLive
                ? `LIVE ON ${player === "twitch" ? "TWITCH" : "YOUTUBE"}${viewers ? ` · ${viewers}` : ""}`
                : "OFF AIR"}
            </span>
          </span>
        </div>

        <div className="mt-5">
          {player === "twitch" ? (
            <div className="video-card">
              <TwitchPlayer />
              {now.youtube.live && now.youtube.videoId ? (
                <p className="video-card-body text-muted">
                  Also live on YouTube.{" "}
                  <a
                    href={`https://www.youtube.com/watch?v=${now.youtube.videoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    Watch there
                  </a>
                </p>
              ) : null}
            </div>
          ) : player === "youtube" && now.youtube.videoId ? (
            <div className="video-card">
              <YouTubeLivePlayer id={now.youtube.videoId} title={now.youtube.title} />
            </div>
          ) : (
            <div className="offair-panel">
              <TvArt className="w-full max-w-[22rem] sm:max-w-[26rem]" />
              <div className="flex flex-col items-center text-center md:items-start md:text-left">
                <p className="hud-label">Off air</p>
                <p className="mt-2 font-display text-4xl tracking-[0.08em]">Nobody's at the desk.</p>
                <p className="mt-2 max-w-md text-lg text-muted">
                  Streams go up on Twitch and YouTube. Catch the last one below.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <a href={SITE.twitchUrl} target="_blank" rel="noreferrer">
              Open Twitch
            </a>
          </Button>
          <Button asChild variant="ghost">
            <a href={SITE.youtubeUrl} target="_blank" rel="noreferrer">
              {SITE.youtubeHandle}
            </a>
          </Button>
        </div>
      </section>

      <section id="live-vods" className="scroll-mt-24">
        <p className="hud-label">Recent VODs</p>
        <h2 className="font-display text-4xl tracking-[0.08em]">
          After the stream
        </h2>
        {vods.length === 0 ? (
          <p className="mt-6 text-muted">No tapes on the shelf yet.</p>
        ) : (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vods.slice(slice.start, slice.end).map((v) => (
              <VodCard key={`${v.platform}-${v.id}`} v={v} />
            ))}
          </ul>
        )}
        <Pager slice={slice} anchorId="live-vods" label="VOD pages" />
      </section>

      <section className="theme-panel relative h-64">
        <img
          src="/images/mockup/wordmark-type-teal.png"
          alt=""
          width={573}
          height={426}
          className="shift-art mark absolute right-6 top-1/2 hidden h-48 w-auto -translate-y-1/2 opacity-90 sm:block"
        />
        <div className="absolute inset-0 flex flex-col items-start justify-end p-6">
          <p className="hud-label">Book a night</p>
          <p className="max-w-lg font-display text-4xl tracking-[0.08em]">
            Live tapings, guest chairs, weird rooms.
          </p>
          <Button asChild className="mt-4">
            <Link to="/desk">Front desk</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
