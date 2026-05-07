import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
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

const TestimonialMarquee = () => {
  const [active, setActive] = useState(0);
  const count = TESTIMONIALS.length;

  const prev = () => setActive((i) => (i - 1 + count) % count);
  const next = () => setActive((i) => (i + 1) % count);

  const t = TESTIMONIALS[active];

  return (
    <section className="py-20 md:py-28 px-4 md:px-6">
      <div className="container mx-auto max-w-4xl">

        {/* Header */}
        <ScrollReveal className="text-center mb-12 md:mb-16">
          <p className="text-bronze font-poppins font-semibold text-sm tracking-widest uppercase mb-4">
            Real Voices
          </p>
          <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold">
            Trusted by creatives{" "}
            <span className="text-gradient-bronze">across the continent.</span>
          </h2>
        </ScrollReveal>

        {/* Card — overflow-hidden clips off-screen cards; translateX slides between them */}
        <div className="overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {TESTIMONIALS.map((item, i) => (
              <div key={i} className="w-full flex-shrink-0">
                <div className="bg-card border border-border rounded-2xl p-7 sm:p-10 md:p-14">
                  {/* Stars */}
                  <div className="flex gap-1 mb-6 md:mb-8">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-bronze text-bronze" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="font-vollkorn text-xl sm:text-2xl md:text-3xl font-medium leading-[1.5] text-foreground mb-8 md:mb-10">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center
                                 bg-gradient-to-br from-bronze to-bronze-dark
                                 text-white text-sm font-semibold font-poppins"
                    >
                      {item.initials}
                    </div>
                    <div>
                      <p className="font-poppins font-semibold text-foreground leading-tight">
                        {item.name}
                      </p>
                      <p className="font-poppins text-sm text-muted-foreground mt-0.5">
                        {item.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls — dots left, arrows right */}
        <div className="flex items-center justify-between mt-6 md:mt-8">
          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  i === active
                    ? "w-8 bg-bronze"
                    : "w-2 bg-border hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>

          {/* Prev / Next */}
          <div className="flex gap-3">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="w-11 h-11 rounded-full border border-border bg-background
                         flex items-center justify-center text-foreground
                         hover:bg-bronze hover:border-bronze hover:text-white
                         transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                         active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next testimonial"
              className="w-11 h-11 rounded-full border border-border bg-background
                         flex items-center justify-center text-foreground
                         hover:bg-bronze hover:border-bronze hover:text-white
                         transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                         active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TestimonialMarquee;
