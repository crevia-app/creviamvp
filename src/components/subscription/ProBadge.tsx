import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProBadgeProps {
  plan?: "pro" | "business";
  className?: string;
}

/**
 * Inline badge rendered next to any feature locked behind a paid tier.
 * Free users see the feature UI but with this badge — clicking triggers the upgrade modal.
 */
const ProBadge = ({ plan = "pro", className }: ProBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full",
      "text-[9px] font-bold uppercase tracking-wide leading-none",
      "bg-bronze/10 text-bronze border border-bronze/25 ml-1 flex-shrink-0",
      className
    )}
  >
    <Sparkles className="w-2 h-2" />
    {plan === "business" ? "Business" : "Pro"}
  </span>
);

export default ProBadge;
