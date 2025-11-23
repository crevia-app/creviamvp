import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp, Sparkles, Link2, Brain, Globe, ChevronLeft, ChevronRight, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import heroBackground from "@/assets/home-hero-bg.jpg";

const Home = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Beauty & Lifestyle Creator",
      content: "Crevia has completely transformed how I manage my brand partnerships. The AI matching is incredibly accurate, and I've tripled my collaborations in just 3 months.",
      rating: 5,
      image: "bg-gradient-to-br from-pink-400 to-rose-500"
    },
    {
      name: "Marcus Rodriguez",
      role: "Tech Reviewer",
      content: "The all-in-one workspace is a game-changer. From discovery to payment, everything is seamless. I've saved countless hours and increased my revenue by 200%.",
      rating: 5,
      image: "bg-gradient-to-br from-blue-500 to-cyan-500"
    },
    {
      name: "Amelia Thompson",
      role: "Food & Travel Blogger",
      content: "Finally, a platform that understands creators. The escrow system gives me peace of mind, and Kira AI's suggestions have helped me find perfect brand matches.",
      rating: 5,
      image: "bg-gradient-to-br from-amber-400 to-orange-500"
    },
    {
      name: "David Kim",
      role: "Fitness Influencer",
      content: "Crevia's campaign management tools are unmatched. I can track everything in one place, and the professional workspace has elevated my entire business.",
      rating: 5,
      image: "bg-gradient-to-br from-green-400 to-emerald-500"
    },
    {
      name: "Luna Martinez",
      role: "Fashion Designer",
      content: "The collaboration features are incredible. I love how easy it is to communicate with brands and manage multiple campaigns simultaneously. Absolutely essential!",
      rating: 5,
      image: "bg-gradient-to-br from-purple-500 to-violet-600"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6 min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center animate-scale-in"
          style={{ 
            backgroundImage: `url(${heroBackground})`,
            animationDuration: '1.2s'
          }}
        />
        
        {/* Gradient Overlays for both light and dark mode */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/60 dark:from-background/90 dark:via-background/75 dark:to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/60" />
        
        <div className="container mx-auto max-w-6xl relative z-10 px-2">
          <div className="text-left max-w-3xl space-y-4 md:space-y-8 animate-fade-in" style={{ animationDelay: '0.3s', animationDuration: '0.8s' }}>
            <h1 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.15] animate-fade-in" style={{ animationDelay: '0.5s', animationDuration: '0.8s' }}>
              Empowering creators to{" "}
              <span className="text-gradient-bronze">own their digital careers</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground/80 font-poppins leading-relaxed animate-fade-in" style={{ animationDelay: '0.7s', animationDuration: '0.8s' }}>
              Tools that help you collaborate, grow, and earn — all in one simple platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2 animate-fade-in" style={{ animationDelay: '0.9s', animationDuration: '0.8s' }}>
              <Link to="/user-type-selection" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-bronze hover:bg-bronze-dark text-base md:text-lg px-8 md:px-10 py-6 md:py-7 font-poppins font-semibold hover-scale shadow-lg">
                  Get Started
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base md:text-lg px-8 md:px-10 py-6 md:py-7 font-poppins font-semibold hover-scale border-2 border-bronze/30 hover:border-bronze hover:bg-bronze/10">
                Learn More
              </Button>
            </div>
          </div>

        </div>
      </section>

      {/* Demo Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="rounded-xl md:rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-bronze/10 to-background border border-bronze/20 animate-fade-in">
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

      {/* What Crevia Solves */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-vollkorn text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-10 md:mb-16 px-2">
            What <span className="text-gradient-bronze">Crevia</span> Solves
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <Card className="p-6 md:p-8 hover-lift border-bronze/20 animate-fade-in-up stagger-1 group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-bronze/10 flex items-center justify-center mb-4 md:mb-6 transition-all duration-300 group-hover:bg-bronze/20 group-hover:scale-110">
                <Users className="w-6 h-6 md:w-7 md:h-7 text-bronze transition-transform duration-300 group-hover:rotate-6" />
              </div>
              <h3 className="font-vollkorn text-xl md:text-2xl font-bold mb-3 md:mb-4">Find collaborations effortlessly</h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Connect with brands and creators that align with your vision, without the endless searching.
              </p>
            </Card>

            <Card className="p-6 md:p-8 hover-lift border-bronze/20 animate-fade-in-up stagger-2 group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-bronze/10 flex items-center justify-center mb-4 md:mb-6 transition-all duration-300 group-hover:bg-bronze/20 group-hover:scale-110">
                <Globe className="w-6 h-6 md:w-7 md:h-7 text-bronze transition-transform duration-300 group-hover:rotate-6" />
              </div>
              <h3 className="font-vollkorn text-xl md:text-2xl font-bold mb-3 md:mb-4">Manage everything in one place</h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                From campaigns to payments, keep your entire creator business organized and professional.
              </p>
            </Card>

            <Card className="p-6 md:p-8 hover-lift border-bronze/20 animate-fade-in-up stagger-3 group">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-bronze/10 flex items-center justify-center mb-4 md:mb-6 transition-all duration-300 group-hover:bg-bronze/20 group-hover:scale-110">
                <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-bronze transition-transform duration-300 group-hover:rotate-6" />
              </div>
              <h3 className="font-vollkorn text-xl md:text-2xl font-bold mb-3 md:mb-4">Grow with AI guidance</h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Get personalized recommendations and insights to level up your creator journey.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Creators Using Crevia */}
      <section className="py-16 md:py-20 px-6 md:px-6 relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-bronze/5 to-background" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-bronze text-sm md:text-base font-semibold tracking-wider uppercase mb-3 animate-fade-in">
              Join the Movement
            </p>
            <h2 className="font-vollkorn text-3xl sm:text-4xl lg:text-5xl font-bold animate-fade-in">
              Where top creators <span className="text-gradient-bronze">build their empires</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 animate-fade-in">
            {[
              { name: "Jay Shetty", role: "Podcast Host & Life Coach", bg: "bg-gradient-to-br from-stone-200 to-stone-300" },
              { name: "Kim Scott", role: "Co-founder of Radical Candor", bg: "bg-gradient-to-br from-red-400 to-red-500" },
              { name: "Ali Abdaal", role: "Productivity Expert", bg: "bg-gradient-to-br from-purple-400 to-purple-500" },
              { name: "Anne-Laure Le Cunff", role: "Founder, Ness Labs", bg: "bg-gradient-to-br from-amber-500 to-amber-600" },
              { name: "Tim Ferriss", role: "Podcast Host & Author", bg: "bg-gradient-to-br from-blue-400 to-blue-500" },
              { name: "Mel Robbins", role: "Award Winning Podcast Host", bg: "bg-gradient-to-br from-stone-300 to-stone-400" }
            ].map((creator, index) => (
              <div
                key={index}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden hover-lift transition-all duration-500 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`${creator.bg} w-full h-full absolute inset-0 transition-transform duration-500 group-hover:scale-110`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="font-vollkorn text-white text-base md:text-lg font-bold mb-1">{creator.name}</h3>
                  <p className="text-white/90 text-xs">{creator.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-16 md:py-20 px-6 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-vollkorn text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-16">
            Powerful <span className="text-gradient-bronze">Products</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="p-8 bg-gradient-to-br from-bronze/5 to-background hover-lift hover-glow border-bronze/20 animate-fade-in-up stagger-1 group overflow-hidden relative">
              <div className="shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Link2 className="w-12 h-12 text-bronze mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 relative z-10" />
              <h3 className="font-vollkorn text-2xl font-bold mb-3 relative z-10">Crevia Connect</h3>
              <p className="text-muted-foreground mb-4 text-base leading-relaxed relative z-10">
                Connect creators & brands for seamless collaborations.
              </p>
              <Button variant="ghost" className="text-bronze hover:text-bronze-dark p-0 h-auto font-semibold bronze-underline relative z-10">
                Learn more →
              </Button>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-bronze/5 to-background hover-lift hover-glow border-bronze/20 animate-fade-in-up stagger-2 group overflow-hidden relative">
              <div className="shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Brain className="w-12 h-12 text-bronze mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 relative z-10" />
              <h3 className="font-vollkorn text-2xl font-bold mb-3 relative z-10">Crevia AI</h3>
              <p className="text-muted-foreground mb-4 text-base leading-relaxed relative z-10">
                Your personal creator growth assistant, powered by Kira.
              </p>
              <Button variant="ghost" className="text-bronze hover:text-bronze-dark p-0 h-auto font-semibold bronze-underline relative z-10">
                Learn more →
              </Button>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-bronze/5 to-background hover-lift hover-glow border-bronze/20 animate-fade-in-up stagger-3 group overflow-hidden relative">
              <div className="shimmer absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Link2 className="w-12 h-12 text-bronze mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 relative z-10" />
              <h3 className="font-vollkorn text-2xl font-bold mb-3 relative z-10">Crevia Link</h3>
              <p className="text-muted-foreground mb-4 text-base leading-relaxed relative z-10">
                Your all-in-one public link to showcase your work.
              </p>
              <Button variant="ghost" className="text-bronze hover:text-bronze-dark p-0 h-auto font-semibold bronze-underline relative z-10">
                Learn more →
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-secondary/30 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-bronze text-sm md:text-base font-semibold tracking-wider uppercase mb-3 animate-fade-in">
              Love from the community
            </p>
            <h2 className="font-vollkorn text-3xl sm:text-4xl lg:text-5xl font-bold animate-fade-in">
              Loved by <span className="text-gradient-bronze">thousands</span> of creators
            </h2>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Navigation Buttons - Visible on all screen sizes */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-16 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background border border-border hover:border-bronze hover:bg-bronze/5 transition-all duration-300 flex items-center justify-center shadow-md group"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground group-hover:text-bronze transition-colors" />
            </button>
            
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-16 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background border border-border hover:border-bronze hover:bg-bronze/5 transition-all duration-300 flex items-center justify-center shadow-md group"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground group-hover:text-bronze transition-colors" />
            </button>

            {/* Testimonials - 1 on mobile, 2 on desktop */}
            <div className="overflow-hidden px-3 md:px-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mx-auto md:max-w-none">
                {/* Mobile: Show single testimonial */}
                <Card className="md:hidden p-10 border-bronze/20 hover:border-bronze/40 transition-all duration-300 bg-background hover:shadow-xl">
                  <div className={`w-24 h-24 rounded-full ${testimonials[currentTestimonial].image} mb-8 shadow-lg`} />
                  <div className="flex gap-1.5 mb-6">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 fill-bronze text-bronze" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                    "{testimonials[currentTestimonial].content}"
                  </p>
                  <div className="border-t border-border pt-6">
                    <h4 className="font-vollkorn font-bold text-2xl mb-2">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-muted-foreground text-base">{testimonials[currentTestimonial].role}</p>
                  </div>
                </Card>

                {/* Desktop: Show 2 testimonials */}
                {[0, 1].map((offset) => {
                  const index = (currentTestimonial + offset) % testimonials.length;
                  const testimonial = testimonials[index];
                  return (
                    <Card 
                      key={index}
                      className="hidden md:block p-8 border-bronze/20 hover:border-bronze/40 transition-all duration-300 bg-background hover:shadow-xl"
                    >
                      <div className={`w-16 h-16 rounded-full ${testimonial.image} mb-5 shadow-lg`} />
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-bronze text-bronze" />
                        ))}
                      </div>
                      <p className="text-muted-foreground text-base leading-relaxed mb-6">
                        "{testimonial.content}"
                      </p>
                      <div className="border-t border-border pt-4">
                        <h4 className="font-vollkorn font-bold text-base">{testimonial.name}</h4>
                        <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-10">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? "bg-bronze w-8"
                      : "bg-bronze/30 hover:bg-bronze/50 w-2"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-6 md:px-6 bg-gradient-to-br from-bronze/10 via-background to-bronze/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-vollkorn text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            Ready to own your story?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-6 md:mb-8 leading-relaxed">
            Join thousands of creators building their digital careers on Crevia.
          </p>
          <Link to="/user-type-selection">
            <Button size="lg" className="bg-bronze hover:bg-bronze-dark text-lg px-10 py-7 font-poppins font-semibold shadow-lg hover-scale">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
