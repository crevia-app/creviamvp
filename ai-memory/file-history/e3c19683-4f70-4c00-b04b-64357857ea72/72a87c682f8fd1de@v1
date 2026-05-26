import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Instagram, Linkedin, Youtube, Mail, Globe, CheckCircle2, Sparkles } from "lucide-react";

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [buttons, setButtons] = useState<any[]>([]);
  const [socialIcons, setSocialIcons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    if (!username) return;

    const { data: linkProfile } = await supabase
      .from("link_profiles")
      .select("*, profiles(*)")
      .eq("username", username)
      .single();

    if (linkProfile) {
      setProfile(linkProfile);

      // Only count visits from non-owners (skip self-views)
      const { data: { session } } = await supabase.auth.getSession();
      const isOwner = session?.user?.id === linkProfile.user_id;
      if (!isOwner) {
        await supabase.rpc("increment_link_visit", { profile_id: linkProfile.id });
      }

      const [{ data: buttonData }, { data: socialData }] = await Promise.all([
        supabase.from("link_buttons").select("*").eq("profile_id", linkProfile.id).eq("visible", true).order("order_index"),
        supabase.from("link_social_icons").select("*").eq("profile_id", linkProfile.id).order("order_index"),
      ]);

      setButtons(buttonData || []);
      setSocialIcons(socialData || []);
    }

    setLoading(false);
  };

  const handleButtonClick = async (buttonId: string, url: string) => {
    // Atomic increment via RPC — works for anonymous visitors, no race condition
    await supabase.rpc("increment_button_click", { button_id: buttonId });
    // Update local state so the click is reflected if owner is viewing
    setButtons(prev => prev.map(b => b.id === buttonId ? { ...b, clicks: (b.clicks || 0) + 1 } : b));
    window.open(url, "_blank");
  };

  const getThemeStyles = () => {
    const theme = profile?.theme || "dark";
    const bgStyle = profile?.background?.style || "solid";
    
    const themeMap: Record<string, { className: string }> = {
      light: { className: "bg-white text-gray-900" },
      dark: { className: "bg-gray-900 text-white" },
      bronze: { className: "bg-gradient-to-br from-[#1a1a1a] to-[#2d2520] text-white" },
      minimal: { className: "bg-gray-50 text-gray-800" },
      sunset: { className: "bg-gradient-to-br from-orange-500 to-pink-600 text-white" },
      ocean: { className: "bg-gradient-to-br from-blue-600 to-teal-500 text-white" },
      forest: { className: "bg-gradient-to-br from-green-700 to-emerald-900 text-white" },
      royal: { className: "bg-gradient-to-br from-purple-700 to-indigo-900 text-white" },
      midnight: { className: "bg-gradient-to-br from-slate-900 to-blue-950 text-white" },
      rose: { className: "bg-gradient-to-br from-rose-400 to-pink-300 text-white" },
      noir: { className: "bg-gradient-to-br from-zinc-900 to-neutral-950 text-white" },
      sapphire: { className: "bg-gradient-to-br from-blue-700 to-indigo-900 text-white" },
      burgundy: { className: "bg-gradient-to-br from-rose-900 to-red-950 text-white" },
      emerald: { className: "bg-gradient-to-br from-emerald-700 to-green-900 text-white" },
      lavender: { className: "bg-gradient-to-br from-violet-400 to-purple-500 text-white" },
      champagne: { className: "bg-gradient-to-br from-amber-100 to-yellow-50 text-gray-900" },
      custom_image: { className: "text-white" },
    };
    return themeMap[theme] || themeMap.dark;
  };

  const getBackgroundExtras = () => {
    const bgStyle = profile?.background?.style || "solid";
    const theme = profile?.theme || "dark";
    if (theme === "custom_image") return {};
    
    const extras: { className?: string; overlayStyle?: React.CSSProperties } = {};
    
    if (bgStyle === "pattern") {
      extras.overlayStyle = {
        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        opacity: 0.08,
      };
    }
    
    if (bgStyle === "blur") {
      extras.className = "backdrop-blur-md bg-white/5";
    }
    
    return extras;
  };

  // Get theme-based styles
  const getFontFamily = () => {
    const font = profile?.background?.font_family || "poppins";
    const fontMap: Record<string, string> = {
      poppins: "font-poppins",
      vollkorn: "font-vollkorn",
      inter: "font-[Inter]",
      playfair: "font-[Playfair_Display]",
      montserrat: "font-[Montserrat]",
      roboto: "font-[Roboto]",
      lora: "font-[Lora]",
      "space-grotesk": "font-[Space_Grotesk]",
    };
    return fontMap[font] || "font-poppins";
  };

  const getFontSize = () => {
    const size = profile?.background?.font_size || "medium";
    const sizeMap: Record<string, string> = {
      small: "text-sm",
      medium: "text-base",
      large: "text-lg",
      xlarge: "text-xl",
    };
    return sizeMap[size] || "text-base";
  };

  const getButtonStyle = () => {
    const style = profile?.background?.button_style || "rounded";
    const styleMap: Record<string, string> = {
      rounded: "rounded-full",
      sharp: "rounded-none",
      soft: "rounded-lg",
      pill: "rounded-full",
    };
    return styleMap[style] || "rounded-full";
  };

  const getPageWidth = () => {
    const width = profile?.background?.page_width || "medium";
    const widthMap: Record<string, string> = {
      narrow: "max-w-md",
      medium: "max-w-2xl",
      wide: "max-w-3xl",
      full: "max-w-6xl",
    };
    return widthMap[width] || "max-w-2xl";
  };

  const getButtonSpacing = () => {
    const spacing = profile?.background?.button_spacing || 12;
    return `${spacing}px`;
  };

  const getButtonVariant = (style: string) => {
    switch (style) {
      case "filled": return "default";
      case "outline": return "outline";
      case "minimal": return "ghost";
      default: return "default";
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram": return <Instagram className="w-5 h-5" />;
      case "linkedin": return <Linkedin className="w-5 h-5" />;
      case "youtube": return <Youtube className="w-5 h-5" />;
      case "email": return <Mail className="w-5 h-5" />;
      case "website": return <Globe className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="font-poppins">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="font-vollkorn text-4xl font-bold mb-4">Page not found</h1>
          <p className="font-poppins text-gray-400">This Crevia Link doesn't exist.</p>
        </div>
      </div>
    );
  }

  const layoutClass = profile?.layout === "centered" ? "mx-auto" : 
                     profile?.layout === "left" ? "" : 
                     profile?.layout === "full" ? "w-full px-8" :
                     profile?.layout === "card" ? "mx-auto bg-card/10 backdrop-blur p-8 rounded-2xl" :
                     profile?.layout === "split" ? "grid md:grid-cols-2 gap-8 max-w-6xl mx-auto" :
                     "mx-auto";

  const hoverEffects = profile?.background?.hover_effects !== false;
  const smoothScroll = profile?.background?.smooth_scroll !== false;
  const fadeAnimation = profile?.background?.fade_animation !== false;

  const themeStyles = getThemeStyles();
  const customBgUrl = profile?.background?.custom_bg_url;
  const isCustomImage = profile?.theme === "custom_image" && customBgUrl;
  
  const bgExtras = getBackgroundExtras();
  
  return (
    <div 
      className={`min-h-screen ${themeStyles.className} ${getFontFamily()} ${getFontSize()} py-12 px-6 relative`}
      style={{ 
        scrollBehavior: smoothScroll ? 'smooth' : 'auto',
        ...(isCustomImage ? { backgroundImage: `url(${customBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } : {})
      }}
    >
      {isCustomImage && <div className="absolute inset-0 bg-black/50" />}
      {bgExtras.overlayStyle && <div className="absolute inset-0" style={bgExtras.overlayStyle} />}
      {bgExtras.className && <div className={`absolute inset-0 ${bgExtras.className}`} />}
      <div className={`${getPageWidth()} ${layoutClass} ${fadeAnimation ? 'animate-fade-in' : ''} relative z-10`}>
        {/* Profile Header */}
        <div className="text-center mb-8">
          {profile?.profile_picture && (
            <img
              src={profile.profile_picture}
              alt={profile.display_name}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-[#CF8150] object-cover"
            />
          )}
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="font-vollkorn text-3xl font-bold">
              {profile?.display_name || profile?.username}
            </h1>
            {profile?.show_verified_badge && profile?.profiles?.is_verified && (
              <CheckCircle2 className="w-6 h-6 text-[#CF8150]" />
            )}
          </div>

          {profile?.bio && (
            <p className="font-poppins text-muted-foreground max-w-md mx-auto">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Social Icons */}
        {socialIcons.length > 0 && (
          <div className="flex justify-center gap-4 mb-8">
            {socialIcons.map((icon) => (
              <a
                key={icon.id}
                href={icon.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full border border-[#CF8150] hover:bg-[#CF8150]/10 transition-colors"
              >
                {getSocialIcon(icon.platform)}
              </a>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="mb-12" style={{ display: 'flex', flexDirection: 'column', gap: getButtonSpacing() }}>
          {buttons.map((button, index) => (
            <Button
              key={button.id}
              variant={getButtonVariant(button.style) as any}
              className={`w-full h-auto py-4 ${getButtonStyle()} ${
                hoverEffects ? 'hover:scale-105 hover:shadow-lg transition-all duration-300' : ''
              } ${fadeAnimation ? 'animate-fade-in' : ''}`}
              style={{ 
                animationDelay: fadeAnimation ? `${index * 100}ms` : '0ms',
                border: '2px solid hsl(var(--bronze))',
              }}
              onClick={() => handleButtonClick(button.id, button.url)}
            >
              <div className="text-left w-full">
                <div className="font-semibold">{button.title}</div>
                {button.subtitle && (
                  <div className="text-sm opacity-80">{button.subtitle}</div>
                )}
              </div>
            </Button>
          ))}
        </div>

        {buttons.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="font-poppins">No links added yet.</p>
          </div>
        )}

        {/* Footer */}
        {profile?.show_crevia_branding && (
          <div className="text-center mt-16 pt-8 border-t border-[#CF8150]/20">
            <Button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-[#D9955F] to-[#D9955F] hover:from-[#D9955F] hover:to-[#111111] text-white font-poppins font-semibold px-8 py-6 rounded-full mb-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get Crevia Link
            </Button>
            <p className="text-sm font-poppins font-semibold opacity-40 tracking-wide">
              Crevia
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
