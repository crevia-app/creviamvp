import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Pencil, Trash2, Link2, Instagram, Twitter, Linkedin, Youtube, Mail, Globe, Github } from "lucide-react";

interface ButtonItemProps {
  button: any;
  onEdit: (button: any) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
}

const iconMap: Record<string, any> = {
  link: Link2,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  email: Mail,
  website: Globe,
  github: Github,
};

export function ButtonItem({ button, onEdit, onDelete, onToggleVisibility }: ButtonItemProps) {
  const Icon = iconMap[button.icon] || Link2;

  return (
    <Card className="p-4 hover-lift group">
      <div className="flex items-center gap-4">
        <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab transition-colors group-hover:text-bronze" />
        
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
            button.style === 'filled' 
              ? 'bg-bronze text-white group-hover:scale-110' 
              : button.style === 'outline'
              ? 'border-2 border-bronze text-bronze group-hover:scale-110'
              : 'text-bronze group-hover:scale-110'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1">
            <p className="font-semibold">{button.title}</p>
            <p className="text-sm text-muted-foreground truncate">{button.url}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={button.visible}
            onCheckedChange={(checked) => onToggleVisibility(button.id, checked)}
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(button)}
            className="transition-all duration-300 hover:scale-110"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(button.id)}
            className="transition-all duration-300 hover:scale-110"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
