import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface LinkTabsMobileProps {
  userType: "creator" | "brand";
}

const LinkTabsMobile = ({ userType }: LinkTabsMobileProps) => {
  const location = useLocation();
  const currentTab = new URLSearchParams(location.search).get("tab") || "profile";

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "buttons", label: "Buttons" },
    { id: "appearance", label: "Appearance" },
    { id: "settings", label: "Settings" },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <div className="md:hidden sticky top-16 z-40 bg-background border-b border-border/40">
      <ScrollArea className="w-full">
        <div className="flex gap-2 px-6 py-3">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            
            return (
              <Link
                key={tab.id}
                to={`/crevia-link?tab=${tab.id}`}
                className={cn(
                  "inline-flex items-center justify-center px-5 py-2.5 rounded-lg whitespace-nowrap font-poppins text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-bronze/10 text-bronze border border-bronze/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-1.5" />
      </ScrollArea>
    </div>
  );
};

export default LinkTabsMobile;
