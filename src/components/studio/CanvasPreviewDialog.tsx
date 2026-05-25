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
  Edit3, Save, X, Maximize2, Minimize2, Download, Send, MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ESignatureDialog from "./ESignatureDialog";
import { SendDocumentDialog } from "@/components/studio/SendDocumentDialog";
import { useDownloadPDF } from "@/hooks/use-download-pdf";

// ─── Types ────────────────────────────────────────────────────────────────────

// Stored position (percentage-based for new signatures, pixel-based for legacy)
interface SigPos {
  x?: number; y?: number; w?: number; h?: number;          // legacy pixels
  xPct?: number; yPct?: number; wPct?: number; hPct?: number; // new: device-independent %
}

// Pixel-only type used internally during the drag/placement session
interface PixelPos { x: number; y: number; w: number; h: number }

const MIN_W   = 80;
const MIN_H   = 40;
const INIT_W  = 200;
const INIT_H  = 80;

// ─── Draggable + resizable widget ─────────────────────────────────────────────
interface DraggableSigProps {
  pos:       PixelPos;
  signature: string;
  onChange:  (p: PixelPos) => void;
}

const DraggableSig = ({ pos, signature, onChange }: DraggableSigProps) => {
  const dragRef   = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const resizeRef = useRef<{ corner: string; sx: number; sy: number; orig: PixelPos } | null>(null);

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
      if (corner === "se") { w = Math.max(MIN_W, o.w + dx);                                  h = Math.max(MIN_H, o.h + dy); }
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
          <img src={signature} alt="sig" className="max-w-full max-h-full object-contain p-1 mix-blend-multiply dark:invert dark:mix-blend-screen" draggable={false} />
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

interface CanvasPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvas: any;
  onCanvasUpdate?: () => void;
}

