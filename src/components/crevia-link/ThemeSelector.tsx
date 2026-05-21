import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { LINK_THEMES, PRO_THEME_IDS } from "@/lib/linkThemes";

interface ThemeSelectorProps {
  value: string;
  onChange: (themeId: string, fontKey: string) => void;
  isProUser: boolean;
  onUpgrade: () => void;
}

const ThemeSelector = ({ value, onChange, isProUser, onUpgrade }: ThemeSelectorProps) => {
  const freeThemes = LINK_THEMES.filter((t) => t.tier === "free");
  const proThemes  = LINK_THEMES.filter((t) => t.tier === "pro");

  const renderTheme = (theme: typeof LINK_THEMES[0]) => {
    const isSelected = value === theme.value;
    const locked = PRO_THEME_IDS.has(theme.value) && !isProUser;

    return (
      <button
        key={theme.value}
        type="button"
        onClick={() => locked ? onUpgrade() : onChange(theme.value, theme.fontKey)}
        className={cn(
          "group relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all duration-200 text-left",
          isSelected
            ? "border-bronze ring-2 ring-bronze/20"
            : "border-border hover:border-border/80",
          locked ? "cursor-pointer opacity-70" : "cursor-pointer"
        )}
      >
        {/* Swatch */}
        <div
          className="w-full h-14 rounded-lg shadow-sm relative overflow-hidden"
          style={{ background: theme.previewBg }}
        >
          {/* Simulated button strip */}
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full opacity-40"
            style={{ background: theme.previewText }}
          />
          {/* Pro lock badge */}
          {locked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
              <div className="flex items-center gap-1 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                <Lock className="w-2.5 h-2.5" />
                PRO
              </div>
            </div>
          )}
          {/* PRO badge (unlocked) */}
          {!locked && theme.tier === "pro" && (
            <div className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-px rounded-full bg-bronze/90 text-white">
              PRO
            </div>
          )}
        </div>

        {/* Label */}
        <span
          className="text-[11px] font-semibold text-center leading-tight truncate w-full"
          style={{ color: isSelected ? undefined : undefined }}
        >
          {theme.label}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-5">
      {/* Free */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Free</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
          {freeThemes.map(renderTheme)}
        </div>
      </div>

      {/* Pro */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pro</p>
          <div className="h-px flex-1 bg-bronze/20" />
          <span className="text-[10px] font-bold text-bronze bg-bronze/10 px-2 py-0.5 rounded-full">10 themes</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
          {proThemes.map(renderTheme)}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
