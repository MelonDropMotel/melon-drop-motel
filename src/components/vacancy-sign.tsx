"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * Header neon: flips between VACANCY and NO VACANCY every 20-30 s (random each time)
 * with a 300-600 ms RGB-split / jitter / flicker glitch in the theme colours.
 * Width is reserved for "NO VACANCY" so the nav never moves. Reduced motion: plain swap.
 * aria-live is off so screen readers are not told every flip.
 * (A "mdm:vacancy" window event triggers a flip right away; used for screenshots.)
 */
export function VacancySign({ className }: { className?: string }) {
  const [no, setNo] = useState(false);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timers: number[] = [];
    let next = 0;
    const flip = () => {
      if (reduce.matches) {
        setNo((v) => !v);
      } else {
        const dur = rand(300, 600);
        setGlitch(true);
        timers.push(window.setTimeout(() => setNo((v) => !v), dur * 0.45));
        timers.push(window.setTimeout(() => setGlitch(false), dur));
      }
    };
    const schedule = () => {
      next = window.setTimeout(() => {
        flip();
        schedule();
      }, rand(20_000, 30_000));
    };
    schedule();
    const now = () => flip();
    window.addEventListener("mdm:vacancy", now);
    return () => {
      window.clearTimeout(next);
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("mdm:vacancy", now);
    };
  }, []);

  const label = no ? "NO VACANCY" : "VACANCY";
  return (
    <span className={cn("vacancy", no && "is-no", glitch && "is-glitch", className)} aria-live="off">
      <span className="vacancy-dot" aria-hidden />
      <span className="vacancy-box">
        <span className="vacancy-reserve" aria-hidden>
          NO VACANCY
        </span>
        <span className="vacancy-text" data-text={label}>
          {label}
        </span>
      </span>
    </span>
  );
}
