import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import gallery1 from "@/assets/about-gallery-1.jpg";
import gallery2 from "@/assets/about-gallery-2.jpg";
import gallery3 from "@/assets/about-gallery-3.jpg";
import gallery4 from "@/assets/about-gallery-4.jpg";
import creviaLogo from "@/assets/crevia-logo-full.png";
import founderPhoto from "@/assets/founder-photo.jpg";

const About = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    check();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Back button for logged-in users */}
      {isLoggedIn && (
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="container mx-auto px-6 py-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2 hover:text-bronze">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="pt-16 md:pt-24 pb-16 md:pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-bronze font-poppins font-semibold text-sm tracking-widest uppercase mb-4 animate-fade-in">
            About Crevia
          </p>
          <h1 className="font-vollkorn text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.08] animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Every story deserves{" "}
            <span className="text-gradient-bronze">infrastructure.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
            We're building the operating system for the creative industry — 
            so creatives and brands can stop surviving and start scaling.
          </p>
        </div>
      </section>

      {/* ═══════════════ SCROLLING GALLERY ═══════════════ */}
      <section className="relative w-full overflow-hidden py-4">
        <div className="flex gap-4 md:gap-6 animate-scroll-left">
          {[gallery1, gallery2, gallery3, gallery4, gallery1, gallery2, gallery3, gallery4].map((src, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-64 h-48 md:w-80 md:h-60 rounded-2xl overflow-hidden shadow-xl"
              style={{ transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)` }}
            >
              <img src={src} alt="Crevia community" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ THE NAME ═══════════════ */}
      <section className="py-20 md:py-28 px-4 md:px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="flex justify-center">
              <div className="relative bg-card/50 backdrop-blur-sm p-12 md:p-16 rounded-3xl border border-bronze/20 shadow-2xl">
                <img
                  src={creviaLogo}
                  alt="Crevia Logo"
                  className="w-full max-w-xs mx-auto"
                />
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="font-vollkorn text-3xl md:text-4xl font-bold leading-tight">
                Create. Via. Us.
              </h2>
              <div className="h-1 w-16 bg-gradient-to-r from-bronze to-bronze-light rounded-full" />
              <p className="text-lg text-muted-foreground leading-relaxed">
                <span className="text-bronze font-semibold">Crevia</span> isn't just a name — it's a declaration. 
                We believe every creative and every brand deserves professional-grade tools, 
                not just the ones with the biggest budgets or the loudest reach.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Look at our logo. Those dots? Each one represents you — whether you're a creator 
                turning passion into a profession, or a brand searching for authentic partnerships. 
                Some small, some large — all equal. We don't measure value by numbers. 
                We measure it by the stories told and the businesses built.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ MISSION & VISION ═══════════════ */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="p-8 md:p-10 rounded-2xl border border-border bg-card space-y-4">
              <p className="text-bronze font-poppins font-semibold text-sm tracking-widest uppercase">
                Our Mission
              </p>
              <h3 className="font-vollkorn text-2xl md:text-3xl font-bold">
                Give creatives and brands the tools to build scalable businesses.
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Not content calendars. Not vanity metrics. Real business infrastructure — 
                intelligence, invoicing, contracts, communication, and payments — in one place.
              </p>
            </div>
            <div className="p-8 md:p-10 rounded-2xl border border-border bg-card space-y-4">
              <p className="text-bronze font-poppins font-semibold text-sm tracking-widest uppercase">
                Our Vision
              </p>
              <h3 className="font-vollkorn text-2xl md:text-3xl font-bold">
                A creative industry where impact outweighs influence.
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Where every creative and brand — regardless of size — owns their narrative. 
                Where partnerships are built on substance, not status. Where your story is enough.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOUNDER ═══════════════ */}
      <section className="py-20 md:py-28 px-4 md:px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="aspect-square max-w-sm mx-auto rounded-3xl overflow-hidden border-2 border-bronze/20 shadow-2xl">
                <img src={founderPhoto} alt="Crevia Founder" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <p className="text-bronze font-poppins font-semibold text-sm tracking-widest uppercase">
                Founder's Note
              </p>
              <blockquote className="font-vollkorn text-xl md:text-2xl font-bold leading-relaxed text-foreground italic">
                "We see a future where your story doesn't need permission to thrive. 
                Where creatives and brands are measured by impact, not metrics. Crevia exists to make this real."
              </blockquote>
              <p className="text-muted-foreground leading-relaxed">
                Create. Via. Us. Because every story deserves to be heard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ 5-YEAR GOAL ═══════════════ */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="rounded-3xl bg-gradient-to-br from-bronze to-bronze-dark p-10 md:p-16 shadow-2xl">
            <p className="text-white/70 font-poppins font-semibold text-sm tracking-widest uppercase mb-4">
              Our 5-Year Goal
            </p>
            <div className="text-5xl sm:text-6xl md:text-8xl font-vollkorn font-bold text-white mb-4">
              1 Million
            </div>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Stories told. Voices amplified. Businesses built.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="py-20 md:py-28 px-4 md:px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Own your <span className="text-gradient-bronze">story.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join the movement. Build your business on Crevia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-bronze hover:bg-bronze-dark font-poppins font-semibold px-10 py-7 text-lg shadow-lg hover-scale">
                Start Your Story <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="font-poppins font-semibold px-10 py-7 text-lg border-2 border-bronze/30 hover:border-bronze hover:bg-bronze/10">
                See Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
