import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-background/95 backdrop-blur-md z-50 border-b border-border/50 animate-fade-in">
      <nav className="container mx-auto px-3 md:px-6 py-3 flex items-center justify-between max-w-7xl">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/crevia-logo.png" alt="Crevia" className="w-9 h-9 md:w-11 md:h-11 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
          <span className="font-vollkorn text-xl md:text-2xl font-bold transition-colors duration-300 group-hover:text-bronze">Crevia</span>
          <span className="text-[8px] font-poppins font-medium text-bronze bg-bronze/10 px-1 py-0.5 rounded-full uppercase tracking-wider">beta</span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          <Link to="/pricing" className="text-sm font-medium hover:text-bronze transition-all duration-300 bronze-underline">
            Pricing
          </Link>
          
          <Link to="/about" className="text-sm font-medium hover:text-bronze transition-all duration-300 bronze-underline">
            About
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 md:gap-3">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" className="!h-14 !w-14 p-0 flex items-center justify-center">
                <Menu className="!h-8 !w-8" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-background">
              <nav className="flex flex-col gap-6 mt-8">
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Header;
