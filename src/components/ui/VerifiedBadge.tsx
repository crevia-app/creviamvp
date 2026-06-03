import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function VerifiedBadge({ className, size = "md" }: VerifiedBadgeProps) {
  const sizeClass = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <BadgeCheck
      className={cn("flex-shrink-0", sizeClass, className)}
      style={{ color: "#0095F6", fill: "#0095F6" }}
      aria-label="Verified Pro"
    />
  );
}
