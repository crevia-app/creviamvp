import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles, Zap } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import HeroPattern from "@/components/HeroPattern";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const fmt = (n: number) => n === 0 ? "$0" : `$${n % 1 === 0 ? n.toLocaleString() : n.toFixed(2)}`;

const DEFAULT_BUSINESS_PRICE = 74.99;

type PlanFeature = {
  product: string;
  detail: string;
  note?: string;
  lockNote?: string;
};

const PLANS = (billingCycle: "monthly" | "yearly", proPrice: number, businessPrice: number, enterprisePrice: number) => {
  const proYearly      = parseFloat((proPrice * 10).toFixed(2));
  const businessYearly = parseFloat((businessPrice * 10).toFixed(2));
  const entYearly      = parseFloat((enterprisePrice * 10).toFixed(2));
  return [
    {
      name: "Free",
      badge: null,
      priceMonthly: "$0",
      priceYearly: "$0",
      period: "",
      seatNote: null,
      description: "Start building your professional footprint.",
      features: [
        { product: "Dira AI", detail: "5 Daily Credits", note: "Refreshed daily" },
        { product: "Crevia Canvas", detail: "Unlimited document drafts", lockNote: "E-Signatures excluded" },
        { product: "Crevia Invoice", detail: "2 standard invoices / month", lockNote: "Customization excluded" },
        { product: "Crevia Workspace", detail: "0 Workspaces", lockNote: "Workspaces are a Pro feature" },
        { product: "Crevia Link", detail: "Core profile engine & basic themes", lockNote: "Analytics excluded" },
      ] as PlanFeature[],
      cta: "Get Started",
      highlighted: false,
      planKey: null as "pro" | "business" | null,
      monthlyAmount: 0,
      yearlyAmount: 0,
    },
    {
      name: "Pro Verified",
      badge: billingCycle === "yearly" ? "2 Months Free" : "Most Popular",
      priceMonthly: fmt(proPrice),
      priceYearly: fmt(proYearly),
      period: billingCycle === "monthly" ? "/mo" : "/yr",
      seatNote: null,
      description: "Scale your operations with an elite toolkit.",
      features: [
        { product: "Dira AI", detail: "500 Monthly Credits" },
        { product: "Crevia Canvas", detail: "Unlimited canvases + Unlimited E-Signatures" },
        { product: "Crevia Invoice", detail: "Unlimited customized invoices", note: "Remove branding, add your logo, add brand colors" },
        { product: "Crevia Workspace", detail: "10 Collaborative Workspaces / month", note: "Invite clients and collaborators natively" },
        { product: "Crevia Link", detail: "Premium themes, custom brand colors, and advanced visitor analytics" },
      ] as PlanFeature[],
      cta: "Go Pro",
      highlighted: true,
      planKey: "pro" as const,
      monthlyAmount: proPrice,
      yearlyAmount: proYearly,
    },
    {
      name: "Business Verified",
      badge: billingCycle === "yearly" ? "2 Months Free" : "For Teams",
      priceMonthly: fmt(businessPrice),
      priceYearly: fmt(businessYearly),
      period: billingCycle === "monthly" ? "/mo" : "/yr",
      seatNote: "+ $19.99 per additional seat",
      description: "Centralize your external team and client roster.",
      features: [
        { product: "Dira AI", detail: "Unlimited priority processing" },
        { product: "Crevia Canvas", detail: "Unlimited canvases + Unlimited E-Signatures" },
        { product: "Crevia Invoice", detail: "Unlimited invoices", note: "Removed branding, add your brand colors and logo" },
        { product: "Crevia Workspace", detail: "Unlimited Client & Project Workspaces with RBAC" },
        { product: "Crevia Link", detail: "Brand colors, logos, and advanced visitor analytics" },
        { product: "Support", detail: "Priority support" },
      ] as PlanFeature[],
      cta: "Get Business",
      highlighted: false,
      planKey: "business" as const,
      monthlyAmount: businessPrice,
      yearlyAmount: businessYearly,
    },
    {
      name: "Enterprise",
      badge: null,
      priceMonthly: enterprisePrice > 0 ? fmt(enterprisePrice) : "Custom",
      priceYearly: enterprisePrice > 0 ? fmt(entYearly) : "Custom",
      period: enterprisePrice > 0 ? (billingCycle === "monthly" ? "/mo" : "/yr") : "",
      seatNote: "Custom pricing",
      description: "Custom infrastructure for high-volume corporate networks.",
      features: [
        { product: "Architecture", detail: "Dedicated white-labeled infrastructure, custom domain mapping, direct API webhooks, and enterprise-grade SLA agreements" },
        { product: "Onboarding", detail: "Design your custom workspace layout", note: "hi@crevia.app" },
      ] as PlanFeature[],
      cta: "Contact Sales",
      highlighted: false,
      planKey: null as "pro" | "business" | null,
      monthlyAmount: enterprisePrice,
      yearlyAmount: entYearly,
    },
  ];
};

