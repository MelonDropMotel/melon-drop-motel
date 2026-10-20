const ANIM = "/images/desk/mdm-sucks-tower.webp";
const STILL = "/images/desk/mdm-sucks-tower-still.webp";

/**
 * The animated "MELON DROP MOTEL SUCKS" tower: the original transparent GIF,
 * re-encoded as a lossless animated WebP (true alpha, original palette colors),
 * cropped to the artwork. Reduced-motion visitors get a single still frame.
 */
export function MotelSign({ className = "" }: { className?: string }) {
  return (
    <span className={`tower-wrap shift-art pointer-events-none select-none ${className}`}>
      <picture className="tower-base block">
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
      {/* stream kit tuned copies: the waves read wrong under the purple / green filter */}
      <img src="/images/mockup/mdm-sucks-tower-purple.webp" alt="" aria-hidden width={640} height={611} loading="lazy" className="tower-tweak purple outline-none" />
      <img src="/images/mockup/mdm-sucks-tower-green.webp" alt="" aria-hidden width={640} height={611} loading="lazy" className="tower-tweak green outline-none" />
    </span>
  );
}
