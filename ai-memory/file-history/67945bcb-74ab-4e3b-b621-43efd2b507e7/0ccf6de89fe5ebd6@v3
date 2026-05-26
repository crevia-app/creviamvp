import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import NotificationSheet from "@/components/notifications/NotificationSheet";

interface TopBarProps {
  profile: any;
  onProfileClick: () => void;
  hideRightElements?: boolean;
}

const TopBar = ({ profile, hideRightElements = false }: TopBarProps) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { notifications, unreadCount, loading, markRead, markAllRead } =
    useNotifications(profile?.id ?? "");

  return (
    <header className="sticky top-0 z-40 w-full bg-black border-b border-white/10">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-2 transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:opacity-80"
        >
          <img src="/crevia-logo.png" alt="Crevia" className="w-9 h-9 md:w-11 md:h-11" />
          <span className="font-vollkorn text-2xl font-bold text-white">Crevia</span>
          <span className="text-[8px] font-poppins font-medium text-bronze bg-bronze/10 px-1 py-0.5 rounded-full uppercase tracking-wider">
            beta
          </span>
        </Link>

        {/* Right side */}
        {!hideRightElements && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSheetOpen(true)}
              className="relative h-9 w-9 text-white/70 hover:text-white hover:bg-white/10"
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
      />
    </header>
  );
};

export default TopBar;
