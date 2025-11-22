import { Link, useLocation } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
        <Sheet>
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
            <div className="grid gap-2 py-4">
              <Link to="/crevia-link">
                <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-bronze hover:bg-white/5">
                  Crevia Link
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-bronze hover:bg-white/5">
                  About
                </Button>
              </Link>
              <Link to="/profile/help">
                <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-bronze hover:bg-white/5">
                  Help & Support
                </Button>
              </Link>
              <Link to="/privacy-policy">
                <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-bronze hover:bg-white/5">
                  Privacy Policy
                </Button>
              </Link>
              <Link to="/terms-of-service">
                <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-bronze hover:bg-white/5">
                  Terms of Service
                </Button>
              </Link>
              <Link to="/profile/settings">
                <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-bronze hover:bg-white/5">
                  Settings
                </Button>
              </Link>
              <Link to="/profile/payments-billing">
                <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-bronze hover:bg-white/5">
                  Payments & Billing
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" className="w-full justify-start text-white/80 hover:text-bronze hover:bg-white/5">
                  My Dashboard
                </Button>
              </Link>
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
