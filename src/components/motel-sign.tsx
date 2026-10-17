import { useEffect, useState } from "react";

const STILL = "/images/desk/mdm-sucks-tower-still.webp";
const ALT = "Melon Drop Motel Sucks";

/**
 * The animated "MELON DROP MOTEL SUCKS" tower. The source GIF is transparent;
 * these encodes are composited onto the site background (#0d0b0c) so they sit
 * directly on the page in every browser (Safari can't do WebM alpha).
 * Reduced-motion visitors keep the still frame.
 */
export function MotelSign({ className = "" }: { className?: string }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    setAnimate(!mq?.matches);
    const onChange = () => setAnimate(!mq?.matches);
    mq?.addEventListener?.("change", onChange);
    return () => mq?.removeEventListener?.("change", onChange);
  }, []);

  const media = "block aspect-[16/9] h-auto w-full";
  return (
    <div className={className}>
      {animate ? (
        <video
          className={media}
          width={960}
          height={540}
          poster={STILL}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-label={ALT}
          role="img"
        >
          <source src="/images/desk/mdm-sucks-tower.webm" type="video/webm" />
          <source src="/images/desk/mdm-sucks-tower.mp4" type="video/mp4" />
        </video>
      ) : (
        <img className={media} src={STILL} width={960} height={540} alt={ALT} decoding="async" />
      )}
    </div>
  );
}
