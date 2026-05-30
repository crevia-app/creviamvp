import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eraser, PenTool, Type, RotateCcw, Check, Shield, BookmarkCheck, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ESignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signerName: string;
  onSign: (signature: string, signedAt: string) => void;
}

interface SavedSignature {
  type: "draw" | "type";
  data: string;
  font?: string;
  savedAt: string;
}

const SAVED_SIGNATURE_KEY = "crevia_saved_signature";

const getSavedSignature = (): SavedSignature | null => {
  try {
    const raw = localStorage.getItem(SAVED_SIGNATURE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveSignature = (sig: SavedSignature) => {
  localStorage.setItem(SAVED_SIGNATURE_KEY, JSON.stringify(sig));
};

const deleteSavedSignature = () => {
  localStorage.removeItem(SAVED_SIGNATURE_KEY);
};

const isDarkMode = () => document.documentElement.classList.contains("dark");

const ESignatureDialog = ({
  open,
  onOpenChange,
  signerName,
  onSign,
}: ESignatureDialogProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false); // ref instead of state — avoids stale closure in native listeners
  const [hasSignature, setHasSignature] = useState(false);
  const [typedSignature, setTypedSignature] = useState(signerName || "");
  const [activeTab, setActiveTab] = useState<"draw" | "type" | "saved">("draw");
  const [selectedFont, setSelectedFont] = useState<string>("script");
  const [saveForLater, setSaveForLater] = useState(true);
  const [savedSignature, setSavedSignature] = useState<SavedSignature | null>(null);

  const fonts = [
    { id: "script", label: "Script", className: "font-['Dancing_Script'] italic" },
    { id: "cursive", label: "Cursive", className: "font-['Great_Vibes']" },
    { id: "handwriting", label: "Handwriting", className: "font-['Caveat']" },
    { id: "elegant", label: "Elegant", className: "font-vollkorn italic" },
  ];

  // ── Canvas helpers ────────────────────────────────────────────────────────

  /** Returns exact CSS-pixel coords relative to the canvas, accounting for
   *  scroll and any CSS transforms on ancestor elements. */
  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  /** Apply ink style to context — called after every scale() so settings survive resets. */
  const applyInkStyle = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = isDarkMode() ? "#e8e8e8" : "#1a1a1a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  /**
   * (Re)initialise the canvas bitmap at the correct physical resolution.
   *
   * Pixel-perfect approach:
   *   canvas.width/height  = CSS size × devicePixelRatio  (physical pixels)
   *   ctx.scale(dpr, dpr)                                 (logical → physical)
   *   Drawing coords stay in CSS-pixel space — no manual scaling needed.
   *
   * If preserveSignature=true we snapshot the current bitmap, resize, then
   * redraw it so the user's work survives orientation changes / resizes.
   */
  const initCanvas = useCallback((preserveSignature = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Snapshot before clearing (resize-preservation path)
    let snapshot: string | null = null;
    if (preserveSignature) {
      // Only worth capturing if there is actual ink
      snapshot = canvas.toDataURL("image/png");
    }

    // Set bitmap dimensions to match physical screen pixels
    canvas.width  = Math.round(rect.width  * dpr);
    canvas.height = Math.round(rect.height * dpr);

    // Scale the context so every draw call uses CSS-pixel coordinates
    ctx.scale(dpr, dpr);
    applyInkStyle(ctx);

    if (snapshot) {
      const img = new Image();
      img.onload = () => {
        // Draw the old snapshot scaled to fill the (potentially new) CSS size
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = snapshot;
    } else {
      setHasSignature(false);
    }
  }, [applyInkStyle]);

  // ── Initialise / reset when dialog opens or tab switches to draw ──────────
  useEffect(() => {
    if (open) {
      const saved = getSavedSignature();
      setSavedSignature(saved);
      setActiveTab(saved ? "saved" : "draw");
      setTypedSignature(signerName || "");
    }
  }, [open, signerName]);

  useEffect(() => {
    if (!open || activeTab !== "draw") return;

    // Use requestAnimationFrame so the canvas has its final layout size
    // before we read getBoundingClientRect (avoids the old setTimeout hack).
    const raf = requestAnimationFrame(() => initCanvas(false));
    return () => cancelAnimationFrame(raf);
  }, [open, activeTab, initCanvas]);

  // ── Responsive resize — preserve signature across orientation changes ──────
  useEffect(() => {
    if (!open || activeTab !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ro = new ResizeObserver(() => {
      // Only reinitialise if there's actual ink to preserve
      initCanvas(true);
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [open, activeTab, initCanvas]);

  // ── Native touch listeners (passive:false) ────────────────────────────────
  // React's synthetic touch handlers are passive in modern React — they cannot
  // call e.preventDefault() to stop page scroll while drawing. We attach native
  // listeners directly so we can mark them { passive: false }.
  useEffect(() => {
    if (!open || activeTab !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // stop browser scroll / zoom
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      isDrawingRef.current = true;
      const { x, y } = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { x, y } = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasSignature(true);
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      isDrawingRef.current = false;
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove",  onTouchMove,  { passive: false });
    canvas.addEventListener("touchend",   onTouchEnd,   { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove",  onTouchMove);
      canvas.removeEventListener("touchend",   onTouchEnd);
    };
  }, [open, activeTab, getCanvasCoords]);

  // ── Mouse handlers (React synthetic — fine, no passive issue) ────────────
  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    isDrawingRef.current = true;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const onMouseUp   = () => { isDrawingRef.current = false; };
  const onMouseLeave = () => { isDrawingRef.current = false; };

  // ── Export ────────────────────────────────────────────────────────────────
  // Always exports dark ink on transparent background regardless of colour
  // scheme, so the PNG integrates cleanly with any document theme.
  const exportSignature = (): string => {
    const canvas = canvasRef.current;
    if (!canvas) return "";
    if (!isDarkMode()) return canvas.toDataURL("image/png");

    // Dark mode: light ink on canvas → invert to dark ink for storage
    const tmp = document.createElement("canvas");
    tmp.width  = canvas.width;
    tmp.height = canvas.height;
    const ctx2 = tmp.getContext("2d")!;
    ctx2.drawImage(canvas, 0, 0);
    const imgData = ctx2.getImageData(0, 0, tmp.width, tmp.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] > 0) {
        d[i]     = 255 - d[i];
        d[i + 1] = 255 - d[i + 1];
        d[i + 2] = 255 - d[i + 2];
      }
    }
    ctx2.putImageData(imgData, 0, 0);
    return tmp.toDataURL("image/png");
  };

  const clearCanvas = () => initCanvas(false);

  // ── Sign ──────────────────────────────────────────────────────────────────
  const handleSign = () => {
    let signatureData: string;

    if (activeTab === "saved" && savedSignature) {
      signatureData = savedSignature.data;
    } else if (activeTab === "draw") {
      if (!canvasRef.current) return;
      signatureData = exportSignature();
    } else {
      signatureData = typedSignature;
    }

    if (saveForLater && activeTab !== "saved") {
      const sigToSave: SavedSignature = {
        type: activeTab === "draw" ? "draw" : "type",
        data: signatureData,
        font: activeTab === "type" ? selectedFont : undefined,
        savedAt: new Date().toISOString(),
      };
      saveSignature(sigToSave);
      toast.success("Signature saved for future use");
    }

    onSign(signatureData, new Date().toISOString());
    onOpenChange(false);
  };

  const handleDeleteSaved = () => {
    deleteSavedSignature();
    setSavedSignature(null);
    setActiveTab("draw");
    toast.success("Saved signature removed");
  };

  const isValid =
    activeTab === "saved"
      ? !!savedSignature
      : activeTab === "draw"
      ? hasSignature
      : typedSignature.trim().length > 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="font-vollkorn text-xl flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <PenTool className="h-4 w-4 text-primary" />
            </div>
            Sign Document
          </DialogTitle>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="px-6">
          <div className="flex items-center bg-muted/50 rounded-xl p-1 mb-5">
            {savedSignature && (
              <button
                onClick={() => setActiveTab("saved")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === "saved" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                )}
              >
                <BookmarkCheck className="h-4 w-4" /> Saved
              </button>
            )}
            <button
              onClick={() => setActiveTab("draw")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === "draw" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              )}
            >
              <PenTool className="h-4 w-4" /> Draw
            </button>
            <button
              onClick={() => setActiveTab("type")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === "type" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
              )}
            >
              <Type className="h-4 w-4" /> Type
            </button>
          </div>
        </div>

        <div className="px-6 pb-4">
          {/* Saved Signature Tab */}
          {activeTab === "saved" && savedSignature && (
            <div className="space-y-4">
              <div className="p-5 bg-white dark:bg-zinc-900 border border-border/30 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Your Saved Signature</p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold">
                    <BookmarkCheck className="h-3 w-3" /> Saved
                  </span>
                </div>
                <div className="h-24 flex items-center justify-center border-b-2 border-border/40">
                  {savedSignature.type === "draw" ? (
                    <img src={savedSignature.data} alt="Saved signature" className="max-h-20 object-contain dark:invert" />
                  ) : (
                    <span className={cn("text-3xl text-foreground/70", fonts.find(f => f.id === savedSignature.font)?.className)}>
                      {savedSignature.data}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Saved on {new Date(savedSignature.savedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteSaved}
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove saved signature
              </Button>
            </div>
          )}

          {/* Draw Tab */}
          {activeTab === "draw" && (
            <div className="space-y-3">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-44 border-2 border-dashed border-border rounded-xl cursor-crosshair bg-white dark:bg-zinc-900 touch-none select-none"
                  // Touch events handled via native listeners (passive:false) — see useEffect above
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={onMouseLeave}
                />
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-muted-foreground text-sm">Draw your signature here</p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <Button type="button" variant="ghost" size="sm" onClick={clearCanvas} className="gap-2 rounded-lg text-xs">
                  <RotateCcw className="h-3.5 w-3.5" /> Clear
                </Button>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="save-draw"
                    checked={saveForLater}
                    onCheckedChange={(checked) => setSaveForLater(!!checked)}
                  />
                  <Label htmlFor="save-draw" className="text-xs text-muted-foreground cursor-pointer">
                    Save for future Canvas
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Type Tab */}
          {activeTab === "type" && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Your Full Name</Label>
                <Input
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  placeholder="Type your full name"
                  className="mt-1.5 h-11 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Signature Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  {fonts.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setSelectedFont(font.id)}
                      className={cn(
                        "p-3 border-2 rounded-xl text-center transition-all",
                        selectedFont === font.id
                          ? "border-primary bg-primary/5"
                          : "border-border/50 hover:border-primary/30"
                      )}
                    >
                      <span className={cn("text-lg", font.className)}>
                        {typedSignature || "Your Name"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-zinc-900 border border-border/30 rounded-xl">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Preview</p>
                <div className="h-16 flex items-center justify-center border-b-2 border-border/40">
                  <span className={cn("text-3xl text-foreground/70", fonts.find(f => f.id === selectedFont)?.className)}>
                    {typedSignature || "Your Name"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="save-type"
                  checked={saveForLater}
                  onCheckedChange={(checked) => setSaveForLater(!!checked)}
                />
                <Label htmlFor="save-type" className="text-xs text-muted-foreground cursor-pointer">
                  Save for future Canvas
                </Label>
              </div>
            </div>
          )}
        </div>

        {/* Legal Notice */}
        <div className="px-6 py-3 bg-muted/30 border-t border-border/30">
          <div className="flex items-start gap-2">
            <Shield className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              By signing, you agree that this electronic signature is legally binding and equivalent to a handwritten signature.
            </p>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/30 gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSign}
            disabled={!isValid}
            className="gap-2 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            <Check className="h-4 w-4" />
            {activeTab === "saved" ? "Use Saved Signature" : "Sign Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ESignatureDialog;
