import ScrollReveal from "@/components/ui/ScrollReveal";

const TESTIMONIALS = [
  {
    quote:
      "Kira gave me the vocabulary to walk into brand deals and actually justify my rates. First campaign after using it — $4,500, no apology for the number.",
    name: "Amara Osei",
    role: "Content Creator · Lagos",
    initials: "AO",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    quote:
      "We replaced three tools with Crevia. The entire onboarding-to-payment cycle for our creator campaigns is now one clean flow. Our ops team hasn't looked back.",
    name: "Tariq Mwangi",
    role: "Head of Partnerships, Hype Agency",
    initials: "TM",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    quote:
      "The e-signature Canvas flow is insane. Brands used to ghost me on NDAs for weeks. Now they sign in the thread, same day. Signed PDF before the call ends.",
    name: "Zinhle Dlamini",
    role: "Brand Photographer · Cape Town",
    initials: "ZD",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    quote:
      "Crevia's market intelligence on African creator rates finally gave us a real benchmark. We stopped underpaying talent — and partnership retention improved immediately.",
    name: "Kofi Acheampong",
    role: "Marketing Director, Bloom Beverages",
    initials: "KA",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    quote:
      "I sent my first Crevia invoice, got paid in 48 hours, and felt like a proper CEO. I'm 22 running a visual studio. That's not small — it changed my entire mindset.",
    name: "Leila Hassan",
    role: "Visual Artist · Nairobi",
    initials: "LH",
    gradient: "from-rose-500 to-pink-600",
  },
];

const TestimonialMarquee = () => {
  return (
    <section className="py-20 md:py-28 px-4 md:px-6 bg-muted/20">
      <div className="container mx-auto max-w-5xl">

        {/* Header */}
        <ScrollReveal className="text-center mb-14 md:mb-20">
          <p className="text-bronze font-poppins font-semibold text-sm tracking-widest uppercase mb-4">
            Real Voices
          </p>
          <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold">
            Trusted by creatives{" "}
            <span className="text-gradient-bronze">across the continent.</span>
          </h2>
        </ScrollReveal>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {TESTIMONIALS.map((item, i) => (
            <ScrollReveal key={i} variant="fade-up" delay={i * 0.07}>
              <div className="flex flex-col gap-4 h-full">

                {/* Card */}
                <div className="flex-1 bg-card border border-border/50 rounded-2xl p-7 md:p-8 shadow-sm">
                  {/* Opening quote mark */}
                  <p className="font-vollkorn text-[42px] leading-none text-foreground/70 mb-3 select-none">
                    &ldquo;
                  </p>
                  {/* Quote text */}
                  <p className="font-poppins text-[15px] md:text-base leading-[1.75] text-foreground/85">
                    {item.quote}
                  </p>
                </div>

                {/* Author — below the card, not inside */}
                <div className="flex items-center gap-3 px-1">
                  <div
                    className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${item.gradient} text-white text-sm font-semibold font-poppins shadow-sm`}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <p className="font-poppins font-semibold text-sm text-foreground leading-tight">
                      {item.name}
                    </p>
                    <p className="font-poppins text-xs text-muted-foreground mt-0.5">
                      {item.role}
                    </p>
                  </div>
                </div>

              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialMarquee;
