import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, FileText, Link2, MessageCircle, Receipt, Shield, Monitor, X } from "lucide-react";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroPattern from "@/components/HeroPattern";
import ScrollReveal from "@/components/ui/ScrollReveal";
import TestimonialMarquee from "@/components/TestimonialMarquee";
import { supabase } from "@/integrations/supabase/client";
import gallery1 from "@/assets/about-gallery-1.jpg";
import gallery2 from "@/assets/about-gallery-2.jpg";
import gallery3 from "@/assets/about-gallery-3.jpg";
import gallery4 from "@/assets/about-gallery-4.jpg";
import connectHero from "@/assets/crevia-connect-hero.jpg";

const galleryImages = [gallery1, gallery2, gallery3, gallery4, connectHero];

const OPS_CARDS = [
  { icon: Link2,         label: "Crevia Link",         path: "/crevia-studio" },
  { icon: MessageCircle, label: "Crevia Chat",          path: "/crevia-studio" },
  { icon: Receipt,       label: "Invoices & Receipts",  path: "/crevia-invoice" },
  { icon: Shield,        label: "Canvas",               path: "/crevia-contracts" },
];

const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [installDismissed, setInstallDismissed] = useState(false);
  const { canInstall, install } = usePWAInstall();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setIsLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  const handleOpsClick = async (path: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    navigate(session ? path : `/auth?mode=signup&redirect=${encodeURIComponent(path)}`);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative pt-28 md:pt-40 pb-20 md:pb-32 px-4 md:px-6 min-h-[90vh] flex items-center overflow-hidden">
        <HeroPattern />
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
                <Link to={isLoggedIn ? "/kira" : "/auth?mode=signup"} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-bronze hover:bg-bronze-dark text-sm sm:text-base md:text-lg px-6 sm:px-10 py-5 sm:py-7 font-poppins font-semibold shadow-lg hover-scale"
                  >
                    {isLoggedIn ? "Own Your Story" : "Start Free"} <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                {!isLoggedIn && (
                  <Link to="/pricing" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto text-sm sm:text-base md:text-lg px-6 sm:px-10 py-5 sm:py-7 font-poppins font-semibold border-2 border-bronze/30 hover:border-bronze hover:bg-bronze/10 transition-premium"
                    >
                      See Pricing
                    </Button>
                  </Link>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* PWA install banner — first-time visitors only */}
        {canInstall && !installDismissed && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
            <div className="flex items-center gap-2.5 bg-background/90 backdrop-blur-md border border-bronze/30 rounded-xl px-3 py-2 shadow-lg">
              <div className="w-7 h-7 rounded-lg bg-bronze/10 flex items-center justify-center flex-shrink-0">
                <Monitor className="w-3.5 h-3.5 text-bronze" />
              </div>
              <div className="leading-tight">
                <p className="text-[11px] font-semibold font-poppins">Install Crevia</p>
                <p className="text-[10px] text-muted-foreground font-poppins">Add to your home screen</p>
              </div>
              <Button
                size="sm"
                onClick={install}
                className="h-7 px-3 bg-bronze hover:bg-bronze-dark text-background text-[11px] font-poppins font-semibold"
              >
                Install
              </Button>
              <button
                onClick={() => setInstallDismissed(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════ PHOTO GALLERY MARQUEE ═══════════════ */}
      <section className="relative w-full py-6 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 w-24 md:w-36 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, hsl(var(--background)) 0%, transparent 100%)" }}
        />
        <div
          className="absolute inset-y-0 right-0 w-24 md:w-36 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, hsl(var(--background)) 0%, transparent 100%)" }}
        />
        <div className="flex animate-scroll-left" style={{ width: "max-content", gap: "16px" }}>
          {[...galleryImages, ...galleryImages, ...galleryImages].map((src, i) => (
            <div
              key={i}
              className="relative flex-shrink-0 w-52 h-36 md:w-72 md:h-48 rounded-xl overflow-hidden border border-border/40"
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
                draggable={false}
              />
            </div>
          ))}
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
              one place to price, scope, invoice, build Canvas, communicate, and get paid.
              That's Crevia.
            </p>
          </ScrollReveal>
        </div>
      </section>

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
                  Links, Canvas, invoices, and communication — all moving in one flow.
                  For creatives, it turns individuals into companies. For brands,
                  it turns chaos into structured creative operations.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-md">
                  {OPS_CARDS.map(({ icon: Icon, label, path }, i) => (
                    <ScrollReveal key={label} delay={0.06 * i} variant="scale">
                      <button
                        onClick={() => handleOpsClick(path)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:bg-bronze/5 card-bronze-glow text-left cursor-pointer"
                      >
                        <Icon className="w-5 h-5 text-bronze flex-shrink-0" />
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

      <TestimonialMarquee />

      {/* ═══════════════ FOR WHO ═══════════════ */}
      <section className="py-20 md:py-28 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <ScrollReveal className="text-center mb-14 md:mb-20">
            <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold">
              Built for people who{" "}
              <span className="text-gradient-bronze">build things.</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0} variant="fade-up">
            <div className="p-8 sm:p-10 md:p-12 rounded-2xl border border-border bg-card hover:border-bronze/30 card-interactive">
              <div className="max-w-3xl space-y-6">
                <p className="text-bronze font-poppins font-semibold text-sm tracking-widest uppercase">
                  One platform. Every workflow.
                </p>
                <h3 className="font-vollkorn text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                  The operating system for the creative economy.
                </h3>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                  The creative economy is worth trillions — yet the infrastructure supporting
                  it has barely evolved. Creatives still chase invoices over WhatsApp. Canvas
                  get lost in email threads. Payments stall in trust gaps. Crevia changes that.
                </p>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                  We built a single, structured workspace where creative professionals run
                  their business with the same rigour as any high-growth company — professional
                  invoicing, legally binding Canvas, secure escrow payments, a public link
                  profile that speaks for them, and end-to-end encrypted client collaboration.
                  Everything connected. Nothing scattered.
                </p>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                  Whether you're a solo creator turning a craft into a career, or a company
                  coordinating campaigns across dozens of talents, Crevia gives you the tools,
                  the clarity, and the credibility to operate at your best — from first brief
                  to final payment.
                </p>
              </div>
            </div>
          </ScrollReveal>
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
            <Link to={isLoggedIn ? "/kira" : "/auth?mode=signup"} className="w-full sm:w-auto inline-block">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-bronze hover:bg-bronze-dark text-sm sm:text-base md:text-lg px-6 sm:px-10 md:px-12 py-5 sm:py-7 font-poppins font-semibold shadow-lg hover-scale"
              >
                {isLoggedIn ? "Open Crevia" : "Own Your Story"} <ArrowRight className="ml-2 w-5 h-5" />
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
