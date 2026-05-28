import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Link2, MessageSquare, Receipt, FileSignature,
  User, MousePointerClick, Palette, BarChart2,
  PanelLeft, X, ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
// Tab content
import CreviaLink         from "./CreviaLink";
import SmartInvoicesTab   from "@/components/studio/SmartInvoicesTab";
import ContractsTab       from "@/components/studio/CanvasTab";
import StudioWorkspacesHub from "@/components/studio/workspaces/StudioWorkspacesHub";

/* ─────────────────────────────────────────────────────────────────────────────
   TAB DEFINITIONS
───────────────────────────────────────────────────────────────────────────── */
const STUDIO_TABS = [
  {
    id:          "link",
    shortLabel:  "Link",
    fullLabel:   "Crevia Link",
    description: "Your public profile page",
    labelKey:    "studio.tab.link",
    icon:        Link2,
    color:       "#CF8150",   // bronze
  },
  {
    id:          "chat",
    shortLabel:  "Workspace",
    fullLabel:   "Crevia Workspace",
    description: "Client collaboration hub",
    labelKey:    "studio.tab.workspace",
    icon:        MessageSquare,
    color:       "#7C6AF7",   // indigo accent
  },
  {
    id:          "invoices",
    shortLabel:  "Invoice",
    fullLabel:   "Crevia Invoice",
    description: "Smart billing system",
    labelKey:    "studio.tab.invoice",
    icon:        Receipt,
    color:       "#2BA577",   // emerald accent
  },
  {
    id:          "canvas",
    shortLabel:  "Canvas",
    fullLabel:   "Crevia Canvas",
    description: "Contracts & e-signatures",
    labelKey:    "studio.tab.canvas",
    icon:        FileSignature,
    color:       "#E8834A",   // warm orange accent
  },
] as const;

