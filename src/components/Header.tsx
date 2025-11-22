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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, User, CreditCard, Bell, Shield, Settings, HelpCircle, MessageSquare, LogOut, Link2, LayoutDashboard, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-border/50 animate-fade-in">
      <nav className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-bronze rounded-lg transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"></div>
          <span className="font-vollkorn text-xl md:text-2xl font-bold transition-colors duration-300 group-hover:text-bronze">Crevia</span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          <Link to="/" className="text-sm font-medium hover:text-bronze transition-all duration-300 bronze-underline">
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
          
          <Link to="/pricing" className="text-sm font-medium hover:text-bronze transition-all duration-300 bronze-underline">
            Pricing
          </Link>
          
          <Link to="/about" className="text-sm font-medium hover:text-bronze transition-all duration-300 bronze-underline">
            About
          </Link>
        </div>

        {/* Mobile Menu & User Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-background">
              <nav className="flex flex-col gap-6 mt-8">
                <Link 
                  to="/" 
                  className="text-base font-medium hover:text-bronze transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                
                {isAuthenticated && (
                  <div className="flex flex-col gap-4 pl-4 border-l-2 border-bronze/20">
                    <Link 
                      to="/crevia-connect" 
                      className="text-sm font-medium hover:text-bronze transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Crevia Connect
                    </Link>
                    <Link 
                      to="/crevia-ai" 
                      className="text-sm font-medium hover:text-bronze transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Crevia AI
                    </Link>
                    <Link 
                      to="/crevia-link" 
                      className="text-sm font-medium hover:text-bronze transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Crevia Link
                    </Link>
                  </div>
                )}
                
                <Link 
                  to="/pricing" 
                  className="text-base font-medium hover:text-bronze transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                
                <Link 
                  to="/about" 
                  className="text-base font-medium hover:text-bronze transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>

                {!isAuthenticated && (
                  <div className="flex flex-col gap-3 pt-4 border-t border-border">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full font-poppins font-semibold">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/user-type-selection" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-bronze hover:bg-bronze-dark font-poppins font-semibold">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop User Actions */}
          <div className="hidden lg:flex items-center gap-3">
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
                <DropdownMenuContent className="w-56 bg-background border-border z-50" align="end">
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
                  <Button variant="ghost" className="font-poppins font-semibold transition-all duration-300 hover-scale">
                    Sign In
                  </Button>
                </Link>
                <Link to="/user-type-selection">
                  <Button className="bg-bronze hover:bg-bronze-dark font-poppins font-semibold transition-all duration-300 hover-lift hover-glow">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile User Avatar (Authenticated Only) */}
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex lg:hidden items-center gap-1 outline-none">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-bronze text-white">
                    {profile?.display_name?.charAt(0) || profile?.handle?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background border-border z-50" align="end">
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
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
