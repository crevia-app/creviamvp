import { useEffect, useState } from "react";

export const AnimatedKira = () => {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 3000);

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className="relative inline-block animate-float">
      <svg
        width="300"
        height="300"
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-2xl"
      >
        {/* Sparkles */}
        <g className="animate-sparkle">
          <circle cx="80" cy="100" r="4" fill="#D4A574" opacity="0.8" />
          <circle cx="220" cy="120" r="3" fill="#D4A574" opacity="0.6" />
          <circle cx="100" cy="80" r="3" fill="#D4A574" opacity="0.7" />
          <circle cx="240" cy="90" r="4" fill="#D4A574" opacity="0.8" />
          <circle cx="90" cy="130" r="3" fill="#D4A574" opacity="0.6" />
          <circle cx="230" cy="140" r="3" fill="#D4A574" opacity="0.7" />
        </g>

        {/* Tail - with wag animation */}
        <g className="origin-[220px_200px] animate-wag">
          <path
            d="M220 200 Q240 180, 250 190 Q260 200, 255 210 Q250 220, 240 215 Q230 210, 220 200"
            fill="#D4A574"
            stroke="#8B6F47"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        {/* Body */}
        <ellipse cx="150" cy="200" rx="70" ry="60" fill="#D4A574" />
        <ellipse cx="150" cy="200" rx="50" ry="45" fill="#F5DEB3" />

        {/* Head */}
        <circle cx="150" cy="130" r="65" fill="#D4A574" />
        <circle cx="150" cy="140" r="45" fill="#F5DEB3" />

        {/* Ears */}
        <g>
          <ellipse cx="105" cy="85" rx="25" ry="35" fill="#D4A574" />
          <ellipse cx="105" cy="90" rx="15" ry="20" fill="#F5DEB3" />
          <ellipse cx="195" cy="85" rx="25" ry="35" fill="#D4A574" />
          <ellipse cx="195" cy="90" rx="15" ry="20" fill="#F5DEB3" />
        </g>

        {/* Eyes */}
        <g>
          {blink ? (
            <>
              <path d="M125 120 Q130 125, 135 120" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M165 120 Q170 125, 175 120" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="130" cy="120" r="8" fill="#1a1a1a" />
              <circle cx="170" cy="120" r="8" fill="#1a1a1a" />
              <circle cx="132" cy="118" r="3" fill="white" />
              <circle cx="172" cy="118" r="3" fill="white" />
            </>
          )}
        </g>

        {/* Nose */}
        <ellipse cx="150" cy="145" rx="8" ry="6" fill="#1a1a1a" />

        {/* Whiskers */}
        <g stroke="#8B6F47" strokeWidth="2" strokeLinecap="round">
          <line x1="100" y1="140" x2="70" y2="135" />
          <line x1="100" y1="145" x2="70" y2="145" />
          <line x1="100" y1="150" x2="70" y2="155" />
          <line x1="200" y1="140" x2="230" y2="135" />
          <line x1="200" y1="145" x2="230" y2="145" />
          <line x1="200" y1="150" x2="230" y2="155" />
        </g>

        {/* Mouth - Happy smile */}
        <path
          d="M140 150 Q150 165, 160 150"
          stroke="#1a1a1a"
          strokeWidth="3"
          fill="white"
          strokeLinecap="round"
        />
        <circle cx="145" cy="158" r="4" fill="white" />
        <circle cx="155" cy="158" r="4" fill="white" />

        {/* Front legs */}
        <rect x="120" y="230" width="20" height="50" rx="10" fill="#D4A574" />
        <rect x="160" y="230" width="20" height="50" rx="10" fill="#D4A574" />
        <ellipse cx="130" cy="280" rx="12" ry="8" fill="#8B6F47" />
        <ellipse cx="170" cy="280" rx="12" ry="8" fill="#8B6F47" />
      </svg>

      {/* Kira label */}
      <div className="absolute -right-12 top-24 font-vollkorn text-3xl font-bold text-bronze animate-pulse">
        Kira
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }

          @keyframes wag {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-15deg); }
            75% { transform: rotate(15deg); }
          }

          @keyframes sparkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
          }

          .animate-float {
            animation: float 3s ease-in-out infinite;
          }

          .animate-wag {
            animation: wag 1s ease-in-out infinite;
            transform-origin: 220px 200px;
          }

          .animate-sparkle circle {
            animation: sparkle 2s ease-in-out infinite;
          }

          .animate-sparkle circle:nth-child(2) {
            animation-delay: 0.3s;
          }

          .animate-sparkle circle:nth-child(3) {
            animation-delay: 0.6s;
          }

          .animate-sparkle circle:nth-child(4) {
            animation-delay: 0.9s;
          }

          .animate-sparkle circle:nth-child(5) {
            animation-delay: 1.2s;
          }

          .animate-sparkle circle:nth-child(6) {
            animation-delay: 1.5s;
          }
        `
      }} />
    </div>
  );
};
