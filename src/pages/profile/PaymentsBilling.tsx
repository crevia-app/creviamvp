import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, DollarSign, TrendingUp } from "lucide-react";

const PaymentsBilling = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", session.user.id)
      .single();

    setUserType(profile?.user_type || null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 pt-32 pb-20 max-w-5xl">
        <h1 className="font-vollkorn text-4xl font-bold mb-2">Payments & Billing</h1>
        <p className="text-muted-foreground mb-8">
          {userType === "creator" ? "Manage your earnings and payouts" : "Manage campaign payments and subscriptions"}
        </p>

        {/* Payment Methods */}
        <Card className="p-8 mb-6">
          <h2 className="font-vollkorn text-2xl font-bold mb-6">Payment Methods</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-bronze" />
                <div>
                  <p className="font-semibold">No payment method added</p>
                  <p className="text-sm text-muted-foreground">
                    {userType === "creator" 
                      ? "Add Pesapal, Stripe, or M-Pesa for payouts"
                      : "Add a payment method for campaigns"}
                  </p>
                </div>
              </div>
              <Button className="bg-bronze hover:bg-bronze-dark">Add Method</Button>
            </div>
          </div>
        </Card>

        {/* Earnings/Spending Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-bronze" />
              <p className="text-sm text-muted-foreground">
                {userType === "creator" ? "Total Earnings" : "Total Spend"}
              </p>
            </div>
            <p className="text-3xl font-bold">$0</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-bronze" />
              <p className="text-sm text-muted-foreground">
                {userType === "creator" ? "Pending Payouts" : "Escrow Balance"}
              </p>
            </div>
            <p className="text-3xl font-bold">$0</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-bronze" />
              <p className="text-sm text-muted-foreground">Subscription</p>
            </div>
            <p className="text-xl font-bold">Free Plan</p>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="p-8">
          <h2 className="font-vollkorn text-2xl font-bold mb-6">Transaction History</h2>
          <div className="text-center py-12 text-muted-foreground">
            <p>No transactions yet</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentsBilling;
