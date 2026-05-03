import { Link2, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StudioIconNavProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

const NAV_ITEMS = [
  { id: "link", label: "Crevia Link", icon: Link2 },
  { id: "chat", label: "Workspaces", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
];

const StudioIconNav = ({ activeTab, onNavigate }: StudioIconNavProps) => {
  return (
    <TooltipProvider delayDuration={200}>
      <nav className="flex flex-col items-center gap-1.5 w-[52px] flex-shrink-0 border-r border-gray-100 dark:border-border/60 bg-background/95 py-3">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onNavigate(id)}
                className={cn(
                  "w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ease-out",
                  activeTab === id
                    ? "bg-bronze/15 text-bronze shadow-sm"
                    : "text-muted-foreground/70 hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-[17px] h-[17px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs font-medium">
              {label}
            </TooltipContent>
          </Tooltip>
        ))}
      </nav>
    </TooltipProvider>
  );
};

export default StudioIconNav;
