import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  CreditCard, ArrowRight, Check, Sparkles,
  Receipt, Calendar, Smartphone,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const isProPlan = (plan: string) =>
  plan === "pro" || plan === "creative_pro" || plan === "brand_workspace";

// $14.99 USD · KES equivalent at ~130 KES/USD
const USD_AMOUNT_CENTS = 1499;       // $14.99 in cents
const KES_AMOUNT_CENTS = 194900;     // KES 1,949 in cents

const PAYMENT_METHODS = [
  {
    id: "card",
    label: "Credit / Debit Card",
    providers: "Visa · Mastercard · Verve",
    price: "$14.99",
    note: "Billed in USD",
    currency: "USD",
    amount: USD_AMOUNT_CENTS,
    channels: ["card"],
    icon: CreditCard,
    badge: null,
  },
  {
    id: "mobile_money",
    label: "Mobile Money",
    providers: "M-Pesa · Airtel Money · MTN",
    price: "KES 1,949",
    note: "≈ $14.99 · Billed in KES",
    currency: "KES",
    amount: KES_AMOUNT_CENTS,
    channels: ["mobile_money"],
    icon: Smartphone,
    badge: "Popular in Kenya",
  },
];

const PaymentsBilling = () => {
  const { t } = useLanguage();
  const [userId, setUserId]           = useState<string | null>(null);
  const [subscription, setSubscription] = useState<string>("free");
  const [loading, setLoading]         = useState(false);
  const [showDialog, setShowDialog]   = useState(false);

  useEffect(() => { checkAuth(); }, []);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("profile-subscription")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "profiles",
        filter: `id=eq.${userId}`,
      }, (payload) => {
        const updated = payload.new as { subscription_plan?: string };
        setSubscription(updated.subscription_plan || "free");
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setUserId(session.user.id);
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_plan")
      .eq("id", session.user.id)
      .single();
    setSubscription(profile?.subscription_plan || "free");
  };

  const pay = async (method: typeof PAYMENT_METHODS[number]) => {
    setShowDialog(false);
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email;
    if (!email) { setLoading(false); return; }

    const w = window as unknown as {
      PaystackPop: { setup: (opts: Record<string, unknown>) => { openIframe: () => void } }
    };
    const handler = w.PaystackPop.setup({
      key:      import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email,
      amount:   method.amount,
      currency: method.currency,
      channels: method.channels,
      metadata: { plan: "pro" },
      callback: () => setLoading(false),
      onClose:  () => setLoading(false),
    });
    handler.openIframe();
  };

  const isPro = isProPlan(subscription);

  const starterFeatures = [
    "10 Kira AI actions per day",
    "Crevia Link — basic templates",
    "Unlimited bio links",
    "2 invoices per month",
    "2 Canvas per month",
    "Standard chat interface",
  ];

  const proFeatures = [
    "Verified badge on your profile",
    "40 Kira AI actions per day",
    "Crevia Link — all premium themes",
    "Full visitor analytics",
    "Unlimited invoices & tracking",
    "Unlimited AI Canvas generation",
    "E-Signatures inside the app",
    "Client Portal access",
    "Priority support",
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">

        <div className="mb-10">
          <h1 className="font-vollkorn text-4xl font-bold mb-2">Payments & Billing</h1>
          <p className="text-muted-foreground">Manage your Crevia subscription</p>
        </div>

        {/* Current Plan */}
        <Card className="p-6 mb-8 border-bronze/30">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-bronze/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-bronze" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-vollkorn text-xl font-bold">
                    {isPro ? "Pro" : "Free Plan"}
                  </h2>
                  <Badge variant="outline" className="text-bronze border-bronze/40">
                    {isPro ? "Active" : "Free"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isPro ? "$14.99 / month" : "Free — no billing required"}
                </p>
              </div>
            </div>
            {!isPro && (
              <Link to="/pricing">
                <Button className="bg-bronze hover:bg-bronze/90 text-white">
                  Upgrade to Pro <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </Card>

        {/* Payment Method */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <CreditCard className="w-5 h-5 text-bronze" />
            <h2 className="font-vollkorn text-xl font-bold">Payment Method</h2>
          </div>
          <div className="p-4 border border-dashed border-border rounded-lg flex items-center justify-between">
            <div>
              <p className="font-medium">No payment method on file</p>
              <p className="text-sm text-muted-foreground">
                Add a card or mobile money to subscribe to Pro
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDialog(true)}
            >
              Add Method
            </Button>
          </div>
        </Card>

        {/* Compare Plans */}
        <h2 className="font-vollkorn text-2xl font-bold mb-5">Compare Plans</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-8">

          {/* Free */}
          <Card className="p-6 border-border/40">
            <h3 className="font-vollkorn text-xl font-bold mb-1">Free</h3>
            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              {starterFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-bronze mt-0.5 shrink-0" />
                  <span className="text-sm">{f}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" disabled={!isPro}>
              {!isPro ? "Current Plan" : "Downgrade"}
            </Button>
          </Card>

          {/* Pro */}
          <Card className="p-6 border-bronze/50 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-bronze text-white border-0">Recommended</Badge>
            </div>
            <h3 className="font-vollkorn text-xl font-bold mb-1">Pro</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold">$14.99</span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>
            <p className="text-xs text-muted-foreground mb-5">≈ KES 1,949 when paying via M-Pesa</p>
            <ul className="space-y-3 mb-6">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-bronze mt-0.5 shrink-0" />
                  <span className="text-sm">{f}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => setShowDialog(true)}
              disabled={loading || isPro}
              className="w-full bg-bronze hover:bg-bronze/90 text-white"
            >
              {loading ? "Processing..." : isPro ? "Current Plan" : "Upgrade Now"}
            </Button>
          </Card>
        </div>

        {/* Billing History */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <Receipt className="w-5 h-5 text-bronze" />
            <h2 className="font-vollkorn text-xl font-bold">Billing History</h2>
          </div>
          <div className="text-center py-10">
            <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No billing history yet</p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Invoices will appear here once you subscribe
            </p>
          </div>
        </Card>
      </div>

      {/* Payment Method Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-vollkorn text-xl">Choose Payment Method</DialogTitle>
            <p className="text-sm text-muted-foreground">
              All methods unlock the same Pro features
            </p>
          </DialogHeader>

          <div className="grid gap-3 mt-1">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => pay(method)}
                  className="group relative flex items-center gap-4 p-4 rounded-xl border border-border hover:border-bronze/60 hover:bg-bronze/5 transition-all text-left"
                >
                  {/* Icon */}
                  <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-bronze/10 transition-colors">
                    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-bronze transition-colors" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{method.label}</p>
                      {method.badge && (
                        <span className="text-[10px] font-medium bg-bronze/10 text-bronze px-2 py-0.5 rounded-full">
                          {method.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{method.providers}</p>
                  </div>

                  {/* Price */}
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">{method.price}</p>
                    <p className="text-[11px] text-muted-foreground">{method.note}</p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-bronze ml-1 transition-colors shrink-0" />
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-2">
            Secured by <span className="font-semibold">Paystack</span> · Cancel anytime
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsBilling;
