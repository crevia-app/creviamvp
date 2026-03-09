import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, FileText, Link2, MessageCircle, Receipt, Shield } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroPattern from "@/components/HeroPattern";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative pt-28 md:pt-40 pb-20 md:pb-32 px-4 md:px-6 min-h-[90vh] flex items-center overflow-hidden">
        {/* Geometric pattern background */}
        <HeroPattern />

        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="max-w-3xl space-y-6 md:space-y-8">
            <p className="text-bronze font-poppins font-semibold text-sm md:text-base tracking-widest uppercase animate-fade-in">
              Own Your Story
            </p>
            <h1
              className="font-vollkorn text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-bold leading-[1.08] animate-fade-in"
              style={{ animationDelay: "0.15s" }}
            >
              The operating system for the{" "}
              <span className="text-gradient-bronze">creative industry.</span>
            </h1>
            <p
              className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-poppins leading-relaxed max-w-2xl animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              Crevia gives creatives and brands the intelligence, tools, and
              infrastructure to build scalable businesses — not just content.
            </p>
            <div
              className="flex flex-col sm:flex-row gap-3 pt-2 animate-fade-in"
              style={{ animationDelay: "0.45s" }}
            >
              <Link to="/auth?mode=signup">
                <Button
                  size="lg"
                  className="bg-bronze hover:bg-bronze-dark text-base md:text-lg px-10 py-7 font-poppins font-semibold shadow-lg hover-scale"
                >
                  Start Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base md:text-lg px-10 py-7 font-poppins font-semibold border-2 border-bronze/30 hover:border-bronze hover:bg-bronze/10"
                >
                  See Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ THE PROBLEM ═══════════════ */}
      <section className="py-20 md:py-28 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Creatives aren't broke.{" "}
            <span className="text-gradient-bronze">They're under-tooled.</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            You don't need another content calendar. You need an operating system — 
            one place to price, scope, invoice, contract, communicate, and get paid. 
            That's Crevia.
          </p>
        </div>
      </section>

      {/* ═══════════════ TWO LAYERS ═══════════════ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 md:mb-20">
            <p className="text-bronze font-poppins font-semibold text-sm tracking-widest uppercase mb-4">
              How It Works
            </p>
            <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold">
              Two layers. <span className="text-gradient-bronze">One system.</span>
            </h2>
          </div>

          {/* KIRA — Intelligence Layer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center mb-20 md:mb-28">
            <div className="space-y-6">
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
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-bronze flex-shrink-0" />
                    <span className="font-poppins">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-bronze/10 via-bronze/5 to-transparent border border-bronze/20 flex items-center justify-center">
                <Brain className="w-24 h-24 md:w-32 md:h-32 text-bronze/30" />
              </div>
            </div>
          </div>

          {/* CREVIA STUDIO — Operations Layer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-bronze/10 via-bronze/5 to-transparent border border-bronze/20 flex items-center justify-center">
                <FileText className="w-24 h-24 md:w-32 md:h-32 text-bronze/30" />
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
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
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Link2, label: "Crevia Link" },
                  { icon: MessageCircle, label: "Crevia Chat" },
                  { icon: Receipt, label: "Invoices & Receipts" },
                  { icon: Shield, label: "Contracts" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-bronze/30 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-bronze flex-shrink-0" />
                    <span className="font-poppins text-sm font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOR WHO ═══════════════ */}
      <section className="py-20 md:py-28 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14 md:mb-20">
            <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold">
              Built for people who{" "}
              <span className="text-gradient-bronze">build things.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* For Creatives */}
            <div className="p-8 md:p-10 rounded-2xl border border-border bg-card hover:border-bronze/30 transition-all duration-300 hover:shadow-xl space-y-6">
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

            {/* For Brands */}
            <div className="p-8 md:p-10 rounded-2xl border border-border bg-card hover:border-bronze/30 transition-all duration-300 hover:shadow-xl space-y-6">
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
          </div>
        </div>
      </section>

      {/* ═══════════════ DEMO VIDEO ═══════════════ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-secondary/20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="font-vollkorn text-3xl sm:text-4xl font-bold mb-4">
              See Crevia in <span className="text-gradient-bronze">action</span>
            </h2>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-bronze/20">
            <div className="aspect-video">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/-20xdAqoBfo"
                title="Crevia Platform Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="relative py-20 md:py-32 px-4 md:px-6 overflow-hidden">
        <HeroPattern />
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Your story deserves{" "}
            <span className="text-gradient-bronze">better infrastructure.</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the creatives and brands building real businesses on Crevia.
            Start free. Scale when you're ready.
          </p>
          <Link to="/auth?mode=signup">
            <Button
              size="lg"
              className="bg-bronze hover:bg-bronze-dark text-lg px-12 py-7 font-poppins font-semibold shadow-lg hover-scale"
            >
              Own Your Story <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
