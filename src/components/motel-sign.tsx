const ANIM = "/images/desk/mdm-sucks-tower.webp";
const STILL = "/images/desk/mdm-sucks-tower-still.webp";

/**
 * The animated "MELON DROP MOTEL SUCKS" tower: the original transparent GIF,
 * re-encoded as a lossless animated WebP (true alpha, original palette colors),
 * cropped to the artwork. Reduced-motion visitors get a single still frame.
 */
export function MotelSign({ className = "" }: { className?: string }) {
  return (
    <picture className={`pointer-events-none block select-none ${className}`}>
      <source media="(prefers-reduced-motion: reduce)" srcSet={STILL} />
      <img
        src={ANIM}
        width={640}
        height={611}
        alt="Melon Drop Motel Sucks"
        loading="lazy"
        decoding="async"
        className="block h-auto w-full outline-none [filter:drop-shadow(0_0_10px_#00ffb540)]"
      />
    </picture>
  );
}
