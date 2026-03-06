import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, DollarSign, TrendingUp, ArrowRight, Check } from "lucide-react";

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
      <div className="container mx-auto px-6 py-12 max-w-5xl">
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
            <p className="text-xl font-bold mb-3">Free Plan</p>
            <Link to="/pricing">
              <Button variant="outline" size="sm" className="w-full">
                Upgrade Plan <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </Card>
        </div>

        {/* Upgrade Option */}
        <Card className="p-8 mb-6">
          <h2 className="font-vollkorn text-2xl font-bold mb-2">Upgrade Your Plan</h2>
          <p className="text-muted-foreground mb-6">
            {userType === "creator" 
              ? "Unlock premium features to grow your creator business" 
              : "Scale your campaigns with advanced tools and insights"}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
            {/* Free Plan */}
            <Card className="p-6 border-border/40">
              <div className="mb-4">
                <h3 className="font-vollkorn text-xl font-bold mb-1">Free</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-bronze mt-0.5 shrink-0" />
                  <span className="text-sm">Basic profile & Crevia Link</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-bronze mt-0.5 shrink-0" />
                  <span className="text-sm">
                    {userType === "creator" ? "Browse & apply to campaigns" : "Post up to 2 campaigns"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-bronze mt-0.5 shrink-0" />
                  <span className="text-sm">Crevia Chat messaging</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </Card>

            {/* Pro Plan */}
            <Card className="p-6 border-bronze hover:border-bronze/60 transition-colors relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-bronze text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Recommended
                </span>
              </div>
              <div className="mb-4">
                <h3 className="font-vollkorn text-xl font-bold mb-1">Pro</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-bold">
                    {userType === "creator" ? "$14.99" : "$19.99"}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-bronze mt-0.5 shrink-0" />
                  <span className="text-sm">Everything in Free</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-bronze mt-0.5 shrink-0" />
                  <span className="text-sm">
                    {userType === "creator" ? "Priority campaign placement" : "Unlimited campaigns"}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-bronze mt-0.5 shrink-0" />
                  <span className="text-sm">Advanced analytics & Kira AI insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-bronze mt-0.5 shrink-0" />
                  <span className="text-sm">
                    {userType === "creator" ? "Custom profile themes" : "Creator discovery & matching"}
                  </span>
                </li>
              </ul>
              <Button className="w-full bg-bronze hover:bg-bronze-dark">
                Upgrade to Pro
              </Button>
            </Card>
          </div>
        </Card>

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
