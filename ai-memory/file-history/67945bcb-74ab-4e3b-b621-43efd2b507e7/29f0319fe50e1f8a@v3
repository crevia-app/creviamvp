import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OPTIONS = [
  { value: "light",  label: "Light",  Icon: Sun     },
  { value: "dark",   label: "Dark",   Icon: Moon    },
  { value: "system", label: "System", Icon: Monitor },
] as const;

const ICON_MAP = { light: Sun, dark: Moon, system: Monitor };

export function NavThemeSwitcher() {
  const { setTheme } = useTheme();
  const [open, setOpen]       = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<string>("system");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setSelected(localStorage.getItem("theme") || "system");
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (value: string) => {
    const applied = value === "system" ? "light" : value;
    localStorage.setItem("app-theme", applied);
    localStorage.setItem("theme", value);
    setTheme(applied);
    setSelected(value);
    setOpen(false);
  };

  if (!mounted) return null;

  const ActiveIcon = ICON_MAP[selected as keyof typeof ICON_MAP] ?? Monitor;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Toggle theme"
        className="flex items-center justify-center w-8 h-8 rounded-full border border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-bronze/40 transition-all duration-300"
      >
        <ActiveIcon className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-10 w-36 rounded-xl bg-card border border-border shadow-xl overflow-hidden py-1 z-50"
          >
            {OPTIONS.map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => handleSelect(value)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="flex-1 text-left font-poppins">{label}</span>
                {selected === value && (
                  <span className="w-1.5 h-1.5 rounded-full bg-bronze flex-shrink-0" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
