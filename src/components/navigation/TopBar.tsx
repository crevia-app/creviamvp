import { Link } from "react-router-dom";

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
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/crevia-logo.png" alt="Crevia" className="w-7 h-7" />
          <span className="font-vollkorn text-2xl font-bold text-white">Crevia</span>
          <span className="text-[10px] font-poppins font-medium text-bronze bg-bronze/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">beta</span>
        </Link>
      </div>
    </header>
  );
};

export default TopBar;
