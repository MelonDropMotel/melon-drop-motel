"use client";

import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { NAV, LATEST, SITE, type Video } from "@/data/site";
import { cn, pad2 } from "@/lib/utils";
import { BootSequence } from "@/components/boot-sequence";
import { getChannelVideos } from "@/lib/youtube";

function useClock() {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const fmt = (d: Date) =>
      `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
    setNow(fmt(new Date()));
    const t = window.setInterval(() => setNow(fmt(new Date())), 1000);
    return () => window.clearInterval(t);
  }, []);
  return now;
}

function StaticBurst() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [burst, setBurst] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setBurst(true);
    const t = window.setTimeout(() => setBurst(false), 280);
    return () => window.clearTimeout(t);
  }, [pathname]);

  if (!burst) return null;
  return <div className="noise-burst" aria-hidden />;
}

function NavLink({
  label,
  to,
  compact,
}: {
  label: string;
  to: string;
  compact?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "tap-44 flex shrink-0 items-center justify-center px-2.5 transition-colors duration-150",
        compact ? "min-w-14" : "h-12",
        active ? "text-primary" : "text-muted hover:text-fg",
      )}
    >
      <span className="font-display text-xl tracking-[0.12em] sm:text-2xl">
        {label}
      </span>
    </Link>
  );
}

function NewsTicker({ text }: { text: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [copies, setCopies] = useState(4);
  const [duration, setDuration] = useState(40);

  useEffect(() => {
    const wrap = wrapRef.current;
    const probe = probeRef.current;
    if (!wrap || !probe) return;

    const measure = () => {
      const unit = probe.getBoundingClientRect().width;
      const view = wrap.clientWidth;
      if (unit < 1 || view < 1) return;
      const n = Math.max(2, Math.ceil(view / unit) + 1);
      setCopies(n);
      setDuration(Math.max(28, (n * unit) / 48));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [text]);

  const strip = Array.from({ length: copies }, (_, i) => (
    <span key={i} className="shrink-0">
      {text}
    </span>
  ));

  return (
    <div
      ref={wrapRef}
      className="hidden overflow-hidden border-t border-fg/10 bg-bg md:block"
    >
      <span
        ref={probeRef}
        className="invisible pointer-events-none absolute whitespace-nowrap text-sm tracking-[0.14em]"
      >
        {text}
      </span>
      <div
        className="ticker whitespace-nowrap py-2 text-sm tracking-[0.14em] text-muted"
        style={{ animationDuration: `${duration}s` }}
      >
        <span className="flex shrink-0">{strip}</span>
        <span className="flex shrink-0" aria-hidden>
          {strip}
        </span>
      </div>
    </div>
  );
}

export function BroadcastShell({ children }: { children: React.ReactNode }) {
  const clock = useClock();
  const [latest, setLatest] = useState<Video>(LATEST);

  useEffect(() => {
    let cancelled = false;

    async function load(fresh: boolean) {
      try {
        const c = await getChannelVideos({ data: { fresh } });
        if (!cancelled) setLatest(c.latest);
      } catch {
        /* keep whatever is on screen */
      }
    }

    load(false);
    const poll = window.setInterval(() => load(true), 2 * 60 * 1000);
    const onVis = () => {
      if (document.visibilityState === "visible") load(true);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const epLabel = latest.ep
    ? `EP.${String(latest.ep).padStart(3, "0")} ${latest.title}`
    : latest.title;
  const ticker = [
    `NOW SHOWING · ${epLabel}`,
    SITE.tagline,
    `LIVE MOVIE NIGHTS · TWITCH @melondropmotel`,
    `SUBSCRIBE ${SITE.youtubeHandle}`,
    `ENJOY YOUR STAY`,
  ].join("   ·   ");
  const tickerLoop = `${ticker}   ·   `;

  return (
    <div className="scanlines min-h-dvh bg-bg text-fg">
      <BootSequence />
      <StaticBurst />

      <header className="sticky top-0 z-20 overflow-hidden border-b border-fg/10 bg-bg/95">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-1.5">
          <Link to="/" className="flex shrink-0 items-center gap-2 py-1 pr-2">
            <img
              src="/images/mark.png"
              alt=""
              className="mark h-9 w-auto sm:h-11"
            />
            <span className="whitespace-nowrap font-display text-2xl tracking-[0.1em] text-fg sm:text-3xl">
              {SITE.name}
            </span>
          </Link>

          <nav
            className="hidden min-w-0 flex-1 flex-nowrap items-center justify-end md:flex"
            aria-label="Menu"
          >
            {NAV.map((c) => (
              <NavLink key={c.to} {...c} />
            ))}
          </nav>

          <span className="hidden shrink-0 items-center gap-3 pl-2 text-sm tracking-[0.16em] text-primary lg:flex">
            <span className="rec-dot size-2 rounded-full bg-primary" />
            <span>VACANCY</span>
            <span className="tabular-nums text-muted">{clock || "--:--:--"}</span>
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 md:pb-10">
        {children}
      </main>

      <NewsTicker text={tickerLoop} />

      <nav
        className="fixed inset-x-0 bottom-0 z-20 flex overflow-x-auto border-t border-fg/10 bg-bg/95 md:hidden"
        aria-label="Menu"
      >
        {NAV.map((c) => (
          <NavLink key={c.to} compact {...c} />
        ))}
      </nav>
    </div>
  );
}
