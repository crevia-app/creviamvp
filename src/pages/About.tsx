import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Target, Heart, Calendar, Users, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import gallery1 from "@/assets/about-gallery-1.jpg";
import gallery2 from "@/assets/about-gallery-2.jpg";
import gallery3 from "@/assets/about-gallery-3.jpg";
import gallery4 from "@/assets/about-gallery-4.jpg";

const About = () => {
  const [showUpcoming, setShowUpcoming] = useState(true);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Gallery Section */}
      <section className="relative pt-24 md:pt-32 pb-12 md:pb-20 overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto max-w-6xl text-center mb-8 md:mb-12 px-4 md:px-6 relative z-10">
          <h1 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6">
            Own Your <span className="text-gradient-bronze">Story</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            We are on a mission to empower creators and brands to build meaningful collaborations
          </p>
        </div>
        
        {/* Scrolling Gallery */}
        <div className="relative w-full overflow-hidden">
          <div className="flex gap-4 md:gap-6 animate-scroll-left">
            {/* First set of images */}
            <div className="flex-shrink-0 w-64 h-48 sm:w-72 sm:h-56 md:w-80 md:h-64 transform rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
              <img 
                src={gallery1} 
                alt="Crevia community event" 
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
            <div className="flex-shrink-0 w-80 h-64 transform rotate-[2deg] hover:rotate-0 transition-transform duration-500">
              <img 
                src={gallery2} 
                alt="Creator community gathering" 
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
            <div className="flex-shrink-0 w-80 h-64 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              <img 
                src={gallery3} 
                alt="Workshop session" 
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
            <div className="flex-shrink-0 w-80 h-64 transform rotate-[3deg] hover:rotate-0 transition-transform duration-500">
              <img 
                src={gallery4} 
                alt="Team collaboration" 
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
            
            {/* Duplicate set for seamless loop */}
            <div className="flex-shrink-0 w-80 h-64 transform rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
              <img 
                src={gallery1} 
                alt="Crevia community event" 
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
            <div className="flex-shrink-0 w-80 h-64 transform rotate-[2deg] hover:rotate-0 transition-transform duration-500">
              <img 
                src={gallery2} 
                alt="Creator community gathering" 
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
            <div className="flex-shrink-0 w-80 h-64 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              <img 
                src={gallery3} 
                alt="Workshop session" 
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
            <div className="flex-shrink-0 w-80 h-64 transform rotate-[3deg] hover:rotate-0 transition-transform duration-500">
              <img 
                src={gallery4} 
                alt="Team collaboration" 
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-vollkorn text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 px-2">About Us</h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-2">
            Building Africa's largest community of creators, entrepreneurs, and innovators. 
            Together, we're bridging the gap between creators and brands, creating opportunities 
            that drive impact and growth across the continent.
          </p>
          <Button size="lg" className="bg-bronze hover:bg-bronze-dark font-poppins font-semibold">
            Join Our Community
          </Button>
        </div>
      </section>

      {/* Our Events Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gradient-to-br from-bronze/5 via-bronze-light/10 to-bronze/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-4">
              <Calendar className="w-10 h-10 md:w-12 md:h-12 text-bronze" />
              <h2 className="font-vollkorn text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">Our Events</h2>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 md:mb-8 px-2">
              Join us at upcoming events or see what we've accomplished
            </p>
            
            {/* Toggle Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-8 md:mb-12 px-4">
              <button
                onClick={() => setShowUpcoming(true)}
                className={`w-full sm:w-auto px-6 md:px-8 py-3 rounded-full font-poppins font-semibold transition-all text-sm md:text-base ${
                  showUpcoming 
                    ? 'bg-gradient-to-r from-bronze to-bronze-light text-white shadow-lg hover:shadow-xl' 
                    : 'bg-card text-foreground border-2 border-bronze/30 hover:border-bronze hover:bg-bronze/5'
                }`}
              >
                Upcoming Events
              </button>
              <button
                onClick={() => setShowUpcoming(false)}
                className={`w-full sm:w-auto px-6 md:px-8 py-3 rounded-full font-poppins font-semibold transition-all text-sm md:text-base ${
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
              <Card className="p-8 bg-card border-2 border-bronze/30 shadow-xl hover:shadow-2xl transition-all">
                <div className="flex items-start justify-between mb-6">
                  <span className="px-4 py-1.5 bg-gradient-to-r from-bronze to-bronze-light text-white rounded-full text-sm font-poppins font-semibold shadow-md">
                    Summit
                  </span>
                  <span className="px-4 py-1.5 bg-bronze/10 text-bronze-dark rounded-full text-sm font-poppins font-semibold border border-bronze/20">
                    Coming Soon
                  </span>
                </div>
                
                <h3 className="font-vollkorn text-3xl md:text-4xl font-bold mb-6 text-gradient-bronze">
                  Crevia Creators Connect
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-foreground">
                    <Calendar className="w-5 h-5 text-bronze" />
                    <span className="font-poppins">TBA 2025</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground">
                    <MapPin className="w-5 h-5 text-bronze" />
                    <span className="font-poppins">Location TBA</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground">
                    <Users className="w-5 h-5 text-bronze" />
                    <span className="font-poppins">Registration Opening Soon</span>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-bronze to-bronze-light hover:from-bronze-dark hover:to-bronze text-white font-poppins font-semibold text-lg py-6 shadow-lg"
                  disabled
                >
                  Coming Soon
                </Button>
              </Card>
            </div>
          ) : (
            /* Previous Events */
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
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
                <div className="p-6">
                  <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full text-sm font-poppins font-semibold mb-4 shadow-md">
                    Summit
                  </span>
                  <h3 className="font-vollkorn text-2xl font-bold mb-3 text-foreground">
                    Freelancers Summit 2024
                  </h3>
                  <p className="text-muted-foreground mb-4 font-poppins">
                    Empowering digital independence
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-poppins text-sm">October 2024</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-poppins text-sm">iHub Nairobi</span>
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
                <div className="p-6">
                  <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full text-sm font-poppins font-semibold mb-4 shadow-md">
                    Summit
                  </span>
                  <h3 className="font-vollkorn text-2xl font-bold mb-3 text-foreground">
                    AI Summit 2025
                  </h3>
                  <p className="text-muted-foreground mb-4 font-poppins">
                    Building AI for impact
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-poppins text-sm">August 2025</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-poppins text-sm">Strathmore University</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* What We Stand For */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-vollkorn text-4xl md:text-5xl font-bold text-center mb-16">
            What We <span className="text-gradient-bronze">Stand For</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-bronze/20">
              <div className="w-16 h-16 rounded-full bg-bronze/10 flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-bronze" />
              </div>
              <h3 className="font-vollkorn text-2xl font-bold mb-3">Our Mission</h3>
              <p className="text-muted-foreground">
                To build the largest community of African creators, innovators, and entrepreneurs 
                by connecting them with global opportunities and fostering genuine collaboration.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-bronze/20">
              <div className="w-16 h-16 rounded-full bg-bronze/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-bronze" />
              </div>
              <h3 className="font-vollkorn text-2xl font-bold mb-3">Our Vision</h3>
              <p className="text-muted-foreground">
                To create an ecosystem where creators and brands thrive together, building sustainable 
                careers and making meaningful impact through authentic partnerships.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Founder's Vision */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-vollkorn text-4xl md:text-5xl font-bold text-center mb-16">
            Get to know our <span className="text-gradient-bronze">founder's vision</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-square rounded-full overflow-hidden bg-gradient-to-br from-bronze/20 to-bronze/10 border-4 border-bronze/20">
                <div className="w-full h-full flex items-center justify-center text-bronze">
                  <Users className="w-32 h-32" />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <p className="text-lg text-foreground leading-relaxed">
                "A future we envision where millions of African creators are building sustainable 
                careers, collaborating with global brands, and shaping the narrative of our continent 
                on their own terms."
              </p>
              <p className="text-lg text-foreground leading-relaxed">
                "We are building the infrastructure to make this happen, connecting creators with the 
                right opportunities, tools, and community to succeed. Every partnership, every campaign, 
                every connection gets us closer to this vision."
              </p>
              <p className="text-muted-foreground italic">
                Together, let's empower Africa's creative economy and unlock the potential of every creator.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Year Goal */}
      <section className="py-20 px-6 bg-gradient-to-br from-bronze/10 via-background to-bronze/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-vollkorn text-4xl md:text-5xl font-bold mb-8">
            Our <span className="text-gradient-bronze">5-Year Goal</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            What defines success for Crevia in the next 5 years?
          </p>
          
          <div className="bg-gradient-to-br from-bronze to-bronze-dark rounded-3xl p-12 shadow-2xl">
            <div className="text-8xl md:text-9xl font-vollkorn font-bold text-white mb-4">
              1 Million
            </div>
            <p className="text-xl text-white/90">
              Creators and entrepreneurs empowered to earn fair income for their talents.
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
            <h2 className="font-vollkorn text-4xl font-bold mb-6">Support Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Help us reach 1M creators by being part of the journey. Your support, 
              partnership, or participation makes a real difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/user-type-selection">
                <Button size="lg" className="bg-bronze hover:bg-bronze-dark font-poppins font-semibold">
                  Become a Creator
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