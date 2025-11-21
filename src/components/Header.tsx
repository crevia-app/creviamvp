import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-border/50">
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-bronze rounded-lg"></div>
          <span className="font-vollkorn text-2xl font-bold">Crevia</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link to="/products" className="text-sm font-medium bronze-underline hover:text-bronze transition-colors">
            Products
          </Link>
          <Link to="/pricing" className="text-sm font-medium bronze-underline hover:text-bronze transition-colors">
            Pricing
          </Link>
          <Link to="/about" className="text-sm font-medium bronze-underline hover:text-bronze transition-colors">
            About
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" className="font-poppins font-semibold">
              Sign In
            </Button>
          </Link>
          <Link to="/auth?signup=true">
            <Button className="bg-bronze hover:bg-bronze-dark font-poppins font-semibold">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
