import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Search, 
  Briefcase, 
  BarChart3, 
  Sparkles, 
  MessageSquare,
  Users,
  FolderKanban,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConnectSidebarDesktopProps {
  userType: "creator" | "brand";
}

const ConnectSidebarDesktop = ({ userType }: ConnectSidebarDesktopProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const currentTab = new URLSearchParams(location.search).get("tab") || 
    (userType === "creator" ? "opportunities" : "discovery");

  const creatorItems = [
    { id: "opportunities", label: "Opportunities", icon: Search },
    { id: "campaigns", label: "My Campaigns", icon: Briefcase },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "kira", label: "Kira Suggestions", icon: Sparkles },
    { id: "chat", label: "Crevia Chat", icon: MessageSquare },
  ];

  const brandItems = [
    { id: "discovery", label: "Creator Discovery", icon: Search },
    { id: "campaigns", label: "Campaign Manager", icon: FolderKanban },
    { id: "creators", label: "My Creators", icon: Users },
    { id: "kira", label: "Kira for Brands", icon: Sparkles },
    { id: "chat", label: "Crevia Chat", icon: MessageSquare },
  ];

  const items = userType === "creator" ? creatorItems : brandItems;

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-black text-white border-r border-border/20 transition-all duration-200 ease-in-out",
        collapsed ? "w-[70px]" : "w-[220px]"
      )}
    >
      <div className="flex items-center justify-end p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 text-white hover:text-bronze hover:bg-white/10"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {items.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              to={`/crevia-connect?tab=${item.id}`}
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

export default ConnectSidebarDesktop;
