import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  User, 
  Link2, 
  Palette, 
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LinkSidebarDesktopProps {
  userType: "creator" | "brand";
  onCollapsedChange?: (collapsed: boolean) => void;
}

const LinkSidebarDesktop = ({ userType, onCollapsedChange }: LinkSidebarDesktopProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const currentTab = new URLSearchParams(location.search).get("tab") || "profile";

  const handleToggleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };

  // Same items for both creators and brands for Crevia Link
  const items = [
    { id: "profile", label: "Profile", icon: User },
    { id: "buttons", label: "Buttons", icon: Link2 },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-black text-white border-r border-border/20 transition-all duration-300 ease-in-out fixed left-[100px] top-16 bottom-0 z-20",
        collapsed ? "w-[70px]" : "w-[220px]"
      )}
    >
      {/* Collapse Toggle Button */}
      <div className="flex items-center justify-between p-4 border-b border-border/20">
        {!collapsed && (
          <span className="font-poppins text-sm font-semibold text-white">Menu</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleCollapse}
          className="h-9 w-9 text-white hover:text-bronze hover:bg-white/10 transition-colors shrink-0"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              to={`/crevia-link?tab=${item.id}`}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-bronze/10 text-bronze"
                  : "text-white/80 hover:text-bronze hover:bg-white/5"
              )}
            >
              <Icon 
                className={cn(
                  "h-5 w-5 shrink-0 transition-all",
                  isActive && "drop-shadow-[0_0_8px_rgba(207,129,80,0.5)]"
                )} 
              />
              {!collapsed && (
                <span className="font-poppins text-sm font-medium truncate">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default LinkSidebarDesktop;
