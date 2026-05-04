import { useRef, useEffect } from "react";

interface HeroPatternProps {
  spotlight?: boolean;
}

/**
 * Premium geometric pattern background for hero sections.
 * Pass spotlight=true to enable the cursor-reveal effect on the hero.
 * Uses CSS custom properties + direct DOM mutation — zero React re-renders, 60fps.
 */
const HeroPattern = ({ spotlight = false }: HeroPatternProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!spotlight) return;
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    };

    const onLeave = () => {
      el.style.setProperty("--mx", "50%");
      el.style.setProperty("--my", "50%");
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [spotlight]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      style={spotlight ? ({ "--mx": "50%", "--my": "50%" } as React.CSSProperties) : undefined}
      aria-hidden="true"
    >
      {/* Base pattern layer — subtle, always visible */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="hero-geo" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="22" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.13" />
            <path d="M90 8 Q112 30 90 52 Q68 30 90 8Z" fill="currentColor" opacity="0.08" />
            <line x1="10" y1="70" x2="50" y2="110" stroke="currentColor" strokeWidth="1.2" opacity="0.11" />
            <line x1="50" y1="70" x2="10" y2="110" stroke="currentColor" strokeWidth="1.2" opacity="0.11" />
            <path d="M120 120 Q120 70 70 70" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.13" />
            <path d="M120 120 Q120 85 85 85" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.09" />
            <circle cx="60" cy="60" r="2.5" fill="currentColor" opacity="0.14" />
            <circle cx="0" cy="0" r="2" fill="currentColor" opacity="0.1" />
            <circle cx="120" cy="0" r="2" fill="currentColor" opacity="0.1" />
            <circle cx="0" cy="120" r="2" fill="currentColor" opacity="0.1" />
            <circle cx="120" cy="120" r="2" fill="currentColor" opacity="0.1" />
            <rect x="52" y="52" width="16" height="16" rx="1" transform="rotate(45 60 60)" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1" />
          </pattern>
          <pattern id="hero-geo-2" x="60" y="60" width="120" height="120" patternUnits="userSpaceOnUse">
            <circle cx="60" cy="60" r="28" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.08" />
            <path d="M30 0 Q52 22 30 44 Q8 22 30 0Z" fill="currentColor" opacity="0.06" />
            <path d="M0 60 Q0 30 30 30" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.09" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-geo)" className="text-foreground" />
        <rect width="100%" height="100%" fill="url(#hero-geo-2)" className="text-foreground" />
      </svg>

      {/* Spotlight reveal layer — only rendered when spotlight=true */}
      {spotlight && (
        <svg
          className="absolute inset-0 w-full h-full text-slate-700 dark:text-slate-300"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          style={{
            maskImage: "radial-gradient(circle 340px at var(--mx, 50%) var(--my, 50%), black 0%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(circle 340px at var(--mx, 50%) var(--my, 50%), black 0%, transparent 100%)",
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
              <circle cx="60" cy="60" r="2.5" fill="currentColor" opacity="0.5" />
              <circle cx="0" cy="0" r="2" fill="currentColor" opacity="0.35" />
              <circle cx="120" cy="0" r="2" fill="currentColor" opacity="0.35" />
              <circle cx="0" cy="120" r="2" fill="currentColor" opacity="0.35" />
              <circle cx="120" cy="120" r="2" fill="currentColor" opacity="0.35" />
              <rect x="52" y="52" width="16" height="16" rx="1" transform="rotate(45 60 60)" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.36" />
            </pattern>
            <pattern id="hero-geo-reveal-2" x="60" y="60" width="120" height="120" patternUnits="userSpaceOnUse">
              <circle cx="60" cy="60" r="28" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.3" />
              <path d="M30 0 Q52 22 30 44 Q8 22 30 0Z" fill="currentColor" opacity="0.22" />
              <path d="M0 60 Q0 30 30 30" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-geo-reveal)" />
          <rect width="100%" height="100%" fill="url(#hero-geo-reveal-2)" />
        </svg>
      )}

      {/* Bronze accent glow — top-right */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-bronze/[0.06] dark:bg-bronze/[0.08] blur-[120px]" />
      {/* Bronze accent glow — bottom-left */}
      <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full bg-bronze/[0.04] dark:bg-bronze/[0.06] blur-[140px]" />

      {/* Subtle radial vignette that fades the pattern edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--background))_80%)]" />

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};

export default HeroPattern;
