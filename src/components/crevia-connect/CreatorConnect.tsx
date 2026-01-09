import { useState } from "react";
import { useLocation } from "react-router-dom";
import ConnectSidebarDesktop from "./ConnectSidebarDesktop";
import ConnectTabsMobile from "./ConnectTabsMobile";
import MyCampaignsTab from "./creator/MyCampaignsTab";
import MyProjectsTab from "./creator/MyProjectsTab";
import AnalyticsTab from "./creator/AnalyticsTab";
import KiraSuggestionsTab from "./creator/KiraSuggestionsTab";
import CreviaChat from "./shared/CreviaChat";
import { cn } from "@/lib/utils";

const CreatorConnect = () => {
  const location = useLocation();
  const currentTab = new URLSearchParams(location.search).get("tab") || "campaigns";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (currentTab) {
      case "campaigns":
        return <MyCampaignsTab />;
      case "projects":
        return <MyProjectsTab />;
      case "analytics":
        return <AnalyticsTab />;
      case "kira":
        return <KiraSuggestionsTab />;
      case "chat":
        return <CreviaChat />;
      default:
        return <MyCampaignsTab />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ConnectTabsMobile userType="creator" />
      
      <div className="flex flex-1 w-full">
        <ConnectSidebarDesktop 
          userType="creator" 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <main className={cn(
          "flex-1 overflow-auto transition-all duration-300",
          sidebarCollapsed ? "md:ml-[160px]" : "md:ml-[300px]"
        )}>
          <div className="container mx-auto px-4 py-4 md:py-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreatorConnect;
