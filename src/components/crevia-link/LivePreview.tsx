import { cn } from "@/lib/utils";

interface LivePreviewProps {
  linkProfile: any;
  buttons: any[];
}

const LivePreview = ({ linkProfile, buttons }: LivePreviewProps) => {
  // Get theme-based styles
  const getThemeStyles = () => {
    const theme = linkProfile?.theme || "dark";
    
    // Premium African pattern styles with authentic cultural colors
    const africanPatterns: Record<string, React.CSSProperties> = {
      // Maasai (Kenya): Red (blood/bravery), Blue (sky/energy), Black, White, Yellow/Gold
      maasai: {
        background: `repeating-linear-gradient(0deg, #C41E3A 0px, #C41E3A 8px, #1E40AF 8px, #1E40AF 12px, #FFD700 12px, #FFD700 16px, #C41E3A 16px, #C41E3A 24px, #FFFFFF 24px, #FFFFFF 28px, #1E40AF 28px, #1E40AF 32px)`,
      },
      // Kente (Ghana): Gold (royalty/wealth), Green (harvest), Red (blood/struggle), Black (maturity)
      kente: {
        background: `linear-gradient(90deg, #FFD700 0%, #FFD700 25%, #228B22 25%, #228B22 50%, #C41E3A 50%, #C41E3A 75%, #1a1a1a 75%, #1a1a1a 100%)`,
      },
      // Ndebele (South Africa): Bold primary colors in geometric house painting tradition
      ndebele: {
        background: `linear-gradient(135deg, #1E40AF 0%, #1E40AF 20%, #FFD700 20%, #FFD700 30%, #C41E3A 30%, #C41E3A 50%, #FFFFFF 50%, #FFFFFF 60%, #228B22 60%, #228B22 80%, #1E40AF 80%, #1E40AF 100%)`,
      },
      // Ankara (Nigeria): Vibrant wax print patterns with orange, brown, gold
      ankara: {
        background: `radial-gradient(circle at 25% 25%, #F97316 20%, transparent 20%), radial-gradient(circle at 75% 75%, #8B4513 20%, transparent 20%), radial-gradient(circle at 50% 50%, #FFD700 15%, transparent 15%), #F97316`,
        backgroundSize: '40px 40px',
      },
      // Amazigh/Berber (Morocco/Algeria): Terracotta, Saffron, Indigo, Desert Sand from Atlas Mountains
      amazigh: {
        background: `linear-gradient(45deg, #CD5C5C 0%, #CD5C5C 15%, #DAA520 15%, #DAA520 30%, #4B0082 30%, #4B0082 45%, #D2B48C 45%, #D2B48C 60%, #CD5C5C 60%, #CD5C5C 75%, #4B0082 75%, #4B0082 100%)`,
        backgroundSize: '60px 60px',
      },
      // Zulu (South Africa): Beadwork colors each with meaning - love, purity, sorrow, etc.
      zulu: {
        background: `repeating-linear-gradient(90deg, #000000 0px, #000000 6px, #FFFFFF 6px, #FFFFFF 12px, #C41E3A 12px, #C41E3A 18px, #1E90FF 18px, #1E90FF 24px, #228B22 24px, #228B22 30px, #FFD700 30px, #FFD700 36px)`,
        backgroundSize: '36px 100%',
      },
      // Ethiopian: Flag colors (Green, Yellow, Red) with Habesha weaving overlay
      ethiopian: {
        background: `linear-gradient(180deg, #078930 0%, #078930 33%, #FCDD09 33%, #FCDD09 66%, #DA121A 66%, #DA121A 100%)`,
      },
      // Adinkra (Ghana): Akan symbols stamped on terracotta/rust fabric
      adinkra: {
        background: `radial-gradient(circle at 50% 50%, #1a1a1a 15%, transparent 15%), radial-gradient(circle at 0% 0%, #1a1a1a 10%, transparent 10%), radial-gradient(circle at 100% 100%, #1a1a1a 10%, transparent 10%), #8B4513`,
        backgroundSize: '30px 30px',
      },
    };

    const gradients: Record<string, string> = {
      light: "bg-gradient-to-br from-gray-50 to-gray-100",
      dark: "bg-gradient-to-br from-gray-800 to-gray-900",
      bronze: "bg-gradient-to-br from-bronze to-bronze-dark",
      minimal: "bg-white",
      sunset: "bg-gradient-to-br from-orange-400 to-pink-600",
      ocean: "bg-gradient-to-br from-blue-500 to-teal-400",
      forest: "bg-gradient-to-br from-green-600 to-emerald-800",
      royal: "bg-gradient-to-br from-purple-600 to-indigo-800",
    };

    if (africanPatterns[theme]) {
      return { style: africanPatterns[theme], className: "" };
    }
    
    return { style: {}, className: gradients[theme] || gradients.dark };
  };

  const getTextColor = () => {
    const theme = linkProfile?.theme || "dark";
    const lightTextThemes = ["dark", "bronze", "sunset", "ocean", "forest", "royal", "maasai", "kente", "ndebele", "ankara", "amazigh", "zulu", "ethiopian", "adinkra"];
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
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-bronze/30 to-bronze-dark/30 flex items-center justify-center ring-2 ring-white/20">
                <span className={cn("text-2xl font-bold", textColor)}>
                  {linkProfile?.display_name?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              
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
                      "w-full py-3 px-4 text-center text-sm font-medium transition-all",
                      buttonStyle,
                      linkProfile?.background?.button_style === "pill" 
                        ? "bg-bronze text-white"
                        : "bg-white/20 backdrop-blur-sm border border-white/30",
                      textColor
                    )}
                  >
                    {button.title}
                  </div>
                ))
              ) : (
                <>
                  <div className={cn("w-full py-3 px-4 text-center text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30", buttonStyle, textColor)}>
                    My Portfolio
                  </div>
                  <div className={cn("w-full py-3 px-4 text-center text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30", buttonStyle, textColor)}>
                    Book Me
                  </div>
                  <div className={cn("w-full py-3 px-4 text-center text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30", buttonStyle, textColor)}>
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
