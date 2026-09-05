"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { LATEST, type Video } from "@/data/site";
import { TubePlayer } from "@/components/tube-player";
import { cn, formatAirDate, ytThumb } from "@/lib/utils";
import { getChannelVideos } from "@/lib/youtube";

const searchSchema = z.object({
  v: z.string().optional(),
});

export const Route = createFileRoute("/watch")({
  validateSearch: searchSchema,
  loader: () => getChannelVideos(),
  component: Watch,
});

type Tab = "episodes" | "clips";

function Watch() {
  const catalog = Route.useLoaderData();
  const { v } = Route.useSearch();
  const [tab, setTab] = useState<Tab>("episodes");

  const current = useMemo((): Video => {
    if (!v) return catalog.latest;
    return (
      catalog.episodes.find((e) => e.id === v) ||
      catalog.clips.find((c) => c.id === v) ||
      catalog.latest ||
      LATEST
    );
  }, [v, catalog]);

  useEffect(() => {
    if (catalog.clips.some((c) => c.id === current.id)) setTab("clips");
  }, [current.id, catalog.clips]);

  const list = tab === "episodes" ? catalog.episodes : catalog.clips;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-5xl tracking-[0.08em] chromatic sm:text-6xl">
          Watch
        </h1>
      </div>

      <TubePlayer video={current} autoPlay={Boolean(v)} />

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

      <div className="flex gap-2">
        {(
          [
            ["episodes", "Episodes"],
            ["clips", "Clips & shorts"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "h-11 px-4 font-display text-xl tracking-[0.12em] uppercase",
              tab === key
                ? "bg-primary text-bg"
                : "text-muted shadow-border hover:text-fg",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((item) => {
          const active = item.id === current.id;
          return (
            <li key={item.id}>
              <Link
                to="/watch"
                search={{ v: item.id }}
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
    </div>
  );
}
