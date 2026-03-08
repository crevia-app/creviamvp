import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Printer, CheckCircle2, FileSignature, Calendar, Coins, PenTool, Send, 
  Edit3, Save, X, Download, Share2, MoreHorizontal, Eye, Shield, 
  Clock, FileText, AlertCircle 
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
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  const [savingContent, setSavingContent] = useState(false);
  const [activeSection, setActiveSection] = useState<"document" | "signatures">("document");

  useEffect(() => {
    if (contract) {
      fetchProfile();
      setLocalContract(contract);
      setEditableContent(contract.content || "");
      setIsEditingContent(false);
      setActiveSection("document");
    }
  }, [contract]);

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
      currency: contract?.currency || "KES",
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

    setLocalContract({ ...localContract, ...updateData });
    const updated = { ...localContract, ...updateData };
    if (updated.creator_signature && updated.client_signature) {
      await supabase.from("contracts").update({ status: "signed" }).eq("id", localContract.id);
      setLocalContract({ ...updated, status: "signed" });
    }

    toast.success(`${signingAs === "creator" ? "Your" : "Client"} signature saved!`);
    onContractUpdate?.();
  };

  const handleSaveContent = async () => {
    if (!localContract) return;
    setSavingContent(true);
    const { error } = await supabase.from("contracts").update({ content: editableContent }).eq("id", localContract.id);
    setSavingContent(false);
    if (error) { toast.error("Failed to save"); return; }
    setLocalContract({ ...localContract, content: editableContent });
    setIsEditingContent(false);
    toast.success("Content updated");
    onContractUpdate?.();
  };

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
    return text
      .replace(/\[CREATOR_NAME\]/g, profile?.display_name || profile?.handle || "Creator")
      .replace(/\[CLIENT_NAME\]/g, contract.client_name)
      .replace(/\[START_DATE\]/g, contract.start_date ? format(new Date(contract.start_date), "MMMM d, yyyy") : "[Start Date]")
      .replace(/\[END_DATE\]/g, contract.end_date ? format(new Date(contract.end_date), "MMMM d, yyyy") : "[End Date]")
      .replace(/\[VALUE\]/g, contract.value?.toString() || "[Value]")
      .replace(/\[CURRENCY\]/g, contract.currency)
      .replace(/\[DELIVERABLES\]/g, contract.deliverables?.join("\n• ") || "[Deliverables]")
      .replace(/\[PAYMENT_TERMS\]/g, contract.payment_terms || "[Payment Terms]")
      .replace(/\[USAGE_RIGHTS\]/g, contract.usage_rights || "[Usage Rights]")
      .replace(/\[EXCLUSIVITY_CLAUSE\]/g, contract.exclusivity ? contract.exclusivity_details || "Exclusivity applies" : "No exclusivity required")
      .replace(/\[TERMINATION_CLAUSE\]/g, contract.termination_clause || "[Termination Clause]");
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-background border-b border-border/50 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <DialogTitle className="font-vollkorn text-base truncate">{contract.title}</DialogTitle>
            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0", status.bg, status.color)}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5 print:hidden">
            {/* Section toggle */}
            <div className="hidden sm:flex items-center bg-muted/50 rounded-lg p-0.5 mr-1">
              <button
                onClick={() => setActiveSection("document")}
                className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all",
                  activeSection === "document" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                )}
              >
                Document
              </button>
              <button
                onClick={() => setActiveSection("signatures")}
                className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all",
                  activeSection === "signatures" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                )}
              >
                Signatures
              </button>
            </div>
            {!isEditingContent && localContract.content && (
              <Button variant="ghost" size="sm" onClick={() => { setIsEditingContent(true); setActiveSection("document"); }} className="gap-1.5 h-8 rounded-lg text-xs">
                <Edit3 className="h-3 w-3" /> Edit
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handlePrint} className="gap-1.5 h-8 rounded-lg text-xs">
              <Printer className="h-3 w-3" /> Print
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 md:p-8">
            {/* Document View */}
            <AnimatePresence mode="wait">
              {activeSection === "document" && (
                <motion.div
                  key="document"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Paper Document */}
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden border border-border/20 print:shadow-none print:border-0">
                    {/* Accent */}
                    <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/20" />
                    
                    <div className="p-6 md:p-10 space-y-8">
                      {/* Header */}
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-1">
                              {contractTypeLabels[contract.contract_type] || "Agreement"}
                            </p>
                            <h1 className="text-2xl md:text-3xl font-vollkorn font-bold text-foreground tracking-tight">
                              {contract.title}
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

                      {/* Parties */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-2">Creator / Service Provider</p>
                          <p className="font-semibold text-foreground">{profile?.display_name || profile?.handle || "Creator"}</p>
                          {profile?.email && <p className="text-xs text-muted-foreground mt-0.5">{profile.email}</p>}
                        </div>
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-2">Client / Brand</p>
                          <p className="font-semibold text-foreground">{contract.client_name}</p>
                          {contract.client_email && <p className="text-xs text-muted-foreground mt-0.5">{contract.client_email}</p>}
                        </div>
                      </div>

                      {/* Key Terms */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                          <Coins className="h-4 w-4 text-primary mx-auto mb-1.5" />
                          <p className="text-lg font-bold text-foreground">{formatCurrency(contract.value)}</p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Value</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/30">
                          <Calendar className="h-4 w-4 text-muted-foreground mx-auto mb-1.5" />
                          <p className="text-sm font-semibold text-foreground">{contract.start_date ? format(new Date(contract.start_date), "MMM d, yyyy") : "TBD"}</p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">Start</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/30">
                          <Calendar className="h-4 w-4 text-muted-foreground mx-auto mb-1.5" />
                          <p className="text-sm font-semibold text-foreground">{contract.end_date ? format(new Date(contract.end_date), "MMM d, yyyy") : "TBD"}</p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">End</p>
                        </div>
                      </div>

                      {/* Deliverables */}
                      {contract.deliverables?.filter((d: string) => d).length > 0 && (
                        <div>
                          <h3 className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-3 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            Deliverables
                          </h3>
                          <div className="space-y-1.5">
                            {contract.deliverables.filter((d: string) => d).map((item: string, i: number) => (
                              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/20">
                                <span className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center text-[10px] font-bold text-emerald-600 flex-shrink-0">{i + 1}</span>
                                <span className="text-sm text-foreground">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Terms Blocks */}
                      <div className="space-y-3">
                        {contract.payment_terms && (
                          <div className="p-4 border-l-2 border-primary bg-primary/5 rounded-r-xl">
                            <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">Payment Terms</p>
                            <p className="text-sm text-foreground/80">{contract.payment_terms}</p>
                          </div>
                        )}
                        {contract.exclusivity && (
                          <div className="p-4 border-l-2 border-amber-500 bg-amber-500/5 rounded-r-xl">
                            <p className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold mb-1">Exclusivity</p>
                            <p className="text-sm text-foreground/80">{contract.exclusivity_details || "Exclusivity terms apply."}</p>
                          </div>
                        )}
                        {contract.usage_rights && (
                          <div className="p-4 border-l-2 border-blue-500 bg-blue-500/5 rounded-r-xl">
                            <p className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold mb-1">Usage Rights</p>
                            <p className="text-sm text-foreground/80">{contract.usage_rights}</p>
                          </div>
                        )}
                        {contract.termination_clause && (
                          <div className="p-4 border-l-2 border-border bg-muted/20 rounded-r-xl">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Termination</p>
                            <p className="text-sm text-foreground/80">{contract.termination_clause}</p>
                          </div>
                        )}
                      </div>

                      {/* Full Content */}
                      {(localContract.content || isEditingContent) && (
                        <div className="pt-6 border-t border-border/30">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Full Agreement</p>
                            {isEditingContent && (
                              <div className="flex gap-1.5 print:hidden">
                                <Button size="sm" variant="ghost" onClick={() => { setIsEditingContent(false); setEditableContent(localContract.content || ""); }} className="gap-1 h-7 text-xs rounded-lg">
                                  <X className="h-3 w-3" /> Cancel
                                </Button>
                                <Button size="sm" onClick={handleSaveContent} disabled={savingContent} className="gap-1 h-7 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">
                                  <Save className="h-3 w-3" /> {savingContent ? "Saving..." : "Save"}
                                </Button>
                              </div>
                            )}
                          </div>
                          {isEditingContent ? (
                            <Textarea
                              value={editableContent}
                              onChange={(e) => setEditableContent(e.target.value)}
                              className="min-h-[350px] font-mono text-sm leading-relaxed rounded-xl border-primary/20 focus:border-primary/40 resize-none"
                            />
                          ) : (
                            <div className="whitespace-pre-wrap text-sm text-foreground/80 leading-relaxed font-mono p-5 rounded-xl bg-muted/20 border border-border/20">
                              {replaceTemplatePlaceholders(localContract.content)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="pt-4 border-t border-border/20 text-center">
                        <p className="text-[10px] text-muted-foreground/50 tracking-wider">
                          CREVIA STUDIO • {format(new Date(), "yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Signatures View */}
              {activeSection === "signatures" && (
                <motion.div
                  key="signatures"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <FileSignature className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-vollkorn text-xl font-bold text-foreground">E-Signatures</h3>
                    <p className="text-sm text-muted-foreground mt-1">Legally binding electronic signatures</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Creator Signature */}
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Creator Signature</p>
                      <div
                        className={cn(
                          "h-32 rounded-2xl border-2 border-dashed flex items-center justify-center relative overflow-hidden transition-all",
                          localContract.creator_signature
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-border hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
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
                          <button
                            onClick={() => { setSigningAs("creator"); setShowSignatureDialog(true); }}
                            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                          >
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
                        <Button
                          onClick={() => { setSigningAs("creator"); setShowSignatureDialog(true); }}
                          className="w-full gap-2 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-10"
                        >
                          <PenTool className="h-4 w-4" /> Sign as Creator
                        </Button>
                      )}
                    </div>

                    {/* Client Signature */}
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Client Signature</p>
                      <div
                        className={cn(
                          "h-32 rounded-2xl border-2 border-dashed flex items-center justify-center relative overflow-hidden transition-all",
                          localContract.client_signature
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-border"
                        )}
                      >
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
                        <Button
                          variant="outline"
                          onClick={() => { setSigningAs("client"); setShowSignatureDialog(true); }}
                          className="w-full gap-2 rounded-xl h-10"
                        >
                          <PenTool className="h-4 w-4" /> Sign as Client
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Send to Client CTA */}
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

            {/* Mobile section toggle */}
            <div className="sm:hidden flex items-center justify-center gap-2 mt-6 print:hidden">
              <Button
                variant={activeSection === "document" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection("document")}
                className="rounded-xl gap-1.5"
              >
                <FileText className="h-3.5 w-3.5" /> Document
              </Button>
              <Button
                variant={activeSection === "signatures" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection("signatures")}
                className="rounded-xl gap-1.5"
              >
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
