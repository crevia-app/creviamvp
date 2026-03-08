import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import HeroPattern from "@/components/HeroPattern";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Pricing = () => {
  const [selectedType, setSelectedType] = useState<"creative" | "brand">("creative");

  const creativePlans = [
    {
      name: "Free",
      price: "$0",
      period: "",
      description: "Everything you need to start running your business.",
      features: [
        "Crevia Link (link-in-bio)",
        "Basic invoices & contracts",
        "Crevia Wallet",
        "Rate card builder",
        "Community support",
      ],
      cta: "Start Free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$14.99",
      period: "/mo",
      description: "For creatives who are ready to scale.",
      features: [
        "Everything in Free",
        "Kira AI — market-aware strategy",
        "Unlimited invoices, contracts & receipts",
        "Premium African-inspired themes",
        "Advanced analytics",
        "Remove Crevia branding",
        "Priority support",
      ],
      cta: "Go Pro",
      highlighted: true,
    },
  ];

  const brandPlans = [
    {
      name: "Free",
      price: "$0",
      period: "",
      description: "Start finding and working with creatives.",
      features: [
        "Creator discovery",
        "Basic campaign management",
        "Crevia Wallet for payments",
        "Standard support",
        "Basic analytics",
      ],
      cta: "Start Free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$19.99",
      period: "/mo",
      description: "For brands scaling creative operations.",
      features: [
        "Everything in Free",
        "Kira AI — creator matching & insights",
        "Unlimited campaigns",
        "Bulk payments & escrow",
        "Advanced analytics & ROI tracking",
        "Priority support",
        "Custom contract templates",
      ],
      cta: "Go Pro",
      highlighted: true,
    },
  ];

  const plans = selectedType === "creative" ? creativePlans : brandPlans;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-8 md:pb-12 px-4 md:px-6 overflow-hidden">
        <HeroPattern />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <p className="text-bronze font-poppins font-semibold text-sm tracking-widest uppercase mb-4 animate-fade-in">
            Pricing
          </p>
          <h1 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Simple pricing.{" "}
            <span className="text-gradient-bronze">Serious tools.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Start free. Upgrade when your business is ready for more power.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center p-1 bg-secondary rounded-full mb-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <button
              onClick={() => setSelectedType("creative")}
              className={`px-6 md:px-8 py-2.5 rounded-full font-poppins font-semibold text-sm transition-all ${
                selectedType === "creative"
                  ? "bg-bronze text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              For Creatives
            </button>
            <button
              onClick={() => setSelectedType("brand")}
              className={`px-6 md:px-8 py-2.5 rounded-full font-poppins font-semibold text-sm transition-all ${
                selectedType === "brand"
                  ? "bg-bronze text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              For Brands
            </button>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="pb-20 md:pb-28 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 md:p-10 transition-all duration-300 hover:shadow-xl ${
                  plan.highlighted
                    ? "border-2 border-bronze bg-gradient-to-br from-bronze/5 to-background shadow-lg"
                    : "border border-border bg-card"
                }`}
              >
                {plan.highlighted && (
                  <span className="inline-block bg-bronze text-white px-4 py-1 rounded-full text-xs font-poppins font-semibold mb-6 uppercase tracking-wider">
                    Recommended
                  </span>
                )}

                <h3 className="font-vollkorn text-2xl md:text-3xl font-bold mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="font-vollkorn text-5xl md:text-6xl font-bold">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground text-lg">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-3.5 mb-10">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-bronze flex-shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-vollkorn text-3xl md:text-4xl font-bold text-center mb-12">
            Questions? <span className="text-gradient-bronze">Answers.</span>
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "What's included in the free plan?",
                a: "Everything you need to start: Crevia Link, basic invoices & contracts, Crevia Wallet, and rate cards. No credit card required.",
              },
              {
                q: "Can I switch plans anytime?",
                a: "Yes. Upgrade, downgrade, or cancel anytime. Changes take effect on your next billing cycle.",
              },
              {
                q: "What payment methods do you accept?",
                a: "All major credit/debit cards and M-Pesa for African creatives.",
              },
              {
                q: "Is there a free trial for Pro?",
                a: "Yes — 14-day free trial on all Pro plans. No commitment.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="p-6 md:p-8 rounded-xl border border-border bg-card">
                <h3 className="font-vollkorn text-lg md:text-xl font-bold mb-2">{q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 md:py-28 px-4 md:px-6 overflow-hidden">
        <HeroPattern />
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Ready to <span className="text-gradient-bronze">own your story?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Start free today. No credit card. No friction.
          </p>
          <Link to="/auth">
            <Button
              size="lg"
              className="bg-bronze hover:bg-bronze-dark text-lg px-12 py-7 font-poppins font-semibold shadow-lg hover-scale"
            >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
