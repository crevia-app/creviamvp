import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Instagram, Linkedin, Youtube, Mail, Globe, CheckCircle2, Sparkles } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { BackButton } from "@/components/BackButton";

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
      // Base themes
      light:     { className: "bg-white text-gray-900" },
      dark:      { className: "bg-gray-900 text-white" },
      bronze:    { className: "bg-gradient-to-br from-[#1a1a1a] to-[#2d2520] text-white" },
      minimal:   { className: "bg-gray-50 text-gray-800" },
      // Nature
      sunset:    { className: "bg-gradient-to-br from-orange-500 to-pink-600 text-white" },
      ocean:     { className: "bg-gradient-to-br from-blue-600 to-teal-500 text-white" },
      forest:    { className: "bg-gradient-to-br from-green-700 to-emerald-900 text-white" },
      coral:     { className: "bg-gradient-to-br from-orange-400 to-rose-500 text-white" },
      jade:      { className: "bg-gradient-to-br from-teal-600 to-emerald-700 text-white" },
      // Dark & moody
      royal:     { className: "bg-gradient-to-br from-purple-700 to-indigo-900 text-white" },
      midnight:  { className: "bg-gradient-to-br from-slate-900 to-blue-950 text-white" },
      noir:      { className: "bg-gradient-to-br from-zinc-900 to-neutral-950 text-white" },
      sapphire:  { className: "bg-gradient-to-br from-blue-700 to-indigo-900 text-white" },
      burgundy:  { className: "bg-gradient-to-br from-rose-900 to-red-950 text-white" },
      obsidian:  { className: "bg-gradient-to-br from-gray-950 to-slate-900 text-white" },
      crimson:   { className: "bg-gradient-to-br from-red-600 to-rose-800 text-white" },
      aurora:    { className: "bg-gradient-to-br from-purple-900 via-teal-800 to-green-900 text-white" },
      // Light & airy
      rose:      { className: "bg-gradient-to-br from-rose-400 to-pink-300 text-white" },
      lavender:  { className: "bg-gradient-to-br from-violet-400 to-purple-500 text-white" },
      emerald:   { className: "bg-gradient-to-br from-emerald-700 to-green-900 text-white" },
      arctic:    { className: "bg-gradient-to-br from-sky-100 to-blue-200 text-gray-900" },
      peach:     { className: "bg-gradient-to-br from-orange-100 to-pink-100 text-gray-900" },
      sand:      { className: "bg-gradient-to-br from-amber-200 to-stone-300 text-gray-900" },
      champagne: { className: "bg-gradient-to-br from-amber-100 to-yellow-50 text-gray-900" },
      // Warm metallics
      copper:    { className: "bg-gradient-to-br from-amber-600 to-orange-800 text-white" },
      steel:     { className: "bg-gradient-to-br from-slate-400 to-slate-600 text-white" },
      // ── 10 NEW PREMIUM THEMES ──
      onyx:      { className: "bg-[radial-gradient(ellipse_at_top,_#27272a,_#09090b)] text-white" },
      electric:  { className: "bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 text-white" },
      velvet:    { className: "bg-gradient-to-br from-purple-900 via-violet-900 to-fuchsia-950 text-white" },
      terra:     { className: "bg-gradient-to-br from-orange-700 via-red-800 to-rose-900 text-white" },
      glacier:   { className: "bg-gradient-to-br from-sky-50 via-blue-100 to-cyan-100 text-gray-900" },
      dusk:      { className: "bg-gradient-to-br from-indigo-900 via-purple-700 to-rose-900 text-white" },
      citrus:    { className: "bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 text-gray-900" },
      ash:       { className: "bg-gradient-to-br from-stone-600 to-stone-900 text-white" },
      graphite:  { className: "bg-gradient-to-br from-zinc-600 via-zinc-700 to-zinc-900 text-white" },
      blush:     { className: "bg-gradient-to-br from-pink-100 via-rose-100 to-fuchsia-50 text-gray-900" },
      custom_image: { className: "text-white" },
      // ── 15 Elite Themes ──
      elite_obsidian:      { className: "bg-[#050505] text-white" },
      pristine:            { className: "bg-[#FFFFFF] text-[#0A0A0A]" },
      exec_slate:          { className: "bg-[#1C1E21] text-[#F0F0F0]" },
      oatmeal:             { className: "bg-[#F5F2EB] text-[#2B241E]" },
      studio_navy:         { className: "bg-[#050A1F] text-white" },
      bordeaux_reserve:    { className: "bg-[#2B0F15] text-[#F4E3E6]" },
      imperial_amethyst:   { className: "bg-[#1A0B2E] text-[#E9DDF7]" },
      matte_bronze:        { className: "bg-[#0D0B0A] text-[#C58361]" },
      midnight_emerald:    { className: "bg-[#04120C] text-[#E0F2E9]" },
      champagne_silk:      { className: "bg-[#E6DCC8] text-[#1A1A1A]" },
      velvet_onyx:         { className: "bg-[#0B0710] text-[#E6DDF2]" },
      brushed_titanium:    { className: "bg-gradient-to-br from-[#2a2a2a] via-[#4a4a4a] to-[#2a2a2a] text-white" },
      tuscan_leather:      { className: "bg-[#2A110A] text-[#FDFBF7]" },
      abyss_glass:         { className: "bg-[#000000] text-white" },
      mono_brutalism:      { className: "bg-[#FFFFFF] text-[#000000]" },
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

  // Returns a CSS font-family value (not a Tailwind class) so it is never
  // purged by Tailwind's content scanner and always applied in production.
  const getFontFamily = (): string => {
    const font = profile?.background?.font_family || "plus-jakarta";
    const fontMap: Record<string, string> = {
      cormorant:      "'Cormorant Garamond', serif",
      playfair:       "'Playfair Display', serif",
      "dm-serif":     "'DM Serif Display', serif",
      "plus-jakarta": "'Plus Jakarta Sans', sans-serif",
      outfit:         "'Outfit', sans-serif",
      syne:           "'Syne', sans-serif",
      // Legacy keys
      poppins:        "'Poppins', sans-serif",
      vollkorn:       "'Vollkorn', serif",
      inter:          "'Inter', sans-serif",
    };
    return fontMap[font] || "'Plus Jakarta Sans', sans-serif";
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

  // Private profile — only the owner can see it
  const isOwnerViewing = profile?.profiles?.id &&
    typeof window !== "undefined" &&
    sessionStorage.getItem("crevia_uid") === profile.profiles.id;

  if (profile?.profiles?.profile_public === false && !isOwnerViewing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">
        <img src="/crevia-logo.png" alt="Crevia" className="w-14 h-14 rounded-full ring-1 ring-white/10 mb-6" />
        <h1 className="font-vollkorn text-3xl font-bold mb-3">This profile is private</h1>
        <p className="font-poppins text-white/50 text-sm text-center max-w-xs">
          The owner has made this profile private. Only they can view it.
        </p>
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
      className={`min-h-screen ${themeStyles.className} ${getFontSize()} pt-12 px-6 relative`}
      style={{
        fontFamily: getFontFamily(),
        scrollBehavior: smoothScroll ? 'smooth' : 'auto',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 3rem)',
        ...(isCustomImage ? { backgroundImage: `url(${customBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } : {})
      }}
    >
      {isCustomImage && <div className="absolute inset-0 bg-black/50" />}
      {bgExtras.overlayStyle && <div className="absolute inset-0" style={bgExtras.overlayStyle} />}
      {bgExtras.className && <div className={`absolute inset-0 ${bgExtras.className}`} />}
      <div className="absolute top-4 left-4 z-20">
        <BackButton fallback="/crevia-link" className="text-white/70 hover:text-white drop-shadow" />
      </div>
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
            <h1 className="text-3xl font-bold">
              {profile?.display_name || profile?.username}
            </h1>
            {profile?.show_verified_badge && profile?.profiles?.is_verified && (
              <CheckCircle2 className="w-6 h-6 text-[#CF8150]" />
            )}
            {["creative_pro", "brand_workspace"].includes(profile?.profiles?.subscription_plan) &&
              ["active", "trialing"].includes(profile?.profiles?.subscription_status) && (
              <VerifiedBadge size="lg" />
            )}
          </div>

          {profile?.bio && (
            <p className="text-muted-foreground max-w-md mx-auto">
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

        {/* Get Crevia Link CTA */}
        <div className="text-center mt-10 pb-4">
          <a
            href="/crevia-studio"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #c9a96e, #b8864e)", color: "#fff", boxShadow: "0 2px 12px rgba(201,169,110,0.35)" }}
          >
            <Sparkles className="w-4 h-4" />
            Get your Crevia Link
          </a>
          <p className="text-xs mt-2 opacity-40">Built with Crevia</p>
        </div>

      </div>
    </div>
  );
};

export default PublicProfile;
