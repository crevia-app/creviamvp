import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Sparkles, MoreHorizontal, Plug, Briefcase, Crown } from "lucide-react";
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
import { useLanguage } from "@/i18n/LanguageContext";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
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
    return location.pathname === path || location.pathname.startsWith(path + "/");
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
    { id: "kira", label: "Kira", icon: Sparkles, path: "/kira" },
    { id: "studio", label: "Studio", icon: Briefcase, path: "/crevia-studio" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-white/10 safe-area-pb">
      <div className="grid grid-cols-3 h-16">
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

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-1 text-white/60">
              <MoreHorizontal className="h-5 w-5" />
              <span className="font-poppins text-xs font-medium">{t("common.more")}</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-black border-white/10 h-[85vh] max-h-[85vh] flex flex-col p-0">
            <SheetHeader className="px-4 pt-4 pb-2 flex-shrink-0">
              <SheetTitle className="text-white font-vollkorn text-lg">{t("nav.moreOptions")}</SheetTitle>
            </SheetHeader>
            
            <ScrollArea className="flex-1 px-4">
              {profile && (
                <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 mb-4">
                  <Avatar className="h-11 w-11 sm:h-12 sm:w-12 ring-2 ring-bronze/30 flex-shrink-0">
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

                {/* Upgrade to Pro — always visible */}
                <Link
                  to="/pricing"
                  onClick={() => setSheetOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-bronze to-bronze-dark text-white hover:opacity-90 transition-all w-full"
                >
                  <Crown className="h-5 w-5 flex-shrink-0" />
                  <span className="font-poppins text-sm font-semibold">Upgrade to Pro</span>
                </Link>

                <Separator className="bg-white/10" />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-2 mb-2">
                    <Plug className="w-4 h-4 text-bronze" />
                    <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">{t("profile.integrations")}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-white/90 hover:text-bronze hover:bg-white/5 h-11 text-sm font-medium rounded-xl"
                    onClick={() => handleNavigation("/profile/integrations")}
                  >
                    <Plug className="w-4 h-4 mr-3" />
                    {t("integrations.manageIntegrations")}
                  </Button>
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider px-2 mb-1">{t("nav.account")}</p>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-white/90 hover:text-bronze hover:bg-white/5 h-11 text-sm font-medium rounded-xl"
                    onClick={() => handleNavigation("/profile/settings")}
                  >
                    {t("profile.settings")}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-white/90 hover:text-bronze hover:bg-white/5 h-11 text-sm font-medium rounded-xl"
                    onClick={() => handleNavigation("/profile/payments-billing")}
                  >
                    {t("profile.paymentsBilling")}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-white/90 hover:text-bronze hover:bg-white/5 h-11 text-sm font-medium rounded-xl"
                    onClick={() => handleNavigation("/profile/feedback")}
                  >
                    {t("nav.feedback")}
                  </Button>
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider px-2 mb-1">{t("nav.support")}</p>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-white/90 hover:text-bronze hover:bg-white/5 h-11 text-sm font-medium rounded-xl"
                    onClick={() => handleNavigation("/profile/help")}
                  >
                    {t("nav.helpSupport")}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-white/90 hover:text-bronze hover:bg-white/5 h-11 text-sm font-medium rounded-xl"
                    onClick={() => handleNavigation("/app/about")}
                  >
                    {t("nav.aboutCrevia")}
                  </Button>
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider px-2 mb-1">{t("nav.legal")}</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      className="flex-1 text-white/60 hover:text-bronze hover:bg-white/5 h-11 text-xs font-medium rounded-xl"
                      onClick={() => handleNavigation("/privacy-policy")}
                    >
                      {t("nav.privacy")}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="flex-1 text-white/60 hover:text-bronze hover:bg-white/5 h-11 text-xs font-medium rounded-xl"
                      onClick={() => handleNavigation("/terms-of-service")}
                    >
                      {t("nav.terms")}
                    </Button>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 h-11 text-sm font-medium rounded-xl"
                  onClick={handleSignOut}
                >
                  {t("nav.logOut")}
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
