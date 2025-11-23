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
        <Link to="/dashboard" className="font-vollkorn text-2xl font-bold text-white">
          Crevia
        </Link>
      </div>
    </header>
  );
};

export default TopBar;
