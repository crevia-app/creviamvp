import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ConnectTabsMobileProps {
  userType: "creator" | "brand";
}

const ConnectTabsMobile = ({ userType }: ConnectTabsMobileProps) => {
  const location = useLocation();
  const currentTab = new URLSearchParams(location.search).get("tab") || 
    (userType === "creator" ? "opportunities" : "discovery");

  const creatorTabs = [
    { id: "opportunities", label: "Opportunities" },
    { id: "campaigns", label: "My Campaigns" },
    { id: "payments", label: "Payments" },
    { id: "analytics", label: "Analytics" },
    { id: "kira", label: "Kira" },
    { id: "chat", label: "Crevia Chat" },
  ];

  const brandTabs = [
    { id: "discovery", label: "Creator Discovery" },
    { id: "campaigns", label: "Campaigns" },
    { id: "payments", label: "Payments" },
    { id: "creators", label: "My Creators" },
    { id: "kira", label: "Kira for Brands" },
    { id: "chat", label: "Crevia Chat" },
  ];

  const tabs = userType === "creator" ? creatorTabs : brandTabs;

  return (
    <div className="md:hidden sticky top-0 z-40 bg-background border-b border-border/40">
      <ScrollArea className="w-full">
        <div className="flex gap-1 px-4 py-2">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            
            return (
              <Link
                key={tab.id}
                to={`/crevia-connect?tab=${tab.id}`}
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

export default ConnectTabsMobile;
