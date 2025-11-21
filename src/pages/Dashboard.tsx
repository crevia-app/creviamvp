import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import CreatorDashboard from "./dashboard/CreatorDashboard";
import BrandDashboard from "./dashboard/BrandDashboard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", session.user.id)
      .single();

    setUserType(profile?.user_type || null);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 pt-32 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24">
        {userType === "creator" ? <CreatorDashboard /> : <BrandDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;
