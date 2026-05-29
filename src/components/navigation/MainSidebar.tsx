import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Sparkles,
  MoreHorizontal,
  MessageSquare,
  Briefcase,
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

interface MainSidebarProps {
  profile: any;
  onProfileClick: () => void;
}

const MainSidebar = ({ profile, onProfileClick }: MainSidebarProps) => {
  const location = useLocation();
  const { t } = useLanguage();
  const { canInstall, isIOS, install, showIOSGuide, setShowIOSGuide } = usePWAInstall();

  const navItems = [
    { id: "kira",   label: t("sidebar.kira"),   icon: Sparkles, path: "/kira",          prefetch: () => import("@/pages/Kira") },
    { id: "studio", label: t("sidebar.studio"), icon: Briefcase, path: "/crevia-studio", prefetch: () => import("@/pages/CreviaStudio") },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <>
    <aside className="hidden md:flex flex-col bg-background/80 backdrop-blur-md border-r border-border/50 fixed left-0 top-14 bottom-0 z-30 w-[100px]">
      <nav className="flex-1 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              onMouseEnter={item.prefetch}
              onTouchStart={item.prefetch}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 px-3 py-3 transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] group",
                active
                  ? "text-bronze"
                  : "text-muted-foreground hover:text-bronze hover:bg-muted/50"
              )}
            >
              <div className={cn(
                "p-2.5 rounded-xl transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105",
                active && "bg-bronze/15"
              )}>
                <Icon 
                  className={cn(
                    "h-6 w-6 transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
                    active && "drop-shadow-[0_0_10px_rgba(207,129,80,0.5)]"
                  )} 
                />
              </div>
              <span className="font-poppins text-xs font-medium text-center leading-tight transition-all duration-300">
                {item.label}
              </span>
            </Link>
          );
        })}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] w-full text-muted-foreground hover:text-bronze hover:bg-muted/50 group">
              <div className="p-2.5 rounded-xl transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105">
                <MoreHorizontal className="h-6 w-6 transition-all duration-300" />
              </div>
              <span className="font-poppins text-xs font-medium text-center leading-tight">
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
          <span className="font-poppins text-xs font-medium text-center leading-tight truncate w-full">
            {profile?.display_name || "User"}
          </span>
        </button>
      </div>
    </aside>

    {/* iOS guide rendered at root so it can layer above the sidebar */}
    <IOSInstallGuide open={showIOSGuide} onClose={() => setShowIOSGuide(false)} />
    </>
  );
};

export default MainSidebar;
