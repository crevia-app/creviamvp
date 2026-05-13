import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Printer, CheckCircle2, PenTool,
  Edit3, Save, X, Maximize2, Minimize2, Download,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ESignatureDialog from "./ESignatureDialog";
import { useDownloadPDF } from "@/hooks/use-download-pdf";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SigPos { x: number; y: number; w: number; h: number }

const MIN_W   = 80;
const MIN_H   = 40;
const INIT_W  = 220;
const INIT_H  = 88;

// ─── Draggable + resizable widget ─────────────────────────────────────────────
// Must live outside ContractPreviewDialog so React never unmounts it on parent
// re-renders during an active drag.

interface DraggableSigProps {
  pos:       SigPos;
  signature: string;
  onChange:  (p: SigPos) => void;
}

const DraggableSig = ({ pos, signature, onChange }: DraggableSigProps) => {
  const dragRef   = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const resizeRef = useRef<{ corner: string; sx: number; sy: number; orig: SigPos } | null>(null);

  // drag body
  const onBodyDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
  };
  const onBodyMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    onChange({ ...pos, x: dragRef.current.ox + (e.clientX - dragRef.current.sx), y: dragRef.current.oy + (e.clientY - dragRef.current.sy) });
  };
  const onBodyUp = () => { dragRef.current = null; };

  // resize corners
  const ch = (corner: string) => ({
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      resizeRef.current = { corner, sx: e.clientX, sy: e.clientY, orig: { ...pos } };
    },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
      if (!resizeRef.current || resizeRef.current.corner !== corner) return;
      const dx = e.clientX - resizeRef.current.sx;
      const dy = e.clientY - resizeRef.current.sy;
      const o  = resizeRef.current.orig;
      let { x, y, w, h } = o;
      if (corner === "se") { w = Math.max(MIN_W, o.w + dx);                                 h = Math.max(MIN_H, o.h + dy); }
      if (corner === "sw") { x = o.x + Math.min(dx, o.w - MIN_W); w = Math.max(MIN_W, o.w - dx); h = Math.max(MIN_H, o.h + dy); }
      if (corner === "ne") { w = Math.max(MIN_W, o.w + dx); y = o.y + Math.min(dy, o.h - MIN_H); h = Math.max(MIN_H, o.h - dy); }
      if (corner === "nw") {
        x = o.x + Math.min(dx, o.w - MIN_W); w = Math.max(MIN_W, o.w - dx);
        y = o.y + Math.min(dy, o.h - MIN_H); h = Math.max(MIN_H, o.h - dy);
      }
      onChange({ x, y, w, h });
    },
    onPointerUp: () => { resizeRef.current = null; },
  });

  const corners = [
    { id: "nw", cls: "-top-2 -left-2 cursor-nw-resize" },
    { id: "ne", cls: "-top-2 -right-2 cursor-ne-resize" },
    { id: "sw", cls: "-bottom-2 -left-2 cursor-sw-resize" },
    { id: "se", cls: "-bottom-2 -right-2 cursor-se-resize" },
  ];

  const fs = Math.max(14, Math.min(pos.h * 0.40, 48));

  return (
    <div
      className="absolute touch-none select-none"
      style={{ left: pos.x, top: pos.y, width: pos.w, height: pos.h, zIndex: 60 }}
      onClick={e => e.stopPropagation()}
    >
      {/* body */}
      <div
        className="w-full h-full rounded-lg border-2 border-dashed border-primary/60 flex items-center justify-center overflow-hidden cursor-move"
        onPointerDown={onBodyDown}
        onPointerMove={onBodyMove}
        onPointerUp={onBodyUp}
      >
        {signature.startsWith("data:image") ? (
          <img src={signature} alt="sig" className="max-w-full max-h-full object-contain p-1 mix-blend-multiply dark:mix-blend-screen" draggable={false} />
        ) : (
          <span className="font-vollkorn italic text-foreground/85 truncate px-2 pointer-events-none" style={{ fontSize: fs }}>
            {signature}
          </span>
        )}
      </div>

      {/* corner resize handles */}
      {corners.map(({ id, cls }) => (
        <div
          key={id}
          className={cn("absolute w-4 h-4 bg-white border-2 border-primary rounded-sm shadow-md touch-none z-10", cls)}
          {...ch(id)}
        />
      ))}
    </div>
  );
};

