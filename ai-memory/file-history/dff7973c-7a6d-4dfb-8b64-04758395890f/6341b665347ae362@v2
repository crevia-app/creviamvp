import { useState, useEffect } from "react";
import SuccessOverlay from "@/components/ui/SuccessOverlay";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileSignature } from "lucide-react";
import { toast } from "sonner";

interface CreateContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingContract?: any;
  onSuccess: () => void;
  onCreated?: (id: string) => void;
  kiraContext?: Record<string, unknown> | null;
}

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
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editingContract) {
      setContent(editingContract.content ?? "");
    } else if (kiraContext) {
      if (kiraContext.content) setContent(kiraContext.content as string);
    } else {
      setContent("");
    }
  }, [editingContract, kiraContext, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please log in"); return; }

      const autoTitle = `Contract – ${new Date().toLocaleDateString()}`;
      const contractData = {
        user_id: session.user.id,
        title: editingContract?.title?.trim() || autoTitle,
        client_name: editingContract?.client_name?.trim() || "",
        client_email: editingContract?.client_email?.trim() || null,
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
        <DialogContent className="w-[calc(100vw-16px)] sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl">
          {/* Header */}
          <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-border/50 flex-shrink-0">
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
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your contract here…"
              className="rounded-xl font-mono text-sm leading-relaxed min-h-[520px] resize-none bg-background border-border/60 focus:border-primary/30 focus-visible:ring-primary/20"
              spellCheck={false}
              autoFocus
            />
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 border-t border-border/50 flex items-center justify-between bg-muted/20 flex-shrink-0">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
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
