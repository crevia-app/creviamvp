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
  Puzzle
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  userType: "creator" | "brand";
}

const ProfileDrawer = ({ isOpen, onClose, profile, userType }: ProfileDrawerProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const menuItems = [
    { icon: CreditCard, label: "Payments & Billing", path: "/profile/payments-billing" },
    { icon: Bell, label: "Notifications", path: "/profile/notifications" },
    { icon: ShieldCheck, label: "Verification", path: "/profile/verification" },
    { icon: Settings, label: "Settings", path: "/profile/settings" },
    { icon: Puzzle, label: "Integrations", path: "/profile/integrations" },
  ];


  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="bg-black border-white/10 w-[320px]">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-white font-vollkorn">Profile Menu</SheetTitle>
        </SheetHeader>

        {/* Profile Info */}
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
            <p className="text-xs text-bronze capitalize mt-1">{userType} Account</p>
          </div>
        </div>

        <Separator className="bg-white/10 mb-4" />

        {/* Menu Items */}
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

        {/* Logout Button */}
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start gap-3 text-white/80 hover:text-red-400 hover:bg-white/5"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-poppins text-sm font-medium">Logout</span>
        </Button>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileDrawer;
