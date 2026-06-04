import React from "react";

type SocialIcon = { id: string; platform: string; url: string };

interface SocialBadgeRowProps {
  icons: SocialIcon[];
  size?: "sm" | "md";
  className?: string;
}

const SOCIAL_SVGS: Record<string, React.ReactElement> = {
  instagram: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <radialGradient id="ig-g" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="1" y="1" width="22" height="22" rx="6" fill="url(#ig-g)" />
      <circle cx="12" cy="12" r="4.8" fill="none" stroke="white" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.4" fill="white" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="24" height="24" rx="5.5" fill="#000" />
      <path fill="white" d="M17.95 4.5h2.55l-5.57 6.37L21.5 19.5h-5.12l-4.02-5.26-4.6 5.26H5.22l5.95-6.8L2.5 4.5h5.25l3.63 4.8 4.57-4.8zm-.9 13.5h1.41L6.97 5.9H5.46L17.05 18z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="24" height="24" rx="5.5" fill="#1b1f23" />
      <path
        fill="white"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3.75A8.25 8.25 0 0 0 3.75 12c0 3.645 2.363 6.733 5.643 7.822.413.076.564-.179.564-.398v-1.42c-2.296.499-2.78-1.107-2.78-1.107-.375-.954-.916-1.208-.916-1.208-.749-.513.056-.502.056-.502.827.058 1.262.849 1.262.849.735 1.26 1.927.896 2.397.685.075-.533.288-.896.524-1.102-1.83-.208-3.754-.916-3.754-4.073 0-.9.321-1.635.849-2.21-.086-.208-.368-1.046.08-2.18 0 0 .692-.222 2.268.845A7.9 7.9 0 0 1 12 7.68a7.9 7.9 0 0 1 2.062.278c1.575-1.067 2.267-.845 2.267-.845.449 1.134.167 1.972.082 2.18.529.575.848 1.31.848 2.21 0 3.165-1.927 3.863-3.762 4.066.296.255.56.757.56 1.527v2.263c0 .22.15.476.567.396A8.253 8.253 0 0 0 20.25 12 8.25 8.25 0 0 0 12 3.75z"
      />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="24" height="24" rx="5.5" fill="#FF0000" />
      <path
        fill="white"
        d="M19.8 7.8a2.1 2.1 0 0 0-1.48-1.49C17.04 6 12 6 12 6s-5.04 0-6.32.31A2.1 2.1 0 0 0 4.2 7.8C3.9 9.08 3.9 12 3.9 12s0 2.92.3 4.2a2.1 2.1 0 0 0 1.48 1.49C6.96 18 12 18 12 18s5.04 0 6.32-.31a2.1 2.1 0 0 0 1.48-1.49c.3-1.28.3-4.2.3-4.2s0-2.92-.3-4.2zM10.2 14.7V9.3l4.82 2.7-4.82 2.7z"
      />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="24" height="24" rx="5.5" fill="#010101" />
      {/* teal offset layer */}
      <path
        fill="#69C9D0"
        d="M13 5h2.2c.2 1.3.9 2.4 2 3v2.1c-.8-.1-1.5-.4-2.1-.9v5A3.5 3.5 0 1 1 11.5 11h.5v2.2a1.3 1.3 0 1 0 1.3 1.3V5H13z"
        transform="translate(-0.8 0.5)"
      />
      {/* red offset layer */}
      <path
        fill="#EE1D52"
        d="M13 5h2.2c.2 1.3.9 2.4 2 3v2.1c-.8-.1-1.5-.4-2.1-.9v5A3.5 3.5 0 1 1 11.5 11h.5v2.2a1.3 1.3 0 1 0 1.3 1.3V5H13z"
        transform="translate(0.8 -0.5)"
      />
      {/* main white */}
      <path
        fill="white"
        d="M13 5h2.2c.2 1.3.9 2.4 2 3v2.1c-.8-.1-1.5-.4-2.1-.9v5A3.5 3.5 0 1 1 11.5 11h.5v2.2a1.3 1.3 0 1 0 1.3 1.3V5H13z"
      />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="24" height="24" rx="5.5" fill="#0077B5" />
      <path
        fill="white"
        d="M6.5 9.5h2.2V17H6.5V9.5zm1.1-3.5a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6zM10 9.5h2.1v1c.33-.53 1.04-1 2.15-1 2.3 0 2.72 1.5 2.72 3.5V17h-2.1v-3.58c0-.85-.01-1.95-1.19-1.95-1.19 0-1.37.93-1.37 1.88V17H10V9.5z"
      />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="24" height="24" rx="5.5" fill="#25D366" />
      <path
        fill="white"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 4.5a7.5 7.5 0 0 0-6.44 11.33L4 19.5l3.77-1.52A7.5 7.5 0 1 0 12 4.5zm4.32 10.88c-.18.51-1.04.97-1.44 1.03-.37.06-.84.08-1.36-.07a12.2 12.2 0 0 1-1.23-.46 9.7 9.7 0 0 1-3.71-3.28c-.5-.7-.85-1.52-.87-1.62-.02-.09-.18-.88.16-1.42.3-.47.72-.62.98-.63H9.2c.15 0 .36-.06.57.43l.71 1.74c.07.17.04.35-.06.5l-.3.43c-.1.14-.21.29-.09.57.7 1.2 1.47 1.97 2.68 2.6.25.14.41.12.57-.04l.57-.67c.15-.18.29-.2.48-.14l1.7.8c.2.09.34.14.37.23.03.09.03.49-.18.98z"
      />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <linearGradient id="em-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EA4335" />
          <stop offset="100%" stopColor="#FBBC05" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="5.5" fill="url(#em-g)" />
      <path
        fill="white"
        d="M5 8.5A1.5 1.5 0 0 1 6.5 7h11A1.5 1.5 0 0 1 19 8.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 15.5v-7zm1.5.87v6.13h11V9.37l-5.08 3.21a.75.75 0 0 1-.84 0L6.5 9.37zm10.3-.87H7.2l4.8 3.03 4.8-3.03z"
      />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="24" height="24" rx="5.5" fill="#34A853" />
      <path
        fill="white"
        d="M8.1 5.5A1.6 1.6 0 0 0 6.5 7.1c0 7.18 5.82 13 13 13a1.6 1.6 0 0 0 1.6-1.6v-2.9a1.6 1.6 0 0 0-1.3-1.57l-2.72-.55a1.6 1.6 0 0 0-1.49.44l-.85.85a11.1 11.1 0 0 1-4.24-4.24l.85-.85a1.6 1.6 0 0 0 .44-1.49L11.24 5.8A1.6 1.6 0 0 0 9.67 4.5H8.1V5.5z"
        transform="translate(-0.5 0)"
      />
    </svg>
  ),
  website: (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="24" height="24" rx="5.5" fill="#4285F4" />
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="white" strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="2.8" ry="6.5" fill="none" stroke="white" strokeWidth="1.5" />
      <line x1="5.5" y1="12" x2="18.5" y2="12" stroke="white" strokeWidth="1.5" />
      <line x1="6" y1="9" x2="18" y2="9" stroke="white" strokeWidth="1" />
      <line x1="6" y1="15" x2="18" y2="15" stroke="white" strokeWidth="1" />
    </svg>
  ),
};

