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
import { FileSignature, PenLine } from "lucide-react";
import { toast } from "sonner";

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

  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editingContract) {
      setTitle(editingContract.title ?? "");
      setClientName(editingContract.client_name ?? "");
      setClientEmail(editingContract.client_email ?? "");
      setContent(editingContract.content ?? "");
    } else if (kiraContext) {
      if (kiraContext.title)        setTitle(kiraContext.title as string);
      if (kiraContext.client_name)  setClientName(kiraContext.client_name as string);
      if (kiraContext.client_email) setClientEmail(kiraContext.client_email as string);
      if (kiraContext.content)      setContent(kiraContext.content as string);
    } else {
      setTitle("");
      setClientName("");
      setClientEmail("");
      setContent("");
    }
  }, [editingContract, kiraContext, open]);

  const appendSignature = () => {
    if (content.includes("SIGNATURES")) return;
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
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-border/50 flex-shrink-0">
            <DialogHeader>
              <DialogTitle className="font-vollkorn text-xl flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileSignature className="h-4 w-4 text-primary" />
                </div>
                {editingContract ? "Edit Contract" : "New Contract"}
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Compact meta row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q1 2026 Brand Partnership"
                  className="mt-1 h-9 rounded-xl text-sm"
                  autoFocus
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Client Name *</Label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Company or individual"
                  className="mt-1 h-9 rounded-xl text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Client Email</Label>
                <Input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="mt-1 h-9 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Canvas area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Canvas</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={appendSignature}
                  className="gap-1.5 h-7 text-xs border-bronze/30 text-bronze hover:bg-bronze/8 hover:border-bronze/50"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  Add Signature
                </Button>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`AGREEMENT\n\nBetween: [Your Name] ("Creator")\nAnd: ${clientName || "[Client Name]"} ("Client")\n\nPaste your Kira AI–generated contract here, or type your terms directly…`}
                className="rounded-xl font-mono text-sm leading-relaxed min-h-[460px] resize-none bg-background border-border/60 focus:border-primary/30 focus-visible:ring-primary/20"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between bg-muted/20 flex-shrink-0">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !title.trim() || !clientName.trim()}
              className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              {loading ? "Saving…" : editingContract ? "Update Contract" : "Save Contract"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateContractDialog;
