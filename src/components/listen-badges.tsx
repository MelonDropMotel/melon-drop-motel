"use client";

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
  return (
    <div>
      <p className="hud-label mb-3">Also on</p>
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-4 pb-6">
        {BADGES.map((b) => (
          <li key={b.id} className="flex min-w-0 items-center gap-2">
            {b.href ? (
              <a
                href={b.href}
                target="_blank"
                rel="noreferrer"
                className="quiet block w-[12rem] shrink-0"
              >
                <img
                  src={b.src}
                  alt={b.alt}
                  className="block aspect-[268/56] h-auto w-full outline-none"
                />
              </a>
            ) : (
              <>
                <span className="block w-[12rem] shrink-0 opacity-80">
                  <img
                    src={b.src}
                    alt={`${b.alt} (coming soon)`}
                    className="block aspect-[268/56] h-auto w-full outline-none"
                  />
                </span>
                <span className="coming-soon-pill" aria-hidden="true">
                  Coming soon
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
