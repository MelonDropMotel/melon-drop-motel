"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/data/site";

const KEY = "mdm-tuned-in";

export function BootSequence() {
  const [show, setShow] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setShow(window.localStorage.getItem(KEY) !== "1");
    } catch {
      setShow(true);
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    const t = window.setTimeout(dismiss, 3200);
    return () => window.clearTimeout(t);
  }, [show]);

  function dismiss() {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-bg text-fg"
      role="dialog"
      aria-label="Please stand by"
    >
      <div className="flex h-10 shrink-0">
        <span className="flex-1 bg-fg" />
        <span className="flex-1 bg-muted" />
        <span className="flex-1 bg-primary" />
        <span className="flex-1 bg-surface" />
        <span className="flex-1 bg-bg" />
        <span className="flex-1 bg-primary" />
        <span className="flex-1 bg-muted" />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="hud-label boot-copy">PLEASE STAND BY</p>
        <img
          src="/images/lockup.png"
          alt={SITE.name}
          className="mark boot-copy mt-6 w-full max-w-lg"
        />
        <p
          className="boot-copy mt-4 max-w-md text-xl text-muted"
          style={{ animationDelay: "120ms" }}
        >
          Checking you into a room.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="boot-copy mt-8 h-12 min-w-44 px-6 font-display text-xl tracking-[0.16em] text-bg bg-primary"
          style={{ animationDelay: "220ms" }}
        >
          TURN ON TV
        </button>
      </div>

      <div className="flex h-10 shrink-0">
        <span className="flex-1 bg-primary" />
        <span className="flex-1 bg-bg" />
        <span className="flex-1 bg-surface" />
        <span className="flex-1 bg-muted" />
        <span className="flex-1 bg-fg" />
        <span className="flex-1 bg-surface" />
        <span className="flex-1 bg-primary" />
      </div>
    </div>
  );
}
