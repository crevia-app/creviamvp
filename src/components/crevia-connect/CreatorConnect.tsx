import { useLocation } from "react-router-dom";
import ConnectSidebarDesktop from "./ConnectSidebarDesktop";
import ConnectTabsMobile from "./ConnectTabsMobile";
import OpportunitiesTab from "./creator/OpportunitiesTab";
import MyCampaignsTab from "./creator/MyCampaignsTab";
import AnalyticsTab from "./creator/AnalyticsTab";
import KiraSuggestionsTab from "./creator/KiraSuggestionsTab";
import CreviaChat from "./shared/CreviaChat";

const CreatorConnect = () => {
  const location = useLocation();
  const currentTab = new URLSearchParams(location.search).get("tab") || "opportunities";

  const renderContent = () => {
    switch (currentTab) {
      case "opportunities":
        return <OpportunitiesTab />;
      case "campaigns":
        return <MyCampaignsTab />;
      case "analytics":
        return <AnalyticsTab />;
      case "kira":
        return <KiraSuggestionsTab />;
      case "chat":
        return <CreviaChat />;
      default:
        return <OpportunitiesTab />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ConnectTabsMobile userType="creator" />
      
      <div className="flex flex-1 w-full">
        <ConnectSidebarDesktop userType="creator" />
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreatorConnect;