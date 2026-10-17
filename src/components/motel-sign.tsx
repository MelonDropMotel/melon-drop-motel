import { useEffect, useState } from "react";

const STILL = "/images/desk/mdm-sucks-tower-still.webp";
const ALT = "Melon Drop Motel Sucks";

/**
 * The animated "MELON DROP MOTEL SUCKS" tower. The source GIF is transparent;
 * these encodes are composited onto the site background (pure black) and drawn with mix-blend-mode: screen, so black drops out and they sit
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

  const media =
    "block aspect-[16/9] h-auto w-full mix-blend-screen [mask-image:radial-gradient(ellipse_at_center,#000_62%,transparent_98%)]";
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
