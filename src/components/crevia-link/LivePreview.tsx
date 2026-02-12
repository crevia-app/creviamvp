import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LivePreviewProps {
  linkProfile: any;
  buttons: any[];
}

const LivePreview = ({ linkProfile, buttons }: LivePreviewProps) => {
  // Get theme-based styles
  const getThemeStyles = () => {
    const theme = linkProfile?.theme || "dark";
    
    const gradients: Record<string, string> = {
      light: "bg-gradient-to-br from-gray-50 to-gray-100",
      dark: "bg-gradient-to-br from-gray-800 to-gray-900",
      bronze: "bg-gradient-to-br from-bronze to-bronze-dark",
      minimal: "bg-white",
      sunset: "bg-gradient-to-br from-orange-400 to-pink-600",
      ocean: "bg-gradient-to-br from-blue-500 to-teal-400",
      forest: "bg-gradient-to-br from-green-600 to-emerald-800",
      royal: "bg-gradient-to-br from-purple-600 to-indigo-800",
      midnight: "bg-gradient-to-br from-slate-900 to-blue-950",
      rose: "bg-gradient-to-br from-rose-400 to-pink-300",
      noir: "bg-gradient-to-br from-zinc-900 to-neutral-950",
      sapphire: "bg-gradient-to-br from-blue-700 to-indigo-900",
      burgundy: "bg-gradient-to-br from-rose-900 to-red-950",
      emerald: "bg-gradient-to-br from-emerald-700 to-green-900",
      lavender: "bg-gradient-to-br from-violet-400 to-purple-500",
      champagne: "bg-gradient-to-br from-amber-100 to-yellow-50",
    };
    
    return { style: {}, className: gradients[theme] || gradients.dark };
  };

  const getTextColor = () => {
    const theme = linkProfile?.theme || "dark";
    const lightTextThemes = ["dark", "bronze", "sunset", "ocean", "forest", "royal", "midnight", "noir", "sapphire", "burgundy", "emerald", "lavender"];
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

  const { style: bgStyle, className: bgClass } = getThemeStyles();
  const textColor = getTextColor();
  const buttonStyle = getButtonStyle();

  return (
    <div className="relative mx-auto w-[280px]">
      {/* Phone Frame */}
      <div className="relative rounded-[3rem] border-[12px] border-gray-800 bg-gray-800 shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-800 rounded-b-2xl z-10" />
        
        {/* Screen */}
        <div 
          className={cn("h-[520px] overflow-y-auto", bgClass)}
          style={bgStyle}
        >
          <div className="pt-10 pb-8 px-5">
            {/* Profile Section */}
            <div className="text-center mb-6">
              {/* Avatar */}
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
              
              {/* Name */}
              <h2 className={cn("font-semibold text-lg mb-1", textColor)}>
                {linkProfile?.display_name || "Your Name"}
              </h2>
              
              {/* Username */}
              <p className={cn("text-sm opacity-70 mb-2", textColor)}>
                @{linkProfile?.username || "username"}
              </p>
              
              {/* Bio */}
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
