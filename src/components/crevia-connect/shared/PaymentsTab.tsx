import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  CreditCard, 
  Smartphone, 
  ArrowUpRight, 
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import AddPayoutMethodDialog from "./AddPayoutMethodDialog";
import EscrowPaymentCard from "./EscrowPaymentCard";

interface PaymentsTabProps {
  userType: "creator" | "brand";
}

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

interface PayoutMethod {
  id: string;
  method_type: string;
  is_default: boolean;
  mpesa_phone: string | null;
  mpesa_name: string | null;
  card_holder_name: string | null;
  card_last_four: string | null;
  bank_name: string | null;
  bank_account_name: string | null;
}

const PaymentsTab = ({ userType }: PaymentsTabProps) => {
  const [escrowPayments, setEscrowPayments] = useState<EscrowPayment[]>([]);
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMethodDialog, setShowAddMethodDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch escrow payments
      const { data: payments, error: paymentsError } = await supabase
        .from("escrow_payments")
        .select(`
          *,
          campaign:campaigns(title),
          brand_profile:profiles!escrow_payments_brand_id_fkey(display_name),
          creator_profile:profiles!escrow_payments_creator_id_fkey(display_name, handle)
        `)
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;
      setEscrowPayments(payments || []);

      // Fetch payout methods for creators
      if (userType === "creator") {
        const { data: methods, error: methodsError } = await supabase
          .from("creator_payout_methods")
          .select("*")
          .eq("creator_id", user.id)
          .order("is_default", { ascending: false });

        if (methodsError) throw methodsError;
        setPayoutMethods(methods || []);
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
      toast.error("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const pending = escrowPayments.filter(
      p => p.first_payment_status === "pending" || p.second_payment_status === "pending"
    );
    const inEscrow = escrowPayments.filter(
      p => p.first_payment_status === "paid" || p.second_payment_status === "paid"
    );
    const released = escrowPayments.filter(
      p => p.first_payment_status === "released" && p.second_payment_status === "released"
    );

    const totalInEscrow = inEscrow.reduce((sum, p) => {
      let amount = 0;
      if (p.first_payment_status === "paid") amount += Number(p.first_payment_amount);
      if (p.second_payment_status === "paid") amount += Number(p.second_payment_amount);
      return sum + amount;
    }, 0);

    const totalReleased = released.reduce((sum, p) => sum + Number(p.total_amount), 0);

    return { pending: pending.length, inEscrow: totalInEscrow, released: totalReleased };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bronze"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-poppins">
          {userType === "creator" ? "My Earnings" : "Payment Management"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {userType === "creator" 
            ? "Track your earnings and manage payout methods" 
            : "Manage escrow payments and fund campaigns"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {userType === "creator" ? "Pending Payments" : "Pending Deposits"}
                </p>
                <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-bronze/10 to-bronze/5 border-bronze/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Escrow</p>
                <p className="text-2xl font-bold text-bronze">
                  KES {stats.inEscrow.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-bronze/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-bronze" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {userType === "creator" ? "Total Earned" : "Total Released"}
                </p>
                <p className="text-2xl font-bold text-green-500">
                  KES {stats.released.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="escrow" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="escrow">Escrow Payments</TabsTrigger>
          {userType === "creator" && (
            <TabsTrigger value="payout-methods">Payout Methods</TabsTrigger>
          )}
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="escrow" className="space-y-4">
          {/* 50/50 Split Info */}
          <Card className="border-bronze/30 bg-bronze/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-bronze mt-0.5" />
                <div>
                  <h3 className="font-semibold text-bronze">50/50 Split Payment System</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Payments are split into two phases: 50% is released when work begins, 
                    and 50% when deliverables are approved. This protects both creators and brands.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {escrowPayments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wallet className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-lg">No escrow payments yet</h3>
                <p className="text-muted-foreground text-center max-w-sm mt-1">
                  {userType === "creator" 
                    ? "When brands fund campaigns you're working on, payments will appear here."
                    : "Fund campaigns to create escrow payments for your creators."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {escrowPayments.map((payment) => (
                <EscrowPaymentCard 
                  key={payment.id} 
                  payment={payment} 
                  userType={userType}
                  onUpdate={fetchData}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {userType === "creator" && (
          <TabsContent value="payout-methods" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Your Payout Methods</h2>
                <p className="text-sm text-muted-foreground">
                  Add M-Pesa or card to receive payments
                </p>
              </div>
              <Button onClick={() => setShowAddMethodDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Method
              </Button>
            </div>

            {payoutMethods.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold text-lg">No payout methods</h3>
                  <p className="text-muted-foreground text-center max-w-sm mt-1">
                    Add M-Pesa or a card to receive your earnings
                  </p>
                  <Button 
                    onClick={() => setShowAddMethodDialog(true)} 
                    className="mt-4 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Payout Method
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {payoutMethods.map((method) => (
                  <Card key={method.id} className={method.is_default ? "border-bronze" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {method.method_type === "mpesa" ? (
                            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                              <Smartphone className="h-5 w-5 text-green-500" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-blue-500" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold capitalize">{method.method_type}</p>
                              {method.is_default && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {method.method_type === "mpesa" 
                                ? `${method.mpesa_name} • ${method.mpesa_phone}`
                                : `${method.card_holder_name} • ****${method.card_last_four}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        <TabsContent value="history" className="space-y-4">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ArrowUpRight className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg">Transaction History</h3>
              <p className="text-muted-foreground text-center max-w-sm mt-1">
                Your complete transaction history will appear here once you start making or receiving payments.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddPayoutMethodDialog 
        open={showAddMethodDialog} 
        onOpenChange={setShowAddMethodDialog}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default PaymentsTab;
