import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MobileHeaderProps {
  title: string;
  onBack?: () => void;
}

/**
 * Mobile-only top navigation header.
 * Hidden on md+ screens where the desktop layout provides its own header.
 * Drop at the top of any page that needs a back button on mobile/PWA.
 */
export function MobileHeader({ title, onBack }: MobileHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex md:hidden items-center gap-3 px-4 py-3 border-b border-border/40 bg-background/95 backdrop-blur-sm flex-shrink-0 sticky top-0 z-50"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
    >
      <button
        onClick={handleBack}
        aria-label="Go back"
        className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-95 transition-all flex-shrink-0"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <h1 className="font-semibold text-sm text-foreground truncate">{title}</h1>
    </div>
  );
}