const LINK_SECTIONS = [
  { id: "profile",    label: "Profile",    icon: User },
  { id: "buttons",    label: "Buttons",    icon: MousePointerClick },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "analytics",  label: "Analytics",  icon: BarChart2 },
] as const;

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const CreviaStudio = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t }                           = useLanguage();
  const [sidebarOpen, setSidebarOpen]   = useState(false);

  const activeTab          = searchParams.get("tab")       || "link";
  const activeLinkSection  = searchParams.get("section")   || "profile";
  const activeWorkspace    = searchParams.get("workspace") || undefined;
  const activeRoomId       = searchParams.get("roomId")    || undefined;
  const isChatTab          = activeTab === "chat";

  const activeTabDef = STUDIO_TABS.find(t => t.id === activeTab) ?? STUDIO_TABS[0];

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
    setSidebarOpen(false);
  };

  const handleLinkSectionChange = (sectionId: string) => {
    setSearchParams({ tab: "link", section: sectionId });
  };

  return (
    <div className="h-full flex flex-col bg-background">

      {/* ═══════════════════════════════════════════════════════════════════
          HEADER
          Mobile:  compact single-row  [≡]  Crevia Studio · Feature name
          Desktop: full title + horizontal tab bar
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="border-b border-border bg-background z-30 flex-shrink-0">
        <div className="mx-auto w-full max-w-7xl">

          {/* ── MOBILE header row ────────────────────────────────────────── */}
          <div className="md:hidden flex items-center gap-3 px-4 py-2.5">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0",
                "bg-muted/60 hover:bg-muted active:scale-95 transition-all duration-150",
                "border border-border/60"
              )}
            >
              <PanelLeft className="w-4 h-4 text-foreground/70" />
            </button>

            {/* Title + active feature */}
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="font-vollkorn text-base font-semibold text-foreground truncate">
                Crevia Studio
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
              <span
                className="text-sm font-semibold font-poppins truncate"
                style={{ color: activeTabDef.color }}
              >
                {activeTabDef.shortLabel}
              </span>
            </div>
          </div>

          {/* ── DESKTOP header (unchanged) ──────────────────────────────── */}
          <div className="hidden md:block px-6 py-4">
            <h1 className="font-vollkorn text-2xl font-semibold text-foreground mb-4">
              {t("studio.title")}
            </h1>
            {/* Desktop tab bar */}
            <div className="flex items-stretch gap-1 -mb-px">
              {STUDIO_TABS.map((tab) => {
                const Icon     = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      "flex-1 flex flex-row items-center justify-center relative",
                      "gap-1.5 px-3 py-2.5 rounded-t-lg font-poppins",
                      "transition-all duration-200 active:scale-[0.96] select-none",
                      isActive
                        ? "text-bronze bg-bronze/10 border-b-2 border-bronze"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium whitespace-nowrap">{t(tab.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Link sub-sections (mobile only — compact icon row) ────────
              Appears below the header when on the Link tab.
              Labels removed to save vertical space; tooltips via title. */}
          {activeTab === "link" && (
            <div className="md:hidden border-t border-border/40 -mx-0">
              <div className="flex w-full px-2 py-1">
                {LINK_SECTIONS.map((section) => {
                  const Icon     = section.icon;
                  const isActive = activeLinkSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleLinkSectionChange(section.id)}
                      title={section.label}
                      className={cn(
                        "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl",
                        "transition-all duration-200 active:scale-95 select-none relative"
                      )}
                    >
                      {isActive && (
                        <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-bronze" />
                      )}
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                        isActive ? "bg-bronze/15 text-bronze" : "text-muted-foreground"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className={cn(
                        "text-[10px] font-medium font-poppins",
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

      {/* ═══════════════════════════════════════════════════════════════════
          TAB CONTENT
      ═══════════════════════════════════════════════════════════════════ */}
      {isChatTab ? (
        <div className="flex-1 min-h-0 overflow-hidden">
          <StudioWorkspacesHub initialRoomId={activeRoomId} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-w-0 pb-16 md:pb-0">
          <AnimatePresence mode="sync">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              {activeTab === "link"     && <CreviaLink isEmbedded />}
              {activeTab === "invoices" && <SmartInvoicesTab workspaceId={activeWorkspace} />}
              {activeTab === "canvas"   && <ContractsTab workspaceId={activeWorkspace} />}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          PREMIUM MOBILE SIDEBAR
          – Backdrop blur overlay (tap to close)
          – Left-sliding panel (spring physics)
          – Each feature: icon chip + name + description + active indicator
          – Only rendered on mobile (md:hidden on the container)
      ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] md:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar panel */}
            <motion.aside
              key="sidebar-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className={cn(
                "fixed left-0 top-0 bottom-0 z-50 md:hidden",
                "w-[300px] max-w-[85vw]",
                "bg-background border-r border-border/80",
                "flex flex-col shadow-2xl",
                "safe-area-pt"
              )}
            >
              {/* ── Sidebar header ── */}
              <div className="flex items-center justify-between px-5 pt-6 pb-5">
                <div>
                  <h2 className="font-vollkorn text-xl font-bold text-foreground">
                    Crevia Studio
                  </h2>
                  <p className="text-xs text-muted-foreground font-poppins mt-0.5">
                    Your creative operations
                  </p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors flex-shrink-0"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4 text-foreground/70" />
                </button>
              </div>

              {/* ── Divider ── */}
              <div className="h-px bg-border/60 mx-5" />

              {/* ── Section label ── */}
              <p className="px-5 pt-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 font-poppins">
                Features
              </p>

              {/* ── Nav items ── */}
              <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-6">
                {STUDIO_TABS.map((tab, index) => {
                  const Icon     = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <motion.button
                      key={tab.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 + index * 0.05, duration: 0.22 }}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        "w-full flex items-center gap-3.5 px-3.5 py-3.5 rounded-2xl text-left",
                        "transition-all duration-200 active:scale-[0.97] select-none",
                        isActive
                          ? "bg-bronze/10 border border-bronze/20"
                          : "hover:bg-muted/60 border border-transparent"
                      )}
                    >
                      {/* Icon chip */}
                      <div
                        className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
                          isActive ? "shadow-sm" : "bg-muted/60"
                        )}
                        style={isActive ? { background: `${tab.color}22` } : undefined}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: isActive ? tab.color : undefined }}
                        />
                      </div>

                      {/* Labels */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-semibold font-poppins leading-tight",
                          isActive ? "text-foreground" : "text-foreground/80"
                        )}>
                          {tab.fullLabel}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                          {tab.description}
                        </p>
                      </div>

                      {/* Active dot */}
                      {isActive && (
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: tab.color }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </nav>

              {/* ── Sidebar footer ── */}
              <div className="px-5 py-4 border-t border-border/40">
                <p className="text-[10px] text-muted-foreground/50 font-poppins text-center">
                  Crevia Studio · All features
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreviaStudio;
