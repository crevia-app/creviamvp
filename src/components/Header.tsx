import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, User, CreditCard, Bell, Shield, Settings, HelpCircle, MessageSquare, LogOut, Link2, LayoutDashboard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Check authentication status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    setProfile(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-border/50">
      <nav className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-bronze rounded-lg"></div>
          <span className="font-vollkorn text-xl md:text-2xl font-bold">Crevia</span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          <Link to="/" className="text-sm font-medium hover:text-bronze transition-colors">
            Home
          </Link>
          
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-bronze transition-colors outline-none">
                Products <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border-border z-50">
                <DropdownMenuItem asChild>
                  <Link to="/crevia-connect" className="cursor-pointer">Crevia Connect</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/crevia-ai" className="cursor-pointer">Crevia AI</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/crevia-link" className="cursor-pointer">Crevia Link</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Link to="/pricing" className="text-sm font-medium hover:text-bronze transition-colors">
            Pricing
          </Link>
          
          <Link to="/about" className="text-sm font-medium hover:text-bronze transition-colors">
            About
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-bronze text-white">
                    {profile?.display_name?.charAt(0) || profile?.handle?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background border-border" align="end">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    My Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/crevia-link" className="cursor-pointer flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    My Crevia Link
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/payments" className="cursor-pointer flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payments & Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/notifications" className="cursor-pointer flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/verification" className="cursor-pointer flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Verification
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/help" className="cursor-pointer flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Help & Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/feedback" className="cursor-pointer flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Feedback
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer flex items-center gap-2 text-destructive">
                  <LogOut className="w-4 h-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" className="font-poppins font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link to="/user-type-selection">
                <Button className="bg-bronze hover:bg-bronze-dark font-poppins font-semibold">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