const CanvasPreviewDialog = ({
  open,
  onOpenChange,
  canvas,
  onCanvasUpdate,
}: CanvasPreviewDialogProps) => {
  const [profile, setProfile]                           = useState<any>(null);
  const [showSignatureDialog, setShowSignatureDialog]   = useState(false);
  const [placementMode, setPlacementMode]               = useState<{
    signature: string;
    signedAt:  string;
    pos:       PixelPos | null;
  } | null>(null);
  const [savingSignature, setSavingSignature]           = useState(false);
  const [localCanvas, setLocalCanvas]                  = useState(canvas);
  const [isEditingDetails, setIsEditingDetails]         = useState(false);
  const [editableContent, setEditableContent]           = useState("");
  const [savingDetails, setSavingDetails]               = useState(false);
  const [isFullscreen, setIsFullscreen]                 = useState(false);
  const [printing, setPrinting]                         = useState(false);
  const [showSendDialog, setShowSendDialog]             = useState(false);

  // ref on the INNER content padding div — DraggableSig lives inside here
  const contentAreaRef = useRef<HTMLDivElement>(null);
  // ref on the text content div — used to measure its exact Y offset for printing
  const textDivRef = useRef<HTMLDivElement>(null);

  const { ref: docRef, download, downloading } = useDownloadPDF(
    canvas ? `Canvas-${canvas.title?.replace(/\s+/g, "-")}` : "Canvas"
  );

  useEffect(() => {
    if (canvas) {
      fetchProfile();
      setLocalCanvas(canvas);
      setEditableContent(canvas.content || "");
      setIsEditingDetails(false);
      setPlacementMode(null);
    }
  }, [canvas]);

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

  // ── Print: screenshot the live DOM with html2canvas → print the image ──
  // This is the only approach that guarantees the signature stays exactly where
  // the user placed it — no coordinate remapping, no font/reflow differences.
  const handlePrint = async () => {
    if (!contentAreaRef.current || printing) return;
    setPrinting(true);
    try {
      const { default: html2canvas } = await import("html2canvas");

      const canvas = await html2canvas(contentAreaRef.current, {
        scale: 2,           // retina quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        removeContainer: true,
      });

      const imgSrc = canvas.toDataURL("image/png");

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title></title>
  <style>
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: white; }
    img { width: 100%; display: block; }
  </style>
</head>
<body><img src="${imgSrc}" /></body>
</html>`;

      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
      if (!doc) { document.body.removeChild(iframe); return; }

      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 500);
    } catch {
      toast.error("Print failed — please try again.");
    } finally {
      setPrinting(false);
    }
  };

  // Confirm → save to DB using percentage-based position for device independence
  const handleConfirm = async () => {
    if (!placementMode?.pos || !localCanvas || !contentAreaRef.current) return;
    setSavingSignature(true);
    const { signature, signedAt, pos } = placementMode;
    const rect = contentAreaRef.current.getBoundingClientRect();
    const normalizedPos: SigPos = {
      xPct: pos.x! / rect.width,
      yPct: pos.y! / rect.height,
      wPct: pos.w! / rect.width,
      hPct: pos.h! / rect.height,
    };
    const { error } = await supabase
      .from("canvases")
      .update({
        creator_signature:  signature,
        creator_signed_at:  signedAt,
        signature_position: normalizedPos as any,
        status:             "signed",
      })
      .eq("id", localCanvas.id);
    setSavingSignature(false);
    if (error) { toast.error("Failed to save signature"); return; }
    setLocalCanvas({ ...localCanvas, creator_signature: signature, creator_signed_at: signedAt, signature_position: normalizedPos, status: "signed" });
    setPlacementMode(null);
    toast.success("Signature placed and saved!");
    onCanvasUpdate?.();
  };

  const handleSaveDetails = async () => {
    if (!localCanvas) return;
    setSavingDetails(true);
    const { error } = await supabase.from("canvases").update({ content: editableContent || null }).eq("id", localCanvas.id);
    setSavingDetails(false);
    if (error) { toast.error("Failed to save changes"); return; }
    setLocalCanvas({ ...localCanvas, content: editableContent || null });
    setIsEditingDetails(false);
    toast.success("Canvas updated");
    onCanvasUpdate?.();
  };

  if (!canvas || !localCanvas) return null;

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    draft:     { label: "Draft",     color: "text-muted-foreground", bg: "bg-muted" },
    sent:      { label: "Sent",      color: "text-blue-600",         bg: "bg-blue-500/10" },
    signed:    { label: "Signed",    color: "text-emerald-600",      bg: "bg-emerald-500/10" },
    active:    { label: "Active",    color: "text-green-600",        bg: "bg-green-500/10" },
    completed: { label: "Completed", color: "text-purple-600",       bg: "bg-purple-500/10" },
    cancelled: { label: "Cancelled", color: "text-destructive",      bg: "bg-destructive/10" },
  };

  const status   = statusConfig[localCanvas.status] || statusConfig.draft;
  const savedPos = localCanvas.signature_position as SigPos | null;

  return (
  <>
    <Dialog open={open} onOpenChange={v => { if (!v) { setIsFullscreen(false); setPlacementMode(null); } onOpenChange(v); }}>
      <DialogContent className={cn(
        "overflow-hidden flex flex-col p-0 gap-0 transition-all duration-300",
        isFullscreen ? "max-w-[100vw] w-screen h-screen max-h-screen rounded-none" : "w-[calc(100vw-16px)] max-w-4xl max-h-[92dvh] rounded-2xl"
      )}>

        {/* ── Top Bar ── */}
        <div className="print:hidden sticky top-0 z-10 bg-background border-b border-border/50 px-3 py-2 flex items-center gap-1.5">
          {/* Title + status — flex-1 so it shrinks before buttons overflow */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <DialogTitle className="font-vollkorn text-sm sm:text-base truncate min-w-0">{localCanvas.title}</DialogTitle>
            <span className={cn("hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0", status.bg, status.color)}>
              {status.label}
            </span>
          </div>

          {/* Action buttons — always right-aligned, never wrap */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {!isEditingDetails && !placementMode && (
              <Button variant="ghost" size="sm" title="Edit"
                onClick={() => { setIsEditingDetails(true); setEditableContent(localCanvas.content || ""); }}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </Button>
            )}
            {!isEditingDetails && !placementMode && !localCanvas.creator_signature && (
              <Button variant="ghost" size="sm" title="Sign"
                onClick={() => setShowSignatureDialog(true)}
                className="h-8 w-8 p-0 rounded-lg text-primary hover:bg-primary/10"
              >
                <PenTool className="h-3.5 w-3.5" />
              </Button>
            )}

            {!placementMode && (
              <>
                {/* Desktop: individual Send / Download / Print buttons */}
                <Button variant="ghost" size="sm" title="Send" onClick={() => setShowSendDialog(true)} className="hidden sm:flex h-8 w-8 p-0 rounded-lg">
                  <Send className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" title="Download" onClick={download} disabled={downloading} className="hidden sm:flex h-8 w-8 p-0 rounded-lg">
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" title="Print" onClick={handlePrint} disabled={printing} className="hidden sm:flex h-8 w-8 p-0 rounded-lg">
                  <Printer className="h-3.5 w-3.5" />
                </Button>

                {/* Mobile: collapse into a single overflow menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="sm:hidden h-8 w-8 p-0 rounded-lg">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 rounded-xl">
                    <DropdownMenuItem onClick={() => setShowSendDialog(true)} className="rounded-lg gap-2 text-sm">
                      <Send className="h-3.5 w-3.5" /> Send
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={download} disabled={downloading} className="rounded-lg gap-2 text-sm">
                      <Download className="h-3.5 w-3.5" /> Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handlePrint} disabled={printing} className="rounded-lg gap-2 text-sm">
                      <Printer className="h-3.5 w-3.5" /> Print
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            <Button variant="ghost" size="sm" title={isFullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={() => setIsFullscreen(f => !f)} className="h-8 w-8 p-0 rounded-lg">
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-3 sm:p-5 md:p-8">

            {/* ────────────── EDIT MODE ────────────── */}
            {isEditingDetails ? (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-border/20 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/20" />
                <div className="p-6 md:p-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-vollkorn text-xl font-bold text-foreground">Edit Canvas</h2>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost"
                        onClick={() => { setIsEditingDetails(false); setEditableContent(localCanvas.content || ""); }}
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
                      placeholder="Write your Canvas terms here…"
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
                          {localCanvas.title}
                        </h1>
                        {localCanvas.creator_signature && (
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
                      {localCanvas.content ? (
                        <div ref={textDivRef} className="whitespace-pre-wrap break-all text-sm text-foreground/80 leading-relaxed font-mono p-4 rounded-xl bg-muted/20 border border-border/20 overflow-hidden">
                          {localCanvas.content}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground/40 italic p-8 rounded-xl bg-muted/20 border border-dashed border-border/30 text-center">
                          No content yet — tap <strong>Edit</strong> to add your Canvas text.
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
                  {!placementMode && savedPos && localCanvas.creator_signature && (() => {
                    const isPct = savedPos.xPct !== undefined;
                    const sigStyle = isPct
                      ? { left: `${savedPos.xPct! * 100}%`, top: `${savedPos.yPct! * 100}%`, width: `${savedPos.wPct! * 100}%`, height: `${savedPos.hPct! * 100}%`, zIndex: 5 }
                      : { left: savedPos.x, top: savedPos.y, width: savedPos.w, height: savedPos.h, zIndex: 5 };
                    const approxH = isPct
                      ? (savedPos.hPct! * (contentAreaRef.current?.clientHeight ?? 300))
                      : (savedPos.h ?? 88);
                    return (
                      <div className="absolute pointer-events-none" style={sigStyle}>
                        {localCanvas.creator_signature.startsWith("data:image") ? (
                          <img src={localCanvas.creator_signature} alt="Signature" className="w-full h-full object-contain mix-blend-multiply dark:invert dark:mix-blend-screen" draggable={false} />
                        ) : (
                          <span
                            className="font-vollkorn italic text-foreground/85 flex items-center justify-center w-full h-full"
                            style={{ fontSize: Math.max(14, Math.min(approxH * 0.40, 48)) }}
                          >
                            {localCanvas.creator_signature}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Placement action bar ── */}
        {placementMode && (
          <div
            className="print:hidden shrink-0 border-t border-primary/20 bg-background/97 backdrop-blur-md px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3"
            onClick={e => e.stopPropagation()}
          >
            {/* Signature thumbnail — hidden on very small screens */}
            <div className="hidden sm:flex h-10 w-20 rounded-lg border border-dashed border-primary/40 bg-primary/5 items-center justify-center flex-shrink-0 overflow-hidden">
              {placementMode.signature.startsWith("data:image")
                ? <img src={placementMode.signature} alt="sig" className="max-h-8 object-contain dark:invert" />
                : <span className="text-xs font-vollkorn italic text-foreground/80 truncate px-1">{placementMode.signature}</span>
              }
            </div>

            <div className="flex-1 min-w-0">
              {!placementMode.pos ? (
                <p className="text-xs font-semibold text-foreground leading-tight">
                  Tap the document to place your signature
                  <span className="hidden sm:inline"> — drag to reposition</span>
                </p>
              ) : (
                <p className="text-xs font-semibold text-foreground leading-tight">
                  Drag to move · corners to resize
                </p>
              )}
            </div>

            {placementMode.pos && (
              <Button size="sm" onClick={handleConfirm} disabled={savingSignature}
                className="h-8 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white gap-1 flex-shrink-0 px-3"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {savingSignature ? "Saving…" : "Confirm"}
              </Button>
            )}

            <Button size="sm" variant="ghost" onClick={() => setPlacementMode(null)}
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground flex-shrink-0"
              title="Cancel"
            >
              <X className="h-3.5 w-3.5" />
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

    <SendDocumentDialog
      open={showSendDialog}
      onOpenChange={setShowSendDialog}
      type="canvas"
      documentId={localCanvas.id}
      defaultEmail={localCanvas.client_email || ""}
      documentLabel={localCanvas.title}
      onSent={() => onOpenChange(false)}
    />
  </>
  );
};

export default CanvasPreviewDialog;
