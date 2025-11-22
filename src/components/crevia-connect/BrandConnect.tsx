import { useLocation } from "react-router-dom";
import ConnectHeader from "./ConnectHeader";
import ConnectSidebarDesktop from "./ConnectSidebarDesktop";
import ConnectTabsMobile from "./ConnectTabsMobile";
import CreatorDiscoveryTab from "./brand/CreatorDiscoveryTab";
import CampaignManagerTab from "./brand/CampaignManagerTab";
import MyCreatorsTab from "./brand/MyCreatorsTab";
import KiraForBrandsTab from "./brand/KiraForBrandsTab";
import CreviaChat from "./shared/CreviaChat";

const BrandConnect = () => {
  const location = useLocation();
  const currentTab = new URLSearchParams(location.search).get("tab") || "discovery";

  const renderContent = () => {
    switch (currentTab) {
      case "discovery":
        return <CreatorDiscoveryTab />;
      case "campaigns":
        return <CampaignManagerTab />;
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
    <div className="min-h-screen flex flex-col">
      <ConnectHeader />
      
      <ConnectTabsMobile userType="brand" />
      
      <div className="flex flex-1 w-full">
        <ConnectSidebarDesktop userType="brand" />
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BrandConnect;