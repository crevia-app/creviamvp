import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface LinkTabsMobileProps {
  userType: "creator" | "brand";
}

const LinkTabsMobile = ({ userType }: LinkTabsMobileProps) => {
  const location = useLocation();
  const currentTab = new URLSearchParams(location.search).get("tab") || "profile";

  // Same tabs for both creators and brands for Crevia Link
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
        <div className="flex gap-1 px-4 py-2">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            
            return (
              <Link
                key={tab.id}
                to={`/crevia-link?tab=${tab.id}`}
                className={cn(
                  "flex items-center px-4 py-2.5 rounded-lg whitespace-nowrap font-poppins text-sm font-medium transition-all duration-200 relative",
                  isActive
                    ? "text-bronze"
                    : "text-muted-foreground hover:text-bronze"
                )}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-bronze rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default LinkTabsMobile;
