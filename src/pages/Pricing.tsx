import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles, Zap } from "lucide-react";
import HeroPattern from "@/components/HeroPattern";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const PLANS = (billingCycle: "monthly" | "yearly") => [
  {
    name: "Free",
    badge: null,
    priceMonthly: "KES 0",
    priceYearly: "KES 0",
    period: "",
    usd: null,
    description: "Everything you need to get started.",
    features: [
      "Crevia Link — basic templates",
      "10 Kira AI actions per day",
      "Unlimited bio links",
      "5 invoices per month",
      "5 contracts per month",
      "Standard chat interface",
      "Community support",
    ],
    cta: "Get Started",
    highlighted: false,
    planKey: null as "pro" | "business" | null,
    monthlyAmount: 0,
    yearlyAmount: 0,
  },
  {
    name: "Pro",
    badge: billingCycle === "yearly" ? "2 Months Free" : "Most Popular",
    priceMonthly: "KES 1,949",
    priceYearly: "KES 19,490",
    period: billingCycle === "monthly" ? "/mo" : "/yr",
    usd: billingCycle === "monthly" ? "$14.99/mo" : "$149.90/yr",
    description: "Advanced tools for serious creators and businesses.",
    features: [
      "Verified badge on your profile",
      "40 Kira AI actions per day",
      "Crevia Link — all premium themes",
      "Full visitor analytics",
      "Unlimited invoices & tracking",
      "Unlimited AI contract generation",
      "E-Signatures inside the app",
      "Client Portal access",
      "Priority support",
    ],
    cta: "Go Pro",
    highlighted: true,
    planKey: "pro" as const,
    monthlyAmount: 1949,
    yearlyAmount: 19490,
  },
  {
    name: "Business",
    badge: "For Teams",
    priceMonthly: "KES 3,899",
    priceYearly: "KES 38,990",
    period: billingCycle === "monthly" ? "/mo" : "/yr",
    usd: billingCycle === "monthly" ? "$29.99/mo" : "$299.90/yr",
    description: "Team workspaces, admin seats, and premium execution tools.",
    features: [
      "Everything in Pro",
      "3 admin seats included",
      "Additional seats at KES 999/seat",
      "Team workspaces",
      "Talent roster tracking",
      "Branded client room links",
      "Advanced team analytics",
      "Dedicated account support",
    ],
    cta: "Get Business",
    highlighted: false,
    planKey: "business" as const,
    monthlyAmount: 3899,
    yearlyAmount: 38990,
  },
  {
    name: "Enterprise",
    badge: null,
    priceMonthly: "Custom",
    priceYearly: "Custom",
    period: "",
    usd: null,
    description: "Custom limits, SSO, and a dedicated success team.",
    features: [
      "Everything in Business",
      "Unlimited admin seats",
      "Custom Kira AI action limits",
      "Single Sign-On (SSO)",
      "Custom integrations & API access",
      "SLA guarantee",
      "Dedicated success manager",
      "Custom onboarding",
    ],
    cta: "Contact Sales",
    highlighted: false,
    planKey: null as "pro" | "business" | null,
    monthlyAmount: 0,
    yearlyAmount: 0,
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPaystackLoading, setIsPaystackLoading] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
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
      currency: "KES",
      metadata: { plan: planKey, billing_cycle: billingCycle },
      callback: () => {
        navigate("/profile/payments-billing");
        setIsPaystackLoading(null);
      },
      onClose: () => setIsPaystackLoading(null),
    });
    handler.openIframe();
  };

  const plans = PLANS(billingCycle);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-8 md:pb-12 px-4 md:px-6 overflow-hidden">
        <HeroPattern />
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
              One platform. Every tool you need to run your creative business.
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
                      ? "border-2 border-bronze bg-gradient-to-br from-bronze/8 to-background shadow-lg shadow-bronze/10"
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

                  {plan.usd && (
                    <p className="text-xs text-muted-foreground font-poppins mb-1">{plan.usd}</p>
                  )}

                  <div className="mb-6 h-5">
                    {plan.highlighted && billingCycle === "yearly" && (
                      <p className="text-xs text-bronze font-poppins font-semibold">
                        Saves ~KES 3,898 vs monthly
                      </p>
                    )}
                    {plan.highlighted && billingCycle === "monthly" && (
                      <p className="text-xs text-muted-foreground font-poppins">
                        Switch to yearly and save 2 months
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, fi) => (
                      <motion.li
                        key={feature}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 + fi * 0.04 }}
                        className="flex items-start gap-2.5"
                      >
                        <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlighted ? "text-bronze" : "text-muted-foreground"}`} />
                        <span className="text-sm leading-relaxed">{feature}</span>
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
                    <a href="mailto:hello@crevia.app">
                      <Button
                        variant="outline"
                        className="w-full font-poppins font-semibold border-border hover:border-bronze/50 hover:bg-bronze/5"
                        size="lg"
                      >
                        <Zap className="mr-2 w-4 h-4" />
                        {plan.cta}
                      </Button>
                    </a>
                  ) : (
                    <Link to={isLoggedIn ? "/kira" : "/auth?mode=signup"}>
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
                a: "Yes. Upgrade, downgrade, or cancel at any time. Changes take effect on your next billing cycle.",
              },
              {
                q: "What payment methods do you accept?",
                a: "All major credit and debit cards, and M-Pesa for local payments across Africa.",
              },
              {
                q: "What is the Client Portal?",
                a: "A professional branded room link you can share with clients for a premium experience. Available on Pro and Business plans.",
              },
              {
                q: "How does the Business extra seat pricing work?",
                a: "Business includes 3 admin seats. Additional team members cost KES 999 per seat per month.",
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
            <Link to={isLoggedIn ? "/kira" : "/auth?mode=signup"}>
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
