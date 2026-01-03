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
  ChevronRight,
  Wallet,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConnectSidebarDesktopProps {
  userType: "creator" | "brand";
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const ConnectSidebarDesktop = ({ userType, collapsed, onToggleCollapse }: ConnectSidebarDesktopProps) => {
  const location = useLocation();
  const currentTab = new URLSearchParams(location.search).get("tab") || 
    (userType === "creator" ? "campaigns" : "discovery");

  const creatorItems = [
    { id: "campaigns", label: "My Campaigns", icon: FolderKanban },
    { id: "projects", label: "My Projects", icon: Briefcase },
    { id: "payments", label: "Crevia Pay", icon: Wallet },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "kira", label: "Kira Suggestions", icon: Sparkles },
    { id: "chat", label: "Crevia Chat", icon: MessageSquare },
  ];

  const brandItems = [
    { id: "discovery", label: "Talent Discovery", icon: Search },
    { id: "campaigns", label: "Campaigns", icon: FolderKanban },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "payments", label: "Crevia Pay", icon: Wallet },
    { id: "creators", label: "My Creatives", icon: Users },
    { id: "kira", label: "Kira for Brands", icon: Sparkles },
    { id: "chat", label: "Crevia Chat", icon: MessageSquare },
  ];

  const items = userType === "creator" ? creatorItems : brandItems;

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-black text-white border-r border-border/20 transition-all duration-300 ease-in-out fixed left-[100px] top-16 bottom-0 z-20",
        collapsed ? "w-[60px]" : "w-[200px]"
      )}
    >
      {/* Collapse button */}
      <div className={cn(
        "flex items-center p-2",
        collapsed ? "justify-center" : "justify-end"
      )}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-7 w-7 text-white/60 hover:text-bronze hover:bg-white/10"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 px-2 py-1 space-y-1">
        {items.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              to={`/crevia-connect?tab=${item.id}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
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
