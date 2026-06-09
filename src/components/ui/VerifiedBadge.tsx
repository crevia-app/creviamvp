import { useId } from "react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "blue" | "gold";
}

// 12-point rosette badge — quadratic bezier curves through inner control points
// create the smooth scalloped edge between each outer bump.
//
// Coordinates (viewBox 0 0 24 24, center 12 12):
//   Outer points:  R = 10.5  at every 30°  starting from –90° (top)
//   Control points: R = 8.0  at every 30°  offset +15° (midpoints between outer)
export function VerifiedBadge({ className, size = "md", variant = "gold" }: VerifiedBadgeProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `vb-${uid}`;

  const sizeClass =
    size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center ml-1 flex-shrink-0 align-middle translate-y-[-1px]",
        sizeClass,
        className
      )}
    >
      <svg viewBox="0 0 24 24" className="w-full h-full" aria-label="Verified" role="img">
        <defs>
          {variant === "blue" ? (
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#1E40AF" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          ) : (
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#92400E" />
              <stop offset="55%"  stopColor="#F0782F" />
              <stop offset="100%" stopColor="#FCD34D" />
            </linearGradient>
          )}
        </defs>

        {/* Rosette body */}
        <path
          fill={`url(#${gradId})`}
          d="M12 1.5
             Q14.07 4.27 17.25 2.91
             Q17.66 6.34 21.09 6.75
             Q19.73 9.93 22.5 12
             Q19.73 14.07 21.09 17.25
             Q17.66 17.66 17.25 21.09
             Q14.07 19.73 12 22.5
             Q9.93 19.73 6.75 21.09
             Q6.34 17.66 2.91 17.25
             Q4.27 14.07 1.5 12
             Q4.27 9.93 2.91 6.75
             Q6.34 6.34 6.75 2.91
             Q9.93 4.27 12 1.5Z"
        />

        {/* White checkmark (stroke) */}
        <path
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 12L10 16L17 8"
        />
      </svg>
    </span>
  );
}
