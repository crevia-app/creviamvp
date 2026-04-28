import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, ArrowRight, Check, Sparkles, Receipt, Calendar } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const PaymentsBilling = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [userId, setUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<string>('free');
  const [isPaystackLoading, setIsPaystackLoading] = useState(false);

  useEffect(() => { checkAuth(); }, []);

  // Refresh subscription in real-time when the webhook updates the profile row
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('profile-subscription')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      }, (payload) => {
        const updated = payload.new as { subscription_plan?: string };
        setSubscription(updated.subscription_plan || 'free');
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    setUserId(session.user.id);
    const { data: profile } = await supabase.from("profiles").select("user_type, subscription_plan").eq("id", session.user.id).single();
    setUserType(profile?.user_type || null);
    setSubscription(profile?.subscription_plan || 'free');
  };

  const starterFeatures = [
    // "Crevia Link page",
    // "Crevia Chat messaging",
    // "Basic Kira AI assistant",
    // "1 Smart Invoice per month",
    "10 Kira AI actions per day",
    "Crevia Link — basic templates",
    "Unlimited bio links",
    "5 invoices per month",
    "5 contracts per month",
    "Standard chat interface",
  ];

  const proFeatures = userType === "brand" ? [
  "3 admin seats included",
  "$9.99 per extra seat",
  "Verified badge",
  "40 Kira AI actions per day",
  "Unlimited talent roster",
  "All premium themes + analytics",
  "Client Portal access",
  "Unlimited invoices & contracts",
  "E-Signatures inside the app",
] : [
  "Verified badge",
  "40 Kira AI actions per day",
  "All premium themes + analytics",
  "Client Portal access",
  "Unlimited invoices & contracts",
  "E-Signatures inside the app",
  "Priority support",
];

const handleUpgrade = async () => {
  setIsPaystackLoading(true);
  const plan = userType === 'brand' ? 'brand_workspace' : 'creative_pro';
  const amount = userType === 'brand' ? 2900 : 799;

  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email;
  if (!email) { setIsPaystackLoading(false); return; }

  const w = window as unknown as { PaystackPop: { setup: (opts: Record<string, unknown>) => { openIframe: () => void } } };
  const handler = w.PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email,
    amount: amount * 100, // Paystack expects smallest unit: KES 799 → 79900
    currency: 'KES',
    metadata: { plan },
    callback: (_response: { reference: string }) => {
      // subscription state updates via realtime listener when webhook fires
      setIsPaystackLoading(false);
    },
    onClose: () => {
      setIsPaystackLoading(false);
    },
  });
  handler.openIframe();
};

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
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
                  {subscription === 'free' ? 'Free Plan' : 
                    subscription === 'creative_pro' ? 'Creative Pro' : 
                     'Brand Workspace'}
                </h2>                  <Badge variant="outline" className="text-bronze border-bronze/40">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Free — no billing required</p>
              </div>
            </div>
            <Link to="/pricing">
              <Button className="bg-bronze hover:bg-bronze/90 text-white">
                Upgrade to Pro <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
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
              <p className="text-sm text-muted-foreground">Add a card or mobile money to subscribe to Pro</p>
            </div>
            <Button variant="outline" size="sm">Add Method</Button>
          </div>
        </Card>

        {/* Plan Comparison */}
        <h2 className="font-vollkorn text-2xl font-bold mb-5">Compare Plans</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Starter */}
          <Card className="p-6 border-border/40">
            <h3 className="font-vollkorn text-xl font-bold mb-1">Starter</h3>
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
            <Button variant="outline" className="w-full" disabled>Current Plan</Button>
          </Card>

          {/* Pro */}
          <Card className="p-6 border-bronze/50 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-bronze text-white border-0">Recommended</Badge>
            </div>
            <h3 className="font-vollkorn text-xl font-bold mb-1">Pro</h3>
            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-3xl font-bold">{userType === "brand" ? "$29.00" : "$7.99"}</span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-bronze mt-0.5 shrink-0" />
                  <span className="text-sm">{f}</span>
                </li>
              ))}
            </ul>
          <Button 
            onClick={handleUpgrade}
            disabled={isPaystackLoading || subscription !== 'free'}
            className="w-full bg-bronze hover:bg-bronze/90 text-white"
         >
            {isPaystackLoading ? "Processing..." : 
             subscription !== 'free' ? "Current Plan" : 
             "Upgrade Now"}
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
            <p className="text-muted-foreground/60 text-xs mt-1">Invoices will appear here once you subscribe to a plan</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentsBilling;
