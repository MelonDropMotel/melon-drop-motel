"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SITE } from "@/data/site";
import { Button } from "@/components/ui/button";
import { formatAirDate, formatDuration } from "@/lib/utils";
import { getTwitchChannel, type TwitchChannel } from "@/lib/twitch";

export const Route = createFileRoute("/live")({
  loader: () => getTwitchChannel(),
  component: Live,
});

function twitchPlayerSrc(channel: string, live: boolean) {
  const hosts = new Set<string>([
    "localhost",
    "grok.com",
    "www.grok.com",
    "grok-sandbox.com",
    "wixsite.com",
    "www.wixsite.com",
    "editor.wix.com",
    "wix.com",
  ]);
  const addHost = (raw: string) => {
    const host = raw.replace(/^www\./, "").toLowerCase();
    if (!host) return;
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host) || host === "[::1]") {
      hosts.add(host);
      hosts.add("localhost");
      return;
    }
    hosts.add(host);
    if (host.endsWith(".grok-sandbox.com")) hosts.add("grok-sandbox.com");
    if (host.endsWith(".grok.com")) hosts.add("grok.com");
    if (host.endsWith(".wixsite.com")) hosts.add("wixsite.com");
  };

  addHost(window.location.hostname);
  try {
    const ancestors = window.location.ancestorOrigins;
    if (ancestors) {
      for (let i = 0; i < ancestors.length; i++) {
        addHost(new URL(ancestors[i]).hostname);
      }
    }
  } catch {
    /* ignore */
  }
  try {
    if (document.referrer) addHost(new URL(document.referrer).hostname);
  } catch {
    /* ignore */
  }

  const parents = [...hosts]
    .map((h) => `parent=${encodeURIComponent(h)}`)
    .join("&");
  return `https://player.twitch.tv/?channel=${channel}&${parents}&autoplay=${live ? "true" : "false"}&muted=true`;
}

function TwitchPlayer({ live }: { live: boolean }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    setSrc(twitchPlayerSrc(SITE.twitchHandle, live));
  }, [live]);

  return (
    <div className="crt-bezel">
      <div className="crt-screen">
        {src ? (
          <iframe
            title="Melon Drop Motel on Twitch"
            src={src}
            className="absolute inset-0 h-full w-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : null}
      </div>
    </div>
  );
}

function Live() {
  const initial = Route.useLoaderData();
  const [twitch, setTwitch] = useState<TwitchChannel>(initial);

  useEffect(() => {
    setTwitch(initial);
  }, [initial]);

  useEffect(() => {
    let cancelled = false;
    const poll = window.setInterval(() => {
      getTwitchChannel({ data: { fresh: true } })
        .then((c) => {
          if (!cancelled) setTwitch(c);
        })
        .catch(() => {});
    }, 2 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, []);

  return (
    <div className="flex flex-col gap-10">
      <section className="relative overflow-hidden shadow-border">
        <img
          src="/images/crt-snow.jpg"
          alt="A CRT television showing analog snow"
          className="h-72 w-full object-cover"
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
              {twitch.live ? twitch.title || "We're live" : "Lobby TV"}
            </h2>
          </div>
          <span className="flex items-center gap-2 text-sm tracking-[0.16em]">
            <span
              className={`rec-dot size-2 rounded-full ${twitch.live ? "bg-primary" : "bg-muted"}`}
            />
            <span className={twitch.live ? "text-primary" : "text-muted"}>
              {twitch.live
                ? `LIVE${twitch.viewers ? ` · ${twitch.viewers}` : ""}`
                : "OFF AIR"}
            </span>
          </span>
        </div>

        <div className="mt-5">
          <TwitchPlayer live={twitch.live} />
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

      <section>
        <p className="hud-label">Recent VODs</p>
        <h2 className="font-display text-4xl tracking-[0.08em]">
          After the stream
        </h2>
        {twitch.vods.length === 0 ? (
          <p className="mt-6 text-muted">No tapes on the shelf yet.</p>
        ) : (
          <ul className="mt-6 divide-y divide-fg/10 border-y border-fg/10">
            {twitch.vods.map((v) => (
              <li key={v.id}>
                <a
                  href={`https://www.twitch.tv/videos/${v.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col gap-3 py-4 transition-colors hover:text-primary sm:flex-row sm:items-center"
                >
                  {v.thumb ? (
                    <img
                      src={v.thumb}
                      alt=""
                      className="aspect-video w-full object-cover sm:w-48"
                    />
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-2xl tracking-[0.08em]">
                      {v.title}
                    </span>
                    <span className="mt-1 block text-muted">
                      {formatAirDate(v.date)}
                      {v.seconds ? ` · ${formatDuration(v.seconds)}` : ""}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="relative overflow-hidden shadow-border">
        <img
          src="/images/ice-machine.jpg"
          alt="Motel ice machine in a night breezeway"
          className="h-64 w-full object-cover"
        />
        <div className="absolute inset-0 bg-bg/60" />
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
