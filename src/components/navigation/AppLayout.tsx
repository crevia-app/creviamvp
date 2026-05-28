import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainSidebar from "./MainSidebar";
import MobileBottomNav from "./MobileBottomNav";
import TopBar from "./TopBar";
import ProfileDrawer from "./ProfileDrawer";
import { BackButton } from "@/components/BackButton";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  useEffect(() => {
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

  const isCrevidAI  = location.pathname === "/crevia-ai";
  const isStudio    = location.pathname === "/crevia-studio";
  const isChatRoute = location.pathname === "/kira" || location.pathname.startsWith("/crevia-workspace/");
  const isSubPage   = ["/profile/", "/privacy-policy", "/terms-of-service", "/app/about", "/crv-9x4m2k"].some(
    (p) => location.pathname.startsWith(p)
  );

  return (
    <div className="h-dvh bg-background flex flex-col">
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

        <main
          className={`flex-1 min-h-0 md:ml-[100px] ${isStudio || isChatRoute ? "overflow-hidden h-full" : "overflow-auto"}`}
          style={
            !isStudio && !isChatRoute
              ? {
                  // Padding mirrors the nav bar height and animates away in sync
                  // when the nav slides off-screen on mobile.
                  // On desktop --nav-bottom-offset is always 0px (set in :root).
                  paddingBottom: "var(--nav-bottom-offset)",
                  transition: "padding-bottom 300ms ease-in-out",
                }
              : undefined
          }
        >
          {isSubPage && (
            <div className="px-4 md:px-6 pt-3 pb-1">
              <BackButton fallback="/kira" />
            </div>
          )}
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
