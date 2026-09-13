"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { Tape } from "@/lib/podcast";
import { formatTapeClock } from "@/lib/podcast";
import { cn } from "@/lib/utils";

type Props = {
  tape: Tape;
  autoPlay?: boolean;
  className?: string;
};

const BARS = 12;

function HeadUnitViz({ playing, clock }: { playing: boolean; clock: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const clockRef = useRef(clock);
  clockRef.current = clock;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let dead = false;

    function draw(now: number) {
      if (dead || !ctx || !canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const gap = 2;
      const bw = (w - gap * (BARS - 1)) / BARS;
      const t = playing ? now / 260 + clockRef.current * 1.7 : clockRef.current * 0.2;
      for (let i = 0; i < BARS; i++) {
        const n =
          0.18 +
          0.55 * Math.abs(Math.sin(t * (0.55 + i * 0.17) + i * 0.9)) +
          0.27 * Math.abs(Math.sin(t * 1.4 + i * 0.35));
        const level = playing ? n : 0.08 + (i % 3) * 0.02;
        const bh = Math.max(2, level * h);
        const x = i * (bw + gap);
        const y = h - bh;
        ctx.fillStyle =
          level > 0.78 ? "rgb(243,235,227)" : "rgb(255,75,110)";
        ctx.fillRect(x, y, bw, bh);
      }
      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
    };
  }, [playing]);

  return (
    <canvas
      ref={ref}
      width={108}
      height={22}
      className="h-[22px] w-[108px] shrink-0"
      aria-hidden
    />
  );
}

export function TapeDeck({ tape, autoPlay = false, className }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(tape.durationSec);
  const [vol, setVol] = useState(0.85);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    setPlaying(false);
    setT(0);
    setDur(tape.durationSec);
    el.volume = vol;
    el.load();
    if (autoPlay) {
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [tape.id, tape.audioUrl, tape.durationSec, autoPlay]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = vol;
  }, [vol]);

  return (
    <div className={cn("crt-bezel", className)}>
      <div className="bg-[#050405] px-4 py-4 sm:px-5">
        <audio
          ref={audioRef}
          src={tape.audioUrl}
          preload="metadata"
          onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
          onDurationChange={(e) => {
            const d = e.currentTarget.duration;
            if (Number.isFinite(d) && d > 0) setDur(d);
          }}
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
        />
        <div className="flex items-center justify-between gap-3">
          <p className="hud-label text-primary">
            Tape{tape.ep ? ` · EP.${String(tape.ep).padStart(3, "0")}` : ""} · Stereo
          </p>
          <HeadUnitViz playing={playing} clock={t} />
        </div>
        <h3 className="mt-2 font-display text-3xl tracking-[0.08em] sm:text-4xl">
          {tape.title}
        </h3>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="quiet flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-bg"
            aria-label={playing ? "Pause tape" : "Play tape"}
            onClick={() => {
              const el = audioRef.current;
              if (!el) return;
              if (el.paused) void el.play();
              else el.pause();
            }}
          >
            {playing ? (
              <Pause className="size-5 fill-current" />
            ) : (
              <Play className="ml-0.5 size-5 fill-current" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={Math.max(1, dur)}
            step={0.1}
            value={Math.min(t, dur || t)}
            className="tape-range min-w-0 flex-1"
            aria-label="Tape position"
            onChange={(e) => {
              const next = Number(e.target.value);
              setT(next);
              if (audioRef.current) audioRef.current.currentTime = next;
            }}
          />
          <span className="shrink-0 tabular-nums text-sm tracking-[0.08em] text-muted">
            {formatTapeClock(t)} / {formatTapeClock(dur || tape.durationSec)}
          </span>
          <label className="flex shrink-0 items-center gap-2">
            <span className="hud-label">Vol</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={vol}
              className="tape-range w-20"
              aria-label="Volume"
              onChange={(e) => setVol(Number(e.target.value))}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
