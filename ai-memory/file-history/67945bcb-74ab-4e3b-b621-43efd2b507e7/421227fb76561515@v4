import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import HeroPattern from "@/components/HeroPattern";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import gallery1 from "@/assets/about-gallery-1.jpg";
import gallery2 from "@/assets/about-gallery-2.jpg";
import gallery3 from "@/assets/about-gallery-3.jpg";
import gallery4 from "@/assets/about-gallery-4.jpg";
import creviaLogo from "@/assets/crevia-logo-full.png";
import founderPhoto from "@/assets/founder-photo.jpg";
import creviaSummit2026 from "@/assets/crevia-summit-2026.png";
import ScrollReveal from "@/components/ui/ScrollReveal";

const galleryImages = [gallery1, gallery2, gallery3, gallery4];

const About = ({ isEmbedded = false }: { isEmbedded?: boolean }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [eventsTab, setEventsTab] = useState<"previous" | "upcoming">("upcoming");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {!isEmbedded && <Header />}

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative pt-28 md:pt-36 pb-16 md:pb-20 px-4 md:px-6 overflow-hidden">
        {!isEmbedded && (
          <div className="container mx-auto max-w-4xl relative z-10 mb-4">
            <BackButton fallback="/" />
          </div>
        )}
        <HeroPattern />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <ScrollReveal>
            <p className="text-bronze font-poppins font-semibold text-sm tracking-widest uppercase mb-4">
              About Crevia
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="font-vollkorn text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.08]">
              Every story deserves{" "}
              <span className="text-gradient-bronze">infrastructure.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Creatives and businesses deserve infrastructure that works as hard as they do.
              We are building it.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════ INFINITE SCROLLING GALLERY ═══════════════ */}
      <section className="relative w-full py-8 overflow-hidden">
        {/* Left fade — bleeds into background for seamless edge */}
        <div
          className="absolute inset-y-0 left-0 w-28 md:w-40 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, hsl(var(--background)) 0%, transparent 100%)" }}
        />
        {/* Right fade */}
        <div
          className="absolute inset-y-0 right-0 w-28 md:w-40 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, hsl(var(--background)) 0%, transparent 100%)" }}
        />

        {/* Marquee track — images duplicated for seamless infinite loop */}
        <div
          className="flex animate-scroll-left"
          style={{ width: "max-content", gap: "20px" }}
        >
          {[...galleryImages, ...galleryImages, ...galleryImages].map((src, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-64 h-48 md:w-80 md:h-60 rounded-2xl overflow-hidden shadow-2xl"
              style={{
                transform: `rotate(${i % 3 === 0 ? -1.8 : i % 3 === 1 ? 1.2 : -0.6}deg)`,
                transition: "transform 0.4s ease",
              }}
            >
              <img
                src={src}
                alt="Crevia community"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ THE NAME ═══════════════ */}
      <section className="py-20 md:py-28 px-4 md:px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <ScrollReveal variant="scale">
              <div className="flex justify-center">
                <div className="relative bg-card/50 backdrop-blur-sm p-12 md:p-16 rounded-3xl border border-bronze/20 shadow-2xl">
                  <img
                    src={creviaLogo}
                    alt="Crevia Logo"
                    className="w-full max-w-xs mx-auto"
                  />
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15} variant="fade-right">
              <div className="space-y-6">
                <h2 className="font-vollkorn text-3xl md:text-4xl font-bold leading-tight">
                  Create. Via. Us.
                </h2>
                <div className="h-1 w-16 bg-gradient-to-r from-bronze to-bronze-light rounded-full" />
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Those dots in our logo are not decoration. Each one is a creative, a brand,
                  a story in motion. Some at the start. Some mid-scale. All equal in what they
                  deserve — the infrastructure to be taken seriously. We do not measure value
                  by follower counts. We measure it by businesses built and money moved.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ EVENTS ═══════════════ */}
      <section className="py-20 md:py-28 px-4 md:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal className="text-center mb-10">
            <p className="text-bronze font-poppins font-semibold text-sm tracking-widest uppercase mb-4">
              Crevia Events
            </p>
            <h2 className="font-vollkorn text-3xl md:text-4xl font-bold mb-6">
              Where <span className="text-gradient-bronze">stories</span> come together.
            </h2>
            
            <div className="inline-flex bg-card border border-border rounded-full p-1 gap-1">
              <button
                onClick={() => setEventsTab("upcoming")}
                className={`px-6 py-2 rounded-full text-sm font-poppins font-medium transition-all duration-300 ${
                  eventsTab === "upcoming"
                    ? "bg-bronze text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setEventsTab("previous")}
                className={`px-6 py-2 rounded-full text-sm font-poppins font-medium transition-all duration-300 ${
                  eventsTab === "previous"
                    ? "bg-bronze text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Previous
              </button>
            </div>
          </ScrollReveal>

          {eventsTab === "upcoming" && (
            <ScrollReveal variant="scale">
              <div className="max-w-md mx-auto">
                <div className="rounded-2xl overflow-hidden border border-bronze/30 shadow-2xl bg-card">
                  <img
                    src={creviaSummit2026}
                    alt="Crevia Summit 2026"
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-6 text-center">
                    <div className="inline-flex items-center gap-2 text-bronze text-sm font-poppins mb-2">
                      <Calendar className="w-4 h-4" />
                      June 27th, 2026
                    </div>
                    <h3 className="font-vollkorn text-xl font-bold mb-2">Crevia Summit 2026</h3>
                    <p className="text-muted-foreground mb-4">Building a successful personal brand</p>
                    <a
                      href="https://vabu.app/l/CS2026"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-bronze hover:bg-bronze-dark font-poppins font-semibold px-6">
                        Register Now <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}

          {eventsTab === "previous" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { src: "https://www.youtube.com/embed/-20xdAqoBfo", title: "Freelancers Summit 2024", desc: "Empowering digital independence" },
                { src: "https://www.youtube.com/embed/BKaxVxiLz0Y", title: "AI Summit 2024", desc: "Building AI for Impact" },
              ].map((event, i) => (
                <ScrollReveal key={event.title} delay={i * 0.1}>
                  <div className="rounded-2xl overflow-hidden border border-border bg-card">
                    <div className="aspect-video">
                      <iframe
                        src={event.src}
                        title={event.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-vollkorn text-lg font-bold mb-1">{event.title}</h3>
                      <p className="text-muted-foreground text-sm">{event.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════ MISSION & VISION ═══════════════ */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <ScrollReveal variant="fade-left">
              <div className="p-8 md:p-10 rounded-2xl border border-border bg-card card-interactive space-y-4 h-full">
                <p className="text-bronze font-poppins font-semibold text-sm tracking-widest uppercase">
                  Our Mission
                </p>
                <h3 className="font-vollkorn text-2xl md:text-3xl font-bold">
                  Give creatives and businesses the infrastructure to operate, close deals, and scale — without the chaos.
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Kira handles the intelligence. Crevia Studio handles the operations.
                  Together, they replace the scattered tools, missed payments, and lost
                  deals that define the industry today.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal variant="fade-right" delay={0.1}>
              <div className="p-8 md:p-10 rounded-2xl border border-border bg-card card-interactive space-y-4 h-full">
                <p className="text-bronze font-poppins font-semibold text-sm tracking-widest uppercase">
                  Our Vision
                </p>
                <h3 className="font-vollkorn text-2xl md:text-3xl font-bold">
                  A world where impact outweighs influence.
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Where success is measured by businesses built and income earned — not followers
                  gained and content posted. Athar House is the physical embodiment of this
                  community. Crevia is the digital infrastructure.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOUNDER ═══════════════ */}
      <section className="py-20 md:py-28 px-4 md:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-3xl text-center">
          <ScrollReveal variant="blur">
            <p className="text-bronze font-poppins font-semibold text-sm tracking-widest uppercase mb-6">
              Co-Founder's Note
            </p>
            <blockquote className="font-vollkorn text-xl md:text-2xl font-bold leading-relaxed text-foreground italic mb-6">
              "I started by hosting summits at iHub Nairobi — bringing creatives into the same room
              to share, collaborate, and build. What I kept seeing was the same problem: immense
              talent, zero infrastructure. People leaving deals on the table. Getting paid late,
              or not at all. Running their businesses on WhatsApp threads and gut instinct.
              I stopped organizing the ecosystem and started building the hard infrastructure
              it actually needs. Crevia is the digital backbone.
              The goal has never changed — impact over vanity. Businesses built. Money moved. Stories owned."
            </blockquote>
            <p className="font-poppins font-semibold text-foreground">Amin Hassan Hussein</p>
            <p className="text-sm text-muted-foreground">Co-Founder & CEO, Crevia</p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="relative py-20 md:py-28 px-4 md:px-6 overflow-hidden">
        <HeroPattern />
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <ScrollReveal variant="blur">
            <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Own your <span className="text-gradient-bronze">story.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join the movement. Build your business on Crevia.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.15} variant="scale">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isLoggedIn && (
                <Link to="/auth">
                  <Button size="lg" className="bg-bronze hover:bg-bronze-dark font-poppins font-semibold px-10 py-7 text-lg shadow-lg hover-scale">
                    Start Your Story <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              )}
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="font-poppins font-semibold px-10 py-7 text-lg border-2 border-bronze/30 hover:border-bronze hover:bg-bronze/10">
                  See Pricing
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {!isEmbedded && <Footer />}
    </div>
  );
};

export default About;
