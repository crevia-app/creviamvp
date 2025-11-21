import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import CreatorConnect from "@/components/crevia-connect/CreatorConnect";
import BrandConnect from "@/components/crevia-connect/BrandConnect";

const CreviaConnect = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

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
      {userType === "creator" && <CreatorConnect />}
      {userType === "brand" && <BrandConnect />}
    </div>
  );
};

export default CreviaConnect;