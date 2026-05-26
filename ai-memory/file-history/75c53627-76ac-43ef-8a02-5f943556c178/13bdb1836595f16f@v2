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
  Printer, CheckCircle2, FileSignature, PenTool,
  Edit3, Save, X, FileText, Maximize2, Minimize2, Download
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ESignatureDialog from "./ESignatureDialog";
import { useDownloadPDF } from "@/hooks/use-download-pdf";

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
  const [placementMode, setPlacementMode] = useState<{ signature: string; signedAt: string } | null>(null);
  const [localContract, setLocalContract] = useState(contract);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);
  const [activeSection, setActiveSection] = useState<"document" | "signatures">("document");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { ref: docRef, download, downloading } = useDownloadPDF(
    contract ? `Contract-${contract.title?.replace(/\s+/g, "-")}` : "Contract"
  );

  useEffect(() => {
    if (contract) {
      fetchProfile();
      setLocalContract(contract);
      setEditableContent(contract.content || "");
      setIsEditingDetails(false);
      setActiveSection("document");
      setPlacementMode(null);
    }
  }, [contract]);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      setProfile(data);
    }
  };

  const handlePrint = () => window.print();

  // Called by ESignatureDialog when user finishes drawing/typing their signature.
  // Instead of saving immediately, enter placement mode so they can "tap to place".
  const handleSignReady = (signature: string, signedAt: string) => {
    setShowSignatureDialog(false);
    setPlacementMode({ signature, signedAt });
  };

  // Called when the user taps anywhere in the placement overlay.
  const handlePlacementTap = async () => {
    if (!placementMode || !localContract) return;
    const { signature, signedAt } = placementMode;
    const { error } = await supabase
      .from("contracts")
      .update({ creator_signature: signature, creator_signed_at: signedAt, status: "signed" })
      .eq("id", localContract.id);
    if (error) { toast.error("Failed to save signature"); return; }
    setLocalContract({ ...localContract, creator_signature: signature, creator_signed_at: signedAt, status: "signed" });
    setPlacementMode(null);
    toast.success("Your signature has been placed!");
    onContractUpdate?.();
  };

  const handleSaveDetails = async () => {
    if (!localContract) return;
    setSavingDetails(true);
    const { error } = await supabase
      .from("contracts")
      .update({ content: editableContent || null })
      .eq("id", localContract.id);
    setSavingDetails(false);
    if (error) { toast.error("Failed to save changes"); return; }
    setLocalContract({ ...localContract, content: editableContent || null });
    setIsEditingDetails(false);
    toast.success("Contract updated");
    onContractUpdate?.();
  };

  if (!contract || !localContract) return null;

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: "Draft", color: "text-muted-foreground", bg: "bg-muted" },
    sent: { label: "Sent", color: "text-blue-600", bg: "bg-blue-500/10" },
    signed: { label: "Signed", color: "text-emerald-600", bg: "bg-emerald-500/10" },
    active: { label: "Active", color: "text-green-600", bg: "bg-green-500/10" },
    completed: { label: "Completed", color: "text-purple-600", bg: "bg-purple-500/10" },
    cancelled: { label: "Cancelled", color: "text-destructive", bg: "bg-destructive/10" },
  };

  const status = statusConfig[localContract.status] || statusConfig.draft;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setIsFullscreen(false); setPlacementMode(null); } onOpenChange(v); }}>
      <DialogContent className={cn(
        "overflow-hidden flex flex-col p-0 gap-0 transition-all duration-300",
        isFullscreen
          ? "max-w-[100vw] w-screen h-screen max-h-screen rounded-none"
          : "max-w-4xl max-h-[92vh] rounded-2xl"
      )}>
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-background border-b border-border/50 px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <DialogTitle className="font-vollkorn text-sm sm:text-base truncate">{localContract.title}</DialogTitle>
            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0", status.bg, status.color)}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 print:hidden">
            <div className="hidden sm:flex items-center bg-muted/50 rounded-lg p-0.5 mr-1">
              <button
                onClick={() => setActiveSection("document")}
                className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all", activeSection === "document" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
              >
                Document
              </button>
              <button
                onClick={() => setActiveSection("signatures")}
                className={cn("px-3 py-1 rounded-md text-xs font-medium transition-all", activeSection === "signatures" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
              >
                Signatures
              </button>
            </div>
            {!isEditingDetails && (
              <Button
                variant="ghost" size="sm"
                onClick={() => { setIsEditingDetails(true); setActiveSection("document"); setEditableContent(localContract.content || ""); }}
                className="gap-1 h-8 w-8 sm:w-auto sm:px-2.5 rounded-lg"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Edit</span>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={download} disabled={downloading} className="gap-1 h-8 w-8 sm:w-auto sm:px-2.5 rounded-lg">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">{downloading ? "Saving…" : "Download"}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handlePrint} className="gap-1 h-8 w-8 sm:w-auto sm:px-2.5 rounded-lg">
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Print</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)} className="gap-1 h-8 w-8 sm:w-auto sm:px-2.5 rounded-lg">
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline text-xs">{isFullscreen ? "Exit" : "Full"}</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto relative">

          {/* Adobe Acrobat-style placement overlay */}
          {placementMode && (
            <div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-background/85 backdrop-blur-sm cursor-crosshair select-none"
              onClick={handlePlacementTap}
            >
              <div className="p-6 rounded-2xl bg-background border-2 border-dashed border-primary/50 shadow-2xl flex flex-col items-center gap-4 pointer-events-none">
                {placementMode.signature.startsWith("data:image") ? (
                  <img src={placementMode.signature} alt="Your signature" className="max-h-24 object-contain" />
                ) : (
                  <span className="text-4xl font-vollkorn italic text-foreground/80">{placementMode.signature}</span>
                )}
                <p className="text-sm text-muted-foreground font-medium tracking-wide">Tap anywhere to place your signature</p>
              </div>
            </div>
          )}

          <div className="p-5 md:p-8">
            <AnimatePresence mode="wait">

              {/* ── DOCUMENT TAB ── */}
              {activeSection === "document" && (
                <motion.div key="document" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                  {/* Edit mode */}
                  {isEditingDetails ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-border/20 overflow-hidden">
                      <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/20" />
                      <div className="p-6 md:p-10 space-y-6">
                        {/* Header row */}
                        <div className="flex items-center justify-between">
                          <h2 className="font-vollkorn text-xl font-bold text-foreground">Edit Contract</h2>
                          <div className="flex gap-1.5">
                            <Button
                              size="sm" variant="ghost"
                              onClick={() => { setIsEditingDetails(false); setEditableContent(localContract.content || ""); }}
                              className="gap-1 h-8 text-xs rounded-lg"
                            >
                              <X className="h-3 w-3" /> Cancel
                            </Button>
                            <Button
                              size="sm" onClick={handleSaveDetails} disabled={savingDetails}
                              className="gap-1 h-8 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <Save className="h-3 w-3" /> {savingDetails ? "Saving..." : "Save All"}
                            </Button>
                          </div>
                        </div>

                        {/* Full Agreement Text — only section */}
                        <div className="space-y-3">
                          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Full Agreement Text</p>
                          <Textarea
                            value={editableContent}
                            onChange={e => setEditableContent(e.target.value)}
                            placeholder="Write your contract terms here…"
                            className="min-h-[420px] font-mono text-sm leading-relaxed rounded-xl resize-none"
                            autoFocus
                          />
                        </div>
                      </div>
                    </div>

                  ) : (
                    /* View mode */
                    <div ref={docRef} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden border border-border/20 print:shadow-none print:border-0">
                      <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/20" />
                      <div className="p-6 md:p-10 space-y-8">
                        {/* Title */}
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <h1 className="text-2xl md:text-3xl font-vollkorn font-bold text-foreground tracking-tight">
                              {localContract.title}
                            </h1>
                            {localContract.creator_signature && (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span className="text-xs font-semibold">Signed</span>
                              </div>
                            )}
                          </div>
                          <div className="h-px bg-border/60" />
                        </div>

                        {/* Full Agreement — the only section */}
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-4">Full Agreement</p>
                          {localContract.content ? (
                            <div className="whitespace-pre-wrap text-sm text-foreground/80 leading-relaxed font-mono p-5 rounded-xl bg-muted/20 border border-border/20">
                              {localContract.content}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground/40 italic p-8 rounded-xl bg-muted/20 border border-dashed border-border/30 text-center">
                              No content yet — tap <strong>Edit</strong> to add your contract text.
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-border/20 text-center">
                          <p className="text-[10px] text-muted-foreground/50 tracking-wider">CREVIA STUDIO • {format(new Date(), "yyyy")}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── SIGNATURES TAB ── */}
              {activeSection === "signatures" && (
                <motion.div key="signatures" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <FileSignature className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-vollkorn text-xl font-bold text-foreground">E-Signatures</h3>
                    <p className="text-sm text-muted-foreground mt-1">Legally binding electronic signatures</p>
                  </div>

                  {/* Your Signature — single card, centred */}
                  <div className="max-w-sm mx-auto space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Your Signature</p>

                    <div
                      className={cn(
                        "h-36 rounded-2xl border-2 border-dashed flex items-center justify-center relative overflow-hidden transition-all",
                        localContract.creator_signature
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-border hover:border-primary/30 hover:bg-primary/5 cursor-pointer"
                      )}
                      onClick={() => { if (!localContract.creator_signature) setShowSignatureDialog(true); }}
                    >
                      {localContract.creator_signature ? (
                        <>
                          <div className="absolute top-2 right-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold">
                              <CheckCircle2 className="h-3 w-3" /> Signed
                            </span>
                          </div>
                          {localContract.creator_signature.startsWith("data:image") ? (
                            <img src={localContract.creator_signature} alt="Signature" className="max-h-24 object-contain" />
                          ) : (
                            <span className="text-3xl font-vollkorn italic text-foreground/70">{localContract.creator_signature}</span>
                          )}
                        </>
                      ) : (
                        <button className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                          <PenTool className="h-5 w-5" />
                          <span className="text-xs font-medium">Tap to sign</span>
                        </button>
                      )}
                    </div>

                    <div>
                      <p className="font-medium text-sm text-foreground">{profile?.display_name || profile?.handle || "Creator"}</p>
                      {localContract.creator_signed_at && (
                        <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {format(new Date(localContract.creator_signed_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                    </div>

                    {!localContract.creator_signature && (
                      <Button
                        onClick={() => setShowSignatureDialog(true)}
                        className="w-full gap-2 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-10"
                      >
                        <PenTool className="h-4 w-4" /> Sign Contract
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile section switcher */}
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
          signerName={profile?.display_name || profile?.handle || ""}
          onSign={handleSignReady}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ContractPreviewDialog;
