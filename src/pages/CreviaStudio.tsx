import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Link2, FileText, FileSignature, Receipt, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Import Crevia Link content
import CreviaLink from "./CreviaLink";

const CreviaStudio = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [userType, setUserType] = useState<"creator" | "brand" | null>(null);
  const [loading, setLoading] = useState(true);
  
  const activeTab = searchParams.get("tab") || "link";

  useEffect(() => {
    const fetchUserType = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .single();
        setUserType(profile?.user_type || null);
      }
      setLoading(false);
    };
    fetchUserType();
  }, []);

  const studioTabs = [
    { id: "link", label: "Crevia Link", icon: Link2 },
    { id: "invoices", label: "Smart Invoices", icon: Receipt },
    { id: "contracts", label: "Contracts", icon: FileSignature },
    { id: "rate-cards", label: "Rate Cards", icon: FileText },
  ];

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
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
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-bronze/10">
              <Sparkles className="h-5 w-5 text-bronze" />
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
          <div className="flex gap-1 overflow-x-auto pb-1 -mb-px">
            {studioTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-poppins text-sm font-medium whitespace-nowrap transition-all duration-300",
                    isActive
                      ? "bg-bronze/10 text-bronze border-b-2 border-bronze"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === "link" && <CreviaLink isEmbedded />}
        
        {activeTab === "invoices" && (
          <div className="p-6 md:p-8">
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-bronze/10 flex items-center justify-center mx-auto mb-6">
                <Receipt className="h-8 w-8 text-bronze" />
              </div>
              <h2 className="font-vollkorn text-2xl font-semibold text-foreground mb-3">
                Smart Invoices
              </h2>
              <p className="text-muted-foreground mb-6">
                Create professional invoices with AI-powered suggestions. Coming soon!
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bronze/10 text-bronze text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Coming Soon
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "contracts" && (
          <div className="p-6 md:p-8">
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-bronze/10 flex items-center justify-center mx-auto mb-6">
                <FileSignature className="h-8 w-8 text-bronze" />
              </div>
              <h2 className="font-vollkorn text-2xl font-semibold text-foreground mb-3">
                Contracts
              </h2>
              <p className="text-muted-foreground mb-6">
                Generate and manage creator contracts with legal templates. Coming soon!
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bronze/10 text-bronze text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Coming Soon
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "rate-cards" && (
          <div className="p-6 md:p-8">
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-bronze/10 flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-bronze" />
              </div>
              <h2 className="font-vollkorn text-2xl font-semibold text-foreground mb-3">
                Rate Cards
              </h2>
              <p className="text-muted-foreground mb-6">
                Build beautiful rate cards to share with brands. Coming soon!
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bronze/10 text-bronze text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Coming Soon
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreviaStudio;
