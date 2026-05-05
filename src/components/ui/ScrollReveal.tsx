import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { ReactNode } from "react";

type AnimationVariant =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "scale"
  | "blur"
  | "hero";

interface ScrollRevealProps {
  children: ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
}

// Luxury deceleration: heavy initial velocity, silky coast to rest — Apple / Stripe tier
export const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

const variants: Record<AnimationVariant, { hidden: object; visible: object }> =
  {
    // Hero headlines — larger travel, no blur (clean editorial typography)
    hero: {
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0 },
    },
    // General fade-up for body copy and feature items
    "fade-up": {
      hidden: { opacity: 0, y: 24, filter: "blur(3px)" },
      visible: { opacity: 1, y: 0, filter: "blur(0px)" },
    },
    "fade-down": {
      hidden: { opacity: 0, y: -20 },
      visible: { opacity: 1, y: 0 },
    },
    "fade-left": {
      hidden: { opacity: 0, x: -28 },
      visible: { opacity: 1, x: 0 },
    },
    "fade-right": {
      hidden: { opacity: 0, x: 28 },
      visible: { opacity: 1, x: 0 },
    },
    // Feature cards — subtle scale feel
    scale: {
      hidden: { opacity: 0, scale: 0.94 },
      visible: { opacity: 1, scale: 1 },
    },
    // CTA sections / pull-quotes — full atmospheric blur
    blur: {
      hidden: { opacity: 0, filter: "blur(10px)" },
      visible: { opacity: 1, filter: "blur(0px)" },
    },
  };

const ScrollReveal = ({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.65,
  className = "",
  once = true,
  threshold,
  rootMargin,
}: ScrollRevealProps) => {
  const { ref, isVisible } = useScrollReveal({ once, threshold, rootMargin });
  const v = variants[variant];

  return (
    <motion.div
      ref={ref}
      initial={v.hidden}
      animate={isVisible ? v.visible : v.hidden}
      transition={{
        duration,
        delay,
        ease: LUXURY_EASE,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
