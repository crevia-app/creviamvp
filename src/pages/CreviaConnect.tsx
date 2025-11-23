import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles } from "lucide-react";
import CreatorConnect from "@/components/crevia-connect/CreatorConnect";
import BrandConnect from "@/components/crevia-connect/BrandConnect";
import { Button } from "@/components/ui/button";

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

  // If authenticated, show the workspace directly
  if (isAuthenticated) {
    return (
      <div className="h-full">
        {userType === "creator" && <CreatorConnect />}
        {userType === "brand" && <BrandConnect />}
      </div>
    );
  }

  // Public landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-background">
      <div className="relative min-h-screen flex items-center justify-center py-16 md:py-24 px-4 md:px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-bronze/5 via-background to-background" />
        
        <div className="relative z-10 text-center max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6 md:mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-bronze" />
            <span className="text-bronze text-xs md:text-sm font-medium tracking-wider uppercase">
              Crevia Connect
            </span>
          </div>
          
          <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold text-foreground mb-6 md:mb-8 leading-[1.1] animate-fade-in px-2">
            Where creators and brands{" "}
            <span className="text-gradient-bronze">create magic</span>
          </h1>
          
          <p className="text-muted-foreground text-base md:text-xl lg:text-2xl mb-10 md:mb-16 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in px-4">
            The ultimate collaboration workspace. Discover opportunities, manage campaigns, 
            and build partnerships—all powered by AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center animate-fade-in px-4">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-bronze hover:bg-bronze/90 text-background font-semibold px-8 md:px-10 py-5 md:py-6 text-base md:text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => navigate("/auth")}
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto border-2 border-border text-foreground hover:bg-accent/50 font-medium px-8 md:px-10 py-5 md:py-6 text-base md:text-lg rounded-full transition-all duration-300"
            >
              See How It Works
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreviaConnect;