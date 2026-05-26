import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const OPTIONS = [
  { value: "light",  Icon: Sun,     label: "Light"  },
  { value: "dark",   Icon: Moon,    label: "Dark"   },
  { value: "system", Icon: Monitor, label: "System" },
] as const;

export function NavThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const handleSet = (value: string) => {
    localStorage.setItem("app-theme", value);
    localStorage.setItem("theme", value);
    setTheme(value);
  };

  return (
    <div className="flex items-center gap-0.5 bg-secondary border border-border rounded-full p-0.5">
      {OPTIONS.map(({ value, Icon, label }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            onClick={() => handleSet(value)}
            aria-label={label}
            title={label}
            className={`
              relative flex items-center justify-center w-7 h-7 rounded-full
              transition-all duration-300 ease-out
              ${active
                ? "bg-background shadow-sm text-bronze"
                : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </div>
  );
}
