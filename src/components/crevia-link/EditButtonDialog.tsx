import { useState, useEffect } from "react";
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

interface EditButtonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (button: any) => void;
  button: any;
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

export function EditButtonDialog({ open, onOpenChange, onSave, button }: EditButtonDialogProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("link");
  const [style, setStyle] = useState("filled");

  useEffect(() => {
    if (button) {
      setTitle(button.title || "");
      setUrl(button.url || "");
      setIcon(button.icon || "link");
      setStyle(button.style || "filled");
    }
  }, [button]);

  const handleSubmit = () => {
    if (!title || !url) return;
    onSave({ ...button, title, url, icon, style });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-vollkorn text-2xl">Edit Button</DialogTitle>
          <DialogDescription>Update your link button details</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="edit-title">Button Title</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Portfolio" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="edit-url">URL</Label>
            <Input id="edit-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="edit-icon">Icon</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                {iconOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2"><opt.icon className="w-4 h-4" />{opt.label}</div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-style">Button Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title || !url} className="bg-bronze hover:bg-bronze-dark">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
