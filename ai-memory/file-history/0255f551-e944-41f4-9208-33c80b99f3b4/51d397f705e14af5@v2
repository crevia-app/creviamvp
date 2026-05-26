import { useRef, useEffect } from "react";

interface HeroPatternProps {
  spotlight?: boolean;
}

/**
 * African geometric pattern background.
 * Tile vocabulary: Kente diamond grid, Adinkra concentric rings,
 * Ndebele corner fills, Bogolan mudcloth cross-marks.
 *
 * spotlight=true enables the cursor/touch reveal effect.
 * CSS custom properties --mx / --my are mutated directly — zero React re-renders, 60fps.
 *
 * Reveal colours:
 *   light mode → rich dark-brown ink  (text-stone-700  #44403c)
 *   dark mode  → warm antique gold    (#c9aa80)
 */
const HeroPattern = ({ spotlight = false }: HeroPatternProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!spotlight) return;
    const el = containerRef.current;
    if (!el) return;

    const setCoords = (x: number, y: number) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${x - rect.left}px`);
      el.style.setProperty("--my", `${y - rect.top}px`);
    };

    const reset = () => {
      el.style.setProperty("--mx", "50%");
      el.style.setProperty("--my", "50%");
    };

    const onMouseMove = (e: MouseEvent) => setCoords(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) setCoords(e.touches[0].clientX, e.touches[0].clientY);
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", reset);
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", reset, { passive: true });

    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", reset);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", reset);
    };
  }, [spotlight]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden select-none ${
        spotlight ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={
        spotlight
          ? ({ "--mx": "50%", "--my": "50%" } as React.CSSProperties)
          : undefined
      }
      aria-hidden="true"
    >
      {/* ── Base pattern: always-visible ghost layer ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none text-foreground opacity-[0.065] dark:opacity-[0.095]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="crevia-african-base"
            x="0"
            y="0"
            width="160"
            height="160"
            patternUnits="userSpaceOnUse"
          >
            {/* Frame */}
            <rect x="6" y="6" width="148" height="148" fill="none" stroke="currentColor" strokeWidth="0.7" />
            {/* Kente diamond — large rotated square */}
            <path d="M80 10 L150 80 L80 150 L10 80 Z" fill="none" stroke="currentColor" strokeWidth="0.9" />
            {/* Inner diamond */}
            <path d="M80 34 L126 80 L80 126 L34 80 Z" fill="none" stroke="currentColor" strokeWidth="0.65" />
            {/* Adinkra concentric rings */}
            <circle cx="80" cy="80" r="26" fill="none" stroke="currentColor" strokeWidth="0.85" />
            <circle cx="80" cy="80" r="16" fill="none" stroke="currentColor" strokeWidth="0.65" />
            <circle cx="80" cy="80" r="4.5" fill="currentColor" />
            {/* Cardinal cross */}
            <line x1="80" y1="54" x2="80" y2="106" stroke="currentColor" strokeWidth="0.65" />
            <line x1="54" y1="80" x2="106" y2="80" stroke="currentColor" strokeWidth="0.65" />
            {/* Diagonal cross */}
            <line x1="61.6" y1="61.6" x2="98.4" y2="98.4" stroke="currentColor" strokeWidth="0.5" />
            <line x1="98.4" y1="61.6" x2="61.6" y2="98.4" stroke="currentColor" strokeWidth="0.5" />
            {/* Ndebele corner fills */}
            <path d="M0 0 L22 0 L0 22 Z" fill="currentColor" />
            <path d="M160 0 L138 0 L160 22 Z" fill="currentColor" />
            <path d="M0 160 L22 160 L0 138 Z" fill="currentColor" />
            <path d="M160 160 L138 160 L160 138 Z" fill="currentColor" />
            {/* Kente chevron strips */}
            <path d="M0 42 L10 34 L20 42 L30 34 L40 42 L50 34 L60 42 L70 34 L80 42 L90 34 L100 42 L110 34 L120 42 L130 34 L140 42 L150 34 L160 42" fill="none" stroke="currentColor" strokeWidth="0.75" />
            <path d="M0 118 L10 126 L20 118 L30 126 L40 118 L50 126 L60 118 L70 126 L80 118 L90 126 L100 118 L110 126 L120 118 L130 126 L140 118 L150 126 L160 118" fill="none" stroke="currentColor" strokeWidth="0.75" />
            {/* Bogolan cross-marks in quadrant interiors */}
            <path d="M43 43 L49 43 M46 40 L46 46" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M111 43 L117 43 M114 40 L114 46" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M43 117 L49 117 M46 114 L46 120" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M111 117 L117 117 M114 114 L114 120" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            {/* Diamond nodes at cardinal midpoints of outer frame */}
            <rect x="77" y="4.5" width="5.5" height="5.5" transform="rotate(45 80 7.25)" fill="currentColor" />
            <rect x="77" y="150" width="5.5" height="5.5" transform="rotate(45 80 152.75)" fill="currentColor" />
            <rect x="4.5" y="77" width="5.5" height="5.5" transform="rotate(45 7.25 80)" fill="currentColor" />
            <rect x="150" y="77" width="5.5" height="5.5" transform="rotate(45 152.75 80)" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#crevia-african-base)" />
      </svg>

      {/* ── Spotlight layers ── only when spotlight=true ── */}
      {spotlight && (
        <>
          {/* Bronze micro-glow that tracks the cursor/touch point */}
          <div
            className="absolute rounded-full pointer-events-none w-72 h-72 md:w-[420px] md:h-[420px]"
            style={{
              left: "var(--mx, 50%)",
              top: "var(--my, 50%)",
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, hsl(var(--bronze) / 0.15) 0%, hsl(var(--bronze) / 0.04) 55%, transparent 72%)",
              filter: "blur(22px)",
            }}
          />

          {/* High-contrast reveal layer — same tile at full weight, masked to spotlight shape
              Light mode: dark brown ink (#44403c = stone-700)
              Dark mode:  antique gold   (#c9aa80) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none text-stone-700 dark:text-[#c9aa80]"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            style={{
              maskImage:
                "radial-gradient(circle 420px at var(--mx, 50%) var(--my, 50%), black 0%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(circle 420px at var(--mx, 50%) var(--my, 50%), black 0%, transparent 100%)",
            }}
          >
            <defs>
              <pattern
                id="crevia-african-reveal"
                x="0"
                y="0"
                width="160"
                height="160"
                patternUnits="userSpaceOnUse"
              >
                <rect x="6" y="6" width="148" height="148" fill="none" stroke="currentColor" strokeWidth="0.85" />
                <path d="M80 10 L150 80 L80 150 L10 80 Z" fill="none" stroke="currentColor" strokeWidth="1.1" />
                <path d="M80 34 L126 80 L80 126 L34 80 Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
                <circle cx="80" cy="80" r="26" fill="none" stroke="currentColor" strokeWidth="1.1" />
                <circle cx="80" cy="80" r="16" fill="none" stroke="currentColor" strokeWidth="0.8" />
                <circle cx="80" cy="80" r="4.5" fill="currentColor" />
                <line x1="80" y1="54" x2="80" y2="106" stroke="currentColor" strokeWidth="0.8" />
                <line x1="54" y1="80" x2="106" y2="80" stroke="currentColor" strokeWidth="0.8" />
                <line x1="61.6" y1="61.6" x2="98.4" y2="98.4" stroke="currentColor" strokeWidth="0.65" />
                <line x1="98.4" y1="61.6" x2="61.6" y2="98.4" stroke="currentColor" strokeWidth="0.65" />
                <path d="M0 0 L22 0 L0 22 Z" fill="currentColor" />
                <path d="M160 0 L138 0 L160 22 Z" fill="currentColor" />
                <path d="M0 160 L22 160 L0 138 Z" fill="currentColor" />
                <path d="M160 160 L138 160 L160 138 Z" fill="currentColor" />
                <path d="M0 42 L10 34 L20 42 L30 34 L40 42 L50 34 L60 42 L70 34 L80 42 L90 34 L100 42 L110 34 L120 42 L130 34 L140 42 L150 34 L160 42" fill="none" stroke="currentColor" strokeWidth="0.9" />
                <path d="M0 118 L10 126 L20 118 L30 126 L40 118 L50 126 L60 118 L70 126 L80 118 L90 126 L100 118 L110 126 L120 118 L130 126 L140 118 L150 126 L160 118" fill="none" stroke="currentColor" strokeWidth="0.9" />
                <path d="M43 43 L49 43 M46 40 L46 46" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                <path d="M111 43 L117 43 M114 40 L114 46" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                <path d="M43 117 L49 117 M46 114 L46 120" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                <path d="M111 117 L117 117 M114 114 L114 120" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                <rect x="77" y="4.5" width="5.5" height="5.5" transform="rotate(45 80 7.25)" fill="currentColor" />
                <rect x="77" y="150" width="5.5" height="5.5" transform="rotate(45 80 152.75)" fill="currentColor" />
                <rect x="4.5" y="77" width="5.5" height="5.5" transform="rotate(45 7.25 80)" fill="currentColor" />
                <rect x="150" y="77" width="5.5" height="5.5" transform="rotate(45 152.75 80)" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#crevia-african-reveal)" />
          </svg>
        </>
      )}

      {/* Bronze ambient glows */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-bronze/[0.06] dark:bg-bronze/[0.09] blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full bg-bronze/[0.04] dark:bg-bronze/[0.07] blur-[140px] pointer-events-none" />

      {/* Radial vignette — fades pattern toward edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--background))_80%)] pointer-events-none" />
      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
};

export default HeroPattern;
