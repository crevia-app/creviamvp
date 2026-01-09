import { useState } from "react";
import { useLocation } from "react-router-dom";
import ConnectSidebarDesktop from "./ConnectSidebarDesktop";
import ConnectTabsMobile from "./ConnectTabsMobile";
import CreatorDiscoveryTab from "./brand/CreatorDiscoveryTab";
import CampaignManagerTab from "./brand/CampaignManagerTab";
import ProjectManagerTab from "./brand/ProjectManagerTab";
import MyCreatorsTab from "./brand/MyCreatorsTab";
import KiraForBrandsTab from "./brand/KiraForBrandsTab";
import CreviaChat from "./shared/CreviaChat";
import { cn } from "@/lib/utils";

const BrandConnect = () => {
  const location = useLocation();
  const currentTab = new URLSearchParams(location.search).get("tab") || "discovery";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (currentTab) {
      case "discovery":
        return <CreatorDiscoveryTab />;
      case "campaigns":
        return <CampaignManagerTab />;
      case "projects":
        return <ProjectManagerTab />;
      case "creators":
        return <MyCreatorsTab />;
      case "kira":
        return <KiraForBrandsTab />;
      case "chat":
        return <CreviaChat />;
      default:
        return <CreatorDiscoveryTab />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ConnectTabsMobile userType="brand" />
      
      <div className="flex flex-1 w-full">
        <ConnectSidebarDesktop 
          userType="brand" 
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

export default BrandConnect;
