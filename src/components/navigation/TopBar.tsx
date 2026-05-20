import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, Monitor, Sun, Moon } from "lucide-react";
import { BackButton } from "@/components/BackButton";
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

const SUB_PAGE_PREFIXES = [
  "/profile/",
  "/privacy-policy",
  "/terms-of-service",
  "/app/about",
  "/admin",
];

const TopBar = ({ profile, hideRightElements = false }: TopBarProps) => {
  const location = useLocation();
  const isSubPage = SUB_PAGE_PREFIXES.some((p) => location.pathname.startsWith(p));
  const [sheetOpen, setSheetOpen] = useState(false);
  const { notifications, unreadCount, loading, markRead, markAllRead, clearAll } =
    useNotifications(profile?.id);

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
    <header className="sticky top-0 z-40 w-full bg-black border-b border-white/10">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left side: back button on sub-pages, logo otherwise */}
        {isSubPage ? (
          <BackButton fallback="/kira" className="text-white/70 hover:text-white" />
        ) : (
          <Link
            to="/dashboard"
            className="flex items-center gap-2 transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:opacity-80"
          >
            <img src="/crevia-logo.png" alt="Crevia" className="w-9 h-9 md:w-11 md:h-11 rounded-full ring-1 ring-white/10" />
            <span className="font-vollkorn text-xl md:text-2xl font-bold text-white">Crevia</span>
            <span className="text-[8px] font-poppins font-medium text-bronze bg-bronze/10 px-1 py-0.5 rounded-full uppercase tracking-wider">
              beta
            </span>
          </Link>
        )}

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
                  className="h-11 w-11 text-white/70 hover:text-white hover:bg-white/10"
                  aria-label="Toggle theme"
                >
                  <Monitor className="h-5 w-5" />
                </Button>

                <AnimatePresence>
                  {themeOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-11 w-36 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-xl overflow-hidden py-1 z-50"
                    >
                      {themeOptions.map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => handleThemeSelect(value)}
                          className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
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
              className="relative h-11 w-11 text-white/70 hover:text-white hover:bg-white/10"
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
