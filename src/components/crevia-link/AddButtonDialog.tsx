import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link2, Instagram, Twitter, Linkedin, Youtube, Mail, Globe, Github } from "lucide-react";

interface AddButtonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (button: any) => void;
}

const iconOptions = [
  { value: "link", label: "Link", icon: Link2 },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "twitter", label: "Twitter/X", icon: Twitter },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "youtube", label: "YouTube", icon: Youtube },
  { value: "email", label: "Email", icon: Mail },
  { value: "website", label: "Website", icon: Globe },
  { value: "github", label: "GitHub", icon: Github },
];

export function AddButtonDialog({ open, onOpenChange, onAdd }: AddButtonDialogProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("link");
  const [style, setStyle] = useState("filled");

  const handleSubmit = () => {
    if (!title || !url) return;

    onAdd({
      title,
      url,
      icon,
      style,
      subtitle: "",
      visible: true,
    });

    // Reset form
    setTitle("");
    setUrl("");
    setIcon("link");
    setStyle("filled");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-vollkorn text-2xl">Add New Button</DialogTitle>
          <DialogDescription>
            Create a new link button for your Crevia Link page
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="title">Button Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Portfolio"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="icon">Icon</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <opt.icon className="w-4 h-4" />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="style">Button Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!title || !url}
            className="bg-bronze hover:bg-bronze-dark"
          >
            Add Button
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
