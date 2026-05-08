import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();
  const { setTheme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  useEffect(() => {
    const appTheme = localStorage.getItem("app-theme");
    if (appTheme) {
      setTheme(appTheme);
    }
    loadProfile();

    // Re-load profile when the session is established after a PKCE OAuth exchange
    // (getSession() above may return null if the code is still being exchanged).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        loadProfile();
      }
    });

    return () => subscription.unsubscribe();
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
    } else {
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

  if (!profile) {
    return null;
  }

  const isCrevidAI = location.pathname === "/crevia-ai";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar
        profile={profile}
        onProfileClick={() => setProfileDrawerOpen(true)}
        hideRightElements={isCrevidAI}
      />

      <div className="flex flex-1 overflow-hidden">
        <MainSidebar
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
      />
    </div>
  );
};

export default AppLayout;
