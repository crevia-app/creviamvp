import React from "react";
import { Link2 } from "lucide-react";
import { iconMap } from "./iconOptions";

/** Render any stored icon value: URL → <img>, named → SI brand or Lucide fallback */
export function renderLinkIcon(icon: string | null | undefined, sizePx = 20): React.ReactElement {
  const style = { width: sizePx, height: sizePx, flexShrink: 0 } as React.CSSProperties;

  if (icon && icon.startsWith("http")) {
    return (
      <img
        src={icon}
        alt=""
        style={{ ...style, objectFit: "cover", borderRadius: 4 }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
    );
  }

  const opt = iconMap[icon ?? ""];
  if (opt?.siIcon) {
    const SI = opt.siIcon;
    return <SI style={style} />;
  }
  if (opt?.icon) {
    const LI = opt.icon;
    return <LI style={style} />;
  }
  return <Link2 style={style} />;
}

// Curated 9-slot quick-picker — values must exist in iconMap
const MINI_ICONS = [
  { value: "link",      label: "Link" },
  { value: "website",   label: "Website" },
  { value: "email",     label: "Email" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter",   label: "Twitter/X" },
  { value: "youtube",   label: "YouTube" },
  { value: "whatsapp",  label: "WhatsApp" },
  { value: "linkedin",  label: "LinkedIn" },
  { value: "tiktok",    label: "TikTok" },
];

// Kept for any external code that still imports LINK_ICONS
export const LINK_ICONS = MINI_ICONS.map(({ value, label }) => ({
  value,
  label,
  Icon: iconMap[value]?.icon ?? Link2,
}));

interface LinkIconPickerProps {
  onSelect: (value: string) => void;
}

const LinkIconPicker = ({ onSelect }: LinkIconPickerProps) => {
  return (
    <div className="w-56 p-3">
      <div className="grid grid-cols-3 gap-1">
        {MINI_ICONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            title={label}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors group"
          >
            <span className="text-muted-foreground group-hover:text-foreground transition-colors">
              {renderLinkIcon(value, 20)}
            </span>
            <span className="text-[9px] text-muted-foreground truncate w-full text-center">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LinkIconPicker;
