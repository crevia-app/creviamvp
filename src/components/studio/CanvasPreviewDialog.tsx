import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
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
import { useSubscription } from "@/hooks/use-subscription";
import { useFeatureGate } from "@/components/subscription/UpgradeModal";

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
          <img src={signature} alt="sig" className="max-w-full max-h-full object-contain p-1 dark:invert" draggable={false} />
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
  const { limits } = useSubscription();
  const { triggerUpgrade: triggerESignUpgrade } = useFeatureGate("E-Signatures");
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
  const [autoSaveStatus, setAutoSaveStatus]             = useState<"idle" | "saving" | "saved">("idle");
  const [sigStyle, setSigStyle]                         = useState<{ left: number; top: number; w: number; h: number } | null>(null);

  // ref on the INNER content padding div — DraggableSig lives inside here
  const contentAreaRef = useRef<HTMLDivElement>(null);
  // ref on the text content div — used to measure its exact Y offset for printing
  const textDivRef = useRef<HTMLDivElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Compute signature pixel position once layout has settled.
  //
  // Why useEffect + rAF instead of useLayoutEffect:
  //   useLayoutEffect fires when deps change — but the critical dep is `open`
  //   (when the dialog first becomes visible). The canvas data is often already
  //   loaded before `open` changes, so the effect fired with contentAreaRef=null
  //   (dialog not yet in the DOM) and set sigStyle to null, never re-running.
  //   Using useEffect + requestAnimationFrame guarantees the browser has done at
  //   least one layout cycle after the dialog renders before we read offsetWidth.
  useEffect(() => {
    if (!open || isEditingDetails || placementMode) { setSigStyle(null); return; }

    const el = contentAreaRef.current;
    if (!el) return;

    const calculate = () => {
      const sp = localCanvas?.signature_position as SigPos | null;
      if (!sp) { setSigStyle(null); return; }
      if (sp.x != null) {
        setSigStyle({ left: sp.x, top: sp.y!, w: sp.w ?? INIT_W, h: sp.h ?? INIT_H });
      } else if (sp.xPct != null) {
        // Use scrollHeight for Y — offsetHeight can be smaller than the full
        // content height while ReactMarkdown is still rendering, causing the
        // signature to appear too high. scrollHeight reflects the true total
        // content height and matches what was measured when the user placed it.
        setSigStyle({
          left: sp.xPct * el.offsetWidth,
          top:  sp.yPct! * el.scrollHeight,
          w:    (sp.wPct ?? 0) * el.offsetWidth  || INIT_W,
          h:    (sp.hPct ?? 0) * el.scrollHeight || INIT_H,
        });
      }
    };

    // Initial pass after first paint
    const raf = requestAnimationFrame(calculate);

    // Recalculate whenever content height changes (ReactMarkdown renders async)
    const ro = new ResizeObserver(calculate);
    ro.observe(el);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [open, localCanvas?.signature_position, localCanvas?.creator_signature, placementMode, isEditingDetails]);

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

  const handlePrint = async () => {
    // Capture contentAreaRef (not docRef) so the absolutely-positioned
    // signature is always within the capture bounds. docRef.scrollHeight
    // doesn't account for absolute children, so signatures near the bottom
    // of a long doc get clipped. contentAreaRef directly contains the sig.
    const el = contentAreaRef.current;
    if (!el || printing) return;
    setPrinting(true);
    try {
      const { default: html2canvas } = await import("html2canvas");

      // Ensure the capture height covers the signature even if it sits
      // below the natural text flow (absolute elements don't grow scrollHeight)
      const sigBottom = sigStyle ? sigStyle.top + sigStyle.h + 40 : 0;
      const captureH  = Math.max(el.scrollHeight, sigBottom);

      const captured = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width:       el.scrollWidth,
        height:      captureH,
        windowWidth: el.scrollWidth,
        // Strip dark mode from the clone so text renders as black on white.
        // Without this, dark mode CSS variables produce near-white text on
        // the forced white background, making content invisible in the PDF.
        onclone: (clonedDoc) => {
          clonedDoc.documentElement.classList.remove("dark");
          clonedDoc.documentElement.classList.add("light");
        },
        // Hide the Canvas title row — print output is clean doc only
        ignoreElements: (node: Element) => node.hasAttribute("data-print-hide"),
      });

      const imgSrc  = captured.toDataURL("image/png");
      const imgW    = captured.width  / 2;   // logical (non-retina) px
      const imgH    = captured.height / 2;

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    @page { size: ${imgW}px ${imgH}px; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: white; width: ${imgW}px; }
    img { width: 100%; height: auto; display: block; }
  </style>
</head>
<body><img src="${imgSrc}" /></body>
</html>`;

      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
      document.body.appendChild(iframe);

      const iDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
      if (!iDoc) { document.body.removeChild(iframe); return; }
      iDoc.open(); iDoc.write(html); iDoc.close();

      const printAndClean = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => { try { document.body.removeChild(iframe); } catch { /* already removed */ } }, 1500);
      };

      // Data URLs load synchronously — img.complete is true immediately after write()
      const img = iDoc.querySelector("img");
      if (!img || img.complete) {
        setTimeout(printAndClean, 300);
      } else {
        img.addEventListener("load", () => setTimeout(printAndClean, 200), { once: true });
        setTimeout(printAndClean, 2000); // hard fallback
      }
    } catch {
      toast.error("Print failed — please try again.");
    } finally {
      setPrinting(false);
    }
  };

  // Confirm → save pixel position + container dims so rendering is exact
  const handleConfirm = async () => {
    if (!placementMode?.pos || !localCanvas || !contentAreaRef.current) return;
    setSavingSignature(true);
    const { signature, signedAt, pos } = placementMode;
    const el = contentAreaRef.current;
    const normalizedPos: SigPos = {
      x: pos.x, y: pos.y, w: pos.w, h: pos.h,
      xPct: pos.x / el.offsetWidth,
      yPct: pos.y / el.scrollHeight,   // scrollHeight matches what rendering uses
      wPct: pos.w / el.offsetWidth,
      hPct: pos.h / el.scrollHeight,
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

  // Debounced auto-save: fires 2s after the user stops typing in edit mode
  useEffect(() => {
    if (!isEditingDetails || !localCanvas) return;
    const canvasId = localCanvas.id;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setAutoSaveStatus("saving");
      const { error } = await supabase
        .from("canvases")
        .update({ content: editableContent || null })
        .eq("id", canvasId);
      if (!error) {
        setLocalCanvas(prev => ({ ...prev, content: editableContent || null }));
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus(s => s === "saved" ? "idle" : s), 3000);
      } else {
        setAutoSaveStatus("idle");
      }
    }, 2000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [editableContent, isEditingDetails]);

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
        isFullscreen ? "max-w-[100vw] w-screen h-dvh max-h-dvh rounded-none" : "w-[calc(100vw-16px)] max-w-4xl max-h-[92dvh] rounded-2xl"
      )}>

        {/* ── Top Bar ── */}
        <div className={cn(
          "print:hidden sticky top-0 z-10 bg-background border-b border-border/50 px-3 py-2 flex items-center gap-1.5",
          isFullscreen && "[padding-top:max(8px,env(safe-area-inset-top))]"
        )}>
          {/* Title + status — flex-1 so it shrinks before buttons overflow */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <DialogTitle className="font-vollkorn text-sm sm:text-base truncate min-w-0">{localCanvas.title}</DialogTitle>
            <span className={cn("hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0", status.bg, status.color)}>
              {status.label}
            </span>
          </div>

          {/* Action buttons — always right-aligned, never wrap */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Edit is locked once signed — a placed signature is immutable */}
            {!isEditingDetails && !placementMode && !localCanvas.creator_signature && (
              <Button variant="ghost" size="sm" title="Edit"
                onClick={() => { setIsEditingDetails(true); setEditableContent(localCanvas.content || ""); }}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </Button>
            )}
            {!isEditingDetails && !placementMode && !localCanvas.creator_signature && (
              <Button variant="ghost" size="sm" title="Sign"
                onClick={() => {
                  if (!limits.hasESignature) { triggerESignUpgrade(); return; }
                  setShowSignatureDialog(true);
                }}
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
        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="p-3 sm:p-5 md:p-8">

            {/* ────────────── EDIT MODE ────────────── */}
            {isEditingDetails ? (
              <div className="bg-white text-black rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/20" />
                <div className="p-6 md:p-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-vollkorn text-xl font-bold text-foreground">Edit Document</h2>
                    <div className="flex items-center gap-1.5">
                      {autoSaveStatus === "saving" && (
                        <span className="text-[11px] text-muted-foreground">Saving…</span>
                      )}
                      {autoSaveStatus === "saved" && (
                        <span className="text-[11px] text-emerald-600">Autosaved</span>
                      )}
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
                      placeholder="Write your document terms here…"
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
              <div ref={docRef} className="bg-white text-black rounded-2xl shadow-xl border border-gray-200 print:shadow-none print:border-0">

                {/* Gradient accent — hidden from print capture */}
                <div className="overflow-hidden rounded-t-2xl" data-print-hide>
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

                    {/* Title — hidden from print/PDF capture via data-print-hide */}
                    <div className="space-y-4" data-print-hide>
                      <div className="flex items-start justify-between gap-4">
                        <h1 className="text-2xl md:text-3xl font-vollkorn font-bold text-gray-900 tracking-tight">
                          {localCanvas.title}
                        </h1>
                        {localCanvas.creator_signature && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 flex-shrink-0">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">Signed</span>
                          </div>
                        )}
                      </div>
                      <div className="h-px bg-gray-200" />
                    </div>

                    {/* Agreement body — no nested box, text flows directly */}
                    <div>
                      {localCanvas.content ? (
                        <div ref={textDivRef} className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none">
                          <ReactMarkdown>{localCanvas.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground/40 italic text-center py-8">
                          No content yet — tap <strong>Edit</strong> to add your document text.
                        </div>
                      )}
                    </div>

                  </div>
                  {/* End regular content ------------------------------------ */}

                  {/* ── SAVED SIGNATURE: pixel position resolved after mount ── */}
                  {!placementMode && localCanvas.creator_signature && sigStyle && (
                    <div
                      className="absolute pointer-events-none [print-color-adjust:exact] [-webkit-print-color-adjust:exact]"
                      style={{ left: sigStyle.left, top: sigStyle.top, width: sigStyle.w, height: sigStyle.h }}
                    >
                      {localCanvas.creator_signature.startsWith("data:image") ? (
                        <img
                          src={localCanvas.creator_signature}
                          alt="Signature"
                          className="w-full h-full object-contain object-left"
                          draggable={false}
                        />
                      ) : (
                        <span className="font-vollkorn italic text-2xl text-gray-900 truncate">
                          {localCanvas.creator_signature}
                        </span>
                      )}
                    </div>
                  )}

                  {/* ── ACTIVE SIGNATURE WIDGET (placement mode only) ── */}
                  {placementMode?.pos && (
                    <DraggableSig
                      pos={placementMode.pos}
                      signature={placementMode.signature}
                      onChange={pos => setPlacementMode(prev => prev ? { ...prev, pos } : prev)}
                    />
                  )}
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
