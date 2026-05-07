const HeroPattern = () => {
  return (
    <div
      className="absolute inset-0 overflow-hidden select-none pointer-events-none"
      aria-hidden="true"
    >
      {/* Subtle geometric pattern */}
      <svg
        className="absolute inset-0 w-full h-full text-foreground"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
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
          <pattern id="hero-geo-2" x="60" y="60" width="120" height="120" patternUnits="userSpaceOnUse">
            <circle cx="60" cy="60" r="28" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.07" />
            <path d="M30 0 Q52 22 30 44 Q8 22 30 0Z" fill="currentColor" opacity="0.05" />
            <path d="M0 60 Q0 30 30 30" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.08" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-geo)" />
        <rect width="100%" height="100%" fill="url(#hero-geo-2)" />
      </svg>

      {/* Bronze ambient glows */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-bronze/[0.05] dark:bg-bronze/[0.08] blur-[120px]" />
      <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full bg-bronze/[0.03] dark:bg-bronze/[0.06] blur-[140px]" />

      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--background))_80%)]" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};

export default HeroPattern;
