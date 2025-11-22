import { useEffect, useState } from "react";

export const AnimatedKira = () => {
  const [blink, setBlink] = useState(false);
  const [earTwitch, setEarTwitch] = useState(false);

  useEffect(() => {
    // Blinking animation
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3500);

    // Ear twitch animation
    const earInterval = setInterval(() => {
      setEarTwitch(true);
      setTimeout(() => setEarTwitch(false), 300);
    }, 5000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(earInterval);
    };
  }, []);

  return (
    <div className="relative inline-block">
      <svg
        width="320"
        height="320"
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-2xl"
      >
        <defs>
          {/* Gradients for realistic fur */}
          <radialGradient id="bodyGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#E8B870" />
            <stop offset="50%" stopColor="#D4A462" />
            <stop offset="100%" stopColor="#C09050" />
          </radialGradient>
          
          <radialGradient id="bellyGradient" cx="50%" cy="30%">
            <stop offset="0%" stopColor="#FFF5E6" />
            <stop offset="70%" stopColor="#F5E6D3" />
            <stop offset="100%" stopColor="#E8D4B8" />
          </radialGradient>

          <radialGradient id="noseGradient" cx="40%" cy="30%">
            <stop offset="0%" stopColor="#4A3428" />
            <stop offset="100%" stopColor="#2C1F19" />
          </radialGradient>

          <linearGradient id="eyeShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B6F47" />
            <stop offset="100%" stopColor="#6B5437" />
          </linearGradient>
        </defs>

        {/* Floating sparkles */}
        <g className="animate-sparkle-float">
          <circle cx="70" cy="80" r="3" fill="#F4C87F" opacity="0.7">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="250" cy="90" r="2.5" fill="#F4C87F" opacity="0.6">
            <animate attributeName="opacity" values="0.2;0.9;0.2" dur="2.3s" repeatCount="indefinite" begin="0.3s" />
          </circle>
          <circle cx="90" cy="120" r="2" fill="#F4C87F" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.1s" repeatCount="indefinite" begin="0.6s" />
          </circle>
          <circle cx="240" cy="130" r="3" fill="#F4C87F" opacity="0.7">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" begin="0.9s" />
          </circle>
        </g>

        {/* Main container with breathing animation */}
        <g className="animate-breathe origin-center">
          {/* Shadow */}
          <ellipse cx="160" cy="290" rx="80" ry="15" fill="#000000" opacity="0.15" />

          {/* Tail with natural curve and wag */}
          <g className="animate-tail-wag" style={{ transformOrigin: '240px 220px' }}>
            <path
              d="M 235 220 Q 260 200 275 210 Q 285 220 282 235 Q 275 250 260 245 L 250 238"
              fill="url(#bodyGradient)"
              stroke="#A68350"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Tail tuft */}
            <ellipse cx="280" cy="230" rx="12" ry="15" fill="#8B6F47" opacity="0.6" />
            <ellipse cx="278" cy="228" rx="8" ry="11" fill="#6B5437" opacity="0.5" />
          </g>

          {/* Back legs */}
          <g>
            <ellipse cx="135" cy="235" rx="18" ry="35" fill="url(#bodyGradient)" />
            <rect x="127" y="250" width="16" height="30" rx="8" fill="url(#bodyGradient)" />
            <ellipse cx="135" cy="280" rx="14" ry="10" fill="#A68350" />
            
            <ellipse cx="185" cy="235" rx="18" ry="35" fill="url(#bodyGradient)" />
            <rect x="177" y="250" width="16" height="30" rx="8" fill="url(#bodyGradient)" />
            <ellipse cx="185" cy="280" rx="14" ry="10" fill="#A68350" />
          </g>

          {/* Body */}
          <ellipse cx="160" cy="205" rx="75" ry="55" fill="url(#bodyGradient)" />
          <ellipse cx="160" cy="210" rx="55" ry="40" fill="url(#bellyGradient)" />

          {/* Front legs */}
          <g>
            <ellipse cx="125" cy="235" rx="16" ry="33" fill="url(#bodyGradient)" />
            <rect x="118" y="250" width="14" height="28" rx="7" fill="url(#bodyGradient)" />
            <ellipse cx="125" cy="278" rx="12" ry="9" fill="#A68350" />
            {/* Paw details */}
            <ellipse cx="121" cy="278" rx="3" ry="2.5" fill="#8B6F47" opacity="0.6" />
            <ellipse cx="129" cy="278" rx="3" ry="2.5" fill="#8B6F47" opacity="0.6" />
            
            <ellipse cx="195" cy="235" rx="16" ry="33" fill="url(#bodyGradient)" />
            <rect x="188" y="250" width="14" height="28" rx="7" fill="url(#bodyGradient)" />
            <ellipse cx="195" cy="278" rx="12" ry="9" fill="#A68350" />
            <ellipse cx="191" cy="278" rx="3" ry="2.5" fill="#8B6F47" opacity="0.6" />
            <ellipse cx="199" cy="278" rx="3" ry="2.5" fill="#8B6F47" opacity="0.6" />
          </g>

          {/* Neck and chest */}
          <ellipse cx="160" cy="155" rx="40" ry="35" fill="url(#bodyGradient)" />
          <ellipse cx="160" cy="160" rx="30" ry="25" fill="url(#bellyGradient)" />

          {/* Head */}
          <ellipse cx="160" cy="120" rx="50" ry="48" fill="url(#bodyGradient)" />
          
          {/* Facial features base */}
          <ellipse cx="160" cy="135" rx="38" ry="32" fill="url(#bellyGradient)" />

          {/* Ears with twitch animation */}
          <g className={earTwitch ? "animate-ear-twitch" : ""}>
            {/* Left ear */}
            <ellipse cx="125" cy="85" rx="22" ry="28" fill="url(#bodyGradient)" transform="rotate(-15 125 85)" />
            <ellipse cx="125" cy="88" rx="14" ry="18" fill="#F5DEB3" transform="rotate(-15 125 88)" />
            <path d="M 115 88 Q 120 95 125 92" stroke="#D4A462" strokeWidth="1" fill="none" />
            
            {/* Right ear */}
            <ellipse cx="195" cy="85" rx="22" ry="28" fill="url(#bodyGradient)" transform="rotate(15 195 85)" />
            <ellipse cx="195" cy="88" rx="14" ry="18" fill="#F5DEB3" transform="rotate(15 195 88)" />
            <path d="M 195 92 Q 200 95 205 88" stroke="#D4A462" strokeWidth="1" fill="none" />
          </g>

          {/* Fur tufts on head */}
          <path d="M 140 75 Q 145 70 150 75" stroke="#C09050" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 170 75 Q 175 70 180 75" stroke="#C09050" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Eyes */}
          <g>
            {blink ? (
              <>
                <path d="M 135 115 Q 143 120 151 115" stroke="#2C1F19" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M 169 115 Q 177 120 185 115" stroke="#2C1F19" strokeWidth="3" strokeLinecap="round" fill="none" />
              </>
            ) : (
              <>
                {/* Left eye */}
                <ellipse cx="143" cy="118" rx="11" ry="13" fill="url(#eyeShine)" />
                <ellipse cx="143" cy="118" rx="9" ry="11" fill="#3D2817" />
                <circle cx="143" cy="118" r="7" fill="#2C1F19" />
                <ellipse cx="145" cy="115" rx="3" ry="4" fill="#FFFFFF" opacity="0.9" />
                <circle cx="140" cy="121" r="1.5" fill="#FFFFFF" opacity="0.6" />
                
                {/* Right eye */}
                <ellipse cx="177" cy="118" rx="11" ry="13" fill="url(#eyeShine)" />
                <ellipse cx="177" cy="118" rx="9" ry="11" fill="#3D2817" />
                <circle cx="177" cy="118" r="7" fill="#2C1F19" />
                <ellipse cx="179" cy="115" rx="3" ry="4" fill="#FFFFFF" opacity="0.9" />
                <circle cx="174" cy="121" r="1.5" fill="#FFFFFF" opacity="0.6" />
              </>
            )}
          </g>

          {/* Nose */}
          <ellipse cx="160" cy="143" rx="10" ry="8" fill="url(#noseGradient)" />
          <ellipse cx="158" cy="141" rx="3" ry="2.5" fill="#6B5437" opacity="0.5" />

          {/* Mouth - adorable smile */}
          <path
            d="M 160 147 L 160 153"
            stroke="#2C1F19"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 145 153 Q 160 163 175 153"
            stroke="#2C1F19"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Subtle smile highlight */}
          <path
            d="M 148 154 Q 160 161 172 154"
            stroke="#FFFFFF"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Whiskers */}
          <g stroke="#8B6F47" strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
            <line x1="110" y1="135" x2="75" y2="130" />
            <line x1="110" y1="140" x2="75" y2="142" />
            <line x1="110" y1="145" x2="78" y2="152" />
            
            <line x1="210" y1="135" x2="245" y2="130" />
            <line x1="210" y1="140" x2="245" y2="142" />
            <line x1="210" y1="145" x2="242" y2="152" />
          </g>

          {/* Spots/markings */}
          <ellipse cx="130" cy="210" rx="8" ry="6" fill="#C09050" opacity="0.3" />
          <ellipse cx="190" cy="210" rx="8" ry="6" fill="#C09050" opacity="0.3" />
        </g>

        {/* Kira name label */}
        <text x="270" y="140" fill="#D4A462" fontSize="32" fontWeight="bold" fontFamily="Vollkorn, serif" className="animate-pulse-gentle">
          Kira
        </text>
      </svg>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes breathe {
            0%, 100% { transform: scale(1) translateY(0); }
            50% { transform: scale(1.02) translateY(-3px); }
          }

          @keyframes tail-wag {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-12deg); }
            75% { transform: rotate(12deg); }
          }

          @keyframes sparkle-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }

          @keyframes ear-twitch {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-8deg); }
          }

          @keyframes pulse-gentle {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }

          .animate-breathe {
            animation: breathe 4s ease-in-out infinite;
            transform-origin: center;
          }

          .animate-tail-wag {
            animation: tail-wag 2s ease-in-out infinite;
          }

          .animate-sparkle-float {
            animation: sparkle-float 3s ease-in-out infinite;
          }

          .animate-ear-twitch {
            animation: ear-twitch 0.3s ease-in-out;
          }

          .animate-pulse-gentle {
            animation: pulse-gentle 3s ease-in-out infinite;
          }
        `
      }} />
    </div>
  );
};
