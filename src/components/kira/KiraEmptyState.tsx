/**
 * KiraEmptyState
 * ──────────────
 * Premium "Dark Luxury" empty-chat state for Kira.
 *
 * Layout:
 *   • Two absolute-positioned brand-orange blur orbs animate independently
 *     (7 s & 8 s breathing cycles) to produce a diffuse, living glow.
 *   • Greeting text sits on z-10, fully above the aura layer.
 *   • Prompt chips below the greeting give instant-start suggestions.
 *
 * Usage:
 *   <KiraEmptyState userName="Anthony" activeProject={null} />
 */

import { Sparkles } from "lucide-react";

interface ActiveProject {
  name: string;
  description?: string | null;
}

interface KiraEmptyStateProps {
  userName?: string | null;
  activeProject?: ActiveProject | null;
  onChipClick?: (text: string) => void;
}

// ── Prompt chips shown when no project is active ──────────────────────────────
const DEFAULT_CHIPS = [
  "Draft a contract for a new client",
  "Help me write a professional invoice",
  "Review this clause for me",
  "Suggest a pricing strategy",
];

const PROJECT_CHIPS = [
  "Summarise this project",
  "What tasks are outstanding?",
  "Draft a status update",
  "Generate a project timeline",
];

// ── Component ─────────────────────────────────────────────────────────────────
const KiraEmptyState = ({
  userName,
  activeProject,
  onChipClick,
}: KiraEmptyStateProps) => {
  const chips = activeProject ? PROJECT_CHIPS : DEFAULT_CHIPS;

  return (
    /**
     * Outer shell: fills the scroll container (min-h keeps it vertically
     * centred even when the scroll container is taller than the content).
     * `overflow-hidden` clips the aura orbs at the edges.
     */
    <div className="relative min-h-[60dvh] flex flex-col items-center justify-center px-6 py-14 overflow-hidden select-none">

      {/* ── Aura layer ─────────────────────────────────────────────────────── */}

      {/* Orb A — top-left quadrant, primary pulse */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute animate-aura-breathe"
        style={{
          top: "10%",
          left: "15%",
          width: "55%",
          height: "55%",
          background: "radial-gradient(ellipse at center, #F0782F 0%, #CF5A1A 40%, transparent 72%)",
          borderRadius: "50%",
          filter: "blur(80px)",
          opacity: 0.22,
          willChange: "transform, opacity",
        }}
      />

      {/* Orb B — bottom-right quadrant, secondary pulse (opposite phase) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute animate-aura-breathe-alt"
        style={{
          bottom: "8%",
          right: "10%",
          width: "48%",
          height: "48%",
          background: "radial-gradient(ellipse at center, #E8631C 0%, #B8440A 45%, transparent 72%)",
          borderRadius: "50%",
          filter: "blur(90px)",
          opacity: 0.18,
          willChange: "transform, opacity",
          animationDelay: "2.5s",
        }}
      />

      {/* Orb C — subtle centre accent, very slow drift */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute animate-aura-breathe"
        style={{
          top: "30%",
          left: "30%",
          width: "40%",
          height: "40%",
          background: "radial-gradient(ellipse at center, #FF9A5C 0%, transparent 65%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          opacity: 0.10,
          willChange: "transform, opacity",
          animationDelay: "4s",
          animationDuration: "11s",
        }}
      />

      {/* ── Content layer (z-10) ────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">

        {/* Kira icon badge */}
        <div
          className="mb-6 flex items-center justify-center w-14 h-14 rounded-2xl"
          style={{
            background: "rgba(240, 120, 47, 0.12)",
            border: "1px solid rgba(240, 120, 47, 0.25)",
            boxShadow: "0 0 24px rgba(240, 120, 47, 0.18)",
          }}
        >
          <Sparkles
            className="w-6 h-6"
            style={{ color: "#F0782F", filter: "drop-shadow(0 0 8px rgba(240,120,47,0.6))" }}
          />
        </div>

        {/* Greeting / heading */}
        {activeProject ? (
          <>
            <h1
              className="font-vollkorn text-3xl md:text-4xl font-bold mb-3 animate-kira-greeting"
              style={{
                background: "linear-gradient(135deg, #F0782F 0%, #FF9A5C 50%, #CF5A1A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {activeProject.name}
            </h1>
            <p
              className="font-poppins text-sm md:text-base text-muted-foreground mb-10 leading-relaxed animate-kira-greeting"
              style={{ animationDelay: "0.1s" }}
            >
              {activeProject.description || "Let's get to work. What do you need from Kira today?"}
            </p>
          </>
        ) : (
          <>
            <h1
              className="font-vollkorn text-3xl md:text-[2.25rem] font-bold mb-3 leading-tight text-foreground animate-kira-greeting"
            >
              {userName
                ? `Good to see you, ${userName}.`
                : "Hello there."}
            </h1>
            <p
              className="font-poppins text-sm md:text-base text-muted-foreground mb-10 leading-relaxed animate-kira-greeting"
              style={{ animationDelay: "0.12s" }}
            >
              I'm Kira — your creative business intelligence.
              <br className="hidden sm:block" />
              What shall we work on?
            </p>
          </>
        )}

        {/* ── Prompt chips ────────────────────────────────────────────────── */}
        <div
          className="flex flex-wrap gap-2.5 justify-center animate-kira-greeting"
          style={{ animationDelay: "0.22s" }}
        >
          {chips.map((chip) => (
            <button
              key={chip}
              onClick={() => onChipClick?.(chip)}
              className="
                font-poppins text-xs font-medium
                px-4 py-2.5 rounded-full
                bg-foreground/5 border border-foreground/10
                text-foreground/70 hover:text-foreground
                hover:bg-orange-500/10 hover:border-orange-400/40
                transition-all duration-300
              "
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KiraEmptyState;
