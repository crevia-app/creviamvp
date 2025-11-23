import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const Pricing = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserType();
  }, []);

  const checkUserType = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", session.user.id)
        .single();
      
      setUserType(profile?.user_type || null);
    }
    setLoading(false);
  };

  const creatorPlans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "Basic creator profile",
        "Apply to up to 3 campaigns/month",
        "Access to Crevia Link",
        "Community support",
        "Basic analytics",
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
        "Unlimited campaign applications",
        "Priority listing in search",
        "Advanced analytics & insights",
        "Kira AI recommendations",
        "Verified badge",
        "Premium support",
      ],
      cta: "Upgrade to Pro",
      highlighted: true,
    },
    {
      name: "Elite",
      price: "$99",
      period: "/month",
      description: "For top-tier creators",
      features: [
        "Everything in Pro",
        "Dedicated account manager",
        "Featured in brand searches",
        "Early access to campaigns",
        "Personalized brand matching",
        "Portfolio review & optimization",
        "Direct brand outreach",
        "Exclusive networking events",
      ],
      cta: "Go Elite",
      highlighted: false,
    },
  ];

  const brandPlans = [
    {
      name: "Starter",
      price: "$49",
      period: "/month",
      description: "Perfect for small brands",
      features: [
        "Post up to 2 campaigns/month",
        "Access to creator discovery",
        "Basic campaign management",
        "Standard support",
        "Campaign analytics",
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
        "Unlimited campaigns",
        "AI-powered creator matching",
        "Advanced campaign workspace",
        "Priority creator access",
        "Verified brand badge",
        "Kira AI insights",
        "Premium support",
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
        "Custom integration support",
        "White-label options",
        "Bulk creator outreach",
        "Advanced reporting & ROI",
        "Custom contract templates",
        "Training & onboarding",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  const plans = userType === "creator" ? creatorPlans : userType === "brand" ? brandPlans : creatorPlans;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 pt-32 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-20 px-6 md:px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-6 md:mb-8 leading-tight">
            Simple, <span className="text-gradient-bronze">Transparent</span> Pricing
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 md:mb-10 leading-relaxed">
            {userType === "creator" 
              ? "Choose the plan that fits your creator journey"
              : userType === "brand"
              ? "Find the perfect plan to connect with creators"
              : "Choose the plan that fits your needs"}
          </p>
          
          {!userType && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 md:mb-12 max-w-md mx-auto">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setUserType("creator")}
                className="w-full sm:w-auto font-poppins font-semibold text-base py-6"
              >
                I'm a Creator
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setUserType("brand")}
                className="w-full sm:w-auto font-poppins font-semibold text-base py-6"
              >
                I'm a Brand
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 md:pb-20 px-6 md:px-6">
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
      <section className="py-16 md:py-20 px-6 md:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 md:mb-16">
            Frequently Asked <span className="text-gradient-bronze">Questions</span>
          </h2>
          
          <div className="space-y-6">
            <Card className="p-6 md:p-8">
              <h3 className="font-vollkorn text-xl md:text-2xl font-bold mb-3">Can I switch plans anytime?</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </Card>

            <Card className="p-6 md:p-8">
              <h3 className="font-vollkorn text-xl md:text-2xl font-bold mb-3">What payment methods do you accept?</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                We accept all major credit cards, debit cards, and digital payment methods including mobile money for African creators.
              </p>
            </Card>

            <Card className="p-6 md:p-8">
              <h3 className="font-vollkorn text-xl md:text-2xl font-bold mb-3">Is there a free trial?</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                {userType === "creator" 
                  ? "Yes! All creators start with our Free plan. You can try Pro features with a 14-day free trial."
                  : "Yes! We offer a 14-day free trial for all paid plans. No credit card required to start."}
              </p>
            </Card>

            <Card className="p-6 md:p-8">
              <h3 className="font-vollkorn text-xl md:text-2xl font-bold mb-3">Can I cancel my subscription?</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-6 md:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Ready to get started?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
            Join thousands of {userType === "brand" ? "brands" : "creators"} already using Crevia
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