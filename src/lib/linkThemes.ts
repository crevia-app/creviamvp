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
  // ── OBSIDIAN ──────────────────────────────────────────────────────────────
  {
    value: "elite_obsidian",
    label: "Obsidian",
    tier: "free",
    fontKey: "plus-jakarta",
    previewBg: "#080808",
    previewText: "#FFFFFF",
    accentColor: "#FFFFFF",
    publicClass: "bg-[#080808] text-white",
  },
  // ── PRISTINE ──────────────────────────────────────────────────────────────
  {
    value: "pristine",
    label: "Pristine",
    tier: "free",
    fontKey: "plus-jakarta",
    previewBg: "#FFFFFF",
    previewText: "#0A0A0A",
    accentColor: "#0A0A0A",
    publicClass: "bg-[#FFFFFF] text-[#0A0A0A]",
  },
  // ── EXEC SLATE ────────────────────────────────────────────────────────────
  {
    value: "exec_slate",
    label: "Exec Slate",
    tier: "free",
    fontKey: "plus-jakarta",
    previewBg: "linear-gradient(150deg, #1A1C24 0%, #252830 100%)",
    previewText: "#E8EAEF",
    accentColor: "#E8EAEF",
    publicClass: "bg-[#1C1E26] text-[#E8EAEF]",
  },
  // ── OATMEAL ───────────────────────────────────────────────────────────────
  {
    value: "oatmeal",
    label: "Oatmeal",
    tier: "free",
    fontKey: "plus-jakarta",
    previewBg: "linear-gradient(150deg, #F4F0E6 0%, #E8E0CC 100%)",
    previewText: "#2B241E",
    accentColor: "#2B241E",
    publicClass: "bg-[#F5F2EB] text-[#2B241E]",
  },
  // ── STUDIO NAVY ───────────────────────────────────────────────────────────
  {
    value: "studio_navy",
    label: "Studio Navy",
    tier: "free",
    fontKey: "plus-jakarta",
    previewBg: "linear-gradient(150deg, #07092A 0%, #0E1550 100%)",
    previewText: "#C8D4FF",
    accentColor: "#C8D4FF",
    publicClass: "bg-[#07092A] text-[#C8D4FF]",
  },
  // ── BORDEAUX RESERVE ──────────────────────────────────────────────────────
  {
    value: "bordeaux_reserve",
    label: "Bordeaux Reserve",
    tier: "pro",
    fontKey: "playfair",
    previewBg: "linear-gradient(150deg, #1E0508 0%, #3D0C16 100%)",
    previewText: "#F5DDE2",
    accentColor: "#E8A0AE",
    publicClass: "bg-[#1E0508] text-[#F5DDE2]",
  },
  // ── IMPERIAL AMETHYST ─────────────────────────────────────────────────────
  {
    value: "imperial_amethyst",
    label: "Imperial Amethyst",
    tier: "pro",
    fontKey: "plus-jakarta",
    previewBg: "linear-gradient(150deg, #0D0620 0%, #1E0A50 100%)",
    previewText: "#E4D4FF",
    accentColor: "#B88EFF",
    publicClass: "bg-[#0D0620] text-[#E4D4FF]",
  },
  // ── MATTE BRONZE ──────────────────────────────────────────────────────────
  {
    value: "matte_bronze",
    label: "Matte Bronze",
    tier: "pro",
    fontKey: "playfair",
    previewBg: "linear-gradient(150deg, #0C0A07 0%, #1C1408 100%)",
    previewText: "#C9855A",
    accentColor: "#C9855A",
    publicClass: "bg-[#0C0A07] text-[#C9855A]",
  },
  // ── MIDNIGHT EMERALD ──────────────────────────────────────────────────────
  {
    value: "midnight_emerald",
    label: "Midnight Emerald",
    tier: "pro",
    fontKey: "plus-jakarta",
    previewBg: "linear-gradient(150deg, #020E07 0%, #052B14 100%)",
    previewText: "#A8F0C8",
    accentColor: "#4DD68C",
    publicClass: "bg-[#020E07] text-[#A8F0C8]",
  },
  // ── CHAMPAGNE SILK ────────────────────────────────────────────────────────
  {
    value: "champagne_silk",
    label: "Champagne Silk",
    tier: "pro",
    fontKey: "dm-serif",
    previewBg: "linear-gradient(150deg, #EFE5CC 0%, #D8C8A0 100%)",
    previewText: "#1A1208",
    accentColor: "#5C4A20",
    publicClass: "bg-[#EFE5CC] text-[#1A1208]",
  },
  // ── VELVET ONYX ───────────────────────────────────────────────────────────
  {
    value: "velvet_onyx",
    label: "Velvet Onyx",
    tier: "pro",
    fontKey: "plus-jakarta",
    previewBg: "linear-gradient(150deg, #090612 0%, #160E28 100%)",
    previewText: "#E8D8FF",
    accentColor: "#C4A0FF",
    publicClass: "bg-[#090612] text-[#E8D8FF]",
  },
  // ── BRUSHED TITANIUM ──────────────────────────────────────────────────────
  {
    value: "brushed_titanium",
    label: "Brushed Titanium",
    tier: "pro",
    fontKey: "plus-jakarta",
    previewBg: "linear-gradient(135deg, #1A1A1A 0%, #3E3E3E 45%, #1A1A1A 100%)",
    previewText: "#F0F0F0",
    accentColor: "#C8C8C8",
    publicClass: "bg-gradient-to-br from-[#1A1A1A] via-[#3E3E3E] to-[#1A1A1A] text-[#F0F0F0]",
  },
  // ── TUSCAN LEATHER ────────────────────────────────────────────────────────
  {
    value: "tuscan_leather",
    label: "Tuscan Leather",
    tier: "pro",
    fontKey: "dm-serif",
    previewBg: "linear-gradient(150deg, #1C0905 0%, #4A1A0A 100%)",
    previewText: "#FCEEE4",
    accentColor: "#E89060",
    publicClass: "bg-[#1C0905] text-[#FCEEE4]",
  },
  // ── ABYSS GLASS ───────────────────────────────────────────────────────────
  {
    value: "abyss_glass",
    label: "Abyss Glass",
    tier: "pro",
    fontKey: "plus-jakarta",
    previewBg: "linear-gradient(150deg, #00060F 0%, #001830 100%)",
    previewText: "#80C8FF",
    accentColor: "#3A9EE0",
    publicClass: "bg-[#00060F] text-[#80C8FF]",
  },
  // ── MONO BRUTALISM ────────────────────────────────────────────────────────
  {
    value: "mono_brutalism",
    label: "Mono Brutalism",
    tier: "pro",
    fontKey: "plus-jakarta",
    previewBg: "#F5F5F5",
    previewText: "#000000",
    accentColor: "#000000",
    publicClass: "bg-[#F5F5F5] text-[#000000]",
  },
];

export const PRO_THEME_IDS = new Set(
  LINK_THEMES.filter((t) => t.tier === "pro").map((t) => t.value)
);
