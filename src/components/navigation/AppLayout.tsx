import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainSidebar from "./MainSidebar";
import MobileBottomNav from "./MobileBottomNav";
import TopBar from "./TopBar";
import ProfileDrawer from "./ProfileDrawer";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"creator" | "brand" | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    setProfile(profileData);
    setUserType(profileData?.user_type || null);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/60 font-poppins">Loading...</div>
      </div>
    );
  }

  if (!userType || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar profile={profile} onProfileClick={() => setProfileDrawerOpen(true)} />
      
      <div className="flex flex-1 overflow-hidden">
        <MainSidebar 
          userType={userType} 
          profile={profile}
          onProfileClick={() => setProfileDrawerOpen(true)}
        />
        
        <main className={`flex-1 overflow-auto pb-16 md:pb-0 ${userType ? 'md:ml-64' : ''}`}>
          {children}
        </main>
      </div>

      <MobileBottomNav />

      <ProfileDrawer
        isOpen={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        profile={profile}
        userType={userType}
      />
    </div>
  );
};

export default AppLayout;
