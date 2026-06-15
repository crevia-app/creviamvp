import { useState, useRef } from "react";
import { Link2, Globe, Star, Mail, Phone, Youtube, Linkedin, Music, ShoppingBag, Upload, Loader2 } from "lucide-react";

export const LINK_ICONS = [
  { value: "link",     Icon: Link2,        label: "Link" },
  { value: "globe",    Icon: Globe,        label: "Website" },
  { value: "star",     Icon: Star,         label: "Featured" },
  { value: "mail",     Icon: Mail,         label: "Email" },
  { value: "phone",    Icon: Phone,        label: "Phone" },
  { value: "youtube",  Icon: Youtube,      label: "YouTube" },
  { value: "linkedin", Icon: Linkedin,     label: "LinkedIn" },
  { value: "music",    Icon: Music,        label: "Music" },
  { value: "shop",     Icon: ShoppingBag,  label: "Shop" },
];

/** Render a link button icon: URL → <img>, named → Lucide, fallback → Link2 */
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
  const found = LINK_ICONS.find((i) => i.value === icon);
  const Icon = found ? found.Icon : Link2;
  return <Icon style={style} />;
}

interface LinkIconPickerProps {
  onSelect: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
  uploading?: boolean;
}

const LinkIconPicker = ({ onSelect, onUpload, uploading = false }: LinkIconPickerProps) => {
  const [tab, setTab] = useState<"icons" | "upload">("icons");
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-56 p-3 space-y-3">
      {/* Tab strip */}
      <div className="flex rounded-lg bg-muted/50 p-0.5 gap-0.5">
        {(["icons", "upload"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
              tab === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "icons" ? "Icons" : "Upload"}
          </button>
        ))}
      </div>

      {/* Icons grid */}
      {tab === "icons" && (
        <div className="grid grid-cols-3 gap-1">
          {LINK_ICONS.map(({ value, Icon, label }) => (
            <button
              key={value}
              onClick={() => onSelect(value)}
              title={label}
              className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors group"
            >
              <Icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-[9px] text-muted-foreground truncate w-full text-center">{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Upload tab */}
      {tab === "upload" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Custom image · max 5 MB</p>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-border rounded-lg py-4 text-sm text-muted-foreground hover:border-bronze/60 hover:text-foreground transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><Upload className="w-4 h-4" /> Choose image</>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
};

export default LinkIconPicker;
