 import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import CreviaChat from "@/components/crevia-connect/shared/CreviaChat";
import WorkspaceMembersDialog from "@/components/studio/workspaces/WorkspaceMembersDialog";
import { ArrowLeft, CheckCircle2, Clock, FileSignature, Receipt, Sparkles, ArrowRight, Users } from "lucide-react";

const DEAL_STAGES = [
  { id: "negotiating", label: "Negotiating" },
  { id: "contract_signed", label: "Contract Signed" },
  { id: "invoice_paid", label: "Invoice Paid" },
  { id: "complete", label: "Complete" },
];

interface VaultProps {
  contracts: any[];
  invoices: any[];
  loading: boolean;
  onNavigate: (path: string) => void;
}

const ActionVaultContent = ({ contracts, invoices, loading, onNavigate }: VaultProps) => (
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
    {/* Contract */}
    <div>
      <div className="flex items-center gap-2 mb-2">
        <FileSignature className="w-3.5 h-3.5 text-bronze" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contract</span>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-16 rounded-xl bg-muted/50 animate-pulse" />
        </div>
      ) : contracts.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-border text-center">
          <FileSignature className="w-6 h-6 text-muted-foreground/40 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">No contracts yet</p>
        </div>
      ) : contracts.slice(0, 2).map((c) => (
        <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl border border-border/50 bg-background hover:border-bronze/30 transition-all mb-2">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-xs font-semibold truncate flex-1">{c.title}</p>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{c.status}</span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate mb-2">{c.client_name}</p>
          {c.status !== "signed" ? (
            <Button size="sm" className="w-full h-7 text-[10px] bg-bronze hover:bg-bronze/90 text-background">
              <FileSignature className="w-3 h-3 mr-1" /> Sign Contract
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span className="text-[10px] text-green-500 font-medium">Signed</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>

    {/* Invoice */}
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Receipt className="w-3.5 h-3.5 text-bronze" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice</span>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-16 rounded-xl bg-muted/50 animate-pulse" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-border text-center">
          <Receipt className="w-6 h-6 text-muted-foreground/40 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">No invoices yet</p>
        </div>
      ) : invoices.slice(0, 2).map((inv) => (
        <motion.div key={inv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl border border-border/50 bg-background hover:border-bronze/30 transition-all mb-2">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-xs font-semibold truncate flex-1">{inv.invoice_number}</p>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{inv.status}</span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate mb-1">{inv.client_name}</p>
          <p className="text-xs font-bold text-bronze mb-2">
            {new Intl.NumberFormat("en-KE", { style: "currency", currency: inv.currency || "KES" }).format(Number(inv.total))}
          </p>
          {inv.status !== "paid" ? (
            <Button size="sm" variant="outline" className="w-full h-7 text-[10px] border-bronze/30 text-bronze hover:bg-bronze/10">
              <Receipt className="w-3 h-3 mr-1" /> Process Payment
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span className="text-[10px] text-green-500 font-medium">Paid</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>

    {/* Quick Actions */}
    <div className="pt-2 border-t border-border/50">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Actions</p>
      <div className="space-y-1.5">
        <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => onNavigate("/crevia-studio?tab=contracts")}>
          <FileSignature className="w-3.5 h-3.5" /> All contracts <ArrowRight className="w-3 h-3 ml-auto" />
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => onNavigate("/crevia-studio?tab=invoices")}>
          <Receipt className="w-3.5 h-3.5" /> All invoices <ArrowRight className="w-3 h-3 ml-auto" />
        </Button>
      </div>
    </div>
  </div>
);

const WorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<any>(null);
  const [contracts, setContracts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [membersOpen, setMembersOpen] = useState(false);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [activeStage, setActiveStage] = useState("negotiating");
  const [loading, setLoading] = useState(true);
  const [vaultOpen, setVaultOpen] = useState(false);

  useEffect(() => { if (id) fetchData(); }, [id]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);

    const [{ data: room }, { data: contractsData }, { data: invoicesData }, { count }] = await Promise.all([
      supabase.from("chat_rooms").select("*").eq("id", id).single(),
      supabase.from("contracts").select("*").order("created_at", { ascending: false }).limit(3),
      supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(3),
      supabase.from("chat_room_members").select("*", { count: "exact", head: true }).eq("room_id", id),
    ]);
    setMemberCount(count ?? null);

    setWorkspace(room);
    setContracts(contractsData || []);
    setInvoices(invoicesData || []);

    if (invoicesData?.some((inv: any) => inv.status === "paid")) setActiveStage("complete");
    else if (invoicesData && invoicesData.length > 0) setActiveStage("invoice_paid");
    else if (contractsData?.some((c: any) => c.status === "signed")) setActiveStage("contract_signed");
    else setActiveStage("negotiating");

    setLoading(false);
  };

  const activeIndex = DEAL_STAGES.findIndex(s => s.id === activeStage);

  return (
    // subtract topbar (64px) + mobile bottom nav (64px) on mobile, topbar only on desktop
    <div className="flex flex-col h-[calc(100vh-128px)] md:h-[calc(100vh-64px)] overflow-hidden">

      {/* Deal Tracker */}
      <div className="flex-shrink-0 border-b border-border/50 bg-card/50 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/crevia-studio?tab=chat")} className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-bronze" />
                <span className="font-poppins font-semibold text-sm">{workspace?.name || "Workspace"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-bronze/30 text-bronze">
                {DEAL_STAGES[activeIndex]?.label}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs border-bronze/40 text-bronze hover:bg-bronze/10"
                onClick={() => setMembersOpen(true)}
              >
                <Users className="w-3.5 h-3.5" />
                People
                {memberCount !== null && (
                  <span className="bg-bronze/20 text-bronze rounded-full px-1.5 py-0 text-[10px] font-semibold leading-4">
                    {memberCount}
                  </span>
                )}
              </Button>
              {/* Mobile vault trigger — hidden on lg+ where the sidebar is visible */}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 lg:hidden border-bronze/30 text-bronze hover:bg-bronze/10"
                onClick={() => setVaultOpen(true)}
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-1">
            {DEAL_STAGES.map((stage, idx) => {
              const isCompleted = idx < activeIndex;
              const isActive = idx === activeIndex;
              return (
                <div key={stage.id} className="flex items-center flex-1 last:flex-none">
                  <button onClick={() => setActiveStage(stage.id)} className="flex flex-col items-center gap-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isCompleted ? "bg-bronze text-background" :
                      isActive ? "bg-bronze/20 border-2 border-bronze text-bronze" :
                      "bg-muted border-2 border-border text-muted-foreground"
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                       isActive ? <Clock className="w-3 h-3" /> :
                       <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                    </div>
                    <span className={`text-[9px] font-medium whitespace-nowrap hidden sm:block ${
                      isActive ? "text-bronze" : isCompleted ? "text-foreground" : "text-muted-foreground"
                    }`}>{stage.label}</span>
                  </button>
                  {idx < DEAL_STAGES.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 transition-all ${idx < activeIndex ? "bg-bronze" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat + Desktop Action Vault */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 min-w-0 overflow-hidden">
          <CreviaChat externalRoomId={id} hideRoomList={true} onBack={() => navigate("/crevia-studio?tab=chat")} />
        </div>

        {/* Desktop sidebar — hidden below lg */}
        <div className="hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0 border-l border-border/50 bg-card/30 overflow-hidden">
          <div className="p-4 border-b border-border/50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-bronze/10">
                <Sparkles className="w-4 h-4 text-bronze" />
              </div>
              <div>
                <h3 className="font-poppins font-semibold text-sm">Action Vault</h3>
                <p className="text-[10px] text-muted-foreground">Active contract & invoice</p>
              </div>
            </div>
          </div>
          <ActionVaultContent contracts={contracts} invoices={invoices} loading={loading} onNavigate={navigate} />
        </div>
      </div>

      {/* Mobile Action Vault — Sheet drawer, only rendered below lg */}
      <Sheet open={vaultOpen} onOpenChange={setVaultOpen}>
        <SheetContent side="right" className="w-full sm:w-80 p-0 flex flex-col">
          <SheetHeader className="p-4 border-b border-border/50 flex-shrink-0">
            <SheetTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-bronze/10">
                <Sparkles className="w-4 h-4 text-bronze" />
              </div>
              Action Vault
            </SheetTitle>
          </SheetHeader>
          <ActionVaultContent contracts={contracts} invoices={invoices} loading={loading} onNavigate={(path) => { navigate(path); setVaultOpen(false); }} />
        </SheetContent>
      </Sheet>

      {workspace && currentUserId && (
        <WorkspaceMembersDialog
          open={membersOpen}
          onOpenChange={(open) => {
            setMembersOpen(open);
            if (!open) {
              supabase
                .from("chat_room_members")
                .select("*", { count: "exact", head: true })
                .eq("room_id", workspace.id)
                .then(({ count }) => setMemberCount(count ?? null));
            }
          }}
          roomId={workspace.id}
          createdBy={workspace.created_by}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default WorkspacePage;
