import { useSearchParams } from "react-router-dom";
import { Link2, MessageSquare, Sparkles, Receipt, FileSignature, User, MousePointerClick, Palette, SlidersHorizontal, BarChart2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
// Tab content
import CreviaLink from "./CreviaLink";
import SmartInvoicesTab from "@/components/studio/SmartInvoicesTab";
import ContractsTab from "@/components/studio/CanvasTab";
import StudioWorkspacesHub from "@/components/studio/workspaces/StudioWorkspacesHub";

const CreviaStudio = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  const activeTab = searchParams.get("tab") || "link";
  const activeLinkSection = searchParams.get("section") || "profile";
  const activeWorkspace = searchParams.get("workspace") || undefined;
  const activeRoomId = searchParams.get("roomId") || undefined;

  // Strict order: Link → Workspace → Invoice → Canvas
  const studioTabs = [
    { id: "link",      labelKey: "studio.tab.link",      icon: Link2 },
    { id: "chat",      labelKey: "studio.tab.workspace", icon: MessageSquare },
    { id: "invoices",  labelKey: "studio.tab.invoice",   icon: Receipt },
    { id: "contracts", labelKey: "studio.tab.canvas",    icon: FileSignature },
  ];

  const linkSections = [
    { id: "profile",    label: "Profile",    icon: User },
    { id: "buttons",    label: "Buttons",    icon: MousePointerClick },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "settings",   label: "Settings",   icon: SlidersHorizontal },
    { id: "analytics",  label: "Analytics",  icon: BarChart2 },
  ];

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const handleLinkSectionChange = (sectionId: string) => {
    setSearchParams({ tab: "link", section: sectionId });
  };

  const isChatTab = activeTab === "chat";

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Studio Header — flex-shrink-0 keeps it pinned while content below scrolls */}
      <div className="border-b border-border bg-background z-30 flex-shrink-0">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-3 mb-3 md:mb-4">
            <div className="p-1.5 md:p-2 rounded-xl bg-bronze/10">
              <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-bronze" />
            </div>
            <div>
              <h1 className="font-vollkorn text-xl md:text-2xl font-semibold text-foreground">
                {t("studio.title")}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {t("studio.subtitle")}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-stretch gap-1 -mb-px">
            {studioTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const label = t(tab.labelKey);
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex-1 flex flex-col sm:flex-row items-center justify-center",
                    "gap-2 sm:gap-1.5 px-1 sm:px-3 py-3.5 sm:py-2.5",
                    "rounded-xl sm:rounded-t-lg sm:rounded-b-none font-poppins",
                    "transition-all duration-200 active:scale-[0.96] select-none",
                    isActive
                      ? "bg-bronze/10 text-bronze sm:border-b-2 sm:border-bronze"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  <Icon className="h-[22px] w-[22px] sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline text-sm font-medium whitespace-nowrap">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Link sub-sections (mobile only) — icon + label tab bar */}
          {activeTab === "link" && (
            <div className="md:hidden mt-2 border-t border-border/40 -mx-4">
              <div className="flex w-full">
                {linkSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeLinkSection === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => handleLinkSectionChange(section.id)}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-1 py-2.5 select-none",
                        "transition-all duration-200 active:scale-95 relative"
                      )}
                    >
                      {/* Active indicator line */}
                      {isActive && (
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-bronze" />
                      )}
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
                        isActive
                          ? "bg-bronze/15 text-bronze"
                          : "text-muted-foreground"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={cn(
                        "text-[10px] font-semibold tracking-wide transition-colors duration-200",
                        isActive ? "text-bronze" : "text-muted-foreground"
                      )}>
                        {section.label}
                      </span>
                    </button>
                  );
                })}
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
        <div className="flex-1 overflow-y-auto min-w-0 pb-16 md:pb-0">
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
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CreviaStudio;
