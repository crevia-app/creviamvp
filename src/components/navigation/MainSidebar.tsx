import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MoreHorizontal,
  MessageSquare,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/i18n/LanguageContext";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { IOSInstallGuide } from "@/components/pwa/IOSInstallGuide";
import { useSubscription } from "@/hooks/use-subscription";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

const DiraIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"
    fill={active ? "currentColor" : "none"}
    stroke={active ? "none" : "currentColor"}
    strokeWidth={1.65} strokeLinejoin="round"
  >
    <path d="M12 2 L14.83 9.17 L22 12 L14.83 14.83 L12 22 L9.17 14.83 L2 12 L9.17 9.17 Z" />
  </svg>
);

const StudioIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
    {([[3,3],[13,3],[3,13],[13,13]] as [number,number][]).map(([x,y],i) => (
      <rect key={i} x={x} y={y} width={8} height={8} rx={2.5}
        fill={active ? "currentColor" : "none"}
        stroke={active ? "none" : "currentColor"}
        strokeWidth={1.65} strokeLinejoin="round"
      />
    ))}
  </svg>
);

interface MainSidebarProps {
  profile: any;
  onProfileClick: () => void;
}

const MainSidebar = ({ profile, onProfileClick }: MainSidebarProps) => {
  const location = useLocation();
  const { t } = useLanguage();
  const { canInstall, isIOS, install, showIOSGuide, setShowIOSGuide } = usePWAInstall();
  const subscription = useSubscription();

  const navItems = [
    { id: "dira",   label: "Dira AI",       Icon: DiraIcon,   path: "/dira",           prefetch: () => import("@/pages/Dira") },
    { id: "studio", label: "Studio",        Icon: StudioIcon, path: "/crevia-studio",  prefetch: () => import("@/pages/CreviaStudio") },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <>
    <aside className="hidden md:flex flex-col bg-background/80 backdrop-blur-md border-r border-bronze/[0.12] fixed left-0 top-14 bottom-0 z-30 w-[100px] pl-[env(safe-area-inset-left,0px)]">
      <nav className="flex-1 py-4 space-y-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              onMouseEnter={item.prefetch}
              onTouchStart={item.prefetch}
              className="flex flex-col items-center justify-center gap-1.5 py-2"
            >
              <div className={cn(
                "flex items-center justify-center w-14 h-10 rounded-2xl transition-all duration-300 ease-out",
                active ? "bg-bronze/15 shadow-[0_0_14px_rgba(207,129,80,0.22)] scale-100" : "bg-transparent scale-95 hover:scale-100"
              )}>
                <span className={cn(
                  "transition-all duration-300 ease-out",
                  active
                    ? "text-bronze drop-shadow-[0_0_10px_rgba(207,129,80,0.45)]"
                    : "text-foreground/42"
                )}>
                  <item.Icon active={active} />
                </span>
              </div>
              <span className={cn(
                "font-poppins text-[10px] font-medium text-center leading-tight transition-colors duration-300",
                active ? "text-bronze" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-1.5 py-2 w-full group">
              <div className="flex items-center justify-center w-14 h-10 rounded-2xl transition-all duration-300 ease-out bg-transparent scale-95 hover:scale-100 group-data-[state=open]:bg-bronze/15">
                <span className="text-foreground/42 group-data-[state=open]:text-bronze transition-all duration-300 ease-out">
                  <MoreHorizontal className="h-[22px] w-[22px]" />
                </span>
              </div>
              <span className="font-poppins text-[10px] font-medium text-center leading-tight text-muted-foreground group-data-[state=open]:text-bronze transition-colors duration-300">
                {t("common.more")}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-background/95 backdrop-blur-md border-border/50">
            {canInstall && (
              <>
                <DropdownMenuItem
                  onClick={() => install()}
                  className="gap-2 cursor-pointer text-foreground/80 hover:text-bronze focus:text-bronze"
                >
                  <Download className="h-4 w-4 text-bronze" />
                  Install Crevia
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent">
              <Link to="/app/about" className="text-foreground/80 hover:text-bronze focus:text-bronze">
                {t("nav.about")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent">
              <Link to="/profile/help" className="text-foreground/80 hover:text-bronze focus:text-bronze">
                {t("nav.helpSupport")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent">
              <Link to="/profile/feedback" className="text-foreground/80 hover:text-bronze focus:text-bronze">
                <MessageSquare className="h-4 w-4 mr-2" />
                {t("nav.feedback")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent">
              <Link to="/privacy-policy" className="text-foreground/80 hover:text-bronze focus:text-bronze">
                {t("nav.privacyPolicy")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent">
              <Link to="/terms-of-service" className="text-foreground/80 hover:text-bronze focus:text-bronze">
                {t("nav.termsOfService")}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      <div className="p-3">
        <button
          onClick={onProfileClick}
          className="flex flex-col items-center justify-center gap-1.5 px-2 py-2 rounded-xl transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] w-full text-muted-foreground hover:text-bronze hover:bg-muted/50 group"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-bronze text-white text-sm">
              {profile?.display_name?.charAt(0) || profile?.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center justify-center gap-1 w-full min-w-0">
            <span className="font-poppins text-xs font-medium leading-tight truncate">
              {profile?.display_name || "User"}
            </span>
            {subscription.limits.hasVerifiedBadge && <VerifiedBadge size="sm" />}
          </div>
        </button>
      </div>
    </aside>

    {/* iOS guide rendered at root so it can layer above the sidebar */}
    <IOSInstallGuide open={showIOSGuide} onClose={() => setShowIOSGuide(false)} />
    </>
  );
};

export default MainSidebar;
