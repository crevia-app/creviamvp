import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Printer, CheckCircle2, FileSignature, Calendar, Coins, PenTool, Send, 
  Edit3, Save, X, Plus, Trash2, FileText, Maximize2, Minimize2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ESignatureDialog from "./ESignatureDialog";

interface ContractPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: any;
  onContractUpdate?: () => void;
}

const ContractPreviewDialog = ({
  open,
  onOpenChange,
  contract,
  onContractUpdate,
}: ContractPreviewDialogProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signingAs, setSigningAs] = useState<"creator" | "client">("creator");
  const [localContract, setLocalContract] = useState(contract);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  const [editForm, setEditForm] = useState({
    client_name: "",
    client_email: "",
    value: "",
    currency: "KES",
    start_date: "",
    end_date: "",
    deliverables: [] as string[],
    payment_terms: "",
    usage_rights: "",
    exclusivity: false,
    exclusivity_details: "",
    termination_clause: "",
  });
  const [savingDetails, setSavingDetails] = useState(false);
  const [activeSection, setActiveSection] = useState<"document" | "signatures">("document");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (contract) {
      fetchProfile();
      setLocalContract(contract);
      setEditableContent(contract.content || "");
      setIsEditingDetails(false);
      setActiveSection("document");
      resetEditForm(contract);
    }
  }, [contract]);

  const resetEditForm = (c: any) => {
    setEditForm({
      client_name: c.client_name || "",
      client_email: c.client_email || "",
      value: c.value?.toString() || "",
      currency: c.currency || "KES",
      start_date: c.start_date || "",
      end_date: c.end_date || "",
      deliverables: c.deliverables?.length ? [...c.deliverables] : [""],
      payment_terms: c.payment_terms || "",
      usage_rights: c.usage_rights || "",
      exclusivity: c.exclusivity || false,
      exclusivity_details: c.exclusivity_details || "",
      termination_clause: c.termination_clause || "",
    });
    setEditableContent(c.content || "");
  };

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      setProfile(data);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: localContract?.currency || "KES",
    }).format(amount);
  };

  const handlePrint = () => window.print();

  const handleSign = async (signature: string, signedAt: string) => {
    if (!localContract) return;
    const updateData = signingAs === "creator"
      ? { creator_signature: signature, creator_signed_at: signedAt }
      : { client_signature: signature, client_signed_at: signedAt };
    const { error } = await supabase.from("contracts").update(updateData).eq("id", localContract.id);
    if (error) { toast.error("Failed to save signature"); return; }
    const updated = { ...localContract, ...updateData };
    if (updated.creator_signature && updated.client_signature) {
      await supabase.from("contracts").update({ status: "signed" }).eq("id", localContract.id);
      setLocalContract({ ...updated, status: "signed" });
    } else {
      setLocalContract(updated);
    }
    toast.success(`${signingAs === "creator" ? "Your" : "Client"} signature saved!`);
    onContractUpdate?.();
  };

  const handleSaveDetails = async () => {
    if (!localContract) return;
    setSavingDetails(true);
    const cleanDeliverables = editForm.deliverables.filter(d => d.trim() !== "");
    const updateData: any = {
      client_name: editForm.client_name,
      client_email: editForm.client_email || null,
      value: editForm.value ? parseFloat(editForm.value) : null,
      currency: editForm.currency,
      start_date: editForm.start_date || null,
      end_date: editForm.end_date || null,
      deliverables: cleanDeliverables,
      payment_terms: editForm.payment_terms || null,
      usage_rights: editForm.usage_rights || null,
      exclusivity: editForm.exclusivity,
      exclusivity_details: editForm.exclusivity_details || null,
      termination_clause: editForm.termination_clause || null,
      content: editableContent || null,
    };
    const { error } = await supabase.from("contracts").update(updateData).eq("id", localContract.id);
    setSavingDetails(false);
    if (error) { toast.error("Failed to save changes"); return; }
    setLocalContract({ ...localContract, ...updateData });
    setIsEditingDetails(false);
    toast.success("Contract updated");
    onContractUpdate?.();
  };

  const addDeliverable = () => setEditForm(f => ({ ...f, deliverables: [...f.deliverables, ""] }));
  const removeDeliverable = (idx: number) => setEditForm(f => ({ ...f, deliverables: f.deliverables.filter((_, i) => i !== idx) }));
  const updateDeliverable = (idx: number, val: string) => setEditForm(f => ({ ...f, deliverables: f.deliverables.map((d, i) => i === idx ? val : d) }));

  const handleSendToClient = async () => {
    if (!localContract?.client_email) {
      toast.error("No client email. Edit the contract to add one.");
      return;
    }
    const { error } = await supabase.from("contracts").update({ status: "sent" }).eq("id", localContract.id);
    if (error) { toast.error("Failed to update"); return; }
    setLocalContract({ ...localContract, status: "sent" });
    toast.success(`Contract sent to ${localContract.client_email}`);
    onContractUpdate?.();
  };

  const replaceTemplatePlaceholders = (text: string) => {
    if (!text) return "";
    const c = localContract;
    return text
      .replace(/\[CREATOR_NAME\]/g, profile?.display_name || profile?.handle || "Creator")
      .replace(/\[CLIENT_NAME\]/g, c.client_name)
      .replace(/\[START_DATE\]/g, c.start_date ? format(new Date(c.start_date), "MMMM d, yyyy") : "[Start Date]")
      .replace(/\[END_DATE\]/g, c.end_date ? format(new Date(c.end_date), "MMMM d, yyyy") : "[End Date]")
      .replace(/\[VALUE\]/g, c.value?.toString() || "[Value]")
      .replace(/\[CURRENCY\]/g, c.currency)
      .replace(/\[DELIVERABLES\]/g, c.deliverables?.join("\n• ") || "[Deliverables]")
      .replace(/\[PAYMENT_TERMS\]/g, c.payment_terms || "[Payment Terms]")
      .replace(/\[USAGE_RIGHTS\]/g, c.usage_rights || "[Usage Rights]")
      .replace(/\[EXCLUSIVITY_CLAUSE\]/g, c.exclusivity ? c.exclusivity_details || "Exclusivity applies" : "No exclusivity required")
      .replace(/\[TERMINATION_CLAUSE\]/g, c.termination_clause || "[Termination Clause]");
  };

  if (!contract || !localContract) return null;

  const contractTypeLabels: Record<string, string> = {
    sponsorship: "Sponsorship Agreement",
    content_creation: "Content Creation Agreement",
    brand_ambassador: "Brand Ambassador Agreement",
    ugc: "UGC Agreement",
    affiliate: "Affiliate Partnership",
    custom: "Custom Agreement",
    uploaded: "Uploaded Contract",
  };

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: "Draft", color: "text-muted-foreground", bg: "bg-muted" },
    sent: { label: "Sent", color: "text-blue-600", bg: "bg-blue-500/10" },
    signed: { label: "Signed", color: "text-emerald-600", bg: "bg-emerald-500/10" },
    active: { label: "Active", color: "text-green-600", bg: "bg-green-500/10" },
    completed: { label: "Completed", color: "text-purple-600", bg: "bg-purple-500/10" },
    cancelled: { label: "Cancelled", color: "text-destructive", bg: "bg-destructive/10" },
  };

  const status = statusConfig[localContract.status] || statusConfig.draft;
  const bothSigned = localContract.creator_signature && localContract.client_signature;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setIsFullscreen(false); onOpenChange(v); }}>
      <DialogContent className={cn(
        "overflow-hidden flex flex-col p-0 gap-0 transition-all duration-300",
        isFullscreen
          ? "max-w-[100vw] w-screen h-screen max-h-screen rounded-none"
          : "max-w-4xl max-h-[92vh] rounded-2xl"
      )}>
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-background border-b border-border/50 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <DialogTitle className="font-vollkorn text-base truncate">{localContract.title}</DialogTitle>
            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0", status.bg, status.color)}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5 print:hidden">
            <div className="hidden sm:flex items-center bg-muted/50 rounded-lg p-0.5 mr-1">
              <button onClick={() => setActiveSection("document")} className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all", activeSection === "document" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}>
                Document
              </button>
              <button onClick={() => setActiveSection("signatures")} className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all", activeSection === "signatures" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}>
                Signatures
              </button>
            </div>
            {!isEditingDetails && (
              <Button variant="ghost" size="sm" onClick={() => { setIsEditingDetails(true); setActiveSection("document"); resetEditForm(localContract); }} className="gap-1.5 h-8 rounded-lg text-xs">
                <Edit3 className="h-3 w-3" /> Edit
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handlePrint} className="gap-1.5 h-8 rounded-lg text-xs">
              <Printer className="h-3 w-3" /> Print
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)} className="gap-1.5 h-8 rounded-lg text-xs">
              {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              {isFullscreen ? "Exit" : "Full"}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 md:p-8">
            <AnimatePresence mode="wait">
              {activeSection === "document" && (
                <motion.div key="document" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {isEditingDetails ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-border/20 overflow-hidden">
                      <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/20" />
                      <div className="p-6 md:p-10 space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="font-vollkorn text-xl font-bold text-foreground">Edit Contract</h2>
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="ghost" onClick={() => { setIsEditingDetails(false); resetEditForm(localContract); }} className="gap-1 h-8 text-xs rounded-lg">
                              <X className="h-3 w-3" /> Cancel
                            </Button>
                            <Button size="sm" onClick={handleSaveDetails} disabled={savingDetails} className="gap-1 h-8 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">
                              <Save className="h-3 w-3" /> {savingDetails ? "Saving..." : "Save All"}
                            </Button>
                          </div>
                        </div>

                        {/* Client Info */}
                        <div className="space-y-3">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Client Information</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Client Name</label>
                              <Input value={editForm.client_name} onChange={e => setEditForm(f => ({ ...f, client_name: e.target.value }))} className="h-9 rounded-lg text-sm" />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Client Email</label>
                              <Input value={editForm.client_email} onChange={e => setEditForm(f => ({ ...f, client_email: e.target.value }))} className="h-9 rounded-lg text-sm" />
                            </div>
                          </div>
                        </div>

                        {/* Value & Dates */}
                        <div className="space-y-3">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Value & Timeline</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Value ({editForm.currency})</label>
                              <Input type="number" value={editForm.value} onChange={e => setEditForm(f => ({ ...f, value: e.target.value }))} className="h-9 rounded-lg text-sm" />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                              <Input type="date" value={editForm.start_date} onChange={e => setEditForm(f => ({ ...f, start_date: e.target.value }))} className="h-9 rounded-lg text-sm" />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                              <Input type="date" value={editForm.end_date} onChange={e => setEditForm(f => ({ ...f, end_date: e.target.value }))} className="h-9 rounded-lg text-sm" />
                            </div>
                          </div>
                        </div>

                        {/* Deliverables */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Deliverables</p>
                            <Button variant="ghost" size="sm" onClick={addDeliverable} className="gap-1 h-7 text-xs rounded-lg text-primary">
                              <Plus className="h-3 w-3" /> Add
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {editForm.deliverables.map((d, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center text-[10px] font-bold text-emerald-600 flex-shrink-0">{i + 1}</span>
                                <Input value={d} onChange={e => updateDeliverable(i, e.target.value)} placeholder="Describe deliverable..." className="h-9 rounded-lg text-sm flex-1" />
                                {editForm.deliverables.length > 1 && (
                                  <Button variant="ghost" size="sm" onClick={() => removeDeliverable(i)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Terms */}
                        <div className="space-y-3">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Terms & Clauses</p>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Payment Terms</label>
                            <Textarea value={editForm.payment_terms} onChange={e => setEditForm(f => ({ ...f, payment_terms: e.target.value }))} className="min-h-[60px] rounded-lg text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Usage Rights</label>
                            <Textarea value={editForm.usage_rights} onChange={e => setEditForm(f => ({ ...f, usage_rights: e.target.value }))} className="min-h-[60px] rounded-lg text-sm" />
                          </div>
                          <div className="flex items-center gap-3">
                            <input type="checkbox" checked={editForm.exclusivity} onChange={e => setEditForm(f => ({ ...f, exclusivity: e.target.checked }))} className="rounded" />
                            <label className="text-sm text-foreground">Exclusivity clause</label>
                          </div>
                          {editForm.exclusivity && (
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Exclusivity Details</label>
                              <Textarea value={editForm.exclusivity_details} onChange={e => setEditForm(f => ({ ...f, exclusivity_details: e.target.value }))} className="min-h-[60px] rounded-lg text-sm" />
                            </div>
                          )}
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Termination Clause</label>
                            <Textarea value={editForm.termination_clause} onChange={e => setEditForm(f => ({ ...f, termination_clause: e.target.value }))} className="min-h-[60px] rounded-lg text-sm" />
                          </div>
                        </div>

                        {/* Full Content */}
                        {(localContract.content || editableContent) && (
                          <div className="space-y-3">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Full Agreement Text</p>
                            <Textarea value={editableContent} onChange={e => setEditableContent(e.target.value)} className="min-h-[200px] font-mono text-sm leading-relaxed rounded-xl resize-none" />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden border border-border/20 print:shadow-none print:border-0">
                      <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/20" />
                      <div className="p-6 md:p-10 space-y-8">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-1">
                                {contractTypeLabels[localContract.contract_type] || "Agreement"}
                              </p>
                              <h1 className="text-2xl md:text-3xl font-vollkorn font-bold text-foreground tracking-tight">
                                {localContract.title}
                              </h1>
                            </div>
                            {bothSigned && (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span className="text-xs font-semibold">Fully Signed</span>
                              </div>
                            )}
                          </div>
                          <div className="h-px bg-border/60" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-2">Creator / Service Provider</p>
                            <p className="font-semibold text-foreground">{profile?.display_name || profile?.handle || "Creator"}</p>
                            {profile?.email && <p className="text-xs text-muted-foreground mt-0.5">{profile.email}</p>}
                          </div>
                          <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-2">Client / Brand</p>
                            <p className="font-semibold text-foreground">{localContract.client_name}</p>
                            {localContract.client_email && <p className="text-xs text-muted-foreground mt-0.5">{localContract.client_email}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                            <Coins className="h-4 w-4 text-primary mx-auto mb-1.5" />
                            <p className="text-lg font-bold text-foreground">{formatCurrency(localContract.value)}</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Value</p>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/30">
                            <Calendar className="h-4 w-4 text-muted-foreground mx-auto mb-1.5" />
                            <p className="text-sm font-semibold text-foreground">{localContract.start_date ? format(new Date(localContract.start_date), "MMM d, yyyy") : "TBD"}</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Start</p>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/30">
                            <Calendar className="h-4 w-4 text-muted-foreground mx-auto mb-1.5" />
                            <p className="text-sm font-semibold text-foreground">{localContract.end_date ? format(new Date(localContract.end_date), "MMM d, yyyy") : "TBD"}</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">End</p>
                          </div>
                        </div>

                        {localContract.deliverables?.filter((d: string) => d).length > 0 && (
                          <div>
                            <h3 className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-3 flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              Deliverables
                            </h3>
                            <div className="space-y-1.5">
                              {localContract.deliverables.filter((d: string) => d).map((item: string, i: number) => (
                                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/20">
                                  <span className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center text-[10px] font-bold text-emerald-600 flex-shrink-0">{i + 1}</span>
                                  <span className="text-sm text-foreground">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          {localContract.payment_terms && (
                            <div className="p-4 border-l-2 border-primary bg-primary/5 rounded-r-xl">
                              <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">Payment Terms</p>
                              <p className="text-sm text-foreground/80">{localContract.payment_terms}</p>
                            </div>
                          )}
                          {localContract.exclusivity && (
                            <div className="p-4 border-l-2 border-amber-500 bg-amber-500/5 rounded-r-xl">
                              <p className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold mb-1">Exclusivity</p>
                              <p className="text-sm text-foreground/80">{localContract.exclusivity_details || "Exclusivity terms apply."}</p>
                            </div>
                          )}
                          {localContract.usage_rights && (
                            <div className="p-4 border-l-2 border-blue-500 bg-blue-500/5 rounded-r-xl">
                              <p className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold mb-1">Usage Rights</p>
                              <p className="text-sm text-foreground/80">{localContract.usage_rights}</p>
                            </div>
                          )}
                          {localContract.termination_clause && (
                            <div className="p-4 border-l-2 border-border bg-muted/20 rounded-r-xl">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Termination</p>
                              <p className="text-sm text-foreground/80">{localContract.termination_clause}</p>
                            </div>
                          )}
                        </div>

                        {localContract.content && (
                          <div className="pt-6 border-t border-border/30">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-4">Full Agreement</p>
                            <div className="whitespace-pre-wrap text-sm text-foreground/80 leading-relaxed font-mono p-5 rounded-xl bg-muted/20 border border-border/20">
                              {replaceTemplatePlaceholders(localContract.content)}
                            </div>
                          </div>
                        )}

                        <div className="pt-4 border-t border-border/20 text-center">
                          <p className="text-[10px] text-muted-foreground/50 tracking-wider">CREVIA STUDIO • {format(new Date(), "yyyy")}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeSection === "signatures" && (
                <motion.div key="signatures" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <FileSignature className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-vollkorn text-xl font-bold text-foreground">E-Signatures</h3>
                    <p className="text-sm text-muted-foreground mt-1">Legally binding electronic signatures</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Creator Signature</p>
                      <div
                        className={cn("h-32 rounded-2xl border-2 border-dashed flex items-center justify-center relative overflow-hidden transition-all",
                          localContract.creator_signature ? "border-emerald-500/30 bg-emerald-500/5" : "border-border hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
                        )}
                        onClick={() => { if (!localContract.creator_signature) { setSigningAs("creator"); setShowSignatureDialog(true); } }}
                      >
                        {localContract.creator_signature ? (
                          <>
                            <div className="absolute top-2 right-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold">
                                <CheckCircle2 className="h-3 w-3" /> Signed
                              </span>
                            </div>
                            {localContract.creator_signature.startsWith("data:image") ? (
                              <img src={localContract.creator_signature} alt="Signature" className="max-h-20 object-contain" />
                            ) : (
                              <span className="text-3xl font-vollkorn italic text-foreground/70">{localContract.creator_signature}</span>
                            )}
                          </>
                        ) : (
                          <button onClick={() => { setSigningAs("creator"); setShowSignatureDialog(true); }} className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                            <PenTool className="h-5 w-5" />
                            <span className="text-xs font-medium">Click to sign</span>
                          </button>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{profile?.display_name || profile?.handle || "Creator"}</p>
                        <p className="text-xs text-muted-foreground">Creator / Service Provider</p>
                        {localContract.creator_signed_at && (
                          <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {format(new Date(localContract.creator_signed_at), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        )}
                      </div>
                      {!localContract.creator_signature && (
                        <Button onClick={() => { setSigningAs("creator"); setShowSignatureDialog(true); }} className="w-full gap-2 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-10">
                          <PenTool className="h-4 w-4" /> Sign as Creator
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Client Signature</p>
                      <div className={cn("h-32 rounded-2xl border-2 border-dashed flex items-center justify-center relative overflow-hidden transition-all",
                        localContract.client_signature ? "border-emerald-500/30 bg-emerald-500/5" : "border-border"
                      )}>
                        {localContract.client_signature ? (
                          <>
                            <div className="absolute top-2 right-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold">
                                <CheckCircle2 className="h-3 w-3" /> Signed
                              </span>
                            </div>
                            {localContract.client_signature.startsWith("data:image") ? (
                              <img src={localContract.client_signature} alt="Signature" className="max-h-20 object-contain" />
                            ) : (
                              <span className="text-3xl font-vollkorn italic text-foreground/70">{localContract.client_signature}</span>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <PenTool className="h-5 w-5" />
                            <span className="text-xs font-medium">
                              {localContract.status === "draft" ? "Send to client first" : "Awaiting signature"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{localContract.client_name}</p>
                        <p className="text-xs text-muted-foreground">Client / Brand</p>
                        {localContract.client_signed_at && (
                          <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {format(new Date(localContract.client_signed_at), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        )}
                      </div>
                      {localContract.status !== "draft" && !localContract.client_signature && (
                        <Button variant="outline" onClick={() => { setSigningAs("client"); setShowSignatureDialog(true); }} className="w-full gap-2 rounded-xl h-10">
                          <PenTool className="h-4 w-4" /> Sign as Client
                        </Button>
                      )}
                    </div>
                  </div>

                  {localContract.status === "draft" && localContract.creator_signature && !localContract.client_signature && (
                    <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Send className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-foreground">Ready to send</p>
                            <p className="text-xs text-muted-foreground">Send to {localContract.client_name} for signature</p>
                          </div>
                        </div>
                        <Button onClick={handleSendToClient} className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg">
                          <Send className="h-4 w-4" /> Send
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="sm:hidden flex items-center justify-center gap-2 mt-6 print:hidden">
              <Button variant={activeSection === "document" ? "default" : "outline"} size="sm" onClick={() => setActiveSection("document")} className="rounded-xl gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Document
              </Button>
              <Button variant={activeSection === "signatures" ? "default" : "outline"} size="sm" onClick={() => setActiveSection("signatures")} className="rounded-xl gap-1.5">
                <PenTool className="h-3.5 w-3.5" /> Signatures
              </Button>
            </div>
          </div>
        </div>

        <ESignatureDialog
          open={showSignatureDialog}
          onOpenChange={setShowSignatureDialog}
          signerName={signingAs === "creator" ? (profile?.display_name || profile?.handle || "") : localContract?.client_name || ""}
          onSign={handleSign}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ContractPreviewDialog;