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
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Smartphone, 
  CreditCard, 
  Shield, 
  CheckCircle2,
  ArrowRight,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/use-subscription";

interface FundEscrowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: any;
  campaign: any;
  onSuccess: () => void;
}

const FundEscrowDialog = ({
  open,
  onOpenChange,
  application,
  campaign,
  onSuccess
}: FundEscrowDialogProps) => {
  const { isPro, isBusiness, isBrandWorkspace } = useSubscription();
  const isProUser = isPro || isBusiness || isBrandWorkspace;

  const [step, setStep] = useState<"review" | "payment" | "processing" | "success">("review");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [processing, setProcessing] = useState(false);

  const totalAmount = Number(application.proposed_price || 0);
  const firstPayment = totalAmount / 2;
  const secondPayment = totalAmount / 2;

  const creatorName = application.creator_profiles?.profiles?.display_name || 
    application.creator_profiles?.profiles?.handle || "Creator";

  const handleProceedToPayment = () => {
    setStep("payment");
  };

  const handleFundEscrow = async () => {
    if (paymentMethod === "mpesa" && !mpesaPhone) {
      toast.error("Please enter your M-Pesa phone number");
      return;
    }

    setStep("processing");
    setProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Create escrow payment record
      const { data: escrowData, error: escrowError } = await supabase
        .from("escrow_payments")
        .insert({
          campaign_id: campaign.id,
          application_id: application.id,
          brand_id: user.id,
          creator_id: application.creator_id,
          total_amount: totalAmount,
          first_payment_amount: firstPayment,
          second_payment_amount: secondPayment,
          first_payment_status: "paid",
          second_payment_status: "pending",
          payment_method: paymentMethod,
          mpesa_phone: paymentMethod === "mpesa" ? mpesaPhone : null,
        })
        .select()
        .single();

      if (escrowError) throw escrowError;

      // Create transaction record for first payment
      await supabase.from("payment_transactions").insert({
        escrow_id: escrowData.id,
        transaction_type: "deposit",
        payment_phase: "first",
        amount: firstPayment,
        status: "completed",
        payment_method: paymentMethod,
        transaction_reference: `ESC-${Date.now()}`
      });

      // Update application status to accepted
      const { error: updateError } = await supabase
        .from("campaign_applications")
        .update({ status: "accepted" })
        .eq("id", application.id);

      if (updateError) throw updateError;

      setStep("success");
      
      // Auto-close after success
      setTimeout(() => {
        onSuccess();
        resetDialog();
      }, 2000);

    } catch (error) {
      console.error("Error funding escrow:", error);
      toast.error("Payment failed. Please try again.");
      setStep("payment");
    } finally {
      setProcessing(false);
    }
  };

  const resetDialog = () => {
    setStep("review");
    setPaymentMethod("mpesa");
    setMpesaPhone("");
    setProcessing(false);
  };

  const handleClose = () => {
    if (step !== "processing") {
      resetDialog();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {!isProUser ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-bronze" />
                Escrow Payments
              </DialogTitle>
              <DialogDescription>This feature is available on Pro and Business plans.</DialogDescription>
            </DialogHeader>
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-bronze/10 flex items-center justify-center mx-auto">
                <Shield className="w-7 h-7 text-bronze" />
              </div>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Escrow payments protect both parties. Upgrade to Pro or Business to unlock this feature.
              </p>
              <a href="/pricing" className="inline-block mt-2 bg-bronze hover:bg-bronze/90 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                Upgrade to Pro
              </a>
            </div>
          </>
        ) : (
          <>
          {step === "review" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-bronze" />
                Accept Creator & Fund Escrow
              </DialogTitle>
              <DialogDescription>
                Review the payment details before proceeding to fund the escrow.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Campaign & Creator Info */}
              <Card className="p-4 bg-muted/30">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Campaign</span>
                    <span className="font-medium">{campaign.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Creator</span>
                    <span className="font-medium">{creatorName}</span>
                  </div>
                </div>
              </Card>

              {/* Payment Breakdown */}
              <div className="space-y-3">
                <h4 className="font-semibold">Payment Breakdown (50/50 Split)</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-bronze/10 border border-bronze/20">
                    <div>
                      <p className="font-medium">Phase 1 - Upfront</p>
                      <p className="text-xs text-muted-foreground">Released when work begins</p>
                    </div>
                    <p className="font-bold text-bronze">KES {firstPayment.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border">
                    <div>
                      <p className="font-medium">Phase 2 - Completion</p>
                      <p className="text-xs text-muted-foreground">Released when deliverables approved</p>
                    </div>
                    <p className="font-bold">KES {secondPayment.toLocaleString()}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Escrow Amount</span>
                  <span className="text-xl font-bold">KES {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Escrow Benefits */}
              <Card className="p-4 border-green-500/20 bg-green-500/5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-500">Protected by Crevia Pay</p>
                    <p className="text-muted-foreground mt-1">
                      Your funds are held securely until you approve each milestone. 
                      If issues arise, our dispute resolution team will help.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleProceedToPayment} className="gap-2">
                Proceed to Payment
                <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "payment" && (
          <>
            <DialogHeader>
              <DialogTitle>Choose Payment Method</DialogTitle>
              <DialogDescription>
                Select how you'd like to fund the escrow payment.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Amount to Pay */}
              <Card className="p-4 bg-bronze/10 border-bronze/30">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Amount to Pay Now</p>
                  <p className="text-3xl font-bold text-bronze">KES {totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (50% released now, 50% held for completion)
                  </p>
                </div>
              </Card>

              {/* Payment Method Selection */}
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={(v) => setPaymentMethod(v as "mpesa" | "card")}
                className="space-y-3"
              >
                <div className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${paymentMethod === "mpesa" ? "border-green-500 bg-green-500/5" : "hover:bg-muted/50"}`}>
                  <RadioGroupItem value="mpesa" id="fund-mpesa" />
                  <Label htmlFor="fund-mpesa" className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">M-Pesa</p>
                      <p className="text-xs text-muted-foreground">Pay via M-Pesa STK Push</p>
                    </div>
                  </Label>
                </div>

                <div className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${paymentMethod === "card" ? "border-blue-500 bg-blue-500/5" : "hover:bg-muted/50"}`}>
                  <RadioGroupItem value="card" id="fund-card" />
                  <Label htmlFor="fund-card" className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Card</p>
                      <p className="text-xs text-muted-foreground">Pay with Visa or Mastercard</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {/* M-Pesa Phone Input */}
              {paymentMethod === "mpesa" && (
                <div className="space-y-2">
                  <Label htmlFor="escrow-mpesa-phone">M-Pesa Phone Number</Label>
                  <Input
                    id="escrow-mpesa-phone"
                    placeholder="e.g., 0712345678"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    You'll receive an STK push to confirm the payment
                  </p>
                </div>
              )}

              {/* Card Payment Notice */}
              {paymentMethod === "card" && (
                <Card className="p-3 bg-blue-500/5 border-blue-500/20">
                  <p className="text-xs text-muted-foreground">
                    You'll be redirected to our secure payment page to enter your card details.
                  </p>
                </Card>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("review")}>
                Back
              </Button>
              <Button onClick={handleFundEscrow} disabled={processing}>
                Fund Escrow
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "processing" && (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-bronze/20 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-bronze animate-spin" />
              </div>
            </div>
            <h3 className="font-semibold text-lg mt-6">Processing Payment...</h3>
            <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">
              {paymentMethod === "mpesa" 
                ? "Please check your phone and enter your M-Pesa PIN to confirm"
                : "Processing your card payment..."}
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="font-semibold text-lg mt-6 text-green-500">Payment Successful!</h3>
            <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">
              The creator has been accepted and the escrow has been funded. 
              They've been notified to begin work.
            </p>
          </div>
        )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FundEscrowDialog;
