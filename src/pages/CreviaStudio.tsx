import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Link2, MessageSquare, Sparkles, Settings, Receipt, FileSignature } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// Tab content
import CreviaLink from "./CreviaLink";
import SmartInvoicesTab from "@/components/studio/SmartInvoicesTab";
import ContractsTab from "@/components/studio/ContractsTab";
import StudioSettingsTab from "@/components/studio/StudioSettingsTab";
import StudioWorkspacesHub from "@/components/studio/workspaces/StudioWorkspacesHub";

const CreviaStudio = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  const activeTab = searchParams.get("tab") || "link";
  const activeLinkSection = searchParams.get("section") || "profile";
  const activeWorkspace = searchParams.get("workspace") || undefined;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .single();
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  // Strict order: Link → Workspace → Invoice → Contracts → Settings
  const studioTabs = [
    { id: "link",      label: "Crevia Link", icon: Link2 },
    { id: "chat",      label: "Workspace",   icon: MessageSquare },
    { id: "invoices",  label: "Invoice",     icon: Receipt },
    { id: "contracts", label: "Contracts",   icon: FileSignature },
    { id: "settings",  label: "Settings",    icon: Settings },
  ];

  const linkSections = [
    { id: "profile",    label: "Profile" },
    { id: "buttons",    label: "Buttons" },
    { id: "appearance", label: "Appearance" },
    { id: "settings",   label: "Settings" },
    { id: "analytics",  label: "Analytics" },
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

  const isChatTab = activeTab === "chat";

  return (
    <div className={cn(
      "bg-background",
      isChatTab
        ? "h-[calc(100vh-128px)] md:h-[calc(100vh-64px)] flex flex-col overflow-hidden"
        : "min-h-screen overflow-x-hidden"
    )}>
      {/* Studio Header */}
      <div className={cn(
        "border-b border-border bg-background z-30 flex-shrink-0",
        !isChatTab && "md:sticky md:top-0"
      )}>
        <div className="mx-auto w-full max-w-7xl px-4 py-3 md:px-6 md:py-4">
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

          {/* Tabs — strict order enforced by studioTabs array */}
          <ScrollArea className="w-full">
            <div className="flex items-center gap-1 pb-1 -mb-px">
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
            <ScrollBar orientation="horizontal" className="h-1.5" />
          </ScrollArea>

          {/* Link sub-sections (mobile only) */}
          {activeTab === "link" && (
            <div className="md:hidden mt-3 border-t border-border/40 pt-3">
              <ScrollArea className="w-full">
                <div className="flex items-center gap-2">
                  {linkSections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => handleLinkSectionChange(section.id)}
                      className={cn(
                        "inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                        activeLinkSection === section.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="h-1.5" />
              </ScrollArea>
            </div>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {isChatTab ? (
        <div className="flex-1 min-h-0 overflow-hidden">
          <StudioWorkspacesHub />
        </div>
      ) : (
        <div className="flex-1 min-w-0 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {activeTab === "link"      && <CreviaLink isEmbedded />}
              {activeTab === "invoices"  && <SmartInvoicesTab workspaceId={activeWorkspace} />}
              {activeTab === "contracts" && <ContractsTab workspaceId={activeWorkspace} />}
              {activeTab === "settings"  && <StudioSettingsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CreviaStudio;
