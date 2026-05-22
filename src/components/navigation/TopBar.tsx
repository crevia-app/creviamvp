import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, Monitor, Sun, Moon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import NotificationSheet from "@/components/notifications/NotificationSheet";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

interface TopBarProps {
  profile: any;
  onProfileClick: () => void;
  hideRightElements?: boolean;
}

const themeOptions = [
  { value: "light",  label: "Light",  icon: Sun },
  { value: "dark",   label: "Dark",   icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];


const TopBar = ({ profile, hideRightElements = false }: TopBarProps) => {
  const location = useLocation();
  const isKira   = location.pathname === "/kira";
  const isStudio = location.pathname.startsWith("/crevia-studio");
  const [sheetOpen, setSheetOpen] = useState(false);
  const { notifications, unreadCount, loading, markRead, markAllRead, clearAll } =
    useNotifications(profile?.id, !!profile?.do_not_disturb);

  const { setTheme } = useTheme();
  const [themeOpen, setThemeOpen] = useState(false);
  const [selected, setSelected] = useState("light");
  const [mounted, setMounted] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setSelected(localStorage.getItem("theme") || "light");
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    };
    if (themeOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [themeOpen]);

  const handleThemeSelect = (value: string) => {
    const applied = value === "system" ? "light" : value;
    localStorage.setItem("app-theme", applied);
    localStorage.setItem("theme", value);
    setTheme(applied);
    setSelected(value);
    setThemeOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Left side */}
        <div className="flex items-center gap-2">

          {/* ── Mobile: route-aware brand slot ── */}
          <AnimatePresence mode="wait" initial={false}>
            {isKira ? (
              <motion.div
                key="kira"
                className="flex md:hidden items-center gap-2.5"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-bronze to-bronze-dark flex items-center justify-center shadow-md shadow-bronze/30 flex-shrink-0">
                  <Sparkles className="h-[18px] w-[18px] text-white" strokeWidth={2} />
                </div>
                <span className="font-vollkorn text-xl font-bold text-foreground tracking-tight">Kira</span>
              </motion.div>
            ) : isStudio ? (
              <motion.div
                key="studio"
                className="flex md:hidden items-center"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <span className="font-vollkorn text-xl font-semibold text-foreground tracking-tight">Crevia Studio</span>
              </motion.div>
            ) : (
              <motion.div
                key="logo"
                className="flex md:hidden"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Link to="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
                  <img src="/crevia-logo.png" alt="Crevia" className="w-9 h-9 rounded-full ring-1 ring-border" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Desktop: always Crevia logo ── */}
          <Link
            to="/dashboard"
            className="hidden md:flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <img src="/crevia-logo.png" alt="Crevia" className="w-11 h-11 rounded-full ring-1 ring-border" />
          </Link>
        </div>

        {/* Right side */}
        {!hideRightElements && (
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            {mounted && (
              <div ref={themeRef} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setThemeOpen((v) => !v)}
                  className="h-11 w-11 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  aria-label="Toggle theme"
                >
                  {(() => { const Icon = themeOptions.find(o => o.value === selected)?.icon ?? Monitor; return <Icon className="h-5 w-5" />; })()}
                </Button>

                <AnimatePresence>
                  {themeOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-11 w-36 rounded-xl bg-background/95 backdrop-blur-md border border-border/50 shadow-xl overflow-hidden py-1 z-50"
                    >
                      {themeOptions.map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => handleThemeSelect(value)}
                          className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors"
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
              </div>
            )}

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSheetOpen(true)}
              className="relative h-11 w-11 text-muted-foreground hover:text-foreground hover:bg-muted/60"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-bronze text-[9px] font-bold text-white leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </div>
        )}
      </div>

      <NotificationSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onClearAll={clearAll}
      />
    </header>
  );
};

export default TopBar;
