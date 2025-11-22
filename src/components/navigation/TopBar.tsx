import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  profile: any;
  onProfileClick: () => void;
}

const TopBar = ({ profile, onProfileClick }: TopBarProps) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-black border-b border-white/10">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/dashboard" className="font-vollkorn text-2xl font-bold text-white">
          Crevia
        </Link>
        
        {/* Right Side: Notifications + Avatar */}
        <div className="flex items-center gap-3">
          <Link to="/profile/notifications">
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-bronze hover:bg-white/5">
              <Bell className="h-5 w-5" />
            </Button>
          </Link>
          
          <button onClick={onProfileClick} className="hidden md:block">
            <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-white/10 hover:ring-bronze/50 transition-all">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-bronze text-white">
                {profile?.display_name?.charAt(0) || profile?.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
