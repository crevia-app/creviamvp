import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Sparkles, 
  MoreHorizontal,
  MessageSquare,
  Briefcase,
  Handshake
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MainSidebarProps {
  userType: "creator" | "brand";
  profile: any;
  onProfileClick: () => void;
}

const MainSidebar = ({ userType, profile, onProfileClick }: MainSidebarProps) => {
  const location = useLocation();

  const navItems = [
    { id: "home", label: "Home", icon: Home, path: "/dashboard" },
    { id: "kira", label: "Kira", icon: Sparkles, path: "/kira" },
    { id: "studio", label: "Crevia Studio", icon: Briefcase, path: "/crevia-studio" },
    { id: "connect", label: "Crevia Connect", icon: Handshake, path: "/crevia-connect" },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <aside className="hidden md:flex flex-col bg-black text-white fixed left-0 top-16 bottom-0 z-30 w-[100px]">
      {/* Main Navigation */}
      <nav className="flex-1 py-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 px-3 py-3 transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] group",
                active
                  ? "text-bronze"
                  : "text-white/70 hover:text-bronze hover:bg-white/5"
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
              <span className="font-poppins text-[11px] font-medium text-center leading-tight transition-all duration-300">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* More Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] w-full text-white/70 hover:text-bronze hover:bg-white/5 group">
              <div className="p-2.5 rounded-xl transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105">
                <MoreHorizontal className="h-6 w-6 transition-all duration-300" />
              </div>
              <span className="font-poppins text-[11px] font-medium text-center leading-tight">
                More
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-black border-white/10">
            <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent">
              <Link to="/about" className="text-white/80 hover:text-bronze focus:text-bronze">
                About
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent">
              <Link to="/profile/help" className="text-white/80 hover:text-bronze focus:text-bronze">
                Help & Support
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent">
              <Link to="/profile/feedback" className="text-white/80 hover:text-bronze focus:text-bronze">
                <MessageSquare className="h-4 w-4 mr-2" />
                Feedback
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent">
              <Link to="/privacy-policy" className="text-white/80 hover:text-bronze focus:text-bronze">
                Privacy Policy
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="hover:bg-transparent focus:bg-transparent">
              <Link to="/terms-of-service" className="text-white/80 hover:text-bronze focus:text-bronze">
                Terms of Service
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* Profile Avatar at Bottom */}
      <div className="p-3">
        <button
          onClick={onProfileClick}
          className="flex flex-col items-center justify-center gap-1.5 px-2 py-2 rounded-xl transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] w-full text-white/70 hover:text-bronze hover:bg-white/5 group"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-bronze text-white text-sm">
              {profile?.display_name?.charAt(0) || profile?.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="font-poppins text-[11px] font-medium text-center leading-tight truncate w-full">
            {profile?.display_name || "User"}
          </span>
        </button>
      </div>
    </aside>
  );
};

export default MainSidebar;
