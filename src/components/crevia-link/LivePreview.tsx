import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LivePreviewProps {
  linkProfile: any;
  buttons: any[];
}

const LivePreview = ({ linkProfile, buttons }: LivePreviewProps) => {
  const theme = linkProfile?.theme || "dark";
  const bgStyle = linkProfile?.background?.style || "solid";
  const customBgUrl = linkProfile?.background?.custom_bg_url;

  const gradients: Record<string, string> = {
    light: "from-gray-50 to-gray-100",
    dark: "from-gray-800 to-gray-900",
    bronze: "from-bronze to-bronze-dark",
    minimal: "bg-white",
    sunset: "from-orange-400 to-pink-600",
    ocean: "from-blue-500 to-teal-400",
    forest: "from-green-600 to-emerald-800",
    royal: "from-purple-600 to-indigo-800",
    midnight: "from-slate-900 to-blue-950",
    rose: "from-rose-400 to-pink-300",
    noir: "from-zinc-900 to-neutral-950",
    sapphire: "from-blue-700 to-indigo-900",
    burgundy: "from-rose-900 to-red-950",
    emerald: "from-emerald-700 to-green-900",
    lavender: "from-violet-400 to-purple-500",
    champagne: "from-amber-100 to-yellow-50",
  };

  // Build background classes based on style
  const getBackgroundClass = () => {
    if (theme === "custom_image" && customBgUrl) return "";
    const grad = gradients[theme] || gradients.dark;
    if (theme === "minimal") return grad;
    
    switch (bgStyle) {
      case "gradient":
        return `bg-gradient-to-br ${grad}`;
      case "pattern":
        return `bg-gradient-to-br ${grad}`;
      case "blur":
        return `bg-gradient-to-br ${grad}`;
      case "solid":
      default:
        return `bg-gradient-to-br ${grad}`;
    }
  };

  const getInlineStyles = (): React.CSSProperties => {
    if (theme === "custom_image" && customBgUrl) {
      return { backgroundImage: `url(${customBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    return {};
  };

  const getTextColor = () => {
    const lightTextThemes = ["dark", "bronze", "sunset", "ocean", "forest", "royal", "midnight", "noir", "sapphire", "burgundy", "emerald", "lavender", "custom_image"];
    return lightTextThemes.includes(theme) ? "text-white" : "text-gray-900";
  };

  const getButtonStyle = () => {
    const style = linkProfile?.background?.button_style || "rounded";
    const styles: Record<string, string> = {
      rounded: "rounded-full",
      sharp: "rounded-none",
      soft: "rounded-lg",
      pill: "rounded-full",
    };
    return styles[style] || "rounded-full";
  };

  const textColor = getTextColor();
  const buttonStyle = getButtonStyle();
  const isCustomImage = theme === "custom_image" && customBgUrl;

  return (
    <div className="relative mx-auto w-[280px]">
      {/* Phone Frame */}
      <div className="relative rounded-[3rem] border-[12px] border-gray-800 bg-gray-800 shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-800 rounded-b-2xl z-10" />
        
        {/* Screen */}
        <div 
          className={cn("h-[520px] overflow-y-auto relative", getBackgroundClass())}
          style={getInlineStyles()}
        >
          {/* Overlay for custom image */}
          {isCustomImage && <div className="absolute inset-0 bg-black/50" />}
          
          {/* Pattern overlay */}
          {bgStyle === "pattern" && !isCustomImage && (
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }} />
          )}
          
          {/* Blur overlay */}
          {bgStyle === "blur" && !isCustomImage && (
            <div className="absolute inset-0 backdrop-blur-sm bg-white/5" />
          )}

          <div className="pt-10 pb-8 px-5 relative z-10">
            {/* Profile Section */}
            <div className="text-center mb-6">
              {linkProfile?.profile_picture ? (
                <Avatar className="w-20 h-20 mx-auto mb-3 ring-2 ring-white/20">
                  <AvatarImage src={linkProfile.profile_picture} />
                  <AvatarFallback className="bg-gradient-to-br from-bronze/30 to-bronze-dark/30 text-2xl font-bold">
                    {linkProfile?.display_name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-bronze/30 to-bronze-dark/30 flex items-center justify-center ring-2 ring-white/20">
                  <span className={cn("text-2xl font-bold", textColor)}>
                    {linkProfile?.display_name?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
              
              <h2 className={cn("font-semibold text-lg mb-1", textColor)}>
                {linkProfile?.display_name || "Your Name"}
              </h2>
              
              <p className={cn("text-sm opacity-70 mb-2", textColor)}>
                @{linkProfile?.username || "username"}
              </p>
              
              {linkProfile?.bio && (
                <p className={cn("text-xs opacity-80 max-w-[200px] mx-auto", textColor)}>
                  {linkProfile.bio}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              {buttons.length > 0 ? (
                buttons.filter(b => b.visible !== false).map((button) => (
                  <div
                    key={button.id}
                    className={cn(
                      "w-full py-3 px-4 text-center text-sm font-medium transition-all shadow-sm",
                      buttonStyle,
                      "bg-white text-gray-900"
                    )}
                  >
                    {button.title}
                  </div>
                ))
              ) : (
                <>
                  <div className={cn("w-full py-3 px-4 text-center text-sm font-medium shadow-sm bg-white text-gray-900", buttonStyle)}>
                    My Portfolio
                  </div>
                  <div className={cn("w-full py-3 px-4 text-center text-sm font-medium shadow-sm bg-white text-gray-900", buttonStyle)}>
                    Book Me
                  </div>
                  <div className={cn("w-full py-3 px-4 text-center text-sm font-medium shadow-sm bg-white text-gray-900", buttonStyle)}>
                    Latest Work
                  </div>
                </>
              )}
            </div>

            {/* Crevia Branding */}
            <div className="mt-8 text-center">
              <p className={cn("text-[10px] opacity-50", textColor)}>
                Powered by Crevia
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
