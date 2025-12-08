import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link2, Plus, Eye, Sparkles, Type, Palette, Layout, Copy, Check } from "lucide-react";
import { AddButtonDialog } from "@/components/crevia-link/AddButtonDialog";
import { ButtonItem } from "@/components/crevia-link/ButtonItem";
import LinkSidebarDesktop from "@/components/crevia-link/LinkSidebarDesktop";
import LinkTabsMobile from "@/components/crevia-link/LinkTabsMobile";
import { cn } from "@/lib/utils";

const CreviaLink = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [linkProfile, setLinkProfile] = useState<any>(null);
  const [buttons, setButtons] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);
  const [copied, setCopied] = useState(false);
  
  
  const currentTab = new URLSearchParams(location.search).get("tab") || "profile";

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    setProfile(userProfile);

    const { data: existingLink } = await supabase
      .from("link_profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (existingLink) {
      setLinkProfile(existingLink);
    } else {
      const { data: newLink } = await supabase
        .from("link_profiles")
        .insert({
          user_id: session.user.id,
          username: userProfile?.handle || "",
          display_name: userProfile?.display_name || "",
          bio: userProfile?.bio || "",
          profile_picture: userProfile?.avatar_url || "",
        })
        .select()
        .single();
      
      setLinkProfile(newLink);
    }

    setLoading(false);
  };

  const fetchButtons = async () => {
    if (!linkProfile?.id) return;

    const { data } = await supabase
      .from("link_buttons")
      .select("*")
      .eq("profile_id", linkProfile.id)
      .order("order_index");

    setButtons(data || []);
  };

  useEffect(() => {
    if (linkProfile) {
      fetchButtons();
    }
  }, [linkProfile]);

  const handleAddButton = async (buttonData: any) => {
    const maxOrder = buttons.length > 0 
      ? Math.max(...buttons.map(b => b.order_index)) 
      : -1;

    const { data, error } = await supabase
      .from("link_buttons")
      .insert({
        profile_id: linkProfile.id,
        ...buttonData,
        order_index: maxOrder + 1,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setButtons([...buttons, data]);
      toast({
        title: "Button added!",
        description: "Your new button has been created.",
      });
    }
  };

  const handleDeleteButton = async (id: string) => {
    const { error } = await supabase
      .from("link_buttons")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setButtons(buttons.filter(b => b.id !== id));
      toast({
        title: "Button deleted",
        description: "The button has been removed.",
      });
    }
  };

  const handleToggleVisibility = async (id: string, visible: boolean) => {
    const { error} = await supabase
      .from("link_buttons")
      .update({ visible })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setButtons(buttons.map(b => 
        b.id === id ? { ...b, visible } : b
      ));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("link_profiles")
      .update({
        username: linkProfile.username,
        display_name: linkProfile.display_name,
        bio: linkProfile.bio,
        theme: linkProfile.theme,
        layout: linkProfile.layout,
        show_verified_badge: linkProfile.show_verified_badge,
        contact_enabled: linkProfile.contact_enabled,
        background: linkProfile.background,
      })
      .eq("id", linkProfile.id);

    if (error) {
      toast({
        title: "Error saving",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Saved!",
        description: "Your Crevia Link has been updated.",
      });
      const { data: updatedLink } = await supabase
        .from("link_profiles")
        .select("*")
        .eq("id", linkProfile.id)
        .single();
      
      if (updatedLink) {
        setLinkProfile(updatedLink);
      }
    }
    setSaving(false);
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/${linkProfile?.username}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Your Crevia Link has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <LinkTabsMobile userType={profile?.user_type || "creator"} />
      
      <div className="flex flex-1 w-full overflow-hidden">
        <LinkSidebarDesktop userType={profile?.user_type || "creator"} />
        
        {/* Main Content Area with proper spacing for mobile */}
        <main className="flex-1 overflow-auto bg-background md:ml-[200px]">
          {/* Mobile: Proper spacing to prevent content cutoff */}
          <div className="w-full max-w-3xl mx-auto px-5 sm:px-6 md:px-10 pt-2 pb-10 md:pt-14 md:pb-14">
            <div className="w-full space-y-8 md:space-y-12">

          {/* ===== PROFILE TAB ===== */}
          {currentTab === "profile" && (
            <div className="space-y-8 md:space-y-10">
              {/* Hero Section */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-4 md:mb-5 text-bronze">
                  <Link2 className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-sm md:text-base font-poppins font-semibold tracking-wider uppercase">CREVIA LINK</span>
                </div>
                <h1 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-5 leading-tight">
                  Your premium link-in-bio
                </h1>
                <p className="text-base md:text-lg text-muted-foreground font-poppins max-w-xl mx-auto leading-relaxed">
                  Beautiful, customizable, and powerful. Share everything you create in one elegant page.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4">
                <Button
                  size="lg"
                  onClick={() => window.open(`/${linkProfile?.username}`, "_blank")}
                  className="w-full bg-bronze hover:bg-bronze-dark font-poppins font-semibold h-14 md:h-16 text-base md:text-lg"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Preview Your Page
                </Button>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleSave}
                    disabled={saving}
                    className="font-poppins font-semibold h-14 md:h-16 text-base md:text-lg"
                  >
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="font-poppins font-semibold h-14 md:h-16 text-base md:text-lg"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-2" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            
              {/* Profile Information Card */}
              <Card className="p-6 md:p-8 border-border/50">
                <h3 className="font-vollkorn text-2xl md:text-3xl font-bold mb-6 md:mb-7">Profile Information</h3>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="username" className="text-base font-medium mb-3 block">Username</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm whitespace-nowrap">crevia.app/</span>
                      <Input
                        id="username"
                        value={linkProfile?.username || ""}
                        onChange={(e) => setLinkProfile({ ...linkProfile, username: e.target.value })}
                        placeholder="yourusername"
                        className="flex-1 h-12 text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="displayName" className="text-base font-medium mb-3 block">Display Name</Label>
                    <Input
                      id="displayName"
                      value={linkProfile?.display_name || ""}
                      onChange={(e) => setLinkProfile({ ...linkProfile, display_name: e.target.value })}
                      placeholder="Your Name"
                      className="h-12 text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-base font-medium mb-3 block">Bio (max 150 characters)</Label>
                    <Textarea
                      id="bio"
                      value={linkProfile?.bio || ""}
                      onChange={(e) => setLinkProfile({ ...linkProfile, bio: e.target.value.slice(0, 150) })}
                      placeholder="Tell people about yourself..."
                      className="min-h-[120px] resize-none text-base"
                      maxLength={150}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      {linkProfile?.bio?.length || 0}/150
                    </p>
                  </div>

                  {profile?.is_verified && (
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showBadge">Show Verified Badge</Label>
                      <Switch
                        id="showBadge"
                        checked={linkProfile?.show_verified_badge || false}
                        onCheckedChange={(checked) => 
                          setLinkProfile({ ...linkProfile, show_verified_badge: checked })
                        }
                      />
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* ===== BUTTONS TAB ===== */}
          {currentTab === "buttons" && (
            <Card className="p-6 md:p-8 border-border/50">
              <div className="space-y-5 mb-6">
                <h3 className="font-vollkorn text-2xl md:text-3xl font-bold">Links & Buttons</h3>
                <Button 
                  className="bg-bronze hover:bg-bronze-dark w-full h-14 md:h-16 font-semibold text-base md:text-lg"
                  onClick={() => setShowAddButton(true)}
                  size="lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Button
                </Button>
              </div>
              
              {buttons.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-base">No buttons yet. Click "Add Button" to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {buttons.map((button) => (
                    <ButtonItem
                      key={button.id}
                      button={button}
                      onEdit={() => {}}
                      onDelete={handleDeleteButton}
                      onToggleVisibility={handleToggleVisibility}
                    />
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* ===== APPEARANCE TAB ===== */}
          {currentTab === "appearance" && (
            <div className="space-y-8 md:space-y-12">
              {/* Typography Section */}
              <Card className="p-6 md:p-9 border-border/50">
                <div className="flex items-center gap-3 mb-8">
                  <Type className="w-7 h-7 md:w-8 md:h-8 text-bronze" />
                  <h3 className="font-vollkorn text-2xl md:text-4xl font-bold">Typography</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="fontFamily" className="text-base font-medium mb-3 block">Font Family</Label>
                    <Select
                      value={linkProfile?.background?.font_family || "poppins"}
                      onValueChange={(value) => setLinkProfile({ 
                        ...linkProfile, 
                        background: { ...linkProfile?.background, font_family: value }
                      })}
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="poppins">Poppins (Modern Sans)</SelectItem>
                        <SelectItem value="vollkorn">Vollkorn (Classic Serif)</SelectItem>
                        <SelectItem value="inter">Inter (Clean Sans)</SelectItem>
                        <SelectItem value="playfair">Playfair Display (Elegant Serif)</SelectItem>
                        <SelectItem value="montserrat">Montserrat (Geometric Sans)</SelectItem>
                        <SelectItem value="roboto">Roboto (Neutral Sans)</SelectItem>
                        <SelectItem value="lora">Lora (Traditional Serif)</SelectItem>
                        <SelectItem value="space-grotesk">Space Grotesk (Tech Sans)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-2">
                      Choose a font that matches your brand personality
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="fontSize" className="text-base font-medium mb-3 block">Text Size</Label>
                    <Select
                      value={linkProfile?.background?.font_size || "medium"}
                      onValueChange={(value) => setLinkProfile({
                        ...linkProfile, 
                        background: { ...linkProfile?.background, font_size: value }
                      })}
                    >
                      <SelectTrigger className="mt-2 h-10 sm:h-11 md:h-12 text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="xlarge">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Theme & Colors Section */}
              <Card className="p-4 sm:p-6 md:p-9 border-border/50">
                <div className="flex items-center gap-3 mb-6 md:mb-10">
                  <Palette className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-bronze flex-shrink-0" />
                  <h3 className="font-vollkorn text-xl sm:text-2xl md:text-4xl font-bold">Theme & Colors</h3>
                </div>
                
                <div className="space-y-6 md:space-y-10">
                  <div>
                    <Label className="text-sm sm:text-base md:text-lg font-medium mb-3 md:mb-6 block">Color Scheme</Label>
                    <RadioGroup
                      value={linkProfile?.theme || "dark"}
                      onValueChange={(value) => setLinkProfile({ ...linkProfile, theme: value })}
                      className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6"
                    >
                      {[
                        { value: "light", label: "Light", gradient: "from-gray-50 to-gray-100" },
                        { value: "dark", label: "Dark", gradient: "from-gray-800 to-gray-900" },
                        { value: "bronze", label: "Bronze", gradient: "from-bronze to-bronze-dark" },
                        { value: "minimal", label: "Minimal", gradient: "bg-white border-2 border-gray-200" },
                        { value: "sunset", label: "Sunset", gradient: "from-orange-400 to-pink-600" },
                        { value: "ocean", label: "Ocean", gradient: "from-blue-500 to-teal-400" },
                        { value: "forest", label: "Forest", gradient: "from-green-600 to-emerald-800" },
                        { value: "royal", label: "Royal", gradient: "from-purple-600 to-indigo-800" },
                      ].map((theme) => (
                        <div key={theme.value} className="relative">
                          <RadioGroupItem value={theme.value} id={theme.value} className="peer sr-only" />
                          <Label
                            htmlFor={theme.value}
                            className="flex flex-col items-center justify-between rounded-lg md:rounded-xl border-2 border-muted bg-white p-3 sm:p-4 md:p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-bronze peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-bronze/20 cursor-pointer transition-all"
                          >
                            <div className={cn("w-full h-16 sm:h-20 md:h-28 rounded-md md:rounded-lg mb-2 sm:mb-3 md:mb-4 shadow-sm", 
                              theme.value === "minimal" ? theme.gradient : `bg-gradient-to-br ${theme.gradient}`
                            )}></div>
                            <span className="font-semibold text-xs sm:text-sm md:text-base">{theme.label}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-sm sm:text-base font-medium mb-2 block">Background Style</Label>
                    <Select
                      value={linkProfile?.background?.style || "solid"}
                      onValueChange={(value) => setLinkProfile({ 
                        ...linkProfile, 
                        background: { ...linkProfile?.background, style: value }
                      })}
                    >
                      <SelectTrigger className="mt-2 h-10 sm:h-11 md:h-12 text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Solid Color</SelectItem>
                        <SelectItem value="gradient">Gradient</SelectItem>
                        <SelectItem value="pattern">Pattern</SelectItem>
                        <SelectItem value="blur">Blur Effect</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Layout & Spacing Section */}
              <Card className="p-4 sm:p-6 md:p-9 border-border/50">
                <div className="flex items-center gap-3 mb-6 md:mb-10">
                  <Layout className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-bronze flex-shrink-0" />
                  <h3 className="font-vollkorn text-xl sm:text-2xl md:text-4xl font-bold">Layout & Spacing</h3>
                </div>
                
                <div className="space-y-6 md:space-y-10">
                  <div>
                    <Label htmlFor="layout" className="text-sm sm:text-base md:text-lg font-medium mb-2 md:mb-4 block">Page Layout</Label>
                    <Select
                      value={linkProfile?.layout || "centered"}
                      onValueChange={(value) => setLinkProfile({ ...linkProfile, layout: value })}
                    >
                      <SelectTrigger className="mt-2 h-10 sm:h-11 md:h-12 text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="centered">Centered Classic</SelectItem>
                        <SelectItem value="left">Left Aligned</SelectItem>
                        <SelectItem value="full">Full Width</SelectItem>
                        <SelectItem value="card">Card Style</SelectItem>
                        <SelectItem value="split">Split Screen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm sm:text-base md:text-lg font-medium mb-3 md:mb-6 block">Button Style</Label>
                    <RadioGroup
                      value={linkProfile?.background?.button_style || "rounded"}
                      onValueChange={(value) => setLinkProfile({ 
                        ...linkProfile, 
                        background: { ...linkProfile?.background, button_style: value }
                      })}
                      className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6"
                    >
                      {[
                        { value: "rounded", label: "Rounded", class: "rounded-full" },
                        { value: "sharp", label: "Sharp", class: "" },
                        { value: "soft", label: "Soft", class: "rounded-lg" },
                        { value: "pill", label: "Pill", class: "rounded-full bg-bronze" },
                      ].map((style) => (
                        <div key={style.value} className="relative">
                          <RadioGroupItem value={style.value} id={style.value} className="peer sr-only" />
                          <Label
                            htmlFor={style.value}
                            className="flex flex-col items-center justify-center rounded-lg md:rounded-xl border-2 border-muted p-3 sm:p-4 md:p-6 hover:bg-accent peer-data-[state=checked]:border-bronze peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-bronze/20 cursor-pointer transition-all"
                          >
                            <div className={cn(
                              "w-full h-10 sm:h-12 md:h-16 mb-2 sm:mb-2.5 md:mb-3 shadow-sm",
                              style.value === "pill" ? style.class : `${style.class} bg-bronze/20 border-2 border-bronze`
                            )}></div>
                            <span className="text-xs sm:text-sm md:text-base font-medium">{style.label}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-sm sm:text-base font-medium mb-2 md:mb-4 block">Button Spacing</Label>
                    <div className="mt-3 md:mt-4">
                      <Slider
                        value={[linkProfile?.background?.button_spacing || 12]}
                        onValueChange={(value) => setLinkProfile({ 
                          ...linkProfile, 
                          background: { ...linkProfile?.background, button_spacing: value[0] }
                        })}
                        min={4}
                        max={32}
                        step={4}
                        className="w-full"
                      />
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 md:mt-3">
                        {linkProfile?.background?.button_spacing || 12}px between buttons
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm sm:text-base font-medium mb-2 block">Page Width</Label>
                    <Select
                      value={linkProfile?.background?.page_width || "medium"}
                      onValueChange={(value) => setLinkProfile({ 
                        ...linkProfile, 
                        background: { ...linkProfile?.background, page_width: value }
                      })}
                    >
                      <SelectTrigger className="mt-2 h-10 sm:h-11 md:h-12 text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="narrow">Narrow (480px)</SelectItem>
                        <SelectItem value="medium">Medium (640px)</SelectItem>
                        <SelectItem value="wide">Wide (800px)</SelectItem>
                        <SelectItem value="full">Full Width</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Effects & Animations */}
              <Card className="p-6 md:p-9 border-border/50">
                <div className="flex items-center gap-3 mb-8">
                  <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-bronze" />
                  <h3 className="font-vollkorn text-2xl md:text-4xl font-bold">Effects & Animations</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <Label className="text-base font-medium">Button Hover Effects</Label>
                      <p className="text-sm text-muted-foreground mt-1">Subtle animations on hover</p>
                    </div>
                    <Switch
                      checked={linkProfile?.background?.hover_effects !== false}
                      onCheckedChange={(checked) => setLinkProfile({ 
                        ...linkProfile, 
                        background: { ...linkProfile?.background, hover_effects: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <Label className="text-base font-medium">Smooth Scrolling</Label>
                      <p className="text-sm text-muted-foreground mt-1">Enhanced scroll experience</p>
                    </div>
                    <Switch
                      checked={linkProfile?.background?.smooth_scroll !== false}
                      onCheckedChange={(checked) => setLinkProfile({ 
                        ...linkProfile, 
                        background: { ...linkProfile?.background, smooth_scroll: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <Label className="text-base font-medium">Fade-in Animation</Label>
                      <p className="text-sm text-muted-foreground mt-1">Elements fade in on load</p>
                    </div>
                    <Switch
                      checked={linkProfile?.background?.fade_animation !== false}
                      onCheckedChange={(checked) => setLinkProfile({ 
                        ...linkProfile, 
                        background: { ...linkProfile?.background, fade_animation: checked }
                      })}
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ===== SETTINGS TAB ===== */}
          {currentTab === "settings" && (
            <Card className="p-6 md:p-8 border-border/50">
              <h3 className="font-vollkorn text-3xl md:text-4xl font-bold mb-8 text-bronze">Settings</h3>
              
              <div className="space-y-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <Label className="text-base font-medium">Contact Button</Label>
                    <p className="text-sm text-muted-foreground mt-1">Allow visitors to contact you</p>
                  </div>
                  <Switch
                    checked={linkProfile?.contact_enabled || false}
                    onCheckedChange={(checked) => 
                      setLinkProfile({ ...linkProfile, contact_enabled: checked })
                    }
                  />
                </div>

                <div className="pt-6 border-t">
                  <h4 className="font-vollkorn text-xl font-bold mb-6">Analytics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-muted rounded-lg">
                      <p className="text-3xl font-bold text-bronze">{linkProfile?.total_visits || 0}</p>
                      <p className="text-sm text-muted-foreground mt-2">Total Visits</p>
                    </div>
                    <div className="p-5 bg-muted rounded-lg">
                      <p className="text-3xl font-bold text-bronze">
                        {buttons.reduce((sum, btn) => sum + (btn.clicks || 0), 0)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">Button Clicks</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ===== ANALYTICS TAB ===== */}
          {currentTab === "analytics" && (
            <Card className="p-6 md:p-8 border-border/50">
              <h3 className="font-vollkorn text-3xl md:text-4xl font-bold mb-8 text-bronze">Analytics</h3>
              
              <div className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-5 md:p-6 bg-muted rounded-lg">
                    <p className="text-3xl md:text-4xl font-bold text-bronze">{linkProfile?.total_visits || 0}</p>
                    <p className="text-sm text-muted-foreground mt-3">Total Page Views</p>
                  </div>
                  <div className="p-5 md:p-6 bg-muted rounded-lg">
                    <p className="text-3xl md:text-4xl font-bold text-bronze">
                      {buttons.reduce((sum, btn) => sum + (btn.clicks || 0), 0)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-3">Total Link Clicks</p>
                  </div>
                  <div className="p-5 md:p-6 bg-muted rounded-lg col-span-2 md:col-span-1">
                    <p className="text-3xl md:text-4xl font-bold text-bronze">{buttons.length}</p>
                    <p className="text-sm text-muted-foreground mt-3">Active Links</p>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h4 className="font-vollkorn text-xl font-bold mb-6">Link Performance</h4>
                  <div className="space-y-4">
                    {buttons.map((button) => (
                      <div key={button.id} className="flex items-center justify-between gap-4 p-5 bg-muted rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base truncate">{button.title}</p>
                          <p className="text-sm text-muted-foreground truncate mt-1">{button.url}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-2xl font-bold text-bronze">{button.clicks || 0}</p>
                          <p className="text-xs text-muted-foreground">clicks</p>
                        </div>
                      </div>
                    ))}
                    {buttons.length === 0 && (
                      <p className="text-center text-muted-foreground py-12 text-base">No links yet. Add buttons to see performance data.</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
          </div>
        </main>
      </div>

      <AddButtonDialog
        open={showAddButton}
        onOpenChange={setShowAddButton}
        onAdd={handleAddButton}
      />
    </div>
  );
};

export default CreviaLink;
