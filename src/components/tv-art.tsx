"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Tyler's TV piece from the stream kit (the white boxy CRT with two antennas and
 * the purple line; mdm-stream-kit/assets/video/tv1-turnon.mp4 then tv1-hold-loop.mp4,
 * exactly as the BRB scene plays them, files copied verbatim). The videos are on
 * pure black, so they are screen-blended over the page; a black backing sits under
 * the TV's screen so the screen and the faces stay black, and a glow in the
 * current theme colour sits behind the body so the halo follows the colour shift.
 * Reduced motion: no turn-on, the colour-bar frame holds still.
 */
export function TvArt({ className, turnOn = true }: { className?: string; turnOn?: boolean }) {
  const holdRef = useRef<HTMLVideoElement>(null);
  const [holding, setHolding] = useState(!turnOn);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setStill(rm);
    if (rm) setHolding(true);
  }, []);

  useEffect(() => {
    const v = holdRef.current;
    if (!v || !holding) return;
    if (still) v.pause();
    else v.play().catch(() => {});
  }, [holding, still]);

  return (
    <div className={cn("tv-art", className)} aria-hidden>
      <div className="tv-art-glow" />
      <div className="tv-art-backing" />
      {turnOn && !holding && !still ? (
        <video
          className="tv-art-video"
          src="/video/tv1-turnon.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={() => setHolding(true)}
          onError={() => setHolding(true)}
          tabIndex={-1}
        />
      ) : null}
      <video
        ref={holdRef}
        className={cn("tv-art-video", !holding && "opacity-0")}
        src="/video/tv1-hold-loop.mp4"
        muted
        loop
        playsInline
        preload="auto"
        tabIndex={-1}
      />
    </div>
  );
}
