"use client";

import { useState } from "react";

const BADGES = [
  {
    id: "spotify",
    href: "https://open.spotify.com/show/0WCpWEgDWCPSxWlxq6PpRa",
    src: "/images/badges/spotify.svg",
    alt: "Listen on Spotify",
  },
  {
    id: "apple",
    href: null,
    src: "/images/badges/apple-podcasts.svg",
    alt: "Listen on Apple Podcasts",
  },
  {
    id: "iheart",
    href: null,
    src: "/images/badges/iheart.svg",
    alt: "Listen on iHeartRadio",
  },
] as const;

export function ListenBadges() {
  const [soon, setSoon] = useState<string | null>(null);

  return (
    <div>
      <p className="hud-label mb-3">Also on</p>
      <ul className="flex flex-wrap items-start gap-3">
        {BADGES.map((b) => (
          <li key={b.id} className="w-[11.5rem]">
            {b.href ? (
              <a
                href={b.href}
                target="_blank"
                rel="noreferrer"
                className="quiet block"
              >
                <img src={b.src} alt={b.alt} className="h-11 w-auto" />
              </a>
            ) : (
              <button
                type="button"
                className="quiet block"
                onClick={() => setSoon(b.id)}
                aria-label={`${b.alt} (coming soon)`}
              >
                <img src={b.src} alt={b.alt} className="h-11 w-auto" />
              </button>
            )}
            {b.href ? null : (
              <p
                className={`mt-1 text-sm tracking-[0.08em] ${
                  soon === b.id ? "text-muted" : "invisible"
                }`}
              >
                Coming soon
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
