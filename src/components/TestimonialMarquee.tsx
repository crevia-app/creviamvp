import { Star } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Kira gave me the vocabulary to walk into brand deals and actually justify my rates. First campaign after using it — $4,500, no apology for the number.",
    name: "Amara Osei",
    role: "Content Creator · Lagos",
    initials: "AO",
  },
  {
    quote:
      "We replaced three tools with Crevia. The entire onboarding-to-payment cycle for our creator campaigns is now one clean flow. Our ops team hasn't looked back.",
    name: "Tariq Mwangi",
    role: "Head of Partnerships, Hype Agency",
    initials: "TM",
  },
  {
    quote:
      "The e-signature contract flow is insane. Brands used to ghost me on NDAs for weeks. Now they sign in the thread, same day. Signed PDF before the call ends.",
    name: "Zinhle Dlamini",
    role: "Brand Photographer · Cape Town",
    initials: "ZD",
  },
  {
    quote:
      "Crevia's market intelligence on African creator rates finally gave us a real benchmark. We stopped underpaying talent — and partnership retention improved immediately.",
    name: "Kofi Acheampong",
    role: "Marketing Director, Bloom Beverages",
    initials: "KA",
  },
  {
    quote:
      "I sent my first Crevia invoice, got paid in 48 hours, and felt like a proper CEO. I'm 22 running a visual studio. That's not small — it changed my entire mindset.",
    name: "Leila Hassan",
    role: "Visual Artist · Nairobi",
    initials: "LH",
  },
];

const TestimonialCard = ({ quote, name, role, initials }: Testimonial) => (
  <div
    // mr-5 on each card (not gap on container) — ensures exactly 50% of total
    // track width equals one full set, giving a pixel-perfect seamless loop.
    className="group relative flex-shrink-0 w-[320px] md:w-[370px] mr-5 p-6 rounded-2xl border overflow-hidden select-none
               bg-card/80 dark:bg-white/[0.04] backdrop-blur-sm
               border-border dark:border-white/[0.07]
               transition-all duration-500
               hover:bg-card dark:hover:bg-white/[0.07]
               hover:border-border/80 dark:hover:border-white/[0.13]
               hover:shadow-[0_4px_32px_-8px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_4px_32px_-8px_rgba(0,0,0,0.5)]"
  >
    {/* Bronze radial glow — fades in on hover */}
    <div
      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, hsl(var(--bronze) / 0.10) 0%, transparent 70%)",
      }}
    />

    {/* Stars */}
    <div className="relative z-10 flex gap-0.5 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-bronze text-bronze" />
      ))}
    </div>

    {/* Quote */}
    <blockquote className="relative z-10 font-poppins text-[14.5px] leading-[1.75] text-foreground/70 dark:text-zinc-300 mb-5">
      &ldquo;{quote}&rdquo;
    </blockquote>

    {/* Hairline divider */}
    <div className="relative z-10 h-px w-full bg-border dark:bg-white/[0.06] mb-4" />

    {/* Author */}
    <div className="relative z-10 flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center
                   bg-gradient-to-br from-bronze to-bronze-dark
                   text-white text-[11px] font-semibold font-poppins tracking-wide"
      >
        {initials}
      </div>
      <div className="min-w-0">
        <p className="font-poppins text-sm font-semibold text-foreground leading-tight truncate">
          {name}
        </p>
        <p className="font-poppins text-xs text-muted-foreground mt-0.5 leading-tight truncate">
          {role}
        </p>
      </div>
    </div>
  </div>
);

const TestimonialMarquee = () => {
  // Duplicate once — animation translates -50% (exactly one full set width)
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="py-20 md:py-28">
      {/* Header */}
      <div className="container mx-auto max-w-6xl px-4 md:px-6 text-center mb-14 md:mb-16">
        <ScrollReveal>
          <p className="text-bronze font-poppins font-semibold text-sm tracking-widest uppercase mb-4">
            Real Voices
          </p>
          <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold">
            Trusted by creatives{" "}
            <span className="text-gradient-bronze">across the continent.</span>
          </h2>
        </ScrollReveal>
      </div>

      {/* Marquee — edge-faded, hardware-accelerated */}
      <div
        className="relative overflow-hidden"
        style={{
          // Soft horizontal fade — cards dissolve into the background at both edges
          maskImage:
            "linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)",
        }}
      >
        <div
          // animate-marquee defined in tailwind.config.ts
          // hover:[animation-play-state:paused] — Tailwind arbitrary property, no config needed
          className="flex animate-marquee hover:[animation-play-state:paused]"
          style={{ width: "max-content", willChange: "transform" }}
        >
          {doubled.map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialMarquee;
