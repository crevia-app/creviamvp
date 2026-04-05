import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
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
  const location = useLocation();
  const { setTheme } = useTheme();
  const [userType, setUserType] = useState<"creator" | "brand" | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  useEffect(() => {
    const appTheme = localStorage.getItem("app-theme");
    if (appTheme) {
      setTheme(appTheme);
    } else {
      setTheme("light");
      localStorage.setItem("app-theme", "light");
      localStorage.setItem("theme", "light");
    }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData);
      setUserType(profileData?.user_type || null);
    } else {
      // Allow access without auth with defaults
      setUserType("creator");
      setProfile({ display_name: "Guest", email: "" });
    }
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

  const isCrevidAI = location.pathname === '/crevia-ai';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar 
        profile={profile} 
        onProfileClick={() => setProfileDrawerOpen(true)} 
        hideRightElements={isCrevidAI}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <MainSidebar 
          userType={userType} 
          profile={profile}
          onProfileClick={() => setProfileDrawerOpen(true)}
        />
        
        <main className="flex-1 overflow-auto pb-16 md:pb-0 md:ml-[100px]">
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
