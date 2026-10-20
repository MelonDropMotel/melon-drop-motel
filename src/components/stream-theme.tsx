"use client";

import { useEffect, useRef } from "react";
import { THEME_NAMES, themeAt, themeVars, type ShiftState, type ThemeName } from "@/lib/stream-theme";

/*
 * Site-wide colour shift (same schedule as the OBS stream kit) plus ONE full-viewport
 * background video: the kit's swirl loops (viz-rind / viz-night / viz-acid, 1920x1080,
 * 15 s perfect loops, copied verbatim). They are stacked in a single fixed layer and
 * cross-faded with the theme: teal = rind (the Starting Soon swirl), red + purple = night
 * turned by the kit's bgHue/bgSat filter, green = acid. Only layers that are showing play.
 *
 * ?theme=teal|red|purple|green holds one theme, ?shiftat=<time> freezes the schedule.
 * prefers-reduced-motion: no animated fade (snaps at the midpoint) and the video is paused.
 */
const LAYERS = [
  { key: "rind", src: "/video/viz-rind.mp4", weight: (w: Record<ThemeName, number>) => w.teal },
  { key: "night", src: "/video/viz-night.mp4", weight: (w: Record<ThemeName, number>) => w.red + w.purple },
  { key: "acid", src: "/video/viz-acid.mp4", weight: (w: Record<ThemeName, number>) => w.green },
] as const;

function readOverrides() {
  const q = new URLSearchParams(window.location.search);
  const th = q.get("theme") as ThemeName | null;
  const forced = th && THEME_NAMES.includes(th) ? th : null;
  const at = q.get("shiftat") || "";
  const atMs = at ? (/^\d+$/.test(at) ? Number(at) : Date.parse(at)) : NaN;
  return { forced, atMs };
}

export function StreamTheme() {
  const vids = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    const { forced, atMs } = readOverrides();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer = 0;

    const syncVideos = (w: Record<ThemeName, number>) => {
      LAYERS.forEach((l, i) => {
        const v = vids.current[i];
        if (!v) return;
        const op = l.weight(w);
        v.style.opacity = op.toFixed(3);
        if (op > 0.001) {
          if (v.preload !== "auto") {
            v.preload = "auto";
            v.load();
          }
          if (mq.matches) v.pause();
          else if (v.paused) v.play().catch(() => {});
        } else if (!v.paused) v.pause();
      });
    };

    const set = (s: ShiftState) => {
      let { from, to, e } = s;
      if (mq.matches && s.fading) {
        from = to = e < 0.5 ? s.from : s.to;
        e = 0;
      }
      for (const [k, v] of Object.entries(themeVars(from, to, e))) root.style.setProperty(k, v);
      root.dataset.theme = e < 0.5 ? from : to;
      const w = Object.fromEntries(
        THEME_NAMES.map((t) => [t, (from === t ? 1 - e : 0) + (to === t ? e : 0)]),
      ) as Record<ThemeName, number>;
      syncVideos(w);
    };

    const loop = () => {
      const s = forced
        ? { from: forced, to: forced, e: 0, fading: false }
        : themeAt(isNaN(atMs) ? Date.now() : atMs);
      set(s);
      if (forced || !isNaN(atMs)) return;
      timer = window.setTimeout(loop, s.fading && !mq.matches ? 66 : 1000);
    };
    loop();

    const onMq = () => loop();
    mq.addEventListener("change", onMq);
    const onVis = () => {
      if (document.hidden) vids.current.forEach((v) => v?.pause());
      else loop();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearTimeout(timer);
      mq.removeEventListener("change", onMq);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div className="site-bg" aria-hidden>
      {LAYERS.map((l, i) => (
        <video
          key={l.key}
          ref={(el) => {
            vids.current[i] = el;
          }}
          className={`site-bg-video site-bg-${l.key}`}
          src={l.src}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          tabIndex={-1}
          style={{ opacity: 0 }}
        />
      ))}
      <div className="site-bg-shade" />
    </div>
  );
}
