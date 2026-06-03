export interface LinkTheme {
  value: string;
  label: string;
  tier: "free" | "pro";
  fontKey: string;
  previewBg: string;
  previewText: string;
  accentColor: string; // button/accent color shown in swatch
  publicClass: string;
}

export const LINK_THEMES: LinkTheme[] = [
  // ── BLACK ─────────────────────────────────────────────────────────────────
  {
    value: "elite_obsidian",
    label: "Black",
    tier: "free",
    fontKey: "plus-jakarta",
    previewBg: "#080808",
    previewText: "#FFFFFF",
    accentColor: "#FFFFFF",
    publicClass: "bg-[#080808] text-white",
  },
  // ── WHITE ─────────────────────────────────────────────────────────────────
  {
    value: "pristine",
    label: "White",
    tier: "free",
    fontKey: "plus-jakarta",
    previewBg: "#FFFFFF",
    previewText: "#0A0A0A",
    accentColor: "#0A0A0A",
    publicClass: "bg-[#FFFFFF] text-[#0A0A0A]",
  },
  // ── BROWN (rich espresso) ─────────────────────────────────────────────────
  {
    value: "espresso",
    label: "Brown",
    tier: "free",
    fontKey: "cormorant",
    previewBg: "linear-gradient(150deg, #1A0A05 0%, #2D1507 100%)",
    previewText: "#F2D9B8",
    accentColor: "#C68642",
    publicClass: "bg-[#1A0A05] text-[#F2D9B8]",
  },
  // ── PURPLE (deep royal) ───────────────────────────────────────────────────
  {
    value: "royal_purple",
    label: "Purple",
    tier: "free",
    fontKey: "syne",
    previewBg: "linear-gradient(150deg, #0D0818 0%, #1E0B3A 100%)",
    previewText: "#E2D4FF",
    accentColor: "#A37FE8",
    publicClass: "bg-[#0D0818] text-[#E2D4FF]",
  },
];

export const PRO_THEME_IDS = new Set(
  LINK_THEMES.filter((t) => t.tier === "pro").map((t) => t.value)
);
