"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { cn, ytThumb } from "@/lib/utils";
import type { Video } from "@/data/site";
import { SITE } from "@/data/site";

type Props = {
  video: Video;
  autoPlay?: boolean;
  className?: string;
};

export function TubePlayer({ video, autoPlay = false, className }: Props) {
  const [playing, setPlaying] = useState(autoPlay);
  const [thumb, setThumb] = useState(ytThumb(video.id, "max"));

  useEffect(() => {
    setPlaying(autoPlay);
    setThumb(ytThumb(video.id, "max"));
  }, [video.id, autoPlay]);

  const label =
    video.kind === "episode" && video.ep
      ? `EP.${String(video.ep).padStart(3, "0")}`
      : video.kind === "track"
        ? "TRACK"
        : "CLIP";

  return (
    <div className={cn("crt-bezel", className)}>
      <div className="crt-screen group">
        {playing ? (
          <iframe
            title={video.title}
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&color=white`}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute inset-0 h-full w-full"
            aria-label={`Play ${video.title}`}
          >
            <img
              src={thumb}
              alt=""
              className="absolute inset-0 h-full w-full object-cover outline-none"
              onError={() => setThumb(ytThumb(video.id, "hq"))}
            />
            <div className="absolute inset-0 bg-bg/35" />
            <div className="absolute left-3 top-3 flex items-center gap-2 text-sm tracking-[0.2em] text-fg">
              <span className="rec-dot size-2 rounded-full bg-primary" />
              <span>STEREO</span>
            </div>
            <div className="absolute right-3 top-3 font-display text-2xl tracking-[0.12em] text-primary chromatic sm:text-3xl">
              {label}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-primary text-bg shadow-border transition-transform duration-150 group-hover:scale-105 sm:size-20">
                <Play className="ml-0.5 size-8 fill-current sm:size-9" />
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-bg/70 to-transparent px-4 pb-3 pt-10 text-left">
              <p className="hud-label">{label} · {SITE.name}</p>
              <p className="font-display text-2xl tracking-[0.06em] text-fg sm:text-3xl">
                {video.title}
              </p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
