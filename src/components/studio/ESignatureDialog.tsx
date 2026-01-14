import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eraser, PenTool, Type, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState("draw");
  const [selectedFont, setSelectedFont] = useState<string>("script");

  // Signature fonts
  const fonts = [
    { id: "script", label: "Script", className: "font-['Dancing_Script'] italic" },
    { id: "cursive", label: "Cursive", className: "font-['Great_Vibes']" },
    { id: "handwriting", label: "Handwriting", className: "font-['Caveat']" },
    { id: "elegant", label: "Elegant", className: "font-vollkorn italic" },
  ];

  useEffect(() => {
    if (open && activeTab === "draw") {
      initCanvas();
    }
  }, [open, activeTab]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Set drawing style
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    initCanvas();
  };

  const handleSign = () => {
    let signatureData: string;

    if (activeTab === "draw") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      signatureData = canvas.toDataURL("image/png");
    } else {
      // For typed signature, we just use the text
      signatureData = typedSignature;
    }

    const signedAt = new Date().toISOString();
    onSign(signatureData, signedAt);
    onOpenChange(false);
  };

  const isValid = activeTab === "draw" ? hasSignature : typedSignature.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-vollkorn text-xl">Sign Document</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="draw" className="gap-2">
              <PenTool className="h-4 w-4" />
              Draw
            </TabsTrigger>
            <TabsTrigger value="type" className="gap-2">
              <Type className="h-4 w-4" />
              Type
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="mt-4">
            <div className="space-y-4">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-40 border-2 border-dashed border-border rounded-lg cursor-crosshair bg-white touch-none"
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearCanvas}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="type" className="mt-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Your Name</Label>
                <Input
                  value={typedSignature}
                  onChange={(e) => setTypedSignature(e.target.value)}
                  placeholder="Type your full name"
                  className="h-11"
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Signature Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  {fonts.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setSelectedFont(font.id)}
                      className={cn(
                        "p-3 border-2 rounded-lg text-center transition-all",
                        selectedFont === font.id
                          ? "border-bronze bg-bronze/5"
                          : "border-border hover:border-bronze/50"
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
              <div className="p-4 bg-white border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Preview</p>
                <div className="h-20 flex items-center justify-center border-b-2 border-gray-300">
                  <span className={cn(
                    "text-3xl text-gray-800",
                    fonts.find(f => f.id === selectedFont)?.className
                  )}>
                    {typedSignature || "Your Name"}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-xs text-muted-foreground mt-2">
          By signing, you agree that this electronic signature is legally binding.
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSign}
            disabled={!isValid}
            className="gap-2 bg-bronze hover:bg-bronze-dark"
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
