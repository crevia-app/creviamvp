/**
 * Premium geometric pattern background for the hero section.
 * Inspired by abstract tessellated shapes — circles, petals, crosses —
 * rendered as an inline SVG so it works seamlessly in light & dark mode
 * using CSS custom-property colours.
 */
const HeroPattern = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {/* SVG pattern layer */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Geometric tile — 120×120 unit cell */}
          <pattern id="hero-geo" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            {/* Circle — top-left quadrant */}
            <circle cx="30" cy="30" r="22" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.07" />
            {/* Petal arcs — top-right */}
            <path d="M90 8 Q112 30 90 52 Q68 30 90 8Z" fill="currentColor" opacity="0.04" />
            {/* Cross / X — bottom-left */}
            <line x1="10" y1="70" x2="50" y2="110" stroke="currentColor" strokeWidth="1" opacity="0.06" />
            <line x1="50" y1="70" x2="10" y2="110" stroke="currentColor" strokeWidth="1" opacity="0.06" />
            {/* Quarter circle — bottom-right */}
            <path d="M120 120 Q120 70 70 70" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.07" />
            <path d="M120 120 Q120 85 85 85" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.05" />
            {/* Dot grid accent */}
            <circle cx="60" cy="60" r="2" fill="currentColor" opacity="0.08" />
            <circle cx="0" cy="0" r="2" fill="currentColor" opacity="0.06" />
            <circle cx="120" cy="0" r="2" fill="currentColor" opacity="0.06" />
            <circle cx="0" cy="120" r="2" fill="currentColor" opacity="0.06" />
            <circle cx="120" cy="120" r="2" fill="currentColor" opacity="0.06" />
            {/* Diamond — center */}
            <rect x="52" y="52" width="16" height="16" rx="1" transform="rotate(45 60 60)" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.05" />
          </pattern>

          {/* Second pattern layer — offset for depth */}
          <pattern id="hero-geo-2" x="60" y="60" width="120" height="120" patternUnits="userSpaceOnUse">
            <circle cx="60" cy="60" r="28" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.04" />
            <path d="M30 0 Q52 22 30 44 Q8 22 30 0Z" fill="currentColor" opacity="0.03" />
            <path d="M0 60 Q0 30 30 30" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.05" />
          </pattern>
        </defs>

        {/* Render both pattern layers */}
        <rect width="100%" height="100%" fill="url(#hero-geo)" className="text-foreground" />
        <rect width="100%" height="100%" fill="url(#hero-geo-2)" className="text-foreground" />
      </svg>

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
