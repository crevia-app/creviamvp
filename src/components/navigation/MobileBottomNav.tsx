import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Sparkles, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [userType, setUserType] = useState<"creator" | "brand" | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(profileData);
        setUserType(profileData?.user_type || null);
      }
    };
    fetchProfile();
  }, []);

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    setSheetOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setSheetOpen(false);
  };

  const navItems = [
    { id: "home", label: "Home", icon: Home, path: "/dashboard" },
    { id: "connect", label: "Connect", icon: Users, path: "/crevia-connect" },
    { id: "kira", label: "Kira", icon: Sparkles, path: "/crevia-ai" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-white/10">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                active ? "text-bronze" : "text-white/60"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_rgba(207,129,80,0.5)]")} />
              <span className="font-poppins text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* More Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-1 text-white/60">
              <MoreHorizontal className="h-5 w-5" />
              <span className="font-poppins text-xs font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-black border-white/10">
            <SheetHeader>
              <SheetTitle className="text-white font-vollkorn">More Options</SheetTitle>
            </SheetHeader>
            
            {/* Profile Info */}
            {profile && (
              <>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 my-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-bronze text-white">
                      {profile?.display_name?.charAt(0) || profile?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-poppins text-sm font-semibold text-white">
                      {profile?.display_name || "User"}
                    </p>
                    <p className="text-xs text-white/50 truncate">{profile?.email}</p>
                    {userType && (
                      <p className="text-xs text-bronze capitalize mt-1">{userType} Account</p>
                    )}
                  </div>
                </div>
                <Separator className="bg-white/10 mb-4" />
              </>
            )}
            
            <div className="grid gap-2 pb-4">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white/80 hover:text-bronze hover:bg-white/5"
                onClick={() => handleNavigation("/crevia-link")}
              >
                Crevia Link
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white/80 hover:text-bronze hover:bg-white/5"
                onClick={() => handleNavigation("/about")}
              >
                About
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white/80 hover:text-bronze hover:bg-white/5"
                onClick={() => handleNavigation("/profile/help")}
              >
                Help & Support
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white/80 hover:text-bronze hover:bg-white/5"
                onClick={() => handleNavigation("/privacy-policy")}
              >
                Privacy Policy
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white/80 hover:text-bronze hover:bg-white/5"
                onClick={() => handleNavigation("/terms-of-service")}
              >
                Terms of Service
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white/80 hover:text-bronze hover:bg-white/5"
                onClick={() => handleNavigation("/profile/settings")}
              >
                Settings
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white/80 hover:text-bronze hover:bg-white/5"
                onClick={() => handleNavigation("/profile/feedback")}
              >
                Feedback
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white/80 hover:text-bronze hover:bg-white/5"
                onClick={() => handleNavigation("/profile/payments-billing")}
              >
                Payments & Billing
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white/80 hover:text-bronze hover:bg-white/5"
                onClick={() => handleNavigation("/dashboard")}
              >
                My Dashboard
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white/80 hover:text-bronze hover:bg-white/5"
                onClick={handleSignOut}
              >
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
