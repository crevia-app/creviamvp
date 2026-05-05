import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import HeroPattern from "@/components/HeroPattern";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const Pricing = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<"creative" | "brand">("creative");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [isPaystackLoading, setIsPaystackLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      setIsLoggedIn(true);
      supabase.from("profiles").select("user_type").eq("id", session.user.id).single()
        .then(({ data }) => setUserType(data?.user_type || null));
    });
  }, []);

  const handleUpgrade = async (planType: "creative" | "brand") => {
    if (!isLoggedIn) { navigate("/auth"); return; }
    setIsPaystackLoading(true);

    const plan = planType === "brand" ? "brand_workspace" : "creative_pro";
    const monthlyAmount = planType === "brand" ? 2900 : 799;
    const yearlyAmount = planType === "brand" ? 29000 : 7990;
    const amount = billingCycle === "yearly" ? yearlyAmount : monthlyAmount;

    const { data: { user } } = await supabase.auth.getUser();
    const email = user?.email;
    if (!email) { setIsPaystackLoading(false); return; }

    const w = window as unknown as {
      PaystackPop: { setup: (opts: Record<string, unknown>) => { openIframe: () => void } }
    };
    const handler = w.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email,
      amount: amount * 100, // Paystack KES uses kobo: KES 799 → 79900
      currency: "KES",
      metadata: { plan, billing_cycle: billingCycle },
      callback: (_response: { reference: string }) => {
        navigate("/profile/payments-billing");
        setIsPaystackLoading(false);
      },
      onClose: () => setIsPaystackLoading(false),
    });
    handler.openIframe();
  };

  const creativePlans = [
    {
      name: "Free",
      priceMonthly: "KES 0",
      priceYearly: "KES 0",
      period: "",
      description: "Everything you need to get started as a creative.",
      features: [
        "Crevia Link-basic templates",
        "10 Kira Ai actions per day",
        "Unlimited bio links",
        "5 invoices per month",
        "5 contracts per month",
        "Standard chat interface",
        "Community support",
      ],
      cta: "Start Free",
      highlighted: false,
      badge: null,
      planType: null,
    },
    {
      name: "Creative Pro",
      priceMonthly: "KES 799",
      priceYearly: "KES 7,990",
      period: billingCycle === "monthly" ? "/mo" : "/yr",
      description: "For creatives who are ready to scale in their business.",
      features: [
        "Verified badge on your Profile",
        "40 Kira AI actions per day",
        "Crevia Link - all premium themes",
        "Full visitor analytics",
        "Unlimited invoices & tracking",
        "Unlimited AI contract generation",
        "E-Signatures inside the app",
        "Client Portal access",
        "Priority Support",
      ],
      cta: "Go Pro",
      highlighted: true,
      badge: billingCycle === "yearly" ? "2 Months Free" : "Most Popular",
      planType: "creative" as const,
    },
  ];

  const brandPlans = [
    {
      name: "Free",
      priceMonthly: "KES 0",
      priceYearly: "KES 0",
      period: "",
      description: "Start discovering and working with creatives.",
      features: [
        "Basic access to creatives",
        "Limited chat usage",
        "Limited project interactions",
        "Standard support",
        "Basic analytics",
      ],
      cta: "Start Free",
      highlighted: false,
      badge: null,
      planType: null,
    },
    {
      name: "Brand Workspace",
      priceMonthly: "KES 2,900",
      priceYearly: "KES 29,000",
      period: billingCycle === "monthly" ? "/mo" : "/yr",
      description: "For brands scaling creative operations.",
      features: [
        "3 admin seats included",
        "KES 999 per extra seat",
        "Verified badge on your profile",
        "40 Kira AI actions per day",
        "Unlimited talent roster tracking",
        "Crevia Link - all premium themes + analytics",
        "Client Portal - branded room links",
        "Unlimited invoices & contracts",
        "E-Signatures inside the app",
        "Priority support",
      ],
      cta: "Get Workspace",
      highlighted: true,
      badge: billingCycle === "yearly" ? "2 Months Free" : "Most Popular",
      planType: "brand" as const,
    },
  ];

  const plans = selectedType === "creative" ? creativePlans : brandPlans;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-8 md:pb-12 px-4 md:px-6 overflow-hidden">
        <HeroPattern />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
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
              Start free. Upgrade when your business is ready for more power.
            </p>
          </ScrollReveal>

          {/* Creative / Brand Toggle */}
          <ScrollReveal delay={0.24}>
            <div className="inline-flex items-center p-1 bg-secondary rounded-full mb-6">
              <button
                onClick={() => setSelectedType("creative")}
                className={`px-4 sm:px-6 md:px-8 py-2.5 rounded-full font-poppins font-semibold text-xs sm:text-sm transition-all duration-300 ${
                  selectedType === "creative"
                    ? "bg-bronze text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                For Creatives
              </button>
              <button
                onClick={() => setSelectedType("brand")}
                className={`px-4 sm:px-6 md:px-8 py-2.5 rounded-full font-poppins font-semibold text-xs sm:text-sm transition-all duration-300 ${
                  selectedType === "brand"
                    ? "bg-bronze text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                For Brands
              </button>
            </div>

            {/* Monthly / Yearly Toggle */}
            <div className="block">
              <div className="inline-flex items-center p-1 bg-secondary rounded-full">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-3 sm:px-5 md:px-6 py-2 rounded-full font-poppins font-semibold text-[11px] sm:text-xs transition-all duration-300 ${
                    billingCycle === "monthly"
                      ? "bg-foreground text-background shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-3 sm:px-5 md:px-6 py-2 rounded-full font-poppins font-semibold text-[11px] sm:text-xs transition-all duration-300 ${
                    billingCycle === "yearly"
                      ? "bg-foreground text-background shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Yearly
                </button>
              </div>
              {billingCycle === "yearly" && (
                <p className="text-xs text-bronze font-poppins font-semibold mt-2">
                  🎉 Save 2 months with yearly billing
                </p>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Cards */}
      <section className="pb-20 md:pb-28 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedType + billingCycle}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8"
            >
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * i, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={`rounded-2xl p-5 sm:p-7 md:p-8 lg:p-10 transition-all duration-300 hover:shadow-xl ${
                    plan.highlighted
                      ? "border-2 border-bronze bg-gradient-to-br from-bronze/5 to-background shadow-lg"
                      : "border border-border bg-card"
                  }`}
                >
                  {plan.badge && (
                    <span className="inline-flex items-center gap-1 bg-bronze text-white px-4 py-1 rounded-full text-xs font-poppins font-semibold mb-6 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" />
                      {plan.badge}
                    </span>
                  )}

                  <h3 className="font-vollkorn text-2xl md:text-3xl font-bold mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-vollkorn text-4xl sm:text-5xl md:text-6xl font-bold">
                      {billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground text-lg">{plan.period}</span>
                    )}
                  </div>

                  {/* Yearly savings note */}
                  {plan.highlighted && billingCycle === "yearly" && (
                    <p className="text-xs text-bronze font-poppins mb-6">
                      {selectedType === "creative" ? "Saves ~KES 1,598 vs monthly" : "Saves ~KES 5,800 vs monthly"}
                    </p>
                  )}
                  {plan.highlighted && billingCycle === "monthly" && (
                    <p className="text-xs text-muted-foreground font-poppins mb-6">
                      Switch to yearly and save 2 months
                    </p>
                  )}
                  {!plan.highlighted && <div className="mb-6" />}

                  <ul className="space-y-2 sm:space-y-3 md:space-y-3.5 mb-8 sm:mb-10">
                    {plan.features.map((feature, fi) => (
                      <motion.li
                        key={feature}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 + fi * 0.04 }}
                        className="flex items-start gap-2 sm:gap-3"
                      >
                        <Check className="w-5 h-5 text-bronze flex-shrink-0 mt-0.5" />
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {plan.planType ? (
                    <Button
                      onClick={() => handleUpgrade(plan.planType!)}
                      disabled={isPaystackLoading}
                      className={`w-full font-poppins font-semibold ${
                        plan.highlighted
                          ? "bg-bronze hover:bg-bronze-dark"
                          : "bg-secondary hover:bg-secondary/80 text-foreground"
                      }`}
                      size="lg"
                    >
                      {isPaystackLoading ? "Processing..." : plan.cta}
                      {!isPaystackLoading && <ArrowRight className="ml-2 w-4 h-4" />}
                    </Button>
                  ) : (
                    <Link to="/auth">
                      <Button
                        className={`w-full font-poppins font-semibold ${
                          plan.highlighted
                            ? "bg-bronze hover:bg-bronze-dark"
                            : "bg-secondary hover:bg-secondary/80 text-foreground"
                        }`}
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
      <section className="py-16 md:py-24 px-4 md:px-6 bg-secondary/30">
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
                a: "Crevia Link with basic templates, 10 Kira AI actions per day, 5 invoices and 5 contracts per month. No credit card required.",
              },
              {
                q: "Can I switch plans anytime?",
                a: "Yes. Upgrade, downgrade, or cancel anytime. Changes take effect on your next billing cycle.",
              },
              {
                q: "What payment methods do you accept?",
                a: "All major credit/debit cards and M-Pesa for African creatives and brands.",
              },
              {
                q: "What is the Client Portal?",
                a: "A professional branded room link you can send to clients for a premium experience. Available on Pro and Brand Workspace plans.",
              },
              {
                q: "How does the Brand Workspace extra seat pricing work?",
                a: "The Brand Workspace includes 3 admin seats. You can add more team members at KES 999 per extra seat per month.",
              },
              {
                q: "What happens to my data if I downgrade?",
                a: "Your data is safe. You keep access to everything you created but new creations will be limited to free plan limits.",
              },
            ].map(({ q, a }, i) => (
              <ScrollReveal key={q} delay={i * 0.06}>
                <div className="p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl border border-border bg-card">
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
            <Link to="/auth">
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
