import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Brain } from "lucide-react";

interface KiraMemory {
  standard_rate?: string;
  currency?: string;
  clients?: string[];
  payment_terms?: string;
  notes?: string;
}

interface KiraMemoryPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const CURRENCIES = ["KES", "USD", "GBP", "NGN", "ZAR", "EUR"];

export function KiraMemoryPanel({ open, onOpenChange, userId }: KiraMemoryPanelProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [standardRate, setStandardRate] = useState("");
  const [currency, setCurrency] = useState("KES");
  const [clientsRaw, setClientsRaw] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("kira_memory")
        .eq("id", userId)
        .single();

      const mem = (data?.kira_memory as KiraMemory) || {};
      setStandardRate(mem.standard_rate || "");
      setCurrency(mem.currency || "KES");
      setClientsRaw(Array.isArray(mem.clients) ? mem.clients.join(", ") : "");
      setPaymentTerms(mem.payment_terms || "");
      setNotes(mem.notes || "");
      setIsLoading(false);
    };
    load();
  }, [open, userId]);

  const handleSave = async () => {
    setIsSaving(true);
    const clients = clientsRaw
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const kiraMemory: KiraMemory = {
      standard_rate: standardRate.trim() || undefined,
      currency: currency || undefined,
      clients: clients.length > 0 ? clients : undefined,
      payment_terms: paymentTerms.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    const { error } = await supabase
      .from("profiles")
      .update({ kira_memory: kiraMemory })
      .eq("id", userId);

    if (error) {
      toast({ title: "Couldn't save", description: "Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Memory saved", description: "Kira will use this in every conversation." });
      onOpenChange(false);
    }
    setIsSaving(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-bronze/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-bronze" />
            </div>
            <div>
              <SheetTitle className="font-poppins text-base">Kira Memory</SheetTitle>
              <SheetDescription className="text-xs mt-0.5">
                Kira uses this in every conversation — no need to repeat yourself.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="km-rate" className="text-sm font-medium">
                Standard rate
              </Label>
              <Input
                id="km-rate"
                placeholder="e.g. KES 20,000 per shoot"
                value={standardRate}
                onChange={(e) => setStandardRate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="km-currency" className="text-sm font-medium">
                Preferred currency
              </Label>
              <select
                id="km-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="km-clients" className="text-sm font-medium">
                Regular clients
              </Label>
              <Input
                id="km-clients"
                placeholder="e.g. Nike, Safaricom, Equity Bank"
                value={clientsRaw}
                onChange={(e) => setClientsRaw(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Separate names with commas</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="km-terms" className="text-sm font-medium">
                Payment terms
              </Label>
              <Input
                id="km-terms"
                placeholder="e.g. 50% upfront, balance on delivery"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="km-notes" className="text-sm font-medium">
                Notes for Kira
              </Label>
              <Textarea
                id="km-notes"
                placeholder="Anything Kira should always know — specialties, deal-breakers, working style..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
        )}

        <div className="px-6 py-4 border-t border-border/50">
          <Button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="w-full bg-bronze hover:bg-bronze/90 text-background font-poppins"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save memory"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
