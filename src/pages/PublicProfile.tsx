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
        return "bg-white text-gray-900";
      case "dark":
        return "bg-gray-900 text-white";
      case "bronze":
        return "bg-gradient-to-br from-[#1a1a1a] to-[#2d2520] text-white";
      case "minimal":
        return "bg-gray-50 text-gray-800";
      case "sunset":
        return "bg-gradient-to-br from-orange-500 to-pink-600 text-white";
      case "ocean":
        return "bg-gradient-to-br from-blue-600 to-teal-500 text-white";
      case "forest":
        return "bg-gradient-to-br from-green-700 to-emerald-900 text-white";
      case "royal":
        return "bg-gradient-to-br from-purple-700 to-indigo-900 text-white";
      // African Heritage Collection
      case "maasai":
        // Maasai (Kenya) - Bold red shuka, royal blue beadwork, vibrant green
        return "bg-[linear-gradient(135deg,#1A0505_0%,#2D0808_50%,#0D0D1A_100%)] text-white [background-image:linear-gradient(135deg,#1A0505_0%,#2D0808_50%,#0D0D1A_100%),repeating-linear-gradient(0deg,transparent,transparent_40px,rgba(227,28,37,0.1)_40px,rgba(227,28,37,0.1)_41px)]";
      case "kente":
        // Kente (Ghana) - Royal gold, forest green, heritage red on black
        return "bg-[linear-gradient(180deg,#0A0A05_0%,#141405_50%,#0D1A0D_100%)] text-yellow-50 [background-image:linear-gradient(180deg,#0A0A05_0%,#141405_50%,#0D1A0D_100%),repeating-linear-gradient(90deg,rgba(234,179,8,0.08)_0px,rgba(234,179,8,0.08)_2px,transparent_2px,transparent_20px)]";
      case "ndebele":
        // Ndebele (South Africa) - Bold primary geometric: blue, green, yellow, red
        return "bg-[radial-gradient(ellipse_at_center,#0A1428_0%,#050A14_50%,#000000_100%)] text-white [background-image:radial-gradient(ellipse_at_center,#0A1428_0%,#050A14_50%,#000000_100%),repeating-linear-gradient(45deg,rgba(29,78,216,0.05)_0px,rgba(29,78,216,0.05)_1px,transparent_1px,transparent_10px)]";
      case "ankara":
        // Ankara (Nigeria/West Africa) - Vibrant purple, orange, green wax print
        return "bg-[conic-gradient(from_180deg_at_50%_50%,#0D0514_0deg,#140A1A_180deg,#0A1410_360deg)] text-orange-50 [background-image:conic-gradient(from_180deg_at_50%_50%,#0D0514_0deg,#140A1A_180deg,#0A1410_360deg),repeating-radial-gradient(circle_at_center,transparent_0px,transparent_20px,rgba(249,115,22,0.03)_20px,rgba(249,115,22,0.03)_21px)]";
      default:
        return "bg-gray-900 text-white";
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

  return (
    <div 
      className={`min-h-screen ${getThemeStyles()} ${getFontFamily()} ${getFontSize()} py-12 px-6`}
      style={{ scrollBehavior: smoothScroll ? 'smooth' : 'auto' }}
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
