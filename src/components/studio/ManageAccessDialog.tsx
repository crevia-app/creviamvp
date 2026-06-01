import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Lock, Link2, Copy, Check, Globe, Users, FolderOpen, FileSignature,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AccessLevel = "restricted" | "link_access";
export type AccessTarget = "canvas" | "folder";

interface ManageAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: AccessTarget;
  id: string;
  title: string;
  currentAccessLevel?: AccessLevel;
  shareToken?: string;
  onAccessChanged?: (level: AccessLevel) => void;
}

// ─── Option card ──────────────────────────────────────────────────────────────

const AccessOption = ({
  selected, icon: Icon, label, description, onClick,
}: {
  selected: boolean;
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150",
      selected
        ? "border-bronze bg-bronze/5 dark:bg-bronze/10"
        : "border-border/60 bg-card hover:border-bronze/40 hover:bg-muted/40"
    )}
  >
    <div className={cn(
      "mt-0.5 flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
      selected ? "bg-bronze/15 text-bronze" : "bg-muted text-muted-foreground"
    )}>
      <Icon className="w-4.5 h-4.5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className={cn("text-sm font-semibold leading-tight", selected ? "text-foreground" : "text-foreground/80")}>
        {label}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
    </div>
    {selected && (
      <Check className="flex-shrink-0 w-4 h-4 text-bronze mt-1" />
    )}
  </button>
);

// ─── Main dialog ──────────────────────────────────────────────────────────────

export function ManageAccessDialog({
  open,
  onOpenChange,
  target,
  id,
  title,
  currentAccessLevel: initialLevel = "restricted",
  shareToken: initialToken,
  onAccessChanged,
}: ManageAccessDialogProps) {
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(initialLevel);
  const [shareToken, setShareToken]   = useState<string | undefined>(initialToken);
  const [saving, setSaving]           = useState(false);
  const [copied, setCopied]           = useState(false);
  const [dirty, setDirty]             = useState(false);

  // Sync when the dialog re-opens for a different item
  useEffect(() => {
    if (open) {
      setAccessLevel(initialLevel);
      setShareToken(initialToken);
      setDirty(false);
      setCopied(false);
    }
  }, [open, initialLevel, initialToken]);

  const table = target === "canvas" ? "canvases" : "canvas_folders";

  // Fetch share_token lazily if not passed in (e.g. older rows)
  useEffect(() => {
    if (!open || shareToken) return;
    (async () => {
      const { data } = await (supabase as any).from(table).select("share_token").eq("id", id).single();
      if (data?.share_token) setShareToken(data.share_token);
    })();
  }, [open, id, shareToken, table]);

  const shareUrl = shareToken
    ? `${window.location.origin}/canvas/view/${shareToken}`
    : "";

  const handleSelect = (level: AccessLevel) => {
    if (level === accessLevel) return;
    setAccessLevel(level);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from(table)
        .update({ access_level: accessLevel })
        .eq("id", id);

      if (error) throw error;

      onAccessChanged?.(accessLevel);
      setDirty(false);
      toast.success(
        accessLevel === "link_access"
          ? "Anyone with the link can now view this."
          : "Access restricted to you only."
      );
    } catch (err: any) {
      toast.error("Failed to update access", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const Icon = target === "canvas" ? FileSignature : FolderOpen;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-bronze/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-bronze" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="font-vollkorn text-lg leading-tight truncate">
                Manage Access
              </DialogTitle>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{title}</p>
            </div>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Control who can view this {target === "canvas" ? "canvas" : "folder"}.
          </DialogDescription>
        </DialogHeader>

        {/* Access options */}
        <div className="space-y-2.5 my-1">
          <AccessOption
            selected={accessLevel === "restricted"}
            icon={Lock}
            label="Only me"
            description="Only you can open and view this document. No one else can access it, even with a direct link."
            onClick={() => handleSelect("restricted")}
          />
          <AccessOption
            selected={accessLevel === "link_access"}
            icon={Globe}
            label="Anyone with the link"
            description="Anyone who has the link can view this document — no sign-in required. They cannot edit or sign it."
            onClick={() => handleSelect("link_access")}
          />
        </div>

        {/* Shareable link — shown when link_access is active OR selected */}
        {accessLevel === "link_access" && shareUrl && (
          <div className="rounded-xl border border-border/50 bg-muted/30 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <Link2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="flex-1 min-w-0 text-xs font-mono text-muted-foreground truncate">
                {shareUrl}
              </span>
              <button
                onClick={handleCopy}
                className="flex-shrink-0 flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-semibold bg-background border border-border/60 hover:bg-muted transition-colors"
              >
                {copied
                  ? <><Check className="w-3 h-3 text-emerald-500" /><span className="text-emerald-600">Copied</span></>
                  : <><Copy className="w-3 h-3" />Copy</>
                }
              </button>
            </div>
          </div>
        )}

        {/* Who has access summary */}
        <div className="flex items-center gap-2 py-1 px-1 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {accessLevel === "link_access"
              ? "Anyone with the link · Read only"
              : "Only you can access this document"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1 h-10" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            className="flex-1 h-10 bg-bronze hover:bg-bronze/90 text-white font-semibold gap-1.5"
            onClick={handleSave}
            disabled={saving || !dirty}
          >
            {saving ? "Saving…" : "Apply"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