// ─── Main Dialog ──────────────────────────────────────────────────────────────

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
  const [profile, setProfile]                           = useState<any>(null);
  const [showSignatureDialog, setShowSignatureDialog]   = useState(false);
  const [placementMode, setPlacementMode]               = useState<{
    signature: string;
    signedAt:  string;
    pos:       SigPos | null;
  } | null>(null);
  const [savingSignature, setSavingSignature]           = useState(false);
  const [localContract, setLocalContract]               = useState(contract);
  const [isEditingDetails, setIsEditingDetails]         = useState(false);
  const [editableContent, setEditableContent]           = useState("");
  const [savingDetails, setSavingDetails]               = useState(false);
  const [isFullscreen, setIsFullscreen]                 = useState(false);

  // ref on the INNER content padding div — DraggableSig lives inside here
  const contentAreaRef = useRef<HTMLDivElement>(null);
  // ref on the text content div — used to measure its exact Y offset for printing
  const textDivRef = useRef<HTMLDivElement>(null);

  const { ref: docRef, download, downloading } = useDownloadPDF(
    contract ? `Contract-${contract.title?.replace(/\s+/g, "-")}` : "Contract"
  );

  useEffect(() => {
    if (contract) {
      fetchProfile();
      setLocalContract(contract);
      setEditableContent(contract.content || "");
      setIsEditingDetails(false);
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

  // ESignatureDialog finished → enter placement mode, switch to view
  const handleSignReady = (signature: string, signedAt: string) => {
    setShowSignatureDialog(false);
    setIsEditingDetails(false);
    setPlacementMode({ signature, signedAt, pos: null });
  };

  // First tap on the document content area → drop the widget at that exact point
  const handleContentTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!placementMode || placementMode.pos || !contentAreaRef.current) return;
    e.stopPropagation();
    const rect = contentAreaRef.current.getBoundingClientRect();
    const x    = e.clientX - rect.left - INIT_W / 2;
    const y    = e.clientY - rect.top  - INIT_H / 2;
    setPlacementMode(prev =>
      prev ? { ...prev, pos: { x: Math.max(0, x), y: Math.max(0, y), w: INIT_W, h: INIT_H } } : prev
    );
  };

  // ── Print: inject a hidden iframe to avoid popup blockers ──
  const handlePrint = () => {
    const sig     = localContract.creator_signature;
    const pos     = localContract.signature_position as SigPos | null;
    const escaped = (localContract.content || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Measure the EXACT pixel distance from contentAreaRef's top edge to the
    // text div's top edge — this is the true spacer height we must replicate
    // in the print so that pos.y maps to exactly the same document location.
    const caRect   = contentAreaRef.current?.getBoundingClientRect();
    const txtRect  = textDivRef.current?.getBoundingClientRect();
    // D = distance from contentAreaRef top → text div top (includes padding + title + label)
    const D = (caRect && txtRect) ? Math.round(txtRect.top - caRect.top) : 177;
    // .cr has padding-top: 40px; the spacer sits INSIDE that padding, so:
    //   spacer height = D - 40  (puts text div top at exactly y=D within .cr)
    const spacerH = Math.max(0, D - 40);

    let sigHtml = "";
    if (sig && pos) {
      const fs = Math.max(14, Math.min(pos.h * 0.40, 48));
      // mix-blend-mode:multiply makes white pixels invisible — works on existing
      // white-background PNGs and on new transparent ones alike
      sigHtml = sig.startsWith("data:image")
        ? `<img src="${sig}" style="position:absolute;left:${pos.x}px;top:${pos.y}px;width:${pos.w}px;height:${pos.h}px;object-fit:contain;mix-blend-mode:multiply;" />`
        : `<div style="position:absolute;left:${pos.x}px;top:${pos.y}px;width:${pos.w}px;height:${pos.h}px;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-style:italic;font-size:${fs}px;color:#111;">${sig}</div>`;
    } else if (sig) {
      sigHtml = sig.startsWith("data:image")
        ? `<div style="margin-top:24px;"><img src="${sig}" style="max-height:72px;max-width:260px;object-fit:contain;mix-blend-mode:multiply;" /></div>`
        : `<div style="margin-top:24px;font-family:Georgia,serif;font-style:italic;font-size:28pt;color:#111;">${sig}</div>`;
    }

    // .cr mirrors contentAreaRef: same width (832px) and same horizontal padding (40px).
    // This keeps the text wrapping at exactly the same column widths as the dialog
    // so the signature lands on the same word/line it was placed on.
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title></title>
  <style>
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: white; }
    .cr  { position: relative; width: 832px; padding: 40px; }
    .sp  { height: ${spacerH}px; }
    .txt {
      white-space: pre-wrap;
      font-family: ui-monospace, monospace;
      font-size: 14px;
      line-height: 1.625;
      color: #111;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="cr">
    <div class="sp"></div>
    <div class="txt">${escaped}</div>
    ${sigHtml}
  </div>
</body>
</html>`;

    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc) { document.body.removeChild(iframe); return; }

    doc.open();
    doc.write(html);
    doc.close();

    // Give the iframe time to render, then print and clean up
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 400);
  };

  // Confirm → save to DB
  const handleConfirm = async () => {
    if (!placementMode?.pos || !localContract) return;
    setSavingSignature(true);
    const { signature, signedAt, pos } = placementMode;
    const { error } = await supabase
      .from("contracts")
      .update({
        creator_signature:  signature,
        creator_signed_at:  signedAt,
        signature_position: pos as any,
        status:             "signed",
      })
      .eq("id", localContract.id);
    setSavingSignature(false);
    if (error) { toast.error("Failed to save signature"); return; }
    setLocalContract({ ...localContract, creator_signature: signature, creator_signed_at: signedAt, signature_position: pos, status: "signed" });
    setPlacementMode(null);
    toast.success("Signature placed and saved!");
    onContractUpdate?.();
  };

  const handleSaveDetails = async () => {
    if (!localContract) return;
    setSavingDetails(true);
    const { error } = await supabase.from("contracts").update({ content: editableContent || null }).eq("id", localContract.id);
    setSavingDetails(false);
    if (error) { toast.error("Failed to save changes"); return; }
    setLocalContract({ ...localContract, content: editableContent || null });
    setIsEditingDetails(false);
    toast.success("Contract updated");
    onContractUpdate?.();
  };

  if (!contract || !localContract) return null;

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    draft:     { label: "Draft",     color: "text-muted-foreground", bg: "bg-muted" },
    sent:      { label: "Sent",      color: "text-blue-600",         bg: "bg-blue-500/10" },
    signed:    { label: "Signed",    color: "text-emerald-600",      bg: "bg-emerald-500/10" },
    active:    { label: "Active",    color: "text-green-600",        bg: "bg-green-500/10" },
    completed: { label: "Completed", color: "text-purple-600",       bg: "bg-purple-500/10" },
    cancelled: { label: "Cancelled", color: "text-destructive",      bg: "bg-destructive/10" },
  };

  const status   = statusConfig[localContract.status] || statusConfig.draft;
  const savedPos = localContract.signature_position as SigPos | null;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { setIsFullscreen(false); setPlacementMode(null); } onOpenChange(v); }}>
      <DialogContent className={cn(
        "overflow-hidden flex flex-col p-0 gap-0 transition-all duration-300",
        isFullscreen ? "max-w-[100vw] w-screen h-screen max-h-screen rounded-none" : "max-w-4xl max-h-[92vh] rounded-2xl"
      )}>

        {/* ── Top Bar ── */}
        <div className="print:hidden sticky top-0 z-10 bg-background border-b border-border/50 px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <DialogTitle className="font-vollkorn text-sm sm:text-base truncate">{localContract.title}</DialogTitle>
            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0", status.bg, status.color)}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!isEditingDetails && !placementMode && (
              <Button variant="ghost" size="sm"
                onClick={() => { setIsEditingDetails(true); setEditableContent(localContract.content || ""); }}
                className="gap-1 h-8 w-8 sm:w-auto sm:px-2.5 rounded-lg"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Edit</span>
              </Button>
            )}
            {/* Sign button — only when unsigned and not in placement/edit mode */}
            {!isEditingDetails && !placementMode && !localContract.creator_signature && (
              <Button variant="ghost" size="sm"
                onClick={() => setShowSignatureDialog(true)}
                className="gap-1 h-8 w-8 sm:w-auto sm:px-2.5 rounded-lg text-primary hover:bg-primary/10"
              >
                <PenTool className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Sign</span>
              </Button>
            )}
            {!placementMode && (
              <>
                <Button variant="ghost" size="sm" onClick={download} disabled={downloading} className="gap-1 h-8 w-8 sm:w-auto sm:px-2.5 rounded-lg">
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline text-xs">{downloading ? "Saving…" : "Download"}</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={handlePrint} className="gap-1 h-8 w-8 sm:w-auto sm:px-2.5 rounded-lg">
                  <Printer className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline text-xs">Print</span>
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(f => !f)} className="gap-1 h-8 w-8 sm:w-auto sm:px-2.5 rounded-lg">
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline text-xs">{isFullscreen ? "Exit" : "Full"}</span>
            </Button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 md:p-8">

            {/* ────────────── EDIT MODE ────────────── */}
            {isEditingDetails ? (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-border/20 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/20" />
                <div className="p-6 md:p-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-vollkorn text-xl font-bold text-foreground">Edit Contract</h2>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost"
                        onClick={() => { setIsEditingDetails(false); setEditableContent(localContract.content || ""); }}
                        className="gap-1 h-8 text-xs rounded-lg"
                      >
                        <X className="h-3 w-3" /> Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveDetails} disabled={savingDetails}
                        className="gap-1 h-8 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Save className="h-3 w-3" /> {savingDetails ? "Saving..." : "Save All"}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Full Agreement Text</p>
                    <Textarea
                      value={editableContent}
                      onChange={e => setEditableContent(e.target.value)}
                      placeholder="Write your contract terms here…"
                      className="min-h-[380px] font-mono text-sm leading-relaxed rounded-xl resize-none"
                      autoFocus
                    />
                  </div>
                </div>
              </div>

            ) : (
              /* ────────────── VIEW MODE ────────────── */
              /*
               * The document card has NO overflow-hidden on the outer shell so
               * the absolutely-positioned DraggableSig (which lives inside
               * contentAreaRef) is NOT clipped — it can overlap any part of the
               * document content.  The gradient accent bar gets its own small
               * overflow-hidden wrapper to preserve the rounded top corners.
               */
              <div ref={docRef} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl dark:shadow-2xl border border-border/20 print:shadow-none print:border-0">

                {/* Gradient accent — separate overflow-hidden so corners clip correctly */}
                <div className="overflow-hidden rounded-t-2xl">
                  <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/20" />
                </div>

                {/*
                 * contentAreaRef — the DIRECT click target AND containing block
                 * for the signature widget.  All coordinates (pos.x / pos.y) are
                 * relative to this element's top-left (getBoundingClientRect).
                 */}
                <div
                  ref={contentAreaRef}
                  className={cn(
                    "relative p-6 md:p-10",
                    placementMode && !placementMode.pos && "cursor-crosshair"
                  )}
                  onClick={handleContentTap}
                >
                  {/* Pulsing ring hint while waiting for first tap */}
                  {placementMode && !placementMode.pos && (
                    <div className="absolute inset-0 rounded-b-2xl pointer-events-none z-30 ring-2 ring-inset ring-primary/40 animate-pulse" />
                  )}

                  {/* Regular document content -------------------------------- */}
                  <div className="space-y-8">

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

                    {/* Agreement body */}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold mb-4">Full Agreement</p>
                      {localContract.content ? (
                        <div ref={textDivRef} className="whitespace-pre-wrap text-sm text-foreground/80 leading-relaxed font-mono p-5 rounded-xl bg-muted/20 border border-border/20">
                          {localContract.content}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground/40 italic p-8 rounded-xl bg-muted/20 border border-dashed border-border/30 text-center">
                          No content yet — tap <strong>Edit</strong> to add your contract text.
                        </div>
                      )}
                    </div>
                  </div>
                  {/* End regular content ------------------------------------ */}

                  {/*
                   * ── ACTIVE SIGNATURE WIDGET ──
                   * Rendered inside contentAreaRef so it appears visually INSIDE
                   * the document body at exactly the coordinates the user tapped.
                   * Not clipped by overflow-hidden (outer card has none).
                   */}
                  {placementMode?.pos && (
                    <DraggableSig
                      pos={placementMode.pos}
                      signature={placementMode.signature}
                      onChange={pos => setPlacementMode(prev => prev ? { ...prev, pos } : prev)}
                    />
                  )}

                  {/*
                   * ── SAVED SIGNATURE DISPLAY ──
                   * Rendered at the exact saved coordinates so it appears
                   * permanently in the right spot on the document.
                   */}
                  {!placementMode && savedPos && localContract.creator_signature && (
                    <div
                      className="absolute pointer-events-none"
                      style={{ left: savedPos.x, top: savedPos.y, width: savedPos.w, height: savedPos.h, zIndex: 5 }}
                    >
                      {localContract.creator_signature.startsWith("data:image") ? (
                        <img src={localContract.creator_signature} alt="Signature" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-screen" draggable={false} />
                      ) : (
                        <span
                          className="font-vollkorn italic text-foreground/85 flex items-center justify-center w-full h-full"
                          style={{ fontSize: Math.max(14, Math.min(savedPos.h * 0.40, 48)) }}
                        >
                          {localContract.creator_signature}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Placement action bar ── */}
        {placementMode && (
          <div
            className="print:hidden shrink-0 border-t border-primary/20 bg-background/97 backdrop-blur-md px-4 py-3 flex items-center gap-3"
            onClick={e => e.stopPropagation()}
          >
            {/* Signature thumbnail */}
            <div className="h-11 w-24 rounded-lg border border-dashed border-primary/40 bg-primary/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {placementMode.signature.startsWith("data:image")
                ? <img src={placementMode.signature} alt="sig" className="max-h-9 object-contain" />
                : <span className="text-sm font-vollkorn italic text-foreground/80 truncate px-1">{placementMode.signature}</span>
              }
            </div>

            <div className="flex-1 min-w-0">
              {!placementMode.pos ? (
                <>
                  <p className="text-xs font-semibold text-foreground">Tap anywhere on the document to place your signature</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">You can move and resize it after placing</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold text-foreground">Drag to move · Drag corners to resize</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Tap Confirm when you're happy with the position</p>
                </>
              )}
            </div>

            {placementMode.pos && (
              <Button size="sm" onClick={handleConfirm} disabled={savingSignature}
                className="h-8 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 flex-shrink-0"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {savingSignature ? "Saving…" : "Confirm"}
              </Button>
            )}

            <Button size="sm" variant="ghost" onClick={() => setPlacementMode(null)}
              className="h-8 text.xs rounded-lg text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              <X className="h-3.5 w-3.5 mr-1" /> Cancel
            </Button>
          </div>
        )}

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
