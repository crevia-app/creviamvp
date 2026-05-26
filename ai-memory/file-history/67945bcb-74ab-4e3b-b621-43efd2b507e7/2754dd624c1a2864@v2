import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Monitor, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const options = [
  { value: "light",  label: "Light",  icon: Sun },
  { value: "dark",   label: "Dark",   icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function FloatingThemeToggle() {
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<string>("light");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") || "system";
    setSelected(saved);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (value: string) => {
    setTheme(value);
    setSelected(value);
    setOpen(false);
  };

  if (!mounted) return null;

  return (
    <div ref={ref} className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-12 right-0 mb-1 w-36 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-xl overflow-hidden py-1"
          >
            {options.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handleSelect(value)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {selected === value && (
                  <span className="w-2 h-2 rounded-full bg-bronze flex-shrink-0" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle theme"
        className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/10 shadow-lg flex items-center justify-center text-white/70 hover:text-white hover:border-white/20 transition-all"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