export function getSocialSvg(platform: string): React.ReactElement {
  const key = platform.toLowerCase();
  return SOCIAL_SVGS[key] ?? SOCIAL_SVGS.website;
}

export function SocialBadgeRow({ icons, size = "md", className = "" }: SocialBadgeRowProps) {
  if (!icons || icons.length === 0) return null;

  const badgeSize = size === "sm" ? "w-7 h-7"  : "w-11 h-11";
  const iconSize  = size === "sm" ? "w-[18px] h-[18px]" : "w-7 h-7";
  const gap       = size === "sm" ? "gap-2"   : "gap-3";
  const mb        = size === "sm" ? "mb-3"    : "mb-6";

  return (
    <div className={`flex flex-row flex-wrap justify-center items-center ${gap} ${mb} ${className}`}>
      {icons.map((icon) => {
        const platform = icon.platform.toLowerCase();
        const href =
          platform === "email"
            ? icon.url.startsWith("mailto:") ? icon.url : `mailto:${icon.url}`
            : platform === "phone"
            ? icon.url.startsWith("tel:") ? icon.url : `tel:${icon.url}`
            : icon.url;

        return (
          <a
            key={icon.id}
            href={href}
            target={platform === "email" || platform === "phone" ? "_self" : "_blank"}
            rel="noopener noreferrer"
            className={`${badgeSize} bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform cursor-pointer overflow-hidden`}
          >
            <span className={`${iconSize} flex items-center justify-center`}>
              {getSocialSvg(icon.platform)}
            </span>
          </a>
        );
      })}
    </div>
  );
}
