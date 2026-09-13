"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { z } from "zod";
import { LATEST, type Video } from "@/data/site";
import { TubePlayer } from "@/components/tube-player";
import { TapeDeck } from "@/components/tape-deck";
import { ListenBadges } from "@/components/listen-badges";
import { cn, formatAirDate, ytThumb } from "@/lib/utils";
import { getChannelVideos } from "@/lib/youtube";
import { getPodcastEpisodes } from "@/lib/podcast";

const searchSchema = z.object({
  v: z.string().optional(),
  tape: z.string().optional(),
  tab: z.enum(["episodes", "clips", "tapes"]).optional(),
});

export const Route = createFileRoute("/watch")({
  validateSearch: searchSchema,
  loader: async () => {
    const [catalog, tapes] = await Promise.all([
      getChannelVideos(),
      getPodcastEpisodes(),
    ]);
    return { ...catalog, tapes };
  },
  component: Watch,
});

type Tab = "episodes" | "clips" | "tapes";

function Watch() {
  const catalog = Route.useLoaderData();
  const { v, tape: tapeId, tab: tabQ } = Route.useSearch();

  const current = useMemo((): Video => {
    if (!v) return catalog.latest;
    return (
      catalog.episodes.find((e) => e.id === v) ||
      catalog.clips.find((c) => c.id === v) ||
      catalog.latest ||
      LATEST
    );
  }, [v, catalog]);

  const currentTape = useMemo(() => {
    if (!catalog.tapes.length) return null;
    if (tapeId) return catalog.tapes.find((t) => t.id === tapeId) ?? catalog.tapes[0];
    return catalog.tapes[0];
  }, [tapeId, catalog.tapes]);

  const tab: Tab =
    tabQ ??
    (tapeId
      ? "tapes"
      : catalog.clips.some((c) => c.id === current.id)
        ? "clips"
        : "episodes");

  const list = tab === "episodes" ? catalog.episodes : tab === "clips" ? catalog.clips : null;
  const onTapes = tab === "tapes";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-5xl tracking-[0.08em] chromatic sm:text-6xl">
          Watch
        </h1>
      </div>

      {onTapes ? (
        currentTape ? (
          <TapeDeck tape={currentTape} autoPlay={Boolean(tapeId)} />
        ) : (
          <p className="text-muted">No tapes on the rack yet.</p>
        )
      ) : (
        <TubePlayer video={current} autoPlay={Boolean(v)} />
      )}

      {!onTapes ? (
        <div>
          <p className="hud-label">
            {current.kind === "episode" && current.ep
              ? `EP.${String(current.ep).padStart(3, "0")}`
              : current.kind.toUpperCase()}{" "}
            · {formatAirDate(current.date)}
          </p>
          <h2 className="font-display text-4xl tracking-[0.06em]">{current.title}</h2>
          {current.blurb ? (
            <p className="mt-2 max-w-3xl whitespace-pre-line text-muted">
              {current.blurb}
            </p>
          ) : null}
        </div>
      ) : currentTape?.blurb ? (
        <p className="max-w-3xl text-muted">{currentTape.blurb}</p>
      ) : null}

      {onTapes ? <ListenBadges /> : null}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["episodes", "Episodes"],
            ["clips", "Clips & shorts"],
            ["tapes", "Tapes"],
          ] as const
        ).map(([key, label]) => (
          <Link
            key={key}
            to="/watch"
            search={(prev) => ({
              v: key === "tapes" ? undefined : prev.v,
              tape: key === "tapes" ? prev.tape : undefined,
              tab: key,
            })}
            className={cn(
              "inline-flex h-11 items-center px-4 font-display text-xl tracking-[0.12em] uppercase",
              tab === key
                ? "bg-primary text-bg"
                : "text-muted shadow-border hover:text-fg",
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      {onTapes ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.tapes.map((item) => {
            const active = item.id === currentTape?.id;
            return (
              <li key={item.id}>
                <Link
                  to="/watch"
                  search={{ tape: item.id, tab: "tapes" }}
                  className={cn(
                    "flex h-full flex-col overflow-hidden p-4 transition-[box-shadow] duration-150",
                    active ? "shadow-border-hover" : "shadow-border hover:shadow-border-hover",
                  )}
                >
                  <p className="hud-label text-primary">
                    {item.ep ? `EP.${String(item.ep).padStart(3, "0")}` : "TAPE"} · {item.duration}
                  </p>
                  <p className="mt-2 font-display text-2xl leading-none tracking-[0.05em]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm tracking-[0.08em] text-muted">
                    {formatAirDate(item.date)}
                  </p>
                  {item.blurb ? (
                    <p className="mt-2 line-clamp-3 text-muted">{item.blurb}</p>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list?.map((item) => {
            const active = item.id === current.id;
            return (
              <li key={item.id}>
                <Link
                  to="/watch"
                  search={{ v: item.id, tab }}
                  className={cn(
                    "flex h-full flex-col overflow-hidden transition-[box-shadow] duration-150",
                    active ? "shadow-border-hover" : "shadow-border hover:shadow-border-hover",
                  )}
                >
                  <div className="relative">
                    <img
                      src={ytThumb(item.id)}
                      alt=""
                      className="aspect-video w-full object-cover"
                    />
                    {item.ep ? (
                      <span className="absolute left-2 top-2 bg-primary px-2 py-0.5 font-display text-lg tracking-[0.12em] text-bg">
                        EP.{String(item.ep).padStart(3, "0")}
                      </span>
                    ) : (
                      <span className="absolute left-2 top-2 bg-bg/80 px-2 py-0.5 font-display text-lg tracking-[0.12em] text-primary">
                        {item.kind === "track" ? "TRACK" : "CLIP"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <p className="font-display text-2xl leading-none tracking-[0.05em]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm tracking-[0.08em] text-muted">
                      {formatAirDate(item.date)}
                    </p>
                    {item.blurb ? (
                      <p className="mt-2 line-clamp-3 whitespace-pre-line text-muted">
                        {item.blurb}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
