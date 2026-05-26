import { useRef, useEffect } from "react";

interface HeroPatternProps {
  spotlight?: boolean;
}

/**
 * Subtle geometric pattern background for hero / CTA sections.
 *
 * spotlight=true enables the cursor+touch reveal effect.
 * --mx / --my CSS vars are mutated directly on the container — zero React re-renders, 60fps.
 *
 * Mobile fix: touchmove/touchend are on `window`, not `el`.
 * Hero content (buttons, text) sits at z-10 and intercepts touches before they reach
 * the background container. Listening globally means any finger movement on the hero
 * updates the spotlight regardless of which element is touched.
 *
 * Reveal colours:
 *   light mode → warm charcoal  (text-stone-600)
 *   dark mode  → antique gold   (#c9aa80)
 */
const HeroPattern = ({ spotlight = false }: HeroPatternProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!spotlight) return;
    const el = containerRef.current;
    if (!el) return;

    const setCoords = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${clientX - rect.left}px`);
      el.style.setProperty("--my", `${clientY - rect.top}px`);
    };

    const reset = () => {
      el.style.setProperty("--mx", "50%");
      el.style.setProperty("--my", "50%");
    };

    // Desktop — mouse events on element work fine
    const onMouseMove = (e: MouseEvent) => setCoords(e.clientX, e.clientY);

    // Mobile — must listen on window because hero content (z-10) intercepts
    // touchstart on buttons/text, so touchmove never reaches the background el.
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) setCoords(e.touches[0].clientX, e.touches[0].clientY);
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", reset);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", reset, { passive: true });

    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", reset);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", reset);
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
      {/* ── Base pattern — always-visible ghost layer ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none text-foreground"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Primary tile — 120×120 abstract geometry */}
          <pattern id="hero-geo" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="22" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.13" />
            <path d="M90 8 Q112 30 90 52 Q68 30 90 8Z" fill="currentColor" opacity="0.07" />
            <line x1="10" y1="70" x2="50" y2="110" stroke="currentColor" strokeWidth="1.2" opacity="0.10" />
            <line x1="50" y1="70" x2="10" y2="110" stroke="currentColor" strokeWidth="1.2" opacity="0.10" />
            <path d="M120 120 Q120 70 70 70" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.12" />
            <path d="M120 120 Q120 85 85 85" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.08" />
            <circle cx="60" cy="60" r="2.5" fill="currentColor" opacity="0.13" />
            <circle cx="0"   cy="0"   r="2" fill="currentColor" opacity="0.09" />
            <circle cx="120" cy="0"   r="2" fill="currentColor" opacity="0.09" />
            <circle cx="0"   cy="120" r="2" fill="currentColor" opacity="0.09" />
            <circle cx="120" cy="120" r="2" fill="currentColor" opacity="0.09" />
            <rect x="52" y="52" width="16" height="16" rx="1"
                  transform="rotate(45 60 60)"
                  fill="none" stroke="currentColor" strokeWidth="1" opacity="0.09" />
          </pattern>

          {/* Secondary tile — offset by (60,60) to break repetition */}
          <pattern id="hero-geo-2" x="60" y="60" width="120" height="120" patternUnits="userSpaceOnUse">
            <circle cx="60" cy="60" r="28" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.07" />
            <path d="M30 0 Q52 22 30 44 Q8 22 30 0Z" fill="currentColor" opacity="0.05" />
            <path d="M0 60 Q0 30 30 30" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.08" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-geo)" />
        <rect width="100%" height="100%" fill="url(#hero-geo-2)" />
      </svg>

      {/* ── Spotlight layers — only when spotlight=true ── */}
      {spotlight && (
        <>
          {/* Bronze micro-glow that tracks cursor / finger */}
          <div
            className="absolute rounded-full pointer-events-none w-72 h-72 md:w-[420px] md:h-[420px]"
            style={{
              left: "var(--mx, 50%)",
              top: "var(--my, 50%)",
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, hsl(var(--bronze) / 0.13) 0%, hsl(var(--bronze) / 0.04) 55%, transparent 72%)",
              filter: "blur(20px)",
            }}
          />

          {/* High-contrast reveal — same tile shapes at 3-4× opacity, masked to cursor radius.
              Light mode: warm charcoal (stone-600).  Dark mode: antique gold (#c9aa80). */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none text-stone-600 dark:text-[#c9aa80]"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            style={{
              maskImage:
                "radial-gradient(circle 400px at var(--mx, 50%) var(--my, 50%), black 0%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(circle 400px at var(--mx, 50%) var(--my, 50%), black 0%, transparent 100%)",
            }}
          >
            <defs>
              <pattern id="hero-geo-reveal" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="22" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.45" />
                <path d="M90 8 Q112 30 90 52 Q68 30 90 8Z" fill="currentColor" opacity="0.28" />
                <line x1="10" y1="70" x2="50" y2="110" stroke="currentColor" strokeWidth="1.4" opacity="0.38" />
                <line x1="50" y1="70" x2="10" y2="110" stroke="currentColor" strokeWidth="1.4" opacity="0.38" />
                <path d="M120 120 Q120 70 70 70" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.42" />
                <path d="M120 120 Q120 85 85 85" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.32" />
                <circle cx="60" cy="60" r="2.5" fill="currentColor" opacity="0.50" />
                <circle cx="0"   cy="0"   r="2" fill="currentColor" opacity="0.35" />
                <circle cx="120" cy="0"   r="2" fill="currentColor" opacity="0.35" />
                <circle cx="0"   cy="120" r="2" fill="currentColor" opacity="0.35" />
                <circle cx="120" cy="120" r="2" fill="currentColor" opacity="0.35" />
                <rect x="52" y="52" width="16" height="16" rx="1"
                      transform="rotate(45 60 60)"
                      fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.36" />
              </pattern>

              <pattern id="hero-geo-reveal-2" x="60" y="60" width="120" height="120" patternUnits="userSpaceOnUse">
                <circle cx="60" cy="60" r="28" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.30" />
                <path d="M30 0 Q52 22 30 44 Q8 22 30 0Z" fill="currentColor" opacity="0.22" />
                <path d="M0 60 Q0 30 30 30" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.30" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-geo-reveal)" />
            <rect width="100%" height="100%" fill="url(#hero-geo-reveal-2)" />
          </svg>
        </>
      )}

      {/* Bronze ambient glows */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-bronze/[0.05] dark:bg-bronze/[0.08] blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full bg-bronze/[0.03] dark:bg-bronze/[0.06] blur-[140px] pointer-events-none" />

      {/* Radial vignette — fades pattern toward edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--background))_80%)] pointer-events-none" />
      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
};

export default HeroPattern;
