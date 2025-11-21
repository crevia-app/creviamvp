import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles } from "lucide-react";
import CreatorConnect from "@/components/crevia-connect/CreatorConnect";
import BrandConnect from "@/components/crevia-connect/BrandConnect";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/crevia-connect-hero.jpg";

const CreviaConnect = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      // Get user profile from the database
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
      }

      // Use profile from database, fallback to user metadata
      const type = profile?.user_type || session.user.user_metadata?.user_type || 'creator';
      setUserType(type);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Creator adjusting camera" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-6">
            Where creators and brands collaborate. <span className="text-gradient-bronze">Seamlessly.</span>
          </h1>
          <p className="text-bronze text-xl md:text-2xl mb-12 font-light">
            Real partnerships. Real work. One unified workspace.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!isAuthenticated ? (
              <>
                <Button 
                  size="lg" 
                  className="bg-bronze hover:bg-bronze/90 text-background font-medium px-8"
                  onClick={() => navigate("/auth")}
                >
                  Get Started
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-foreground/20 text-foreground hover:bg-foreground/5"
                >
                  Watch How It Works
                </Button>
              </>
            ) : (
              <Button 
                size="lg" 
                className="bg-bronze hover:bg-bronze/90 text-background font-medium px-8"
                onClick={() => {
                  const element = document.getElementById('dashboard');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-center mb-4">
            How Crevia Connect Works
          </h2>
          <p className="text-muted-foreground text-center mb-16 text-lg">
            A simple, elegant 4-step system for creators and brands
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Discover",
                description: "Find opportunities (creators) or creators (brands) instantly with smart filters."
              },
              {
                step: "02",
                title: "Connect",
                description: "Chat, negotiate, and collaborate — all on Crevia."
              },
              {
                step: "03",
                title: "Create",
                description: "Track briefs, deliverables, revisions, timelines in one shared workspace."
              },
              {
                step: "04",
                title: "Complete & Get Paid",
                description: "Payments protected with escrow. Reviews build your reputation."
              }
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="text-bronze/40 text-5xl font-bold mb-4 group-hover:text-bronze transition-colors">
                  {item.step}
                </div>
                <h3 className="font-serif text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personalized Dashboard (only for authenticated users) */}
      {isAuthenticated && (
        <div id="dashboard">
          {/* Kira AI Banner */}
          <div className="bg-gradient-to-r from-primary/10 to-bronze/10 border-y border-border/50 py-3">
            <div className="container mx-auto px-6 flex items-center justify-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-bronze" />
              <span className="text-muted-foreground">Powered by <span className="font-semibold text-foreground">Kira AI</span> — your smart collaboration assistant.</span>
            </div>
          </div>
          
          {userType === "creator" && <CreatorConnect />}
          {userType === "brand" && <BrandConnect />}
        </div>
      )}
    </div>
  );
};

export default CreviaConnect;