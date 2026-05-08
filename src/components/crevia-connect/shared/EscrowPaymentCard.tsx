import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Shield,
  Smartphone,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface EscrowPayment {
  id: string;
  campaign_id: string;
  application_id: string;
  brand_id: string;
  creator_id: string;
  total_amount: number;
  first_payment_amount: number;
  second_payment_amount: number;
  first_payment_status: string;
  second_payment_status: string;
  payment_method: string | null;
  created_at: string;
  campaign?: { title: string };
  brand_profile?: { display_name: string };
  creator_profile?: { display_name: string; handle: string };
}

interface EscrowPaymentCardProps {
  payment: EscrowPayment;
  currentUserId: string;
  onUpdate: () => void;
}

const EscrowPaymentCard = ({ payment, currentUserId, onUpdate }: EscrowPaymentCardProps) => {
  const isPayer = currentUserId === payment.brand_id;
  const [expanded, setExpanded] = useState(false);
  const [showFundDialog, setShowFundDialog] = useState(false);
  const [showReleaseDialog, setShowReleaseDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [processing, setProcessing] = useState(false);
  const [releasePhase, setReleasePhase] = useState<"first" | "second">("first");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-500";
      case "paid": return "bg-blue-500/20 text-blue-500";
      case "released": return "bg-green-500/20 text-green-500";
      case "refunded": return "bg-red-500/20 text-red-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getProgress = () => {
    let progress = 0;
    if (payment.first_payment_status === "paid") progress += 25;
    if (payment.first_payment_status === "released") progress += 25;
    if (payment.second_payment_status === "paid") progress += 25;
    if (payment.second_payment_status === "released") progress += 25;
    return progress;
  };

  const handleFundPayment = async () => {
    if (paymentMethod === "mpesa" && !mpesaPhone) {
      toast.error("Please enter your M-Pesa phone number");
      return;
    }

    setProcessing(true);
    try {
      // Simulate payment processing (in real implementation, integrate with M-Pesa/card API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const nextPhase = payment.first_payment_status === "pending" ? "first" : "second";
      const updateField = nextPhase === "first" ? "first_payment_status" : "second_payment_status";

      const { error } = await supabase
        .from("escrow_payments")
        .update({ 
          [updateField]: "paid",
          payment_method: paymentMethod,
          mpesa_phone: paymentMethod === "mpesa" ? mpesaPhone : null
        })
        .eq("id", payment.id);

      if (error) throw error;

      // Create transaction record
      await supabase.from("payment_transactions").insert({
        escrow_id: payment.id,
        transaction_type: "deposit",
        payment_phase: nextPhase,
        amount: nextPhase === "first" ? payment.first_payment_amount : payment.second_payment_amount,
        status: "completed",
        payment_method: paymentMethod,
        transaction_reference: `TXN-${Date.now()}`
      });

      toast.success(`${nextPhase === "first" ? "First" : "Second"} payment funded successfully!`);
      setShowFundDialog(false);
      onUpdate();
    } catch (error) {
      console.error("Error funding payment:", error);
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReleasePayment = async () => {
    setProcessing(true);
    try {
      const updateField = releasePhase === "first" ? "first_payment_status" : "second_payment_status";

      const { error } = await supabase
        .from("escrow_payments")
        .update({ [updateField]: "released" })
        .eq("id", payment.id);

      if (error) throw error;

      // Create transaction record
      await supabase.from("payment_transactions").insert({
        escrow_id: payment.id,
        transaction_type: "release",
        payment_phase: releasePhase,
        amount: releasePhase === "first" ? payment.first_payment_amount : payment.second_payment_amount,
        status: "completed",
        payment_method: payment.payment_method,
        transaction_reference: `REL-${Date.now()}`
      });

      toast.success(`${releasePhase === "first" ? "First" : "Second"} payment released to creator!`);
      setShowReleaseDialog(false);
      onUpdate();
    } catch (error) {
      console.error("Error releasing payment:", error);
      toast.error("Failed to release payment. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const canFund = isPayer &&
    (payment.first_payment_status === "pending" ||
     (payment.first_payment_status === "released" && payment.second_payment_status === "pending"));

  const canRelease = isPayer &&
    (payment.first_payment_status === "paid" || payment.second_payment_status === "paid");

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-bronze/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-bronze" />
              </div>
              <div>
                <h3 className="font-semibold">{payment.campaign?.title || "Campaign"}</h3>
                <p className="text-sm text-muted-foreground">
                  {isPayer
                    ? `To: ${payment.creator_profile?.display_name || payment.creator_profile?.handle || "Collaborator"}`
                    : `From: ${payment.brand_profile?.display_name || "Client"}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-lg">KES {Number(payment.total_amount).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Amount</p>
              </div>
              {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-4 pb-2">
            <Progress value={getProgress()} className="h-2" />
          </div>

          {/* Expanded Content */}
          {expanded && (
            <div className="border-t p-4 space-y-4">
              {/* Payment Phases */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Payment */}
                <div className="p-4 rounded-lg bg-muted/30 border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Phase 1 (50%)</h4>
                    <Badge className={getStatusColor(payment.first_payment_status)}>
                      {payment.first_payment_status}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">KES {Number(payment.first_payment_amount).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Released when work begins</p>
                  
                  {isPayer && payment.first_payment_status === "paid" && (
                    <Button 
                      size="sm" 
                      className="mt-3 w-full"
                      onClick={() => {
                        setReleasePhase("first");
                        setShowReleaseDialog(true);
                      }}
                    >
                      Release to Creator
                    </Button>
                  )}
                </div>

                {/* Second Payment */}
                <div className="p-4 rounded-lg bg-muted/30 border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Phase 2 (50%)</h4>
                    <Badge className={getStatusColor(payment.second_payment_status)}>
                      {payment.second_payment_status}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">KES {Number(payment.second_payment_amount).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Released when deliverables approved</p>
                  
                  {isPayer && payment.second_payment_status === "paid" && (
                    <Button 
                      size="sm" 
                      className="mt-3 w-full"
                      onClick={() => {
                        setReleasePhase("second");
                        setShowReleaseDialog(true);
                      }}
                    >
                      Release to Creator
                    </Button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {canFund && (
                <Button 
                  className="w-full gap-2"
                  onClick={() => setShowFundDialog(true)}
                >
                  <ArrowRight className="h-4 w-4" />
                  Fund {payment.first_payment_status === "pending" ? "First" : "Second"} Payment
                </Button>
              )}

              {/* Status Timeline */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <span>Created: {new Date(payment.created_at).toLocaleDateString()}</span>
                {payment.payment_method && (
                  <span className="flex items-center gap-1">
                    {payment.payment_method === "mpesa" ? (
                      <Smartphone className="h-3 w-3" />
                    ) : (
                      <CreditCard className="h-3 w-3" />
                    )}
                    {payment.payment_method.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fund Payment Dialog */}
      <Dialog open={showFundDialog} onOpenChange={setShowFundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fund Escrow Payment</DialogTitle>
            <DialogDescription>
              Choose your payment method to fund this escrow payment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Amount to pay</p>
              <p className="text-2xl font-bold">
                KES {Number(payment.first_payment_status === "pending" 
                  ? payment.first_payment_amount 
                  : payment.second_payment_amount).toLocaleString()}
              </p>
            </div>

            <RadioGroup 
              value={paymentMethod} 
              onValueChange={(v) => setPaymentMethod(v as "mpesa" | "card")}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="mpesa" id="mpesa" />
                <Label htmlFor="mpesa" className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">M-Pesa</p>
                    <p className="text-xs text-muted-foreground">Pay with M-Pesa mobile money</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Card</p>
                    <p className="text-xs text-muted-foreground">Pay with Visa, Mastercard</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {paymentMethod === "mpesa" && (
              <div className="space-y-2">
                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="e.g., 0712345678"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFundDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleFundPayment} disabled={processing}>
              {processing ? "Processing..." : "Pay Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Payment Dialog */}
      <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Payment</DialogTitle>
            <DialogDescription>
              This will release the payment to the creator. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-semibold">
                    KES {Number(releasePhase === "first" 
                      ? payment.first_payment_amount 
                      : payment.second_payment_amount).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Will be sent to {payment.creator_profile?.display_name || "Creator"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReleaseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReleasePayment} disabled={processing} className="bg-green-600 hover:bg-green-700">
              {processing ? "Releasing..." : "Confirm Release"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EscrowPaymentCard;
