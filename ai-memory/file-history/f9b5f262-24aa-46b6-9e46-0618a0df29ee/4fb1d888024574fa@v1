import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  CreditCard, ArrowRight, Check, Sparkles,
  Receipt, Calendar, Smartphone, Users,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const planLabel = (plan: string) => {
  if (plan === "business" || plan === "brand_workspace") return "Business";
  if (plan === "pro" || plan === "creative_pro") return "Pro";
  return "Free";
};

const planPrice = (plan: string) => {
  if (plan === "business" || plan === "brand_workspace") return "$79 / month";
  if (plan === "pro" || plan === "creative_pro") return "$14.99 / month";
  return "Free — no billing required";
};

const isPaidPlan = (plan: string) =>
  ["pro", "creative_pro", "brand_workspace", "business"].includes(plan);

// Payment method definitions — amount changes per target plan
const buildMethods = (planKey: "pro" | "business") => {
  const usdAmount = planKey === "business" ? 7900 : 1499;
  const kesAmount = planKey === "business" ? 1027100 : 194900; // ~$79 ≈ KES 10,271
  const usdLabel  = planKey === "business" ? "$79" : "$14.99";
  const kesLabel  = planKey === "business" ? "KES 10,271" : "KES 1,949";
  return [
    {
      id: "card",
      label: "Credit / Debit Card",
      providers: "Visa · Mastercard · Verve",
      price: usdLabel,
      note: "Billed in USD",
      currency: "USD",
      amount: usdAmount,
      channels: ["card"],
      badge: null,
      icon: CreditCard,
    },
    {
      id: "mobile_money",
      label: "Mobile Money",
      providers: "M-Pesa · Airtel Money · MTN",
      price: kesLabel,
      note: "≈ " + usdLabel + " · Billed in KES",
      currency: "KES",
      amount: kesAmount,
      channels: ["mobile_money"],
      badge: "Popular in Kenya",
      icon: Smartphone,
    },
  ];
};

const PaymentsBilling = () => {
  const { t } = useLanguage();
  const [userId, setUserId]           = useState<string | null>(null);
  const [subscription, setSubscription] = useState<string>("free");
  const [loading, setLoading]         = useState(false);
  const [showDialog, setShowDialog]   = useState(false);
  const [targetPlan, setTargetPlan]   = useState<"pro" | "business">("pro");

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

  const openUpgrade = (plan: "pro" | "business") => {
    setTargetPlan(plan);
    setShowDialog(true);
  };

  const pay = async (method: ReturnType<typeof buildMethods>[number]) => {
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
      metadata: { plan: targetPlan },
      callback: () => setLoading(false),
      onClose:  () => setLoading(false),
    });
    handler.openIframe();
  };

  const isBusiness = subscription === "business" || subscription === "brand_workspace";
  const isPro      = subscription === "pro" || subscription === "creative_pro";
  const isFree     = !isPaidPlan(subscription);

  const starterFeatures = [
    "1 seat",
    "10 Kira AI actions per day",
    "Crevia Link — basic templates",
    "1 active workspace",
    "5 Canvas per month (basic editing)",
    "3 invoices per month (Crevia watermark)",
  ];

  const proFeatures = [
    "1 seat",
    "40 Kira AI actions per day",
    "Crevia Link — all premium themes & analytics",
    "Unlimited workspaces",
    "Unlimited Canvas with full E-Signatures",
    "Unlimited invoices — no watermark",
    "Client Portal access",
    "Priority support",
  ];

  const businessFeatures = [
    "3 seats included (+$14.99/extra seat)",
    "200 Kira AI actions/day",
    "Multi-workspace Kira context",
    "Team roles & permissions (RBAC)",
    "Unlimited Canvas + clause library",
    "Unlimited invoices — no watermark",
    "E-Signatures inside the app",
    "Priority support",
  ];

  const methods = buildMethods(targetPlan);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-5xl">

        <div className="mb-10">
          <h1 className="font-vollkorn text-4xl font-bold mb-2">Payments & Billing</h1>
          <p className="text-muted-foreground">Manage your Crevia subscription</p>
        </div>

        {/* Current Plan */}
        <Card className="p-6 mb-8 border-bronze/30">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-bronze/10 flex items-center justify-center">
                {isBusiness ? <Users className="h-6 w-6 text-bronze" /> : <Sparkles className="h-6 w-6 text-bronze" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-vollkorn text-xl font-bold">
                    {planLabel(subscription)} {isFree ? "Plan" : ""}
                  </h2>
                  <Badge variant="outline" className="text-bronze border-bronze/40">
                    {isFree ? "Free" : "Active"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{planPrice(subscription)}</p>
              </div>
            </div>
            {isFree && (
              <Link to="/pricing">
                <Button className="bg-bronze hover:bg-bronze/90 text-white">
                  Upgrade <ArrowRight className="w-4 h-4 ml-1" />
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
                Add a card or mobile money to subscribe
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => openUpgrade("pro")}>
              Add Method
            </Button>
          </div>
        </Card>

        {/* Compare Plans */}
        <h2 className="font-vollkorn text-2xl font-bold mb-5">Compare Plans</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-8">

          {/* Free */}
          <Card className="p-6 border-border/40">
            <h3 className="font-vollkorn text-xl font-bold mb-1">Free</h3>
            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              {starterFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-bronze mt-0.5 shrink-0" />
                  <span className="text-sm">{f}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full mt-auto" disabled={isFree}>
              {isFree ? "Current Plan" : "Downgrade"}
            </Button>
          </Card>

          {/* Pro */}
          <Card className="p-6 border-bronze/50 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-bronze text-white border-0">Most Popular</Badge>
            </div>
            <h3 className="font-vollkorn text-xl font-bold mb-1">Pro</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold">$14.99</span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>
            <p className="text-xs text-muted-foreground mb-5">≈ KES 1,949 via M-Pesa</p>
            <ul className="space-y-3 mb-6">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-bronze mt-0.5 shrink-0" />
                  <span className="text-sm">{f}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => openUpgrade("pro")}
              disabled={loading || isPro || isBusiness}
              className="w-full bg-bronze hover:bg-bronze/90 text-white"
            >
              {loading ? "Processing..." : isPro ? "Current Plan" : isBusiness ? "Downgrade" : "Upgrade to Pro"}
            </Button>
          </Card>

          {/* Business */}
          <Card className="p-6 border-border/40 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-foreground text-background border-0">For Teams</Badge>
            </div>
            <h3 className="font-vollkorn text-xl font-bold mb-1">Business</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold">$79</span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>
            <p className="text-xs text-muted-foreground mb-5">3 seats · +$14.99/extra seat</p>
            <ul className="space-y-3 mb-6">
              {businessFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-bronze mt-0.5 shrink-0" />
                  <span className="text-sm">{f}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={() => openUpgrade("business")}
              disabled={loading || isBusiness}
              variant="outline"
              className="w-full"
            >
              {loading ? "Processing..." : isBusiness ? "Current Plan" : "Upgrade to Business"}
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
              Upgrading to <span className="font-semibold capitalize">{targetPlan}</span> —{" "}
              {targetPlan === "business" ? "$79/mo · 3 seats" : "$14.99/mo · 1 seat"}
            </p>
          </DialogHeader>
          <div className="grid gap-3 mt-1">
            {methods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => pay(method)}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-border hover:border-bronze/60 hover:bg-bronze/5 transition-all text-left"
                >
                  <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-bronze/10 transition-colors">
                    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-bronze transition-colors" />
                  </div>
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
