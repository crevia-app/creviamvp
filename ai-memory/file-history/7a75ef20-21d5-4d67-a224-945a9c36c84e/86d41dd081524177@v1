import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Upload,
  FileText,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File, contractType: string, title: string) => void;
}

const contractTypes = [
  { id: "plain", label: "Keep As-Is", desc: "Upload without categorizing — edit freely", icon: "📄" },
  { id: "sponsorship", label: "Sponsorship", desc: "Brand sponsorship deal", icon: "💎" },
  { id: "content_creation", label: "Content Creation", desc: "Content production agreement", icon: "🎬" },
  { id: "brand_ambassador", label: "Brand Ambassador", desc: "Long-term brand representation", icon: "🤝" },
  { id: "ugc", label: "UGC", desc: "User-generated content deal", icon: "📱" },
  { id: "affiliate", label: "Affiliate", desc: "Commission-based partnership", icon: "🔗" },
  { id: "custom", label: "Custom", desc: "Other Canvas type", icon: "✏️" },
];

const UploadContractDialog = ({ open, onOpenChange, onUpload }: UploadContractDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedType, setSelectedType] = useState("plain");
  const [title, setTitle] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) return;
    const type = selectedType === "plain" ? "uploaded" : selectedType;
    onUpload(selectedFile, type, title || selectedFile.name.replace(/\.[^/.]+$/, ""));
    // Reset
    setSelectedFile(null);
    setSelectedType("plain");
    setTitle("");
    onOpenChange(false);
  };

  const reset = () => {
    setSelectedFile(null);
    setSelectedType("plain");
    setTitle("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-vollkorn text-xl">
            <Upload className="h-5 w-5 text-bronze" />
            Upload Canvas
          </DialogTitle>
          <DialogDescription>
            Upload an existing Canvas and choose how to categorize it
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Drop Zone */}
          {!selectedFile ? (
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all",
                dragOver
                  ? "border-bronze bg-bronze/5"
                  : "border-border hover:border-bronze/40 hover:bg-muted/30"
              )}
            >
              <div className="p-3 rounded-full bg-bronze/10">
                <FileText className="h-6 w-6 text-bronze" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Drop your file here or <span className="text-bronze underline underline-offset-2">browse</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOCX, TXT, MD, RTF, ODT — up to 20MB
                </p>
              </div>
              <input
                type="file"
                accept=".txt,.md,.doc,.docx,.pdf,.rtf,.odt"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
              <div className="p-2 rounded-lg bg-bronze/10">
                <FileText className="h-4 w-4 text-bronze" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)} className="text-muted-foreground">
                Change
              </Button>
            </div>
          )}

          {/* Title */}
          {selectedFile && (
            <>
              <div>
                <Label className="text-sm font-medium">Canvas Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Brand X Partnership Agreement"
                  className="mt-1.5"
                />
              </div>

              {/* Contract Type Selection */}
              <div>
                <Label className="text-sm font-medium">Canvas Type</Label>
                <p className="text-xs text-muted-foreground mb-2">Choose a category or keep it plain</p>
                <div className="grid grid-cols-2 gap-2">
                  {contractTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        "flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all",
                        selectedType === type.id
                          ? "border-bronze bg-bronze/5 ring-1 ring-bronze/20"
                          : "border-border hover:border-bronze/30 hover:bg-muted/30"
                      )}
                    >
                      <span className="text-lg mt-0.5">{type.icon}</span>
                      <div className="min-w-0">
                        <p className={cn(
                          "text-xs font-semibold",
                          selectedType === type.id ? "text-bronze" : "text-foreground"
                        )}>
                          {type.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{type.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmit}
                className="w-full bg-bronze hover:bg-bronze/90 gap-2 h-11 rounded-xl"
              >
                <Sparkles className="h-4 w-4" />
                Upload & Edit Canvas
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadContractDialog;
