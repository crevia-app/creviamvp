import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const ConnectHeader = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/crevia-logo.png" alt="Crevia" className="w-9 h-9 md:w-11 md:h-11 rounded-full ring-1 ring-border" />
          <span className="font-vollkorn text-2xl font-bold text-primary">Crevia</span>
          <span className="text-[8px] font-poppins font-medium text-primary bg-primary/10 px-1 py-0.5 rounded-full uppercase tracking-wider">beta</span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link to="/crevia-connect" className="text-sm font-medium hover:text-primary transition-colors">
            Connect
          </Link>
          <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default ConnectHeader;