import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Info } from "lucide-react";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onProjectCreated: (project: {
    id: string;
    name: string;
    description: string | null;
    custom_instructions: string | null;
    created_at: string;
    updated_at: string;
  }) => void;
}

export const CreateProjectDialog = ({
  open,
  onOpenChange,
  userId,
  onProjectCreated,
}: CreateProjectDialogProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a project name",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from("kira_projects")
        .insert({
          user_id: userId,
          name: name.trim(),
          description: description.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      onProjectCreated(data);
      setName("");
      setDescription("");
      onOpenChange(false);
      toast({
        title: "Project created",
        description: `"${data.name}" is ready to use`,
      });
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Couldn't create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-vollkorn text-2xl">
            Create a personal project
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info Box */}
          <div className="rounded-xl bg-muted/50 border border-border/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Info className="w-4 h-4 text-bronze" />
              How to use projects
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Projects help organize your work and leverage knowledge across
              multiple conversations. Set custom instructions and context that
              Kira can reference again and again.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Start by creating a memorable title and description to organize
              your project. You can always edit it later.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                What are you working on?
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name your project"
                className="h-11"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                What are you trying to achieve?
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project, goals, subject, etc..."
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !name.trim()}
              className="bg-bronze hover:bg-bronze-dark text-background"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create project"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
