export interface LinkTheme {
  value: string;
  label: string;
  tier: "free" | "pro";
  fontKey: string;
  previewBg: string; // CSS color or gradient string (used in style prop)
  previewText: string;
  publicClass: string; // Applied on PublicProfile page
}

export const LINK_THEMES: LinkTheme[] = [
  // ── 5 FREE ──
  {
    value: "elite_obsidian",
    label: "Obsidian",
    tier: "free",
    fontKey: "plus-jakarta",
    previewBg: "#050505",
    previewText: "#FFFFFF",
    publicClass: "bg-[#050505] text-white",
  },
  {
    value: "pristine",
    label: "Pristine",
    tier: "free",
    fontKey: "plus-jakarta",
    previewBg: "#FFFFFF",
    previewText: "#0A0A0A",
    publicClass: "bg-[#FFFFFF] text-[#0A0A0A]",
  },
  {
    value: "exec_slate",
    label: "Exec Slate",
    tier: "free",
    fontKey: "plus-jakarta",
    previewBg: "#1C1E21",
    previewText: "#F0F0F0",
    publicClass: "bg-[#1C1E21] text-[#F0F0F0]",
  },
  {
    value: "oatmeal",
    label: "Oatmeal",
    tier: "free",
    fontKey: "plus-jakarta",
    previewBg: "#F5F2EB",
    previewText: "#2B241E",
    publicClass: "bg-[#F5F2EB] text-[#2B241E]",
  },
  {
    value: "studio_navy",
    label: "Studio Navy",
    tier: "free",
    fontKey: "plus-jakarta",
    previewBg: "#050A1F",
    previewText: "#FFFFFF",
    publicClass: "bg-[#050A1F] text-white",
  },
  // ── 10 PRO ──
  {
    value: "bordeaux_reserve",
    label: "Bordeaux Reserve",
    tier: "pro",
    fontKey: "playfair",
    previewBg: "#2B0F15",
    previewText: "#F4E3E6",
    publicClass: "bg-[#2B0F15] text-[#F4E3E6]",
  },
  {
    value: "imperial_amethyst",
    label: "Imperial Amethyst",
    tier: "pro",
    fontKey: "plus-jakarta",
    previewBg: "#1A0B2E",
    previewText: "#E9DDF7",
    publicClass: "bg-[#1A0B2E] text-[#E9DDF7]",
  },
  {
    value: "matte_bronze",
    label: "Matte Bronze",
    tier: "pro",
    fontKey: "playfair",
    previewBg: "#0D0B0A",
    previewText: "#C58361",
    publicClass: "bg-[#0D0B0A] text-[#C58361]",
  },
  {
    value: "midnight_emerald",
    label: "Midnight Emerald",
    tier: "pro",
    fontKey: "plus-jakarta",
    previewBg: "#04120C",
    previewText: "#E0F2E9",
    publicClass: "bg-[#04120C] text-[#E0F2E9]",
  },
  {
    value: "champagne_silk",
    label: "Champagne Silk",
    tier: "pro",
    fontKey: "dm-serif",
    previewBg: "#E6DCC8",
    previewText: "#1A1A1A",
    publicClass: "bg-[#E6DCC8] text-[#1A1A1A]",
  },
  {
    value: "velvet_onyx",
    label: "Velvet Onyx",
    tier: "pro",
    fontKey: "plus-jakarta",
    previewBg: "#0B0710",
    previewText: "#E6DDF2",
    publicClass: "bg-[#0B0710] text-[#E6DDF2]",
  },
  {
    value: "brushed_titanium",
    label: "Brushed Titanium",
    tier: "pro",
    fontKey: "plus-jakarta",
    previewBg: "linear-gradient(135deg, #2a2a2a 0%, #4a4a4a 50%, #2a2a2a 100%)",
    previewText: "#FFFFFF",
    publicClass: "bg-gradient-to-br from-[#2a2a2a] via-[#4a4a4a] to-[#2a2a2a] text-white",
  },
  {
    value: "tuscan_leather",
    label: "Tuscan Leather",
    tier: "pro",
    fontKey: "dm-serif",
    previewBg: "#2A110A",
    previewText: "#FDFBF7",
    publicClass: "bg-[#2A110A] text-[#FDFBF7]",
  },
  {
    value: "abyss_glass",
    label: "Abyss Glass",
    tier: "pro",
    fontKey: "plus-jakarta",
    previewBg: "#000000",
    previewText: "#FFFFFF",
    publicClass: "bg-[#000000] text-white",
  },
  {
    value: "mono_brutalism",
    label: "Mono Brutalism",
    tier: "pro",
    fontKey: "plus-jakarta",
    previewBg: "#FFFFFF",
    previewText: "#000000",
    publicClass: "bg-[#FFFFFF] text-[#000000]",
  },
];

export const PRO_THEME_IDS = new Set(
  LINK_THEMES.filter((t) => t.tier === "pro").map((t) => t.value)
);
