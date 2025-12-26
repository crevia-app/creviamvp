import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Sparkles, MoreHorizontal, Plug, Calendar, Instagram, Music2 } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
    { id: "kira", label: "Kira", icon: Sparkles, path: "/kira" },
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
                "flex flex-col items-center justify-center gap-1 transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] group",
                active ? "text-bronze" : "text-white/60"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-all duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110", 
                active && "drop-shadow-[0_0_8px_rgba(207,129,80,0.5)]"
              )} />
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
          <SheetContent side="bottom" className="bg-black border-white/10 h-[85vh] max-h-[85vh] flex flex-col p-0">
            <SheetHeader className="px-4 pt-4 pb-2 flex-shrink-0">
              <SheetTitle className="text-white font-vollkorn text-lg">More Options</SheetTitle>
            </SheetHeader>
            
            <ScrollArea className="flex-1 px-4">
              {/* Profile Info */}
              {profile && (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 mb-4">
                  <Avatar className="h-12 w-12 ring-2 ring-bronze/30 flex-shrink-0">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-bronze to-bronze-dark text-white font-semibold text-sm">
                      {profile?.display_name?.charAt(0) || profile?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-poppins text-sm font-semibold text-white truncate">
                      {profile?.display_name || "User"}
                    </p>
                    <p className="text-xs text-white/50 truncate">{profile?.email}</p>
                    {userType && (
                      <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-bronze/20 text-bronze border border-bronze/30 capitalize">
                        {userType}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="space-y-4 pb-8">
                {/* Tools Section */}
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider px-2 mb-1">Tools</p>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-white/90 hover:text-bronze hover:bg-white/5 h-11 text-sm font-medium rounded-xl"
                    onClick={() => handleNavigation("/crevia-link")}
                  >
                    Crevia Link
                  </Button>
                </div>

                <Separator className="bg-white/10" />

                {/* Integrations Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-2 mb-2">
                    <Plug className="w-4 h-4 text-bronze" />
                    <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Integrations</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                          <Instagram className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Instagram</p>
                          <p className="text-[10px] text-white/50">Not connected</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs h-8 px-3 border-white/20 hover:bg-white/10">
                        Connect
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center border border-white/20">
                          <Music2 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">TikTok</p>
                          <p className="text-[10px] text-white/50">Not connected</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs h-8 px-3 border-white/20 hover:bg-white/10">
                        Connect
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Google Calendar</p>
                          <p className="text-[10px] text-white/50">Not connected</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs h-8 px-3 border-white/20 hover:bg-white/10">
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Account Section */}
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider px-2 mb-1">Account</p>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-white/90 hover:text-bronze hover:bg-white/5 h-11 text-sm font-medium rounded-xl"
                    onClick={() => handleNavigation("/profile/settings")}
                  >
                    Settings
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-white/90 hover:text-bronze hover:bg-white/5 h-11 text-sm font-medium rounded-xl"
                    onClick={() => handleNavigation("/profile/payments-billing")}
                  >
                    Payments & Billing
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-white/90 hover:text-bronze hover:bg-white/5 h-11 text-sm font-medium rounded-xl"
                    onClick={() => handleNavigation("/profile/feedback")}
                  >
                    Feedback
                  </Button>
                </div>

                <Separator className="bg-white/10" />

                {/* Support Section */}
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider px-2 mb-1">Support</p>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-white/90 hover:text-bronze hover:bg-white/5 h-11 text-sm font-medium rounded-xl"
                    onClick={() => handleNavigation("/profile/help")}
                  >
                    Help & Support
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-white/90 hover:text-bronze hover:bg-white/5 h-11 text-sm font-medium rounded-xl"
                    onClick={() => handleNavigation("/about")}
                  >
                    About Crevia
                  </Button>
                </div>

                <Separator className="bg-white/10" />

                {/* Legal Section */}
                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider px-2 mb-1">Legal</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      className="flex-1 text-white/60 hover:text-bronze hover:bg-white/5 h-10 text-xs font-medium rounded-xl"
                      onClick={() => handleNavigation("/privacy-policy")}
                    >
                      Privacy
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="flex-1 text-white/60 hover:text-bronze hover:bg-white/5 h-10 text-xs font-medium rounded-xl"
                      onClick={() => handleNavigation("/terms-of-service")}
                    >
                      Terms
                    </Button>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Logout */}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 h-11 text-sm font-medium rounded-xl"
                  onClick={handleSignOut}
                >
                  Log Out
                </Button>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
