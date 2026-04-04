import { Link, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  CreditCard, 
  Bell, 
  ShieldCheck, 
  Settings, 
  LogOut,
  Crown
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/i18n/LanguageContext";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  userType: "creator" | "brand";
}

const ProfileDrawer = ({ isOpen, onClose, profile, userType }: ProfileDrawerProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const menuItems = [
    { icon: CreditCard, label: t("profile.paymentsBilling"), path: "/profile/payments-billing" },
    { icon: Bell, label: t("profile.notifications"), path: "/profile/notifications" },
    { icon: ShieldCheck, label: t("profile.verification"), path: "/profile/verification" },
    { icon: Settings, label: t("profile.settings"), path: "/profile/settings" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="bg-black border-white/10 w-[320px]">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-white font-vollkorn">{t("profile.menu")}</SheetTitle>
        </SheetHeader>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 mb-6">
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
            <p className="text-xs text-bronze capitalize mt-1">
              {userType === "creator" ? t("profile.creatorAccount") : t("profile.brandAccount")}
            </p>
          </div>
        </div>

        {/* Upgrade to Pro */}
        <Link
          to="/pricing"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-gradient-to-r from-bronze to-bronze-dark text-white hover:opacity-90 transition-all"
        >
          <Crown className="h-5 w-5" />
          <span className="font-poppins text-sm font-semibold">Upgrade to Pro</span>
        </Link>

        <Separator className="bg-white/10 mb-4" />

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-bronze hover:bg-white/5 transition-all"
              >
                <Icon className="h-5 w-5" />
                <span className="font-poppins text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Separator className="bg-white/10 my-4" />

        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start gap-3 text-white/80 hover:text-red-400 hover:bg-white/5"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-poppins text-sm font-medium">{t("profile.logout")}</span>
        </Button>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileDrawer;
