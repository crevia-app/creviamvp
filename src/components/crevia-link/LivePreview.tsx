import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, Sparkles } from "lucide-react";

interface LivePreviewProps {
  linkProfile: any;
  buttons: any[];
}

const LivePreview = ({ linkProfile, buttons }: LivePreviewProps) => {
  const theme = linkProfile?.theme || "dark";
  const bgStyle = linkProfile?.background?.style || "solid";
  const customBgUrl = linkProfile?.background?.custom_bg_url;
  const buttonStyle = linkProfile?.background?.button_style || "rounded";
  const buttonSpacing = linkProfile?.background?.button_spacing || 12;
  const fontFamily = linkProfile?.background?.font_family || "poppins";
  const hoverEffects = linkProfile?.background?.hover_effects !== false;
  const fadeAnimation = linkProfile?.background?.fade_animation !== false;
  const showBranding = linkProfile?.show_crevia_branding !== false;
  const showVerified = linkProfile?.show_verified_badge;
  const isCustomImage = theme === "custom_image" && customBgUrl;

  // Theme background classes
  const themeMap: Record<string, { bg: string; text: string; lightText: boolean }> = {
    light: { bg: "bg-white", text: "text-gray-900", lightText: false },
    dark: { bg: "bg-gradient-to-br from-gray-800 to-gray-900", text: "text-white", lightText: true },
    bronze: { bg: "bg-gradient-to-br from-[#1a1a1a] to-[#2d2520]", text: "text-white", lightText: true },
    minimal: { bg: "bg-gray-50", text: "text-gray-800", lightText: false },
    sunset: { bg: "bg-gradient-to-br from-orange-400 to-pink-600", text: "text-white", lightText: true },
    ocean: { bg: "bg-gradient-to-br from-blue-500 to-teal-400", text: "text-white", lightText: true },
    forest: { bg: "bg-gradient-to-br from-green-600 to-emerald-800", text: "text-white", lightText: true },
    royal: { bg: "bg-gradient-to-br from-purple-600 to-indigo-800", text: "text-white", lightText: true },
    midnight: { bg: "bg-gradient-to-br from-slate-900 to-blue-950", text: "text-white", lightText: true },
    rose: { bg: "bg-gradient-to-br from-rose-400 to-pink-300", text: "text-white", lightText: true },
    noir: { bg: "bg-gradient-to-br from-zinc-900 to-neutral-950", text: "text-white", lightText: true },
    sapphire: { bg: "bg-gradient-to-br from-blue-700 to-indigo-900", text: "text-white", lightText: true },
    burgundy: { bg: "bg-gradient-to-br from-rose-900 to-red-950", text: "text-white", lightText: true },
    emerald: { bg: "bg-gradient-to-br from-emerald-700 to-green-900", text: "text-white", lightText: true },
    lavender: { bg: "bg-gradient-to-br from-violet-400 to-purple-500", text: "text-white", lightText: true },
    champagne: { bg: "bg-gradient-to-br from-amber-100 to-yellow-50", text: "text-gray-900", lightText: false },
    custom_image: { bg: "", text: "text-white", lightText: true },
  };

  const currentTheme = themeMap[theme] || themeMap.dark;

  // Font family class
  const fontMap: Record<string, string> = {
    poppins: "font-poppins",
    vollkorn: "font-vollkorn",
    inter: "font-[Inter]",
    playfair: "font-[Playfair_Display]",
  };
  const fontClass = fontMap[fontFamily] || "font-poppins";

  // Button border radius
  const btnRadiusMap: Record<string, string> = {
    rounded: "rounded-full",
    sharp: "rounded-none",
    soft: "rounded-lg",
    pill: "rounded-full",
  };
  const btnRadius = btnRadiusMap[buttonStyle] || "rounded-full";

  // Button variant styles
  const getButtonClasses = (style?: string) => {
    const base = `w-full py-2.5 px-4 text-center text-xs font-medium transition-all shadow-sm ${btnRadius}`;
    switch (style) {
      case "outline":
        return cn(base, currentTheme.lightText 
          ? "bg-transparent border border-white/40 text-white" 
          : "bg-transparent border border-gray-400 text-gray-900");
      case "minimal":
        return cn(base, currentTheme.lightText
          ? "bg-white/10 text-white backdrop-blur-sm"
          : "bg-gray-100 text-gray-900");
      case "filled":
      default:
        return cn(base, "bg-white text-gray-900");
    }
  };

  const visibleButtons = buttons.filter(b => b.visible !== false);

  return (
    <div className="relative mx-auto w-[280px]">
      {/* Phone Frame */}
      <div className="relative rounded-[3rem] border-[12px] border-gray-800 bg-gray-800 shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-800 rounded-b-2xl z-20" />
        
        {/* Screen */}
        <div className="h-[520px] flex flex-col relative">
          {/* Scrollable content area */}
          <div 
            className={cn(
              "flex-1 overflow-y-auto relative scrollbar-none",
              !isCustomImage && currentTheme.bg,
              fontClass
            )}
            style={isCustomImage ? { 
              backgroundImage: `url(${customBgUrl})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center' 
            } : {}}
          >
            {/* Custom image overlay */}
            {isCustomImage && <div className="absolute inset-0 bg-black/50 z-0" />}
            
            {/* Pattern overlay */}
            {bgStyle === "pattern" && !isCustomImage && (
              <div className="absolute inset-0 opacity-10 z-0" style={{
                backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                backgroundSize: '16px 16px'
              }} />
            )}
            
            {/* Blur overlay */}
            {bgStyle === "blur" && !isCustomImage && (
              <div className="absolute inset-0 backdrop-blur-sm bg-white/5 z-0" />
            )}

            <div className={cn(
              "pt-10 pb-4 px-5 relative z-10",
              fadeAnimation && "animate-fade-in"
            )}>
              {/* Profile Section */}
              <div className="text-center mb-5">
                {linkProfile?.profile_picture ? (
                  <Avatar className="w-20 h-20 mx-auto mb-3 ring-2 ring-white/20">
                    <AvatarImage src={linkProfile.profile_picture} />
                    <AvatarFallback className="bg-gradient-to-br from-bronze/30 to-bronze-dark/30 text-2xl font-bold">
                      {linkProfile?.display_name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className={cn(
                    "w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-bronze/30 to-bronze-dark/30 flex items-center justify-center ring-2 ring-white/20",
                  )}>
                    <span className={cn("text-2xl font-bold", currentTheme.text)}>
                      {linkProfile?.display_name?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-center gap-1 mb-1">
                  <h2 className={cn("font-semibold text-lg", currentTheme.text)}>
                    {linkProfile?.display_name || "Your Name"}
                  </h2>
                  {showVerified && (
                    <CheckCircle2 className="w-4 h-4 text-[#CF8150]" />
                  )}
                </div>
                
                <p className={cn("text-xs opacity-70 mb-1.5", currentTheme.text)}>
                  @{linkProfile?.username || "username"}
                </p>
                
                {linkProfile?.bio && (
                  <p className={cn("text-[10px] opacity-80 max-w-[200px] mx-auto leading-relaxed", currentTheme.text)}>
                    {linkProfile.bio}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.max(4, buttonSpacing * 0.6)}px` }}>
                {visibleButtons.length > 0 ? (
                  visibleButtons.map((button, index) => (
                    <div
                      key={button.id}
                      className={cn(
                        getButtonClasses(button.style),
                        hoverEffects && "hover:scale-[1.02] hover:shadow-md",
                        fadeAnimation && "animate-fade-in"
                      )}
                      style={fadeAnimation ? { animationDelay: `${index * 80}ms` } : {}}
                    >
                      <div className="font-medium truncate">{button.title}</div>
                      {button.subtitle && (
                        <div className="text-[9px] opacity-70 truncate mt-0.5">{button.subtitle}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <>
                    <div className={getButtonClasses("filled")}>My Portfolio</div>
                    <div className={getButtonClasses("filled")}>Book Me</div>
                    <div className={getButtonClasses("filled")}>Latest Work</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom pinned area */}
          <div className={cn(
            "px-5 py-3 text-center border-t border-white/10 flex-shrink-0",
            !isCustomImage && currentTheme.bg,
            fontClass
          )}
          style={isCustomImage ? {
            backgroundImage: `url(${customBgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'bottom center'
          } : {}}
          >
            {isCustomImage && <div className="absolute inset-0 bg-black/60 z-0" />}
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Sparkles className={cn("w-3 h-3 opacity-50", currentTheme.text)} />
                <span className={cn("text-[9px] opacity-50", currentTheme.text)}>
                  Create your link-in-bio
                </span>
              </div>
              {showBranding && (
                <span className={cn("text-[10px] font-semibold opacity-40 tracking-wide", currentTheme.text)}>
                  Crevia
                </span>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};

export default LivePreview;
