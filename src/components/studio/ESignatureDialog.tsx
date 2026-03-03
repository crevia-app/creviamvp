import { useState, useRef, useEffect } from "react";
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
import { Eraser, PenTool, Type, RotateCcw, Check, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ESignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signerName: string;
  onSign: (signature: string, signedAt: string) => void;
}

const ESignatureDialog = ({
  open,
  onOpenChange,
  signerName,
  onSign,
}: ESignatureDialogProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [typedSignature, setTypedSignature] = useState(signerName || "");
  const [activeTab, setActiveTab] = useState<"draw" | "type">("draw");
  const [selectedFont, setSelectedFont] = useState<string>("script");

  const fonts = [
    { id: "script", label: "Script", className: "font-['Dancing_Script'] italic" },
    { id: "cursive", label: "Cursive", className: "font-['Great_Vibes']" },
    { id: "handwriting", label: "Handwriting", className: "font-['Caveat']" },
    { id: "elegant", label: "Elegant", className: "font-vollkorn italic" },
  ];

  useEffect(() => {
    if (open && activeTab === "draw") {
      setTimeout(initCanvas, 100);
    }
  }, [open, activeTab]);

  useEffect(() => {
    if (open) setTypedSignature(signerName || "");
  }, [open, signerName]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => setIsDrawing(false);
  const clearCanvas = () => initCanvas();

  const handleSign = () => {
    let signatureData: string;
    if (activeTab === "draw") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      signatureData = canvas.toDataURL("image/png");
    } else {
      signatureData = typedSignature;
    }
    onSign(signatureData, new Date().toISOString());
    onOpenChange(false);
  };

  const isValid = activeTab === "draw" ? hasSignature : typedSignature.trim().length > 0;

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
          {activeTab === "draw" ? (
            <div className="space-y-3">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-44 border-2 border-dashed border-border rounded-xl cursor-crosshair bg-white touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-muted-foreground text-sm">Draw your signature here</p>
                  </div>
                )}
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={clearCanvas} className="gap-2 rounded-lg text-xs">
                <RotateCcw className="h-3.5 w-3.5" /> Clear
              </Button>
            </div>
          ) : (
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

              {/* Preview */}
              <div className="p-5 bg-white dark:bg-zinc-900 border border-border/30 rounded-xl">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Preview</p>
                <div className="h-16 flex items-center justify-center border-b-2 border-border/40">
                  <span className={cn("text-3xl text-foreground/70", fonts.find(f => f.id === selectedFont)?.className)}>
                    {typedSignature || "Your Name"}
                  </span>
                </div>
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
            Sign Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ESignatureDialog;
