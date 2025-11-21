import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Target, Heart, Calendar, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import gallery1 from "@/assets/about-gallery-1.jpg";
import gallery2 from "@/assets/about-gallery-2.jpg";
import gallery3 from "@/assets/about-gallery-3.jpg";
import gallery4 from "@/assets/about-gallery-4.jpg";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Gallery Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto max-w-6xl text-center mb-12 px-6 relative z-10">
          <h1 className="font-vollkorn text-5xl md:text-7xl font-bold mb-6">
            About <span className="text-gradient-bronze">In Action</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We are on a mission to empower creators and brands to build meaningful collaborations
          </p>
        </div>
        
        {/* Scrolling Gallery */}
        <div className="relative w-full overflow-hidden">
          <div className="flex gap-6 animate-scroll-left">
            {/* First set of images */}
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
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-vollkorn text-4xl md:text-5xl font-bold mb-6">About Us</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Building Africa's largest community of creators, entrepreneurs, and innovators. 
            Together, we're bridging the gap between creators and brands, creating opportunities 
            that drive impact and growth across the continent.
          </p>
          <Button size="lg" className="bg-bronze hover:bg-bronze-dark font-poppins font-semibold">
            Join Our Community
          </Button>
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