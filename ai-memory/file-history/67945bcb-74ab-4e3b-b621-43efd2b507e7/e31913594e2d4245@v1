import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Sparkles, MoreHorizontal, Briefcase, Crown } from "lucide-react";
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
import { signOutWithCleanup } from "@/lib/device-session";
import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
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
      }
    };
    fetchProfile();
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleSignOut = async () => {
    await signOutWithCleanup();
    navigate("/");
    setSheetOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setSheetOpen(false);
  };

  const navItems = [
    { id: "kira",   label: "Kira",   icon: Sparkles,  path: "/kira",          prefetch: () => import("@/pages/Kira") },
    { id: "studio", label: "Studio", icon: Briefcase, path: "/crevia-studio", prefetch: () => import("@/pages/CreviaStudio") },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-2xl border-t border-white/[0.06] safe-area-pb">
      <div className="grid grid-cols-3 h-[60px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              onTouchStart={item.prefetch}
              onMouseEnter={item.prefetch}
              className="flex items-center justify-center"
            >
              <div className={cn(
                "flex items-center justify-center w-14 h-9 rounded-2xl transition-all duration-300 ease-out",
                active ? "bg-bronze/15 scale-100" : "bg-transparent scale-95 hover:scale-100"
              )}>
                <Icon
                  strokeWidth={active ? 2.2 : 1.7}
                  className={cn(
                    "h-[22px] w-[22px] transition-all duration-300 ease-out",
                    active
                      ? "text-bronze drop-shadow-[0_0_10px_rgba(207,129,80,0.45)]"
                      : "text-foreground/40"
                  )}
                />
              </div>
            </Link>
          );
        })}

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button className="flex items-center justify-center">
              <div className={cn(
                "flex items-center justify-center w-14 h-9 rounded-2xl transition-all duration-300 ease-out",
                sheetOpen ? "bg-bronze/15 scale-100" : "bg-transparent scale-95 hover:scale-100"
              )}>
                <MoreHorizontal
                  strokeWidth={sheetOpen ? 2.2 : 1.7}
                  className={cn(
                    "h-[22px] w-[22px] transition-all duration-300 ease-out",
                    sheetOpen
                      ? "text-bronze drop-shadow-[0_0_10px_rgba(207,129,80,0.45)]"
                      : "text-foreground/40"
                  )}
                />
              </div>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-background border-border h-[85dvh] max-h-[85dvh] flex flex-col p-0">
            <SheetHeader className="px-4 pt-4 pb-2 flex-shrink-0">
              <SheetTitle className="text-foreground font-vollkorn text-lg">{t("nav.moreOptions")}</SheetTitle>
            </SheetHeader>

            <ScrollArea className="flex-1 px-4">
              {profile && (
                <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-muted/50 border border-border mb-4">
                  <Avatar className="h-11 w-11 sm:h-12 sm:w-12 ring-2 ring-bronze/30 flex-shrink-0">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-bronze to-bronze-dark text-white font-semibold text-sm">
                      {profile?.display_name?.charAt(0) || profile?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-poppins text-sm font-semibold text-foreground truncate">
                      {profile?.display_name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
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


                <Separator className="bg-border" />

                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1">{t("nav.account")}</p>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-foreground/90 hover:text-bronze hover:bg-muted/50 h-11 text-sm font-medium rounded-xl"
                    onClick={() => handleNavigation("/profile/settings")}
                  >
                    {t("profile.settings")}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-foreground/90 hover:text-bronze hover:bg-muted/50 h-11 text-sm font-medium rounded-xl"
                    onClick={() => handleNavigation("/profile/payments-billing")}
                  >
                    {t("profile.paymentsBilling")}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-foreground/90 hover:text-bronze hover:bg-muted/50 h-11 text-sm font-medium rounded-xl"
                    onClick={() => handleNavigation("/profile/feedback")}
                  >
                    {t("nav.feedback")}
                  </Button>
                </div>

                <Separator className="bg-border" />

                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1">{t("nav.support")}</p>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-foreground/90 hover:text-bronze hover:bg-muted/50 h-11 text-sm font-medium rounded-xl"
                    onClick={() => handleNavigation("/profile/help")}
                  >
                    {t("nav.helpSupport")}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-foreground/90 hover:text-bronze hover:bg-muted/50 h-11 text-sm font-medium rounded-xl"
                    onClick={() => handleNavigation("/app/about")}
                  >
                    {t("nav.aboutCrevia")}
                  </Button>
                </div>

                <Separator className="bg-border" />

                <div className="space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1">{t("nav.legal")}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      className="flex-1 text-muted-foreground hover:text-bronze hover:bg-muted/50 h-11 text-xs font-medium rounded-xl"
                      onClick={() => handleNavigation("/privacy-policy")}
                    >
                      {t("nav.privacy")}
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 text-muted-foreground hover:text-bronze hover:bg-muted/50 h-11 text-xs font-medium rounded-xl"
                      onClick={() => handleNavigation("/terms-of-service")}
                    >
                      {t("nav.terms")}
                    </Button>
                  </div>
                </div>

                <Separator className="bg-border" />

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
