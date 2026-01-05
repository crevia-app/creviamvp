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

    // Fetch link profile
    const { data: linkProfile } = await supabase
      .from("link_profiles")
      .select("*, profiles(*)")
      .eq("username", username)
      .single();

    if (linkProfile) {
      setProfile(linkProfile);

      // Track visit
      await supabase
        .from("link_profiles")
        .update({ total_visits: (linkProfile.total_visits || 0) + 1 })
        .eq("id", linkProfile.id);

      // Fetch buttons
      const { data: buttonData } = await supabase
        .from("link_buttons")
        .select("*")
        .eq("profile_id", linkProfile.id)
        .eq("visible", true)
        .order("order_index");

      setButtons(buttonData || []);

      // Fetch social icons
      const { data: socialData } = await supabase
        .from("link_social_icons")
        .select("*")
        .eq("profile_id", linkProfile.id)
        .order("order_index");

      setSocialIcons(socialData || []);
    }

    setLoading(false);
  };

  const handleButtonClick = async (buttonId: string, url: string) => {
    // Track click
    await supabase
      .from("link_buttons")
      .update({ clicks: buttons.find(b => b.id === buttonId)?.clicks + 1 || 1 })
      .eq("id", buttonId);

    // Open URL
    window.open(url, "_blank");
  };

  const getThemeStyles = () => {
    const theme = profile?.theme || "dark";
    switch (theme) {
      case "light":
        return { className: "bg-white text-gray-900" };
      case "dark":
        return { className: "bg-gray-900 text-white" };
      case "bronze":
        return { className: "bg-gradient-to-br from-[#1a1a1a] to-[#2d2520] text-white" };
      case "minimal":
        return { className: "bg-gray-50 text-gray-800" };
      case "sunset":
        return { className: "bg-gradient-to-br from-orange-500 to-pink-600 text-white" };
      case "ocean":
        return { className: "bg-gradient-to-br from-blue-600 to-teal-500 text-white" };
      case "forest":
        return { className: "bg-gradient-to-br from-green-700 to-emerald-900 text-white" };
      case "royal":
        return { className: "bg-gradient-to-br from-purple-700 to-indigo-900 text-white" };
      // African Heritage Collection - Authentic patterns with character
      case "maasai":
        // Maasai beadwork - colorful horizontal stripes like traditional beaded jewelry
        return {
          className: "text-white",
          style: {
            background: `
              repeating-linear-gradient(
                0deg,
                #C41E3A 0px, #C41E3A 12px,
                #1E40AF 12px, #1E40AF 18px,
                #FFD700 18px, #FFD700 24px,
                #C41E3A 24px, #C41E3A 36px,
                #FFFFFF 36px, #FFFFFF 42px,
                #1E40AF 42px, #1E40AF 48px,
                #228B22 48px, #228B22 54px,
                #FFD700 54px, #FFD700 60px
              )
            `
          }
        };
      case "kente":
        // Kente cloth - woven geometric pattern with gold, green, red, black
        return {
          className: "text-white",
          style: {
            background: `
              repeating-linear-gradient(
                90deg,
                #FFD700 0px, #FFD700 20px,
                #228B22 20px, #228B22 40px,
                #C41E3A 40px, #C41E3A 60px,
                #1a1a1a 60px, #1a1a1a 80px
              ),
              repeating-linear-gradient(
                0deg,
                transparent 0px, transparent 8px,
                rgba(0,0,0,0.2) 8px, rgba(0,0,0,0.2) 16px
              )
            `,
            backgroundBlendMode: 'multiply'
          }
        };
      case "ndebele":
        // Ndebele geometric art - bold blocks of blue, yellow, red, white, green
        return {
          className: "text-white",
          style: {
            background: `
              linear-gradient(to right,
                #1E40AF 0%, #1E40AF 15%,
                #FFD700 15%, #FFD700 25%,
                #C41E3A 25%, #C41E3A 45%,
                #FFFFFF 45%, #FFFFFF 55%,
                #228B22 55%, #228B22 70%,
                #FFD700 70%, #FFD700 80%,
                #1E40AF 80%, #1E40AF 100%
              ),
              repeating-linear-gradient(
                0deg,
                transparent 0px, transparent 40px,
                rgba(0,0,0,0.15) 40px, rgba(0,0,0,0.15) 45px,
                transparent 45px, transparent 90px
              )
            `
          }
        };
      case "ankara":
        // Ankara wax print - vibrant circular and organic patterns
        return {
          className: "text-white",
          style: {
            background: `
              radial-gradient(circle at 20% 30%, #F97316 25%, transparent 25%),
              radial-gradient(circle at 80% 70%, #8B4513 20%, transparent 20%),
              radial-gradient(circle at 50% 50%, #FFD700 18%, transparent 18%),
              radial-gradient(circle at 20% 80%, #C41E3A 15%, transparent 15%),
              radial-gradient(circle at 80% 20%, #228B22 15%, transparent 15%),
              radial-gradient(circle at 60% 40%, #1E40AF 12%, transparent 12%),
              radial-gradient(circle at 35% 60%, #FFD700 10%, transparent 10%),
              #F97316
            `,
            backgroundSize: '120px 120px'
          }
        };
      default:
        return { className: "bg-gray-900 text-white" };
    }
  };

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
      case "filled":
        return "default";
      case "outline":
        return "outline";
      case "minimal":
        return "ghost";
      default:
        return "default";
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="w-5 h-5" />;
      case "linkedin":
        return <Linkedin className="w-5 h-5" />;
      case "youtube":
        return <Youtube className="w-5 h-5" />;
      case "email":
        return <Mail className="w-5 h-5" />;
      case "website":
        return <Globe className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
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
  
  return (
    <div 
      className={`min-h-screen ${themeStyles.className} ${getFontFamily()} ${getFontSize()} py-12 px-6`}
      style={{ scrollBehavior: smoothScroll ? 'smooth' : 'auto', ...themeStyles.style }}
    >
      <div className={`${getPageWidth()} ${layoutClass} ${fadeAnimation ? 'animate-fade-in' : ''}`}>
        {/* Profile Header */}
        <div className="text-center mb-8">
          {profile?.profile_picture && (
            <img
              src={profile.profile_picture}
              alt={profile.display_name}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-[#CF8150]"
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
              className="bg-gradient-to-r from-[#CF8150] to-[#D9955F] hover:from-[#B8704A] hover:to-[#CF8150] text-white font-poppins font-semibold px-8 py-6 rounded-full mb-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create your link-in-bio
            </Button>
            <p className="text-sm font-poppins text-muted-foreground">
              Made with ♥ on <span className="text-[#CF8150] font-semibold">Crevia</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
