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
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  useEffect(() => {
    const appTheme = localStorage.getItem("app-theme");
    if (appTheme) setTheme(appTheme);

    let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

    const init = async () => {
      await loadProfile();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Subscribe to profile row changes so avatar/display name syncs across all devices instantly
      realtimeChannel = supabase
        .channel(`profile-sync:${session.user.id}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${session.user.id}` },
          (payload) => setProfile(payload.new)
        )
        .subscribe();
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") loadProfile();
    });

    return () => {
      subscription.unsubscribe();
      if (realtimeChannel) supabase.removeChannel(realtimeChannel);
    };
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
  };

  const isCrevidAI = location.pathname === "/crevia-ai";

  return (
    <div className="min-h-dvh bg-background flex flex-col">
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
