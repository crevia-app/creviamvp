import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Pricing = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<"creator" | "brand">("creator");

  const creatorPlans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Everything you need to start",
      features: [
        "Crevia Link (link-in-bio)",
        "Basic invoices & contracts",
        "Crevia Wallet",
        "Rate card builder",
        "Community support",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For serious creators",
      features: [
        "Everything in Free",
        "Premium African themes",
        "Unlimited invoices & contracts",
        "Advanced analytics",
        "Kira AI assistant",
        "Priority support",
        "Remove Crevia branding",
      ],
      cta: "Upgrade to Pro",
      highlighted: true,
    },
    {
      name: "Business",
      price: "$79",
      period: "/month",
      description: "For creator businesses",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Custom contract templates",
        "API access",
        "Dedicated account manager",
        "White-label options",
        "Advanced integrations",
        "Priority everything",
      ],
      cta: "Go Business",
      highlighted: false,
    },
  ];

  const brandPlans = [
    {
      name: "Starter",
      price: "$49",
      period: "/month",
      description: "For small brands",
      features: [
        "Creator discovery",
        "Basic campaign management",
        "Crevia Wallet for payments",
        "Standard support",
        "Basic analytics",
      ],
      cta: "Start Free Trial",
      highlighted: false,
    },
    {
      name: "Growth",
      price: "$199",
      period: "/month",
      description: "For growing brands",
      features: [
        "Everything in Starter",
        "AI-powered creator matching",
        "Unlimited campaigns",
        "Bulk payments",
        "Advanced analytics",
        "Kira AI insights",
        "Priority support",
      ],
      cta: "Start Growth",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations",
      features: [
        "Everything in Growth",
        "Dedicated account manager",
        "Custom integrations",
        "White-label options",
        "Advanced reporting & ROI",
        "Custom contract templates",
        "Training & onboarding",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  const plans = selectedType === "creator" ? creatorPlans : brandPlans;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-6 md:mb-8 leading-tight">
            Tools to <span className="text-gradient-bronze">own your story</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 md:mb-10 leading-relaxed">
            {selectedType === "creator" 
              ? "Professional tools to run your creative business. Start free, upgrade when you're ready."
              : "Find and work with creators. Simple pricing, powerful tools."}
          </p>
          
          {/* User Type Toggle */}
          <div className="inline-flex items-center gap-2 p-1 bg-secondary/50 rounded-full mb-10 md:mb-12">
            <Button
              variant={selectedType === "creator" ? "default" : "ghost"}
              size="lg"
              onClick={() => setSelectedType("creator")}
              className={`rounded-full px-6 md:px-8 font-poppins font-semibold text-sm md:text-base transition-all ${
                selectedType === "creator" 
                  ? "bg-bronze hover:bg-bronze-dark text-white shadow-md" 
                  : "hover:bg-transparent"
              }`}
            >
              For Creators
            </Button>
            <Button
              variant={selectedType === "brand" ? "default" : "ghost"}
              size="lg"
              onClick={() => setSelectedType("brand")}
              className={`rounded-full px-6 md:px-8 font-poppins font-semibold text-sm md:text-base transition-all ${
                selectedType === "brand" 
                  ? "bg-bronze hover:bg-bronze-dark text-white shadow-md" 
                  : "hover:bg-transparent"
              }`}
            >
              For Brands
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 md:pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index}
                className={`p-8 md:p-10 relative transition-all duration-300 hover:shadow-2xl ${
                  plan.highlighted 
                    ? "border-bronze border-2 md:transform md:scale-105 shadow-xl bg-gradient-to-br from-bronze/5 to-background" 
                    : "border-border hover:-translate-y-1"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-bronze to-bronze-dark text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                      <Sparkles className="w-4 h-4" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="font-vollkorn text-2xl md:text-3xl font-bold mb-3">{plan.name}</h3>
                  <p className="text-muted-foreground text-base mb-6">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-vollkorn text-5xl md:text-6xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-lg">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-bronze flex-shrink-0 mt-0.5" />
                      <span className="text-base leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full font-poppins font-semibold text-base ${
                    plan.highlighted 
                      ? "bg-bronze hover:bg-bronze-dark" 
                      : "bg-secondary hover:bg-secondary/80 text-foreground"
                  }`}
                  size="lg"
                  onClick={() => navigate("/user-type-selection")}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 md:mb-16">
            Frequently Asked <span className="text-gradient-bronze">Questions</span>
          </h2>
          
          <div className="space-y-6">
            <Card className="p-6 md:p-8">
              <h3 className="font-vollkorn text-xl md:text-2xl font-bold mb-3">What's included in the free plan?</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Everything you need to start: Crevia Link, basic invoices & contracts, Crevia Wallet, and rate cards. Upgrade when you need more power.
              </p>
            </Card>

            <Card className="p-6 md:p-8">
              <h3 className="font-vollkorn text-xl md:text-2xl font-bold mb-3">Can I switch plans anytime?</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </Card>

            <Card className="p-6 md:p-8">
              <h3 className="font-vollkorn text-xl md:text-2xl font-bold mb-3">What payment methods do you accept?</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                We accept all major credit cards, debit cards, and M-Pesa for African creators.
              </p>
            </Card>

            <Card className="p-6 md:p-8">
              <h3 className="font-vollkorn text-xl md:text-2xl font-bold mb-3">Is there a free trial?</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                {selectedType === "creator" 
                  ? "Yes! Start free forever with our Free plan. Try Pro features with a 14-day free trial."
                  : "Yes! We offer a 14-day free trial for all paid plans. No credit card required to start."}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Ready to own your story?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
            Join thousands of {selectedType === "brand" ? "brands" : "creators"} building with Crevia
          </p>
          <Link to="/user-type-selection">
            <Button size="lg" className="bg-bronze hover:bg-bronze-dark text-lg px-12 py-7 font-poppins font-semibold shadow-lg hover-scale">
              Start Free Today
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
