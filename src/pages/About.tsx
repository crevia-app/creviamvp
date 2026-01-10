import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Target, Heart, Calendar, Users, MapPin, ArrowLeft } from "lucide-react";
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
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button for logged-in users */}
      {isLoggedIn && (
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="container mx-auto px-6 py-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="gap-2 hover:text-bronze"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}
      
      {/* Hero Gallery Section */}
      <section className="relative pt-12 md:pt-16 pb-16 md:pb-20 overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto max-w-6xl text-center mb-12 md:mb-16 px-6 md:px-6 relative z-10">
          <h1 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-6 md:mb-8 leading-tight">
            Own Your <span className="text-gradient-bronze">Story</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We build smart tools so creators can run their businesses like pros. No gatekeepers. No limits.
          </p>
        </div>
        
        {/* Scrolling Gallery */}
        <div className="relative w-full overflow-hidden">
          <div className="flex gap-4 md:gap-6 animate-scroll-left">
            {/* First set of images */}
            <div className="flex-shrink-0 w-64 h-48 md:w-80 md:h-64 transform rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
              <img 
                src={gallery1} 
                alt="Crevia community event" 
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
            <div className="flex-shrink-0 w-64 h-48 md:w-80 md:h-64 transform rotate-[2deg] hover:rotate-0 transition-transform duration-500">
              <img 
                src={gallery2} 
                alt="Creator community gathering" 
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
            <div className="flex-shrink-0 w-64 h-48 md:w-80 md:h-64 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              <img 
                src={gallery3} 
                alt="Workshop session" 
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
            <div className="flex-shrink-0 w-64 h-48 md:w-80 md:h-64 transform rotate-[3deg] hover:rotate-0 transition-transform duration-500">
              <img 
                src={gallery4} 
                alt="Team collaboration" 
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
            
            {/* Duplicate set for seamless loop */}
            <div className="flex-shrink-0 w-64 h-48 md:w-80 md:h-64 transform rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
              <img 
                src={gallery1} 
                alt="Crevia community event" 
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
            <div className="flex-shrink-0 w-64 h-48 md:w-80 md:h-64 transform rotate-[2deg] hover:rotate-0 transition-transform duration-500">
              <img 
                src={gallery2} 
                alt="Creator community gathering" 
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
            <div className="flex-shrink-0 w-64 h-48 md:w-80 md:h-64 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              <img 
                src={gallery3} 
                alt="Workshop session" 
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
            <div className="flex-shrink-0 w-64 h-48 md:w-80 md:h-64 transform rotate-[3deg] hover:rotate-0 transition-transform duration-500">
              <img 
                src={gallery4} 
                alt="Team collaboration" 
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>


      {/* Logo Story Section - Premium */}
      <section className="relative py-20 md:py-32 px-6 md:px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-bronze/5 via-background to-bronze-light/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-bronze/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-bronze-light/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Logo Side */}
            <div className="order-2 md:order-1 flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-bronze to-bronze-light rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                <div className="relative bg-card/50 backdrop-blur-sm p-12 md:p-16 rounded-3xl border border-bronze/20 shadow-2xl">
                  <img 
                    src={creviaLogo} 
                    alt="Crevia Logo - Every story matters" 
                    className="w-full max-w-xs mx-auto transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Story Side */}
            <div className="order-1 md:order-2 space-y-8">
              <div className="space-y-4">
                <h2 className="font-vollkorn text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
                  More Than a Name.
                  <br />
                  <span className="text-gradient-bronze">A Movement.</span>
                </h2>
                
                <div className="h-1 w-20 bg-gradient-to-r from-bronze to-bronze-light rounded-full" />
              </div>
              
              <div className="space-y-6 text-lg md:text-xl leading-relaxed">
                <p className="text-foreground font-medium">
                  <span className="text-bronze font-bold">Crevia</span> isn't just a word—it's a declaration. 
                  <span className="font-bold"> Create. Via. Us.</span>
                </p>
                
                <p className="text-muted-foreground">
                  We believe every creator deserves professional-grade tools. Not just the ones with millions of followers. 
                  That's why we're building the operating system for creative businesses.
                </p>
                
                <p className="text-muted-foreground">
                  Look closer at our logo. See those dots? Each one represents <span className="text-bronze font-semibold">you</span>. 
                  Some small, some large—all equal. Because we don't measure creators by followers. 
                  We measure them by <span className="font-semibold text-foreground">the businesses they build</span>.
                </p>
                
                <p className="text-foreground font-semibold text-2xl md:text-3xl font-vollkorn italic pt-4">
                  Your story. Your tools. Your empire.
                </p>
              </div>
              
              <div className="flex items-center gap-3 pt-6">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-bronze animate-pulse" />
                  <div className="w-3 h-3 rounded-full bg-bronze-light animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <div className="w-4 h-4 rounded-full bg-bronze animate-pulse" style={{ animationDelay: "0.4s" }} />
                  <div className="w-3 h-3 rounded-full bg-bronze-light animate-pulse" style={{ animationDelay: "0.6s" }} />
                  <div className="w-2 h-2 rounded-full bg-bronze animate-pulse" style={{ animationDelay: "0.8s" }} />
                </div>
                <span className="text-sm text-muted-foreground italic">Every size. Every voice. Every story.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Events Section */}
      <section className="py-16 md:py-20 px-6 md:px-6 bg-gradient-to-br from-bronze/5 via-bronze-light/10 to-bronze/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Calendar className="w-10 h-10 md:w-12 md:h-12 text-bronze" />
              <h2 className="font-vollkorn text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">Our Events</h2>
            </div>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 md:mb-10 leading-relaxed">
              Join us at upcoming events or see what we've accomplished
            </p>
            
            {/* Toggle Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 md:mb-12 max-w-md mx-auto">
              <button
                onClick={() => setShowUpcoming(true)}
                className={`w-full sm:w-auto px-8 py-4 rounded-full font-poppins font-semibold transition-all text-base ${
                  showUpcoming 
                    ? 'bg-gradient-to-r from-bronze to-bronze-light text-white shadow-lg hover:shadow-xl' 
                    : 'bg-card text-foreground border-2 border-bronze/30 hover:border-bronze hover:bg-bronze/5'
                }`}
              >
                Upcoming Events
              </button>
              <button
                onClick={() => setShowUpcoming(false)}
                className={`w-full sm:w-auto px-8 py-4 rounded-full font-poppins font-semibold transition-all text-base ${
                  !showUpcoming 
                    ? 'bg-gradient-to-r from-bronze to-bronze-light text-white shadow-lg hover:shadow-xl' 
                    : 'bg-card text-foreground border-2 border-bronze/30 hover:border-bronze hover:bg-bronze/5'
                }`}
              >
                Previous Events
              </button>
            </div>
          </div>

          {/* Events Content */}
          {showUpcoming ? (
            /* Upcoming Events */
            <div className="max-w-2xl mx-auto">
              <Card className="p-8 md:p-10 bg-card border-2 border-bronze/30 shadow-xl hover:shadow-2xl transition-all">
                <div className="flex items-start justify-between mb-8">
                  <span className="px-6 py-2 bg-gradient-to-r from-bronze to-bronze-light text-white rounded-full text-sm font-poppins font-semibold shadow-md">
                    Summit
                  </span>
                  <span className="px-6 py-2 bg-bronze/10 text-bronze-dark rounded-full text-sm font-poppins font-semibold border border-bronze/20">
                    Coming Soon
                  </span>
                </div>
                
                <h3 className="font-vollkorn text-3xl md:text-4xl font-bold mb-8 text-gradient-bronze">
                  Crevia Creators Connect
                </h3>
                
                <div className="space-y-5 mb-10">
                  <div className="flex items-center gap-4 text-foreground">
                    <Calendar className="w-6 h-6 text-bronze" />
                    <span className="font-poppins text-lg">TBA 2025</span>
                  </div>
                  <div className="flex items-center gap-4 text-foreground">
                    <MapPin className="w-6 h-6 text-bronze" />
                    <span className="font-poppins text-lg">Location TBA</span>
                  </div>
                  <div className="flex items-center gap-4 text-foreground">
                    <Users className="w-6 h-6 text-bronze" />
                    <span className="font-poppins text-lg">Registration Opening Soon</span>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-bronze to-bronze-light hover:from-bronze-dark hover:to-bronze text-white font-poppins font-semibold text-lg py-7 shadow-lg"
                  disabled
                >
                  Coming Soon
                </Button>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Freelancers Summit 2024 */}
              <Card className="overflow-hidden bg-card border-primary/20 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="aspect-video bg-black">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/-20xdAqoBfo"
                    title="Freelancers Summit 2024 - Event Highlights"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-6 md:p-8">
                  <span className="inline-block px-6 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full text-sm font-poppins font-semibold mb-5 shadow-md">
                    Summit
                  </span>
                  <h3 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4 text-foreground">
                    Freelancers Summit 2024
                  </h3>
                  <p className="text-muted-foreground mb-6 font-poppins text-base leading-relaxed">
                    Empowering digital independence
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="font-poppins">October 2024</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="font-poppins">iHub Nairobi</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* AI Summit 2025 */}
              <Card className="overflow-hidden bg-card border-primary/20 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="aspect-video bg-black">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/BKaxVxiLz0Y"
                    title="AI Summit 2025 - Event Highlights"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-6 md:p-8">
                  <span className="inline-block px-6 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full text-sm font-poppins font-semibold mb-5 shadow-md">
                    Summit
                  </span>
                  <h3 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4 text-foreground">
                    AI Summit 2025
                  </h3>
                  <p className="text-muted-foreground mb-6 font-poppins text-base leading-relaxed">
                    Building AI for impact
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="font-poppins">August 2025</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="font-poppins">Strathmore University</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* What We Stand For */}
      <section className="py-16 md:py-20 px-6 md:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 md:mb-16">
            What We <span className="text-gradient-bronze">Stand For</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            <Card className="p-8 md:p-10 text-center hover:shadow-xl transition-all duration-300 border-bronze/20">
              <div className="w-16 h-16 rounded-full bg-bronze/10 flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-bronze" />
              </div>
              <h3 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Our Mission</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                To amplify every creator's voice—not by their reach, but by their impact. 
                We believe your story doesn't need permission. It needs a platform.
              </p>
            </Card>

            <Card className="p-8 md:p-10 text-center hover:shadow-xl transition-all duration-300 border-bronze/20">
              <div className="w-16 h-16 rounded-full bg-bronze/10 flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-bronze" />
              </div>
              <h3 className="font-vollkorn text-2xl md:text-3xl font-bold mb-4">Our Vision</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                A world where every creator—big or small—owns their narrative. 
                Where impact outweighs follower counts. Where every story finds its audience.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Founder's Vision */}
      <section className="py-16 md:py-20 px-6 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 md:mb-16">
            Get to know our <span className="text-gradient-bronze">founder's vision</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
            <div className="relative order-2 md:order-1">
              <div className="aspect-square rounded-full overflow-hidden border-4 border-bronze/30 shadow-2xl hover:scale-105 transition-transform duration-500">
                <img 
                  src={founderPhoto} 
                  alt="Crevia Founder" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="space-y-6 md:space-y-8 order-1 md:order-2">
              <p className="text-lg md:text-xl text-foreground leading-relaxed">
                "We see a future where your story doesn't need permission to thrive. 
                Where creators are measured by impact, not metrics. Where every voice—
                no matter the size—finds its audience."
              </p>
              <p className="text-lg md:text-xl text-foreground leading-relaxed">
                "Crevia exists to make this real. To build the platform where your narrative 
                is enough. Where partnerships value substance over statistics. Where you own 
                your story, and we help you tell it."
              </p>
              <p className="text-base md:text-lg text-muted-foreground italic">
                Create. Via. Us. Because every story deserves to be heard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Year Goal */}
      <section className="py-16 md:py-20 px-6 md:px-6 bg-gradient-to-br from-bronze/10 via-background to-bronze/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl font-bold mb-6 md:mb-8">
            Our <span className="text-gradient-bronze">5-Year Goal</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 md:mb-12 leading-relaxed">
            In 5 years, this is the movement we're building:
          </p>
          
          <div className="bg-gradient-to-br from-bronze to-bronze-dark rounded-3xl p-10 md:p-12 shadow-2xl">
            <div className="text-6xl sm:text-7xl md:text-9xl font-vollkorn font-bold text-white mb-6">
              1 Million
            </div>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed">
              Stories told. Voices amplified. Creators owning their narrative.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-secondary/50 rounded-3xl p-12 border border-border">
            <div className="w-20 h-20 rounded-full bg-bronze/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-bronze" />
            </div>
            <h2 className="font-vollkorn text-4xl font-bold mb-6">Own Your Story</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join a movement where your narrative matters. Where impact trumps metrics. 
              Where every creator—regardless of size—has a voice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/user-type-selection">
                <Button size="lg" className="bg-bronze hover:bg-bronze-dark font-poppins font-semibold">
                  Start Your Story
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="font-poppins font-semibold">
                  Partner With Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;