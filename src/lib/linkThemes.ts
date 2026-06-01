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
  // ── GREY ──────────────────────────────────────────────────────────────────
  {
    value: "brushed_titanium",
    label: "Grey",
    tier: "free",
    fontKey: "plus-jakarta",
    previewBg: "linear-gradient(135deg, #1A1A1A 0%, #3E3E3E 45%, #1A1A1A 100%)",
    previewText: "#F0F0F0",
    accentColor: "#C8C8C8",
    publicClass: "bg-gradient-to-br from-[#1A1A1A] via-[#3E3E3E] to-[#1A1A1A] text-[#F0F0F0]",
  },
  // ── BROWN ─────────────────────────────────────────────────────────────────
  {
    value: "oatmeal",
    label: "Brown",
    tier: "free",
    fontKey: "plus-jakarta",
    previewBg: "linear-gradient(150deg, #F4F0E6 0%, #E8E0CC 100%)",
    previewText: "#2B241E",
    accentColor: "#2B241E",
    publicClass: "bg-[#F5F2EB] text-[#2B241E]",
  },
  // ── EMERALD GREEN ─────────────────────────────────────────────────────────
  {
    value: "midnight_emerald",
    label: "Emerald",
    tier: "free",
    fontKey: "plus-jakarta",
    previewBg: "linear-gradient(150deg, #020E07 0%, #052B14 100%)",
    previewText: "#A8F0C8",
    accentColor: "#4DD68C",
    publicClass: "bg-[#020E07] text-[#A8F0C8]",
  },
  // ── BLUE ──────────────────────────────────────────────────────────────────
  {
    value: "studio_navy",
    label: "Blue",
    tier: "free",
    fontKey: "plus-jakarta",
    previewBg: "linear-gradient(150deg, #07092A 0%, #0E1550 100%)",
    previewText: "#C8D4FF",
    accentColor: "#C8D4FF",
    publicClass: "bg-[#07092A] text-[#C8D4FF]",
  },
];

export const PRO_THEME_IDS = new Set(
  LINK_THEMES.filter((t) => t.tier === "pro").map((t) => t.value)
);
