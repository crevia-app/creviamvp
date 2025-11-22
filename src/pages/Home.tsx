import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, TrendingUp, Sparkles, Link2, Brain, Globe } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 md:space-y-6 mb-8 md:mb-12">
            <h1 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight px-2">
              Empowering creators to <br className="hidden sm:block" />
              <span className="text-gradient-bronze">own their digital careers</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto font-poppins px-4">
              Tools that help you collaborate, grow, and earn — all in one simple platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-4 md:pt-6 px-4">
              <Link to="/user-type-selection" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-bronze hover:bg-bronze-dark text-base md:text-lg px-6 md:px-8 py-5 md:py-6 font-poppins font-semibold">
                  Get Started
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6 font-poppins font-semibold">
                Learn More
              </Button>
            </div>
          </div>

          {/* Demo Section */}
          <div className="mt-16 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-bronze/10 to-background border border-bronze/20">
            <div className="aspect-video bg-secondary/50 flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <div className="w-20 h-20 rounded-full bg-bronze/20 flex items-center justify-center mx-auto">
                  <Sparkles className="w-10 h-10 text-bronze" />
                </div>
                <h3 className="font-vollkorn text-2xl font-bold">Platform Demo</h3>
                <p className="text-muted-foreground">See Crevia in action</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Crevia Solves */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-vollkorn text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-16 px-2">
            What <span className="text-gradient-bronze">Crevia</span> Solves
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-bronze/20">
              <div className="w-14 h-14 rounded-xl bg-bronze/10 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-bronze" />
              </div>
              <h3 className="font-vollkorn text-2xl font-bold mb-4">Find collaborations effortlessly</h3>
              <p className="text-muted-foreground">
                Connect with brands and creators that align with your vision, without the endless searching.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-bronze/20">
              <div className="w-14 h-14 rounded-xl bg-bronze/10 flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-bronze" />
              </div>
              <h3 className="font-vollkorn text-2xl font-bold mb-4">Manage everything in one place</h3>
              <p className="text-muted-foreground">
                From campaigns to payments, keep your entire creator business organized and professional.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-bronze/20">
              <div className="w-14 h-14 rounded-xl bg-bronze/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-bronze" />
              </div>
              <h3 className="font-vollkorn text-2xl font-bold mb-4">Grow with AI guidance</h3>
              <p className="text-muted-foreground">
                Get personalized recommendations and insights to level up your creator journey.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-vollkorn text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-16 px-2">
            Powerful <span className="text-gradient-bronze">Products</span>
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <Card className="p-8 bg-gradient-to-br from-bronze/5 to-background hover:shadow-xl transition-all duration-300 border-bronze/20">
              <Link2 className="w-12 h-12 text-bronze mb-4" />
              <h3 className="font-vollkorn text-2xl font-bold mb-3">Crevia Connect</h3>
              <p className="text-muted-foreground mb-4">
                Connect creators & brands for seamless collaborations.
              </p>
              <Button variant="ghost" className="text-bronze hover:text-bronze-dark p-0 h-auto font-semibold bronze-underline">
                Learn more →
              </Button>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-bronze/5 to-background hover:shadow-xl transition-all duration-300 border-bronze/20">
              <Brain className="w-12 h-12 text-bronze mb-4" />
              <h3 className="font-vollkorn text-2xl font-bold mb-3">Crevia AI</h3>
              <p className="text-muted-foreground mb-4">
                Your personal creator growth assistant, powered by Kira.
              </p>
              <Button variant="ghost" className="text-bronze hover:text-bronze-dark p-0 h-auto font-semibold bronze-underline">
                Learn more →
              </Button>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-bronze/5 to-background hover:shadow-xl transition-all duration-300 border-bronze/20">
              <Link2 className="w-12 h-12 text-bronze mb-4" />
              <h3 className="font-vollkorn text-2xl font-bold mb-3">Crevia Link</h3>
              <p className="text-muted-foreground mb-4">
                Your all-in-one public link to showcase your work.
              </p>
              <Button variant="ghost" className="text-bronze hover:text-bronze-dark p-0 h-auto font-semibold bronze-underline">
                Learn more →
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-gradient-to-br from-bronze/10 via-background to-bronze/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-vollkorn text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 px-2">
            Ready to own your story?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 px-4">
            Join thousands of creators building their digital careers on Crevia.
          </p>
          <Link to="/user-type-selection">
            <Button size="lg" className="bg-bronze hover:bg-bronze-dark text-base md:text-lg px-8 md:px-12 py-5 md:py-6 font-poppins font-semibold">
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
