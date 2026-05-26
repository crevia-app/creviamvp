import { useState, useEffect } from "react";
import SuccessOverlay from "@/components/ui/SuccessOverlay";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileSignature,
  ChevronRight,
  User,
  PenLine,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CreateContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingContract?: any;
  onSuccess: () => void;
  onCreated?: (id: string) => void;
  kiraContext?: Record<string, unknown> | null;
}

const SIGNATURE_BLOCK = `

─────────────────────────────────────

SIGNATURES

Creator
Name: ___________________________
Signature: ___________________________
Date: ___________________________


Client / Brand
Name: ___________________________
Signature: ___________________________
Date: ___________________________
`;

const steps = [
  { id: "details", label: "Details", icon: <User className="h-4 w-4" /> },
  { id: "canvas",  label: "Canvas",  icon: <PenLine className="h-4 w-4" /> },
];

const CreateContractDialog = ({
  open,
  onOpenChange,
  editingContract,
  onSuccess,
  onCreated,
  kiraContext,
}: CreateContractDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Step 0 fields — only essentials
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  // Step 1 field — the blank canvas
  const [content, setContent] = useState("");

  // ── Populate when editing or Kira-prefilled ──────────────────
  useEffect(() => {
    if (!open) return;
    if (editingContract) {
      setTitle(editingContract.title ?? "");
      setClientName(editingContract.client_name ?? "");
      setClientEmail(editingContract.client_email ?? "");
      setContent(editingContract.content ?? "");
      setCurrentStep(0);
    } else if (kiraContext) {
      if (kiraContext.title)        setTitle(kiraContext.title as string);
      if (kiraContext.client_name)  setClientName(kiraContext.client_name as string);
      if (kiraContext.client_email) setClientEmail(kiraContext.client_email as string);
      if (kiraContext.content)      setContent(kiraContext.content as string);
      setCurrentStep(0);
    } else {
      resetForm();
    }
  }, [editingContract, kiraContext, open]);

  const resetForm = () => {
    setTitle("");
    setClientName("");
    setClientEmail("");
    setContent("");
    setCurrentStep(0);
  };

  const appendSignature = () => {
    if (content.includes("SIGNATURES")) return; // don't double-add
    setContent((prev) => prev + SIGNATURE_BLOCK);
    toast.success("Signature block added");
  };

  const handleSubmit = async () => {
    if (!title.trim() || !clientName.trim()) {
      toast.error("Contract title and client name are required");
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please log in"); return; }

      const contractData = {
        user_id: session.user.id,
        title: title.trim(),
        client_name: clientName.trim(),
        client_email: clientEmail.trim() || null,
        contract_type: "custom",
        content: content || null,
      };

      if (editingContract) {
        const { error } = await supabase
          .from("contracts")
          .update(contractData)
          .eq("id", editingContract.id);
        if (error) throw error;
        onSuccess();
        onOpenChange(false);
        toast.success("Contract updated");
      } else {
        const { data: created, error } = await supabase
          .from("contracts")
          .insert(contractData)
          .select("id")
          .single();
        if (error) throw error;
        if (created?.id) onCreated?.(created.id);
        onOpenChange(false);
        setShowSuccess(true);
      }
    } catch (error: any) {
      if (error.message?.includes("contract_limit_reached")) {
        toast.error("Monthly limit reached", {
          description: "Free plan allows 2 contracts per month. Upgrade to Pro for unlimited.",
        });
      } else {
        toast.error(error.message || "Failed to save contract");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SuccessOverlay
        show={showSuccess}
        title="Contract Created"
        subtitle="Your contract is ready to sign"
        onComplete={() => { setShowSuccess(false); onSuccess(); }}
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl">
          {/* Header + step indicator */}
          <div className="px-6 pt-6 pb-4 border-b border-border/50 flex-shrink-0">
            <DialogHeader className="mb-4">
              <DialogTitle className="font-vollkorn text-xl flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileSignature className="h-4 w-4 text-primary" />
                </div>
                {editingContract ? "Edit Contract" : "New Contract"}
              </DialogTitle>
            </DialogHeader>

            {/* Step pills */}
            <div className="flex items-center gap-1">
              {steps.map((step, i) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => {
                      if (i < currentStep || (i === 1 && title.trim() && clientName.trim())) {
                        setCurrentStep(i);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      i === currentStep
                        ? "bg-primary/10 text-primary"
                        : i < currentStep
                        ? "text-foreground/70 hover:bg-muted cursor-pointer"
                        : "text-muted-foreground cursor-default"
                    )}
                  >
                    {i < currentStep
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      : step.icon}
                    <span className="hidden sm:inline">{step.label}</span>
                  </button>
                  {i < steps.length - 1 && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground mx-0.5" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <AnimatePresence mode="wait">
              {/* Step 0 – Details */}
              {currentStep === 0 && (
                <motion.div
                  key="step-details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Contract details</h3>
                    <p className="text-xs text-muted-foreground">
                      Just the essentials — use Kira AI to generate the full content on the next step.
                    </p>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Contract Title *
                    </Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Q1 2026 Brand Partnership"
                      className="mt-1.5 h-11 rounded-xl"
                      autoFocus
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Client Information
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Client Name *</Label>
                        <Input
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Company or individual"
                          className="mt-1 h-10 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Client Email</Label>
                        <Input
                          type="email"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="client@example.com"
                          className="mt-1 h-10 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Kira AI hint */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-bronze/5 border border-bronze/15">
                    <Sparkles className="h-4 w-4 text-bronze flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong className="text-foreground">Tip:</strong> Use Kira AI to draft your full contract.
                      Copy the generated text and paste it into the Canvas on the next step.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 1 – Blank Canvas */}
              {currentStep === 1 && (
                <motion.div
                  key="step-canvas"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3 h-full"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground mb-0.5">Contract Canvas</h3>
                      <p className="text-xs text-muted-foreground">
                        Paste or type your full contract content here.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={appendSignature}
                      className="gap-1.5 h-8 text-xs border-bronze/30 text-bronze hover:bg-bronze/8 hover:border-bronze/50 flex-shrink-0"
                    >
                      <PenLine className="h-3.5 w-3.5" />
                      Add Signature
                    </Button>
                  </div>

                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`AGREEMENT\n\nBetween: [Your Name] ("Creator")\nAnd: ${clientName || "[Client Name]"} ("Client")\n\nPaste your Kira AI–generated contract here, or type your terms directly…`}
                    className="rounded-xl font-mono text-sm leading-relaxed min-h-[440px] resize-none bg-background border-border/60 focus:border-primary/30 focus-visible:ring-primary/20"
                    spellCheck={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between bg-muted/20 flex-shrink-0">
            <Button
              variant="ghost"
              onClick={() => {
                if (currentStep === 0) onOpenChange(false);
                else setCurrentStep(0);
              }}
              className="rounded-xl"
            >
              {currentStep === 0 ? "Cancel" : "Back"}
            </Button>

            {currentStep === 0 ? (
              <Button
                onClick={() => setCurrentStep(1)}
                disabled={!title.trim() || !clientName.trim()}
                className="rounded-xl bg-primary hover:bg-primary/90 gap-1.5"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !title.trim() || !clientName.trim()}
                className="rounded-xl bg-primary hover:bg-primary/90 gap-1.5 shadow-lg shadow-primary/20"
              >
                {loading ? "Saving…" : editingContract ? "Update Contract" : "Save Contract"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateContractDialog;
