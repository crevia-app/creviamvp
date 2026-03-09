import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Link2, Receipt, FileSignature, MessageSquare, Sparkles, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

// Import tab content
import CreviaLink from "./CreviaLink";
import SmartInvoicesTab from "@/components/studio/SmartInvoicesTab";
import ContractsTab from "@/components/studio/ContractsTab";
import CreviaChat from "@/components/crevia-connect/shared/CreviaChat";
import StudioSettingsTab from "@/components/studio/StudioSettingsTab";

const CreviaStudio = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<"creator" | "brand">("creator");
  
  const activeTab = searchParams.get("tab") || "link";
  const activeLinkSection = searchParams.get("section") || "profile";

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .single();
        
        if (profile?.user_type) {
          setUserType(profile.user_type);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const studioTabs = [
    { id: "link", label: "Crevia Link", icon: Link2 },
    { id: "chat", label: "Crevia Chat", icon: MessageSquare },
    { id: "contracts", label: "Contracts", icon: FileSignature },
    { id: "invoices", label: "Invoices", icon: Receipt },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const linkSections = [
    { id: "profile", label: "Profile" },
    { id: "buttons", label: "Buttons" },
    { id: "appearance", label: "Appearance" },
    { id: "settings", label: "Settings" },
    { id: "analytics", label: "Analytics" },
  ];

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const handleLinkSectionChange = (sectionId: string) => {
    setSearchParams({ tab: "link", section: sectionId });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-poppins">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Studio Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-16 z-30">
        <div className="px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-3 mb-3 md:mb-4">
            <div className="p-1.5 md:p-2 rounded-xl bg-bronze/10">
              <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-bronze" />
            </div>
            <div>
              <h1 className="font-vollkorn text-xl md:text-2xl font-semibold text-foreground">
                Crevia Studio
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Your creative business toolkit
              </p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 -mb-px scrollbar-none">
            {studioTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-t-lg font-poppins text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-300",
                    isActive
                      ? "bg-bronze/10 text-bronze border-b-2 border-bronze"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === "link" && <CreviaLink isEmbedded />}
        {activeTab === "chat" && <CreviaChat />}
        {activeTab === "invoices" && <SmartInvoicesTab />}
        {activeTab === "contracts" && <ContractsTab />}
        {activeTab === "settings" && <StudioSettingsTab />}
      </div>
    </div>
  );
};

export default CreviaStudio;
