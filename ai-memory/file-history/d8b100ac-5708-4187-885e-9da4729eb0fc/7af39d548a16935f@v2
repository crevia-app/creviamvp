import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  X, ChevronRight, ChevronLeft, Brain, Mail,
  CreditCard, Palette, Loader2, Trash2, Pencil,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/use-subscription";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";

type PanelView = "main" | "memory" | "personalization" | "saved-memories";

interface KiraMemory {
  reference_chat_history: boolean;
  reference_saved_memories: boolean;
  nickname: string;
  occupation: string;
  more_about_you: string;
  custom_instructions: string;
}

const DEFAULT_MEMORY: KiraMemory = {
  reference_chat_history: true,
  reference_saved_memories: true,
  nickname: "",
  occupation: "",
  more_about_you: "",
  custom_instructions: "",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function PlanLabel({ plan }: { plan: string }) {
  const labels: Record<string, string> = {
    free: "Free",
    creative_pro: "Pro",
    brand_workspace: "Enterprise",
    pro: "Pro",
    enterprise: "Enterprise",
  };
  return <span className="text-muted-foreground text-sm">{labels[plan] ?? "Free"}</span>;
}

export function KiraSettingsPanel({ open, onOpenChange, userId }: Props) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { plan } = useSubscription();

  const [view, setView] = useState<PanelView>("main");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [memory, setMemory] = useState<KiraMemory>(DEFAULT_MEMORY);

  // Reset to main view when panel opens
  useEffect(() => {
    if (open) setView("main");
  }, [open]);

  // Load profile + memory on open
  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setIsLoading(true);
      const [{ data: { user } }, { data: profile }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("profiles").select("display_name, kira_memory").eq("id", userId).single(),
      ]);
      if (user?.email) setEmail(user.email);
      if (profile?.display_name) setDisplayName(profile.display_name);

      const raw = (profile?.kira_memory as Record<string, unknown>) || {};
      setMemory({
        reference_chat_history: raw.reference_chat_history !== false,
        reference_saved_memories: raw.reference_saved_memories !== false,
        nickname: (raw.nickname as string) || "",
        occupation: (raw.occupation as string) || "",
        more_about_you: (raw.more_about_you as string) || "",
        custom_instructions: (raw.custom_instructions as string) || "",
      });
      setIsLoading(false);
    };
    load();
  }, [open, userId]);

  const saveMemory = async (patch?: Partial<KiraMemory>) => {
    setIsSaving(true);
    const toSave = patch ? { ...memory, ...patch } : memory;
    const { error } = await supabase
      .from("profiles")
      .update({ kira_memory: toSave })
      .eq("id", userId);
    if (error) {
      toast({ title: "Couldn't save", description: "Please try again.", variant: "destructive" });
    } else {
      if (patch) setMemory(toSave);
      toast({ title: "Saved", description: "Kira will use this going forward." });
    }
    setIsSaving(false);
  };

  const deleteMemoryField = async (field: keyof KiraMemory) => {
    const patch = { ...memory, [field]: "" };
    setMemory(patch);
    await supabase.from("profiles").update({ kira_memory: patch }).eq("id", userId);
    toast({ title: "Memory removed" });
  };

  const savedItems = [
    { key: "nickname", label: "Nickname", value: memory.nickname },
    { key: "occupation", label: "Occupation", value: memory.occupation },
    { key: "more_about_you", label: "About you", value: memory.more_about_you },
    { key: "custom_instructions", label: "Instructions", value: memory.custom_instructions },
  ].filter((item) => item.value.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-sm w-full rounded-2xl overflow-hidden border border-border/40 bg-[#1a1a1a] text-foreground shadow-2xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* ── MAIN VIEW ── */}
            {view === "main" && (
              <ScrollArea className="max-h-[85vh]">
                <div className="p-5 pb-6 space-y-6">
                  {/* Close */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => onOpenChange(false)}
                      className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Avatar + name */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bronze to-bronze-dark flex items-center justify-center text-background font-bold text-lg select-none">
                        {getInitials(displayName) || "U"}
                      </div>
                      <button
                        onClick={() => { onOpenChange(false); navigate("/profile/settings"); }}
                        className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow"
                      >
                        <Pencil className="w-3 h-3 text-black" />
                      </button>
                    </div>
                    <span className="font-semibold text-base">{displayName || "Your name"}</span>
                  </div>

                  {/* Customize Kira */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground px-1">Customize Kira</p>
                    <div className="rounded-2xl bg-white/5 divide-y divide-white/8 overflow-hidden">
                      <SettingsRow
                        icon={<Palette className="w-4 h-4 text-muted-foreground" />}
                        label="Personalization"
                        onClick={() => setView("personalization")}
                        hasChevron
                      />
                      <SettingsRow
                        icon={<Brain className="w-4 h-4 text-muted-foreground" />}
                        label="Memory"
                        onClick={() => setView("memory")}
                        hasChevron
                      />
                    </div>
                  </div>

                  {/* Account */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground px-1">Account</p>
                    <div className="rounded-2xl bg-white/5 divide-y divide-white/8 overflow-hidden">
                      <SettingsRow
                        icon={<Mail className="w-4 h-4 text-muted-foreground" />}
                        label="Email"
                        value={<span className="text-muted-foreground text-sm truncate max-w-[160px]">{email}</span>}
                      />
                      <SettingsRow
                        icon={<CreditCard className="w-4 h-4 text-muted-foreground" />}
                        label="Subscription"
                        value={<PlanLabel plan={plan} />}
                        onClick={() => { onOpenChange(false); navigate("/profile/payments"); }}
                        hasChevron
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
            )}

            {/* ── MEMORY VIEW ── */}
            {view === "memory" && (
              <div className="flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 flex-shrink-0">
                  <button
                    onClick={() => setView("main")}
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-base">Memory</span>
                  <Button
                    size="sm"
                    onClick={() => saveMemory()}
                    disabled={isSaving}
                    className="h-8 px-4 rounded-full bg-white/10 hover:bg-white/20 text-foreground border-0 text-sm font-medium"
                  >
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                  </Button>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-5">
                    {/* Reference chat history toggle */}
                    <div className="rounded-2xl bg-white/5 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Reference chat history</span>
                        <Switch
                          checked={memory.reference_chat_history}
                          onCheckedChange={(val) => setMemory((m) => ({ ...m, reference_chat_history: val }))}
                          className="data-[state=checked]:bg-green-500"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Lets Kira reference recent conversations when responding.
                      </p>
                    </div>

                    {/* Reference saved memories toggle */}
                    <div className="rounded-2xl bg-white/5 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">Reference saved memories</span>
                        <Switch
                          checked={memory.reference_saved_memories}
                          onCheckedChange={(val) => setMemory((m) => ({ ...m, reference_saved_memories: val }))}
                          className="data-[state=checked]:bg-green-500"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Lets Kira save and use memories when responding.
                      </p>
                    </div>

                    {/* Saved memories link */}
                    <div className="rounded-2xl bg-white/5 overflow-hidden">
                      <button
                        onClick={() => setView("saved-memories")}
                        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors"
                      >
                        <span className="font-medium text-sm">Saved memories</span>
                        <div className="flex items-center gap-2">
                          {savedItems.length > 0 && (
                            <span className="text-xs text-muted-foreground">{savedItems.length}</span>
                          )}
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground px-1 -mt-2">
                      Kira may use Memory to personalize your experience on Crevia.
                    </p>

                    {/* Nickname */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground px-1">Your nickname</p>
                      <Input
                        value={memory.nickname}
                        onChange={(e) => setMemory((m) => ({ ...m, nickname: e.target.value }))}
                        placeholder="Name"
                        className="rounded-2xl bg-white/5 border-white/10 focus-visible:ring-bronze/50 h-12 px-4"
                      />
                    </div>

                    {/* Occupation */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground px-1">Your occupation</p>
                      <Input
                        value={memory.occupation}
                        onChange={(e) => setMemory((m) => ({ ...m, occupation: e.target.value }))}
                        placeholder="Photographer, designer, etc."
                        className="rounded-2xl bg-white/5 border-white/10 focus-visible:ring-bronze/50 h-12 px-4"
                      />
                    </div>

                    {/* More about you */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground px-1">More about you</p>
                      <Textarea
                        value={memory.more_about_you}
                        onChange={(e) => setMemory((m) => ({ ...m, more_about_you: e.target.value }))}
                        placeholder="Interests, values, or preferences to keep..."
                        rows={4}
                        className="rounded-2xl bg-white/5 border-white/10 focus-visible:ring-bronze/50 px-4 resize-none"
                      />
                    </div>
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* ── SAVED MEMORIES VIEW ── */}
            {view === "saved-memories" && (
              <div className="flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 flex-shrink-0">
                  <button
                    onClick={() => setView("memory")}
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-base">Saved Memories</span>
                  <div className="w-9" />
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {savedItems.length === 0 ? (
                      <div className="py-12 flex flex-col items-center gap-3 text-center">
                        <Brain className="w-8 h-8 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">No saved memories yet.</p>
                        <p className="text-xs text-muted-foreground/70">
                          Go back and fill in your details to help Kira personalize responses.
                        </p>
                      </div>
                    ) : (
                      savedItems.map((item) => (
                        <div
                          key={item.key}
                          className="rounded-2xl bg-white/5 px-4 py-3 flex items-start gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                            <p className="text-sm leading-snug break-words">{item.value}</p>
                          </div>
                          <button
                            onClick={() => deleteMemoryField(item.key as keyof KiraMemory)}
                            className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* ── PERSONALIZATION VIEW ── */}
            {view === "personalization" && (
              <div className="flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 flex-shrink-0">
                  <button
                    onClick={() => setView("main")}
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-base">Personalization</span>
                  <Button
                    size="sm"
                    onClick={() => saveMemory()}
                    disabled={isSaving}
                    className="h-8 px-4 rounded-full bg-white/10 hover:bg-white/20 text-foreground border-0 text-sm font-medium"
                  >
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                  </Button>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-5">
                    <div className="rounded-2xl bg-white/5 p-4 space-y-3">
                      <div>
                        <p className="text-sm font-medium">What should Kira know about you?</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Kira will use this to tailor how it responds to you in every chat.
                        </p>
                      </div>
                      <Textarea
                        value={memory.custom_instructions}
                        onChange={(e) => setMemory((m) => ({ ...m, custom_instructions: e.target.value }))}
                        placeholder="e.g. I prefer concise answers. I'm a freelance videographer based in Nairobi. Always lead with pricing when relevant."
                        rows={6}
                        className="rounded-xl bg-white/5 border-white/10 focus-visible:ring-bronze/50 px-4 resize-none text-sm"
                      />
                    </div>

                    <p className="text-xs text-muted-foreground px-1 leading-relaxed">
                      These instructions apply to all Kira conversations on Crevia. Be specific — the more context you give, the sharper Kira's responses.
                    </p>
                  </div>
                </ScrollArea>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Reusable settings row ──
interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  value?: React.ReactNode;
  onClick?: () => void;
  hasChevron?: boolean;
}

function SettingsRow({ icon, label, value, onClick, hasChevron }: SettingsRowProps) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors ${
        onClick ? "hover:bg-white/5 cursor-pointer" : ""
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1 text-sm font-medium text-left">{label}</span>
      {value && <span className="flex-shrink-0">{value}</span>}
      {hasChevron && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
    </Tag>
  );
}
