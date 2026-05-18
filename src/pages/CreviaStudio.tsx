import { useSearchParams } from "react-router-dom";
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

  const activeTab = searchParams.get("tab") || "link";
  const activeLinkSection = searchParams.get("section") || "profile";
  const activeWorkspace = searchParams.get("workspace") || undefined;
  const activeRoomId = searchParams.get("roomId") || undefined;

  // Strict order: Link → Workspace → Invoice → Contracts → Settings
  const studioTabs = [
    { id: "link",      label: "Crevia Link", icon: Link2 },
    { id: "chat",      label: "Workspace",   icon: MessageSquare },
    { id: "invoices",  label: "Invoice",     icon: Receipt },
    { id: "contracts", label: "Canvas",       icon: FileSignature },
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
              <p className="text-sm md:text-base text-muted-foreground">
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
                    title={tab.label}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2.5 rounded-t-lg font-poppins text-sm font-medium whitespace-nowrap transition-all duration-300 min-w-[44px] justify-center",
                      isActive
                        ? "bg-bronze/10 text-bronze border-b-2 border-bronze"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" className="h-1.5" />
          </ScrollArea>

          {/* Link sub-sections (mobile only) — segmented control */}
          {activeTab === "link" && (
            <div className="md:hidden mt-2 border-t border-border/40 pt-2">
              {/* Row 1: Profile · Buttons · Appearance */}
              <div className="flex gap-1 p-1 bg-muted/60 rounded-xl mb-1">
                {linkSections.slice(0, 3).map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleLinkSectionChange(section.id)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-[11px] font-semibold text-center transition-all duration-200 active:scale-95",
                      activeLinkSection === section.id
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground"
                    )}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
              {/* Row 2: Settings · Analytics */}
              <div className="flex gap-1 p-1 bg-muted/60 rounded-xl">
                {linkSections.slice(3).map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleLinkSectionChange(section.id)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-[11px] font-semibold text-center transition-all duration-200 active:scale-95",
                      activeLinkSection === section.id
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground"
                    )}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {isChatTab ? (
        <div className="flex-1 min-h-0 overflow-hidden">
          <StudioWorkspacesHub initialRoomId={activeRoomId} />
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