const Pricing = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPaystackLoading, setIsPaystackLoading] = useState<string | null>(null);
  const [proPrice, setProPrice]               = useState(14.99);
  const [businessPrice, setBusinessPrice]     = useState(DEFAULT_BUSINESS_PRICE);
  const [enterprisePrice, setEnterprisePrice] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
    (supabase.from("app_settings" as any) as any)
      .select("key, value")
      .in("key", ["plan_price_pro", "plan_price_business", "plan_price_enterprise"])
      .then(({ data }: { data: any[] | null }) => {
        if (!data) return;
        data.forEach(row => {
          const n = parseFloat(row.value);
          // Only accept values in a sensible USD range — guards against stale KES values in app_settings
          if (!isNaN(n) && n > 0 && n < 999) {
            if (row.key === "plan_price_pro")        setProPrice(n);
            if (row.key === "plan_price_business")   setBusinessPrice(n);
            if (row.key === "plan_price_enterprise") setEnterprisePrice(n);
          }
        });
      });
  }, []);

  const handleUpgrade = async (planKey: "pro" | "business", monthlyAmount: number, yearlyAmount: number) => {
    if (!isLoggedIn) { navigate("/auth"); return; }
    setIsPaystackLoading(planKey);

    const amount = billingCycle === "yearly" ? yearlyAmount : monthlyAmount;
    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email;
    if (!email) { setIsPaystackLoading(null); return; }

    const w = window as unknown as {
      PaystackPop: { setup: (opts: Record<string, unknown>) => { openIframe: () => void } }
    };
    const handler = w.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email,
      amount: amount * 100,
      currency: "USD",
      metadata: { plan: planKey, billing_cycle: billingCycle },
      callback: () => {
        navigate("/profile/payments-billing");
        setIsPaystackLoading(null);
      },
      onClose: () => setIsPaystackLoading(null),
    });
    handler.openIframe();
  };

  const plans = PLANS(billingCycle, proPrice, businessPrice, enterprisePrice);

  return (
    <div className="min-h-dvh bg-background page-bg-warm overflow-x-clip">
      <SEO
        title="Pricing"
        description="Simple, transparent pricing for businesses and creatives. Start free and upgrade when you're ready. Crevia Pro, Business, and Enterprise plans available."
        url="/pricing"
      />
      <Header />

      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-8 md:pb-12 px-4 md:px-6 overflow-hidden">
        <HeroPattern />
        <div className="container mx-auto max-w-5xl relative z-10 mb-4">
          <BackButton fallback="/" />
        </div>
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <ScrollReveal>
            <p className="text-bronze font-poppins font-semibold text-sm tracking-widest uppercase mb-4">
              Pricing
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <h1 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Simple pricing.{" "}
              <span className="text-gradient-bronze">Serious tools.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.16}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Pay for what moves your business forward. Nothing else.
            </p>
          </ScrollReveal>

          {/* Monthly / Yearly Toggle */}
          <ScrollReveal delay={0.22}>
            <div className="inline-flex items-center p-1 bg-secondary rounded-full">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 md:px-8 py-2.5 rounded-full font-poppins font-semibold text-xs sm:text-sm transition-all duration-300 ${
                  billingCycle === "monthly"
                    ? "bg-foreground text-background shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-5 md:px-8 py-2.5 rounded-full font-poppins font-semibold text-xs sm:text-sm transition-all duration-300 ${
                  billingCycle === "yearly"
                    ? "bg-foreground text-background shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly
              </button>
            </div>
            {billingCycle === "yearly" && (
              <p className="text-xs text-bronze font-poppins font-semibold mt-3">
                Save 2 months with yearly billing
              </p>
            )}
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 md:pb-28 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={billingCycle}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6"
            >
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.08 * i, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={`relative flex flex-col rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-xl ${
                    plan.highlighted
                      ? "border-gradient-bronze bg-gradient-to-br from-bronze/8 to-background shadow-lg shadow-bronze/10"
                      : plan.name === "Business"
                        ? "border-gradient-bronze bg-card"
                        : "border border-border bg-card"
                  }`}
                >
                  {plan.badge && (
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-poppins font-semibold mb-5 uppercase tracking-wider w-fit ${
                      plan.highlighted
                        ? "bg-bronze text-white"
                        : "bg-secondary text-muted-foreground"
                    }`}>
                      {plan.highlighted && <Sparkles className="w-3 h-3" />}
                      {plan.badge}
                    </span>
                  )}

                  {!plan.badge && <div className="mb-8" />}

                  <h3 className="font-vollkorn text-2xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{plan.description}</p>

                  <div className="mb-1">
                    <span className="font-vollkorn text-4xl md:text-5xl font-bold">
                      {billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground text-base ml-1">{plan.period}</span>
                    )}
                  </div>

                  {plan.name === "Business Verified" && (
                    <p className="text-xs text-muted-foreground font-poppins mb-0.5">Includes 3 seats</p>
                  )}
                  {plan.seatNote && (
                    <p className="text-xs text-muted-foreground font-poppins mb-1">{plan.seatNote}</p>
                  )}

                  <div className="mb-6 h-5">
                    {billingCycle === "yearly" && (plan.planKey === "pro" || plan.planKey === "business") && (
                      <p className="text-xs text-bronze font-poppins font-semibold">
                        2 months free vs monthly
                      </p>
                    )}
                    {billingCycle === "monthly" && (plan.planKey === "pro" || plan.planKey === "business") && (
                      <p className="text-xs text-muted-foreground font-poppins">
                        Switch to yearly and save 2 months
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f, fi) => (
                      <motion.li
                        key={f.product}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 + fi * 0.04 }}
                        className="flex items-start gap-2.5"
                      >
                        <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlighted ? "text-bronze" : "text-muted-foreground"}`} />
                        <span className="text-sm leading-relaxed">
                          <span className="font-medium text-foreground">{f.product}:</span>{" "}
                          {f.detail}
                          {f.note && <span className="text-muted-foreground text-xs"> · {f.note}</span>}
                          {f.lockNote && <span className="text-muted-foreground/70 text-xs italic"> ({f.lockNote})</span>}
                        </span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {plan.planKey ? (
                    <Button
                      onClick={() => handleUpgrade(plan.planKey!, plan.monthlyAmount, plan.yearlyAmount)}
                      disabled={isPaystackLoading !== null}
                      className={`w-full font-poppins font-semibold ${
                        plan.highlighted
                          ? "bg-bronze hover:bg-bronze-dark text-white"
                          : "bg-secondary hover:bg-secondary/80 text-foreground"
                      }`}
                      size="lg"
                    >
                      {isPaystackLoading === plan.planKey ? (
                        "Processing..."
                      ) : (
                        <>{plan.cta} <ArrowRight className="ml-2 w-4 h-4" /></>
                      )}
                    </Button>
                  ) : plan.name === "Enterprise" ? (
                    <a href="mailto:hi@crevia.app">
                      <Button
                        variant="outline"
                        className="w-full font-poppins font-semibold btn-ghost-bronze"
                        size="lg"
                      >
                        <Zap className="mr-2 w-4 h-4" />
                        {plan.cta}
                      </Button>
                    </a>
                  ) : (
                    <Link to={isLoggedIn ? "/dira" : "/auth?mode=signup"}>
                      <Button
                        className="w-full font-poppins font-semibold bg-secondary hover:bg-secondary/80 text-foreground"
                        size="lg"
                      >
                        {plan.cta} <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-secondary/30 section-tint-warm">
        <div className="container mx-auto max-w-3xl">
          <ScrollReveal>
            <h2 className="font-vollkorn text-3xl md:text-4xl font-bold text-center mb-12">
              Questions? <span className="text-gradient-bronze">Answers.</span>
            </h2>
          </ScrollReveal>
          <div className="space-y-6">
            {[
              {
                q: "What's included in the free plan?",
                a: "Crevia Link with basic templates, 5 Dira AI actions per day, 2 invoices per month, and unlimited Canvas drafts. No credit card required.",
              },
              {
                q: "Can I switch plans anytime?",
                a: "Yes. Upgrade, downgrade, or cancel at any time. Changes take effect on your next billing cycle.",
              },
              {
                q: "What payment methods do you accept?",
                a: "All major credit and debit cards, and M-Pesa for local payments across Africa.",
              },
              {
                q: "What happens to my data if I downgrade?",
                a: "Your data is always safe. You retain access to everything you created — new activity is simply limited to your new plan's limits.",
              },
              {
                q: "What is Enterprise?",
                a: "Enterprise is a custom plan for organisations that need SSO, dedicated support, custom API limits, and an SLA. Reach out and we'll build a plan around your needs.",
              },
            ].map(({ q, a }, i) => (
              <ScrollReveal key={q} delay={i * 0.06}>
                <div className="p-5 md:p-8 rounded-xl border border-border bg-card">
                  <h3 className="font-vollkorn text-lg md:text-xl font-bold mb-2">{q}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 md:py-28 px-4 md:px-6 overflow-hidden">
        <HeroPattern />
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <ScrollReveal variant="blur">
            <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Ready to <span className="text-gradient-bronze">own your story?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Start free today. No credit card. No friction.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.15} variant="scale">
            <Link to={isLoggedIn ? "/dira" : "/auth?mode=signup"}>
              <Button
                size="lg"
                className="bg-bronze hover:bg-bronze-dark text-lg px-12 py-7 font-poppins font-semibold shadow-lg hover-scale"
              >
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
