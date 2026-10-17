import { useEffect, useRef, useState } from "react";

const POSTER = "/images/desk/mdm-sucks-tower-poster.webp";
const ALT = "Melon Drop Motel Sucks";

/** Looping "station ID" tower, framed like the other motel TVs. */
export function StationId({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPlay(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={ref} className={`crt-bezel ${className}`}>
      <div className="crt-screen">
        {play ? (
          <video
            className="block h-full w-full object-cover"
            width={960}
            height={540}
            poster={POSTER}
            autoPlay
            loop
            muted
            playsInline
            aria-label={ALT}
          >
            <source src="/images/desk/mdm-sucks-tower.webm" type="video/webm" />
            <source src="/images/desk/mdm-sucks-tower.mp4" type="video/mp4" />
          </video>
        ) : (
          <img
            className="block h-full w-full object-cover"
            src={POSTER}
            width={960}
            height={540}
            loading="lazy"
            decoding="async"
            alt={ALT}
          />
        )}
      </div>
    </figure>
  );
}
