import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  profile: any;
  onProfileClick: () => void;
  hideRightElements?: boolean;
}

const TopBar = ({ profile, onProfileClick, hideRightElements = false }: TopBarProps) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-black border-b border-white/10">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/dashboard" className="font-vollkorn text-2xl font-bold text-white">
          Crevia
        </Link>
        
        {/* Right Side: Notifications only */}
        {!hideRightElements && (
          <div className="flex items-center gap-3">
            <Link to="/profile/notifications">
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-bronze hover:bg-white/5">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
