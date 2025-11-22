import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Link2, 
  Sparkles, 
  Users, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
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
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { id: "home", label: "Home", icon: Home, path: "/dashboard" },
    { id: "connect", label: "Crevia Connect", icon: Users, path: "/crevia-connect" },
    { id: "kira", label: "Crevia AI", icon: Sparkles, path: "/crevia-ai" },
    { id: "link", label: "Crevia Link", icon: Link2, path: "/crevia-link" },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-black text-white border-r border-white/10 transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Toggle Button */}
      <div className="flex items-center justify-end p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 text-white/60 hover:text-bronze hover:bg-white/5"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                active
                  ? "bg-bronze/10 text-bronze"
                  : "text-white/80 hover:text-bronze hover:bg-white/5"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-all",
                active && "bg-bronze/20"
              )}>
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-all",
                    active && "drop-shadow-[0_0_8px_rgba(207,129,80,0.6)]"
                  )} 
                />
              </div>
              {!collapsed && (
                <span className="font-poppins text-sm font-medium truncate">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}

        {/* More Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 w-full",
                "text-white/80 hover:text-bronze hover:bg-white/5"
              )}
            >
              <div className="p-2 rounded-lg">
                <MoreHorizontal className="h-5 w-5" />
              </div>
              {!collapsed && (
                <span className="font-poppins text-sm font-medium truncate">
                  More
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-black border-white/10">
            <DropdownMenuItem asChild>
              <Link to="/about" className="text-white/80 hover:text-bronze focus:text-bronze">
                About
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/profile/help" className="text-white/80 hover:text-bronze focus:text-bronze">
                Help & Support
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white/80 hover:text-bronze focus:text-bronze">
              System Status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* Profile Avatar at Bottom */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={onProfileClick}
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 w-full",
            "text-white/80 hover:text-bronze hover:bg-white/5"
          )}
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-bronze text-white">
              {profile?.display_name?.charAt(0) || profile?.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 text-left truncate">
              <p className="font-poppins text-sm font-medium truncate">
                {profile?.display_name || "User"}
              </p>
              <p className="text-xs text-white/50 truncate capitalize">
                {userType}
              </p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default MainSidebar;
