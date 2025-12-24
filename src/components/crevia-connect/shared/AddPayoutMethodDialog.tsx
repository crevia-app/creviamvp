import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Smartphone, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface AddPayoutMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddPayoutMethodDialog = ({ open, onOpenChange, onSuccess }: AddPayoutMethodDialogProps) => {
  const [methodType, setMethodType] = useState<"mpesa" | "card">("mpesa");
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  // M-Pesa fields
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [mpesaName, setMpesaName] = useState("");

  // Card fields
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");

  const resetForm = () => {
    setMethodType("mpesa");
    setIsDefault(false);
    setMpesaPhone("");
    setMpesaName("");
    setCardHolderName("");
    setCardNumber("");
    setCardExpiry("");
  };

  const handleSubmit = async () => {
    // Validation
    if (methodType === "mpesa") {
      if (!mpesaPhone || !mpesaName) {
        toast.error("Please fill in all M-Pesa fields");
        return;
      }
    } else {
      if (!cardHolderName || !cardNumber || !cardExpiry) {
        toast.error("Please fill in all card fields");
        return;
      }
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // If setting as default, unset other defaults first
      if (isDefault) {
        await supabase
          .from("creator_payout_methods")
          .update({ is_default: false })
          .eq("creator_id", user.id);
      }

      const { error } = await supabase.from("creator_payout_methods").insert({
        creator_id: user.id,
        method_type: methodType,
        is_default: isDefault,
        mpesa_phone: methodType === "mpesa" ? mpesaPhone : null,
        mpesa_name: methodType === "mpesa" ? mpesaName : null,
        card_holder_name: methodType === "card" ? cardHolderName : null,
        card_last_four: methodType === "card" ? cardNumber.slice(-4) : null,
        card_expiry: methodType === "card" ? cardExpiry : null,
      });

      if (error) throw error;

      toast.success("Payout method added successfully!");
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error adding payout method:", error);
      toast.error("Failed to add payout method");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payout Method</DialogTitle>
          <DialogDescription>
            Add a new way to receive your earnings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup 
            value={methodType} 
            onValueChange={(v) => setMethodType(v as "mpesa" | "card")}
            className="space-y-3"
          >
            <div className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${methodType === "mpesa" ? "border-green-500 bg-green-500/5" : "hover:bg-muted/50"}`}>
              <RadioGroupItem value="mpesa" id="payout-mpesa" />
              <Label htmlFor="payout-mpesa" className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">M-Pesa</p>
                  <p className="text-xs text-muted-foreground">Receive via M-Pesa mobile money</p>
                </div>
              </Label>
            </div>

            <div className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${methodType === "card" ? "border-blue-500 bg-blue-500/5" : "hover:bg-muted/50"}`}>
              <RadioGroupItem value="card" id="payout-card" />
              <Label htmlFor="payout-card" className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Debit Card</p>
                  <p className="text-xs text-muted-foreground">Receive to your debit card</p>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {methodType === "mpesa" && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="mpesa-name">Name on M-Pesa</Label>
                <Input
                  id="mpesa-name"
                  placeholder="e.g., John Doe"
                  value={mpesaName}
                  onChange={(e) => setMpesaName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mpesa-phone">M-Pesa Phone Number</Label>
                <Input
                  id="mpesa-phone"
                  placeholder="e.g., 0712345678"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                />
              </div>
            </div>
          )}

          {methodType === "card" && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="card-name">Cardholder Name</Label>
                <Input
                  id="card-name"
                  placeholder="e.g., John Doe"
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-expiry">Expiry Date</Label>
                <Input
                  id="card-expiry"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="default" 
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked as boolean)}
            />
            <Label htmlFor="default" className="text-sm cursor-pointer">
              Set as default payout method
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Adding..." : "Add Method"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPayoutMethodDialog;
