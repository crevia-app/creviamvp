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

export interface ApplicationContext {
  campaignTitle: string;
  creatorName: string;
  creatorEmail: string | null;
  proposedPrice: number;
  deliverables: string[];
}

interface CreateCanvasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCanvas?: any;
  onSuccess: () => void;
  onCreated?: (id: string) => void;
  kiraContext?: Record<string, unknown> | null;
  applicationContext?: ApplicationContext | null;
  folderId?: string | null;
}

const buildTemplate = (ctx: ApplicationContext): string => {
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const price = Number(ctx.proposedPrice || 0).toLocaleString();
  const half = (Number(ctx.proposedPrice || 0) / 2).toLocaleString();
  const deliverableLines = ctx.deliverables?.length
    ? ctx.deliverables.map(d => `  • ${d}`).join("\n")
    : "  • As agreed between parties";
  return `CANVAS AGREEMENT
Campaign: ${ctx.campaignTitle}
Date: ${today}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PARTIES
Brand (Client):  [Your Brand / Company Name]
Creator:         ${ctx.creatorName}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DELIVERABLES
${deliverableLines}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPENSATION
Total:                    KES ${price}
  Phase 1 (on start):     KES ${half}
  Phase 2 (on delivery):  KES ${half}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TERMS & CONDITIONS

1. SCOPE OF WORK
   The Creator agrees to deliver the content described above in accordance
   with the campaign brief.

2. CONTENT RIGHTS
   Upon full payment, the Brand receives a non-exclusive licence to use
   the content across agreed platforms for the campaign duration.

3. TIMELINE
   Deliverables shall be submitted within a timeframe agreed by both parties.

4. REVISIONS
   The Creator will provide up to [2] rounds of revisions upon request.

5. CONFIDENTIALITY
   Both parties agree to keep the terms of this agreement confidential.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SIGNATURES

Brand (Client)
Signature: ________________________________
Name:      ________________________________
Date:      ________________________________

Creator
Signature: ________________________________
Name:      ${ctx.creatorName}
Date:      ________________________________
`;
};

const CreateCanvasDialog = ({
  open,
  onOpenChange,
  editingCanvas,
  onSuccess,
  onCreated,
  kiraContext,
  applicationContext,
  folderId,
}: CreateCanvasDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editingCanvas) {
      setContent(editingCanvas.content ?? "");
    } else if (applicationContext) {
      setContent(buildTemplate(applicationContext));
    } else if (kiraContext) {
      if (kiraContext.content) setContent(kiraContext.content as string);
    } else {
      setContent("");
    }
  }, [editingCanvas, kiraContext, applicationContext, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please log in"); return; }

      const autoTitle = applicationContext
        ? `Canvas – ${applicationContext.campaignTitle}`
        : `Canvas – ${new Date().toLocaleDateString()}`;
      const contractData = {
        user_id: session.user.id,
        title: editingCanvas?.title?.trim() || autoTitle,
        client_name: applicationContext?.creatorName || editingCanvas?.client_name?.trim() || "",
        client_email: applicationContext?.creatorEmail || editingCanvas?.client_email?.trim() || null,
        value: applicationContext?.proposedPrice || null,
        deliverables: applicationContext?.deliverables?.length ? applicationContext.deliverables : null,
        contract_type: "custom",
        content: content || null,
      };

      if (editingCanvas) {
        const { error } = await supabase
          .from("canvases")
          .update(contractData)
          .eq("id", editingCanvas.id);
        if (error) throw error;
        onSuccess();
        onOpenChange(false);
        toast.success("Canvas updated");
      } else {
        const { data: created, error } = await supabase
          .from("canvases")
          .insert({ ...contractData, folder_id: folderId ?? null } as any)
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
          description: "Free plan allows 2 Canvas per month. Upgrade to Pro for unlimited.",
        });
      } else {
        toast.error(error.message || "Failed to save Canvas");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SuccessOverlay
        show={showSuccess}
        title="Canvas Created"
        subtitle="Your Canvas is ready"
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
                {editingCanvas ? "Edit Canvas" : applicationContext ? `Canvas – ${applicationContext.campaignTitle}` : "New Canvas"}
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your Canvas here…"
              className="rounded-xl font-mono text-base leading-relaxed min-h-[520px] resize-none bg-background border-border/60 focus:border-primary/30 focus-visible:ring-primary/20"
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
              {loading ? "Saving…" : editingCanvas ? "Update Canvas" : "Save Canvas"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateCanvasDialog;
