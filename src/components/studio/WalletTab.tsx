import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  CreditCard,
  Smartphone,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Plus,
  Shield,
  TrendingUp,
  Download,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import AddPayoutMethodDialog from "@/components/crevia-connect/shared/AddPayoutMethodDialog";

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

const WalletTab = () => {
  const [escrowPayments, setEscrowPayments] = useState<EscrowPayment[]>([]);
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMethodDialog, setShowAddMethodDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

      const { data: methods, error: methodsError } = await supabase
        .from("creator_payout_methods")
        .select("*")
        .eq("creator_id", user.id)
        .order("is_default", { ascending: false });

      if (methodsError) throw methodsError;
      setPayoutMethods(methods || []);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      toast.error("Failed to load wallet data");
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

    return {
      pendingCount: pending.length,
      inEscrow: totalInEscrow,
      released: totalReleased,
    };
  };

  const stats = calculateStats();

  const filteredPayments = escrowPayments.filter(payment => {
    const searchLower = searchQuery.toLowerCase();
    const campaignTitle = payment.campaign?.title?.toLowerCase() || "";
    const counterpart = (payment.brand_profile?.display_name || payment.creator_profile?.display_name || "").toLowerCase();
    return campaignTitle.includes(searchLower) || counterpart.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bronze"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Hero Balance Card */}
      <Card className="bg-gradient-to-br from-bronze/20 via-bronze/10 to-background border-bronze/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-bronze/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-6 md:p-8 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-2xl bg-bronze/20 backdrop-blur-sm">
                  <Wallet className="h-6 w-6 text-bronze" />
                </div>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Balance
                </span>
              </div>
              <h1 className="font-vollkorn text-4xl md:text-5xl font-bold text-foreground">
                KES {stats.inEscrow.toLocaleString()}
              </h1>
              <p className="text-muted-foreground mt-2 font-poppins">
                {stats.pendingCount > 0
                  ? `${stats.pendingCount} pending payment${stats.pendingCount !== 1 ? "s" : ""}`
                  : "Ready to withdraw"}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="bg-bronze hover:bg-bronze-dark font-poppins gap-2 h-12 px-6"
              >
                <Download className="h-5 w-5" />
                Withdraw
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-poppins gap-2 h-12 px-6"
                onClick={() => setShowAddMethodDialog(true)}
              >
                <Plus className="h-5 w-5" />
                Add Method
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Pending</p>
                <p className="text-lg font-bold font-vollkorn text-foreground">{stats.pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-bronze/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-bronze" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">In Escrow</p>
                <p className="text-lg font-bold font-vollkorn text-foreground">
                  KES {stats.inEscrow.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Completed</p>
                <p className="text-lg font-bold font-vollkorn text-foreground">
                  KES {stats.released.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">This Month</p>
                <p className="text-lg font-bold font-vollkorn text-foreground">+12%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="payments" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList className="bg-muted/50 w-fit">
            <TabsTrigger value="payments" className="font-poppins">Payments</TabsTrigger>
            <TabsTrigger value="methods" className="font-poppins">Payout Methods</TabsTrigger>
            <TabsTrigger value="history" className="font-poppins">History</TabsTrigger>
          </TabsList>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              className="pl-9 h-10 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          {filteredPayments.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Wallet className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold text-lg font-vollkorn">No payments yet</h3>
                <p className="text-muted-foreground text-center max-w-sm mt-2">
                  Complete campaigns to start earning
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredPayments.map((payment) => (
                <Card key={payment.id} className="hover:border-bronze/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                        payment.first_payment_status === "released"
                          ? "bg-green-500/10"
                          : payment.first_payment_status === "paid"
                            ? "bg-bronze/10"
                            : "bg-yellow-500/10"
                      )}>
                        {payment.first_payment_status === "released" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : payment.first_payment_status === "paid" ? (
                          <Shield className="h-5 w-5 text-bronze" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate font-poppins">
                          {payment.campaign?.title || "Campaign"}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {payment.brand_profile?.display_name || payment.creator_profile?.display_name || "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg font-vollkorn text-green-500">
                          +KES {Number(payment.total_amount).toLocaleString()}
                        </p>
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          payment.first_payment_status === "released"
                            ? "text-green-500 border-green-500/30"
                            : payment.first_payment_status === "paid"
                              ? "text-bronze border-bronze/30"
                              : "text-yellow-500 border-yellow-500/30"
                        )}>
                          {payment.first_payment_status === "released" ? "Completed" :
                            payment.first_payment_status === "paid" ? "In Escrow" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Payout Methods Tab */}
        <TabsContent value="methods" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold font-vollkorn">Payout Methods</h2>
              <p className="text-sm text-muted-foreground">
                Add M-Pesa or card to receive payments instantly
              </p>
            </div>
            <Button onClick={() => setShowAddMethodDialog(true)} className="gap-2 bg-bronze hover:bg-bronze-dark">
              <Plus className="h-4 w-4" />
              Add Method
            </Button>
          </div>

          {payoutMethods.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <CreditCard className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold text-lg font-vollkorn">No payout methods</h3>
                <p className="text-muted-foreground text-center max-w-sm mt-2">
                  Add M-Pesa or a card to receive your earnings
                </p>
                <Button
                  onClick={() => setShowAddMethodDialog(true)}
                  className="mt-6 gap-2 bg-bronze hover:bg-bronze-dark"
                >
                  <Plus className="h-4 w-4" />
                  Add Payout Method
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payoutMethods.map((method) => (
                <Card key={method.id} className={cn(
                  "hover:border-bronze/30 transition-colors",
                  method.is_default && "border-bronze"
                )}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        {method.method_type === "mpesa" ? (
                          <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <Smartphone className="h-6 w-6 text-green-500" />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-blue-500" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold capitalize font-poppins">{method.method_type}</p>
                            {method.is_default && (
                              <Badge className="bg-bronze/10 text-bronze text-xs">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
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

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <ArrowUpRight className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="font-semibold text-lg font-vollkorn">Transaction History</h3>
              <p className="text-muted-foreground text-center max-w-sm mt-2">
                Your complete transaction history will appear here
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

export default WalletTab;
