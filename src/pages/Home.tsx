import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, FileText, Link2, MessageCircle, Receipt, Shield } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroPattern from "@/components/HeroPattern";
import ScrollReveal from "@/components/ui/ScrollReveal";
import TestimonialMarquee from "@/components/TestimonialMarquee";
import { supabase } from "@/integrations/supabase/client";

const Home = () => {
  const navigate = useNavigate();

  const handleAuthGatedClick = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth?mode=signup");
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative pt-28 md:pt-40 pb-20 md:pb-32 px-4 md:px-6 min-h-[90vh] flex items-center overflow-hidden">
        <HeroPattern spotlight />
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="max-w-3xl space-y-6 md:space-y-8">
            <ScrollReveal delay={0}>
              <p className="text-bronze font-poppins font-semibold text-sm md:text-base tracking-widest uppercase">
                Own Your Story
              </p>
            </ScrollReveal>
            {/* variant="hero" — larger 40px travel, no blur, clean typographic entrance */}
            <ScrollReveal delay={0.12} variant="hero" duration={0.8}>
              <h1 className="font-vollkorn text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-bold leading-[1.08]">
                The operating system for the{" "}
                <span className="text-gradient-bronze">creative industry.</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.26}>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-poppins leading-relaxed max-w-2xl">
                Crevia gives creatives and brands the intelligence, tools, and
                infrastructure to build scalable businesses — not just content.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.38}>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/auth?mode=signup" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-bronze hover:bg-bronze-dark text-sm sm:text-base md:text-lg px-6 sm:px-10 py-5 sm:py-7 font-poppins font-semibold shadow-lg hover-scale"
                  >
                    Start Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/pricing" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto text-sm sm:text-base md:text-lg px-6 sm:px-10 py-5 sm:py-7 font-poppins font-semibold border-2 border-bronze/30 hover:border-bronze hover:bg-bronze/10 transition-premium"
                  >
                    See Pricing
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ THE PROBLEM ═══════════════ */}
      <section className="py-20 md:py-28 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <ScrollReveal variant="hero">
            <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Creatives aren't broke.{" "}
              <span className="text-gradient-bronze">They're under-tooled.</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.12}>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              You don't need another content calendar. You need an operating system —
              one place to price, scope, invoice, contract, communicate, and get paid.
              That's Crevia.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <TestimonialMarquee />

      {/* ═══════════════ TWO LAYERS ═══════════════ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 md:mb-20">
            <ScrollReveal>
              <p className="text-bronze font-poppins font-semibold text-sm tracking-widest uppercase mb-4">
                How It Works
              </p>
              <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold">
                Two layers. <span className="text-gradient-bronze">One system.</span>
              </h2>
            </ScrollReveal>
          </div>

          {/* KIRA */}
          <ScrollReveal variant="fade-up" className="mb-20 md:mb-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
              <div className="space-y-6 lg:col-span-2 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bronze/10 border border-bronze/20">
                  <Brain className="w-4 h-4 text-bronze" />
                  <span className="text-bronze font-poppins font-semibold text-sm">
                    The Intelligence Layer
                  </span>
                </div>
                <h3 className="font-vollkorn text-3xl md:text-4xl font-bold leading-tight">
                  Meet Kira.{" "}
                  <span className="text-gradient-bronze">Think sharper.</span>
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Kira brings African market intelligence into your business logic.
                  No copy-pasted global playbooks — real data on pricing, scoping, and
                  structuring deals that make sense for your market.
                </p>
                <ul className="space-y-3">
                  {[
                    "Market-aware pricing suggestions",
                    "Scope & structure recommendations",
                    "Campaign strategy powered by local data",
                  ].map((item, i) => (
                    <ScrollReveal key={item} delay={0.08 * i} variant="fade-left">
                      <li className="flex items-center gap-3 text-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-bronze flex-shrink-0" />
                        <span className="font-poppins">{item}</span>
                      </li>
                    </ScrollReveal>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollReveal>

          {/* STUDIO */}
          <ScrollReveal variant="fade-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
              <div className="space-y-6 lg:col-span-2 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bronze/10 border border-bronze/20">
                  <FileText className="w-4 h-4 text-bronze" />
                  <span className="text-bronze font-poppins font-semibold text-sm">
                    The Operations Layer
                  </span>
                </div>
                <h3 className="font-vollkorn text-3xl md:text-4xl font-bold leading-tight">
                  Crevia Studio.{" "}
                  <span className="text-gradient-bronze">Run everything.</span>
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Links, contracts, invoices, and communication — all moving in one flow.
                  For creatives, it turns individuals into companies. For brands,
                  it turns chaos into structured creative operations.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-md">
                  {[
                    { icon: Link2, label: "Crevia Link" },
                    { icon: MessageCircle, label: "Crevia Chat" },
                    { icon: Receipt, label: "Invoices & Receipts" },
                    { icon: Shield, label: "Contracts" },
                  ].map(({ icon: Icon, label }, i) => (
                    <ScrollReveal key={label} delay={0.06 * i} variant="scale">
                      <button
                        onClick={handleAuthGatedClick}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:bg-bronze/5 card-bronze-glow text-left cursor-pointer"
                      >
                        <Icon className="w-5 h-5 text-bronze flex-shrink-0 transition-premium group-hover:scale-110" />
                        <span className="font-poppins text-sm font-medium">{label}</span>
                      </button>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════ FOR WHO ═══════════════ */}
      <section className="py-20 md:py-28 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal className="text-center mb-14 md:mb-20">
            <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold">
              Built for people who{" "}
              <span className="text-gradient-bronze">build things.</span>
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <ScrollReveal delay={0} variant="fade-up">
              <div className="p-5 sm:p-7 md:p-8 lg:p-10 rounded-2xl border border-border bg-card hover:border-bronze/30 card-interactive space-y-6 h-full">
                <p className="text-bronze font-poppins font-semibold text-sm tracking-widest uppercase">
                  For Creatives
                </p>
                <h3 className="font-vollkorn text-2xl md:text-3xl font-bold">
                  Stop freelancing. Start building a company.
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  You're not "just a creator." You're a business. Crevia gives you
                  the invoices, contracts, link-in-bio, and AI strategy to prove it —
                  to clients, to brands, and to yourself.
                </p>
                <Link to="/auth?mode=signup">
                  <Button className="bg-bronze hover:bg-bronze-dark font-poppins font-semibold mt-2">
                    Start Free <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.12} variant="fade-up">
              <div className="p-5 sm:p-7 md:p-8 lg:p-10 rounded-2xl border border-border bg-card hover:border-bronze/30 card-interactive space-y-6 h-full">
                <p className="text-bronze font-poppins font-semibold text-sm tracking-widest uppercase">
                  For Brands
                </p>
                <h3 className="font-vollkorn text-2xl md:text-3xl font-bold">
                  Turn creative chaos into structured operations.
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Finding creatives is easy. Managing campaigns, contracts, payments,
                  and deliverables at scale? That's where Crevia comes in. One platform.
                  Zero chaos.
                </p>
                <Link to="/auth?mode=signup">
                  <Button className="bg-bronze hover:bg-bronze-dark font-poppins font-semibold mt-2">
                    Start Free <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="relative py-20 md:py-32 px-4 md:px-6 overflow-hidden">
        <HeroPattern />
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <ScrollReveal variant="blur">
            <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Your story deserves{" "}
              <span className="text-gradient-bronze">better infrastructure.</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.12}>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Join the creatives and brands building real businesses on Crevia.
              Start free. Scale when you're ready.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.24} variant="scale">
            <Link to="/auth?mode=signup" className="w-full sm:w-auto inline-block">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-bronze hover:bg-bronze-dark text-sm sm:text-base md:text-lg px-6 sm:px-10 md:px-12 py-5 sm:py-7 font-poppins font-semibold shadow-lg hover-scale"
              >
                Own Your Story <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
