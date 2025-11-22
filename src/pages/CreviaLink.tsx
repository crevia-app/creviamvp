import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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

    // Fetch user profile
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    setProfile(userProfile);

    // Fetch or create link profile
    const { data: existingLink } = await supabase
      .from("link_profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (existingLink) {
      setLinkProfile(existingLink);
    } else {
      // Create default link profile
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
    const { error } = await supabase
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
      // Refresh the link profile to get the latest data
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-6 pt-32 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <LinkTabsMobile userType={profile?.user_type || "creator"} />
      
      <div className="flex flex-1 w-full">
        <LinkSidebarDesktop userType={profile?.user_type || "creator"} />
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-12 md:pb-20">
            {/* Hero Section */}
            <div className="text-center mb-10 md:mb-16">
              <div className="inline-flex items-center gap-2 mb-3 md:mb-4 text-bronze">
                <Link2 className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-xs md:text-sm font-poppins font-semibold">CREVIA LINK</span>
              </div>
              <h1 className="font-vollkorn text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 px-2">
                Your premium link-in-bio
              </h1>
              <p className="text-base md:text-lg text-muted-foreground font-poppins max-w-2xl mx-auto mb-6 md:mb-8 px-4">
                Beautiful, customizable, and powerful. Share everything you create in one elegant page.
              </p>
              
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 justify-center px-4">
                <Button
                  size="lg"
                  onClick={() => window.open(`/${linkProfile?.username}`, "_blank")}
                  className="bg-bronze hover:bg-bronze-dark font-poppins font-semibold"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Your Page
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleSave}
                  disabled={saving}
                  className="font-poppins font-semibold"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="font-poppins font-semibold"
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
              </div>
            </div>

            {/* Editor Content */}
            <div className="max-w-5xl mx-auto">

          {/* Profile Tab */}
          {currentTab === "profile" && (
            <Card className="p-8">
              <h3 className="font-vollkorn text-2xl font-bold mb-6">Profile Information</h3>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-muted-foreground">crevia.app/</span>
                    <Input
                      id="username"
                      value={linkProfile?.username || ""}
                      onChange={(e) => setLinkProfile({ ...linkProfile, username: e.target.value })}
                      placeholder="yourusername"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={linkProfile?.display_name || ""}
                    onChange={(e) => setLinkProfile({ ...linkProfile, display_name: e.target.value })}
                    placeholder="Your Name"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio (max 150 characters)</Label>
                  <Textarea
                    id="bio"
                    value={linkProfile?.bio || ""}
                    onChange={(e) => setLinkProfile({ ...linkProfile, bio: e.target.value.slice(0, 150) })}
                    placeholder="Tell people about yourself..."
                    className="mt-2"
                    maxLength={150}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
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
          )}

          {/* Buttons Tab */}
          {currentTab === "buttons" && (
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-vollkorn text-2xl font-bold">Links & Buttons</h3>
                <Button 
                  className="bg-bronze hover:bg-bronze-dark"
                  onClick={() => setShowAddButton(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Button
                </Button>
              </div>
              
              {buttons.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No buttons yet. Click "Add Button" to get started.</p>
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

          {/* Appearance Tab */}
          {currentTab === "appearance" && (
            <div className="space-y-6">
              {/* Typography Section */}
              <Card className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Type className="w-5 h-5 text-bronze" />
                  <h3 className="font-vollkorn text-2xl font-bold">Typography</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Select
                      value={linkProfile?.background?.font_family || "poppins"}
                      onValueChange={(value) => setLinkProfile({ 
                        ...linkProfile, 
                        background: { ...linkProfile?.background, font_family: value }
                      })}
                    >
                      <SelectTrigger className="mt-2">
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
                    <p className="text-xs text-muted-foreground mt-2">
                      Choose a font that matches your brand personality
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="fontSize">Text Size</Label>
                    <Select
                      value={linkProfile?.background?.font_size || "medium"}
                      onValueChange={(value) => setLinkProfile({ 
                        ...linkProfile, 
                        background: { ...linkProfile?.background, font_size: value }
                      })}
                    >
                      <SelectTrigger className="mt-2">
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
              <Card className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Palette className="w-5 h-5 text-bronze" />
                  <h3 className="font-vollkorn text-2xl font-bold">Theme & Colors</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <Label>Color Scheme</Label>
                    <RadioGroup
                      value={linkProfile?.theme || "dark"}
                      onValueChange={(value) => setLinkProfile({ ...linkProfile, theme: value })}
                      className="grid grid-cols-2 gap-4 mt-4"
                    >
                      <div className="relative">
                        <RadioGroupItem value="light" id="light" className="peer sr-only" />
                        <Label
                          htmlFor="light"
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-bronze [&:has([data-state=checked])]:border-bronze cursor-pointer"
                        >
                          <div className="w-full h-20 rounded bg-gradient-to-br from-gray-50 to-gray-100 mb-3"></div>
                          <span className="font-semibold">Light</span>
                        </Label>
                      </div>

                      <div className="relative">
                        <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                        <Label
                          htmlFor="dark"
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-bronze [&:has([data-state=checked])]:border-bronze cursor-pointer"
                        >
                          <div className="w-full h-20 rounded bg-gradient-to-br from-gray-800 to-gray-900 mb-3"></div>
                          <span className="font-semibold">Dark</span>
                        </Label>
                      </div>

                      <div className="relative">
                        <RadioGroupItem value="bronze" id="bronze" className="peer sr-only" />
                        <Label
                          htmlFor="bronze"
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-bronze [&:has([data-state=checked])]:border-bronze cursor-pointer"
                        >
                          <div className="w-full h-20 rounded bg-gradient-to-br from-bronze to-bronze-dark mb-3"></div>
                          <span className="font-semibold">Bronze Elegance</span>
                        </Label>
                      </div>

                      <div className="relative">
                        <RadioGroupItem value="minimal" id="minimal" className="peer sr-only" />
                        <Label
                          htmlFor="minimal"
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-bronze [&:has([data-state=checked])]:border-bronze cursor-pointer"
                        >
                          <div className="w-full h-20 rounded bg-white border-2 mb-3"></div>
                          <span className="font-semibold">Minimal</span>
                        </Label>
                      </div>

                      <div className="relative">
                        <RadioGroupItem value="sunset" id="sunset" className="peer sr-only" />
                        <Label
                          htmlFor="sunset"
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-bronze [&:has([data-state=checked])]:border-bronze cursor-pointer"
                        >
                          <div className="w-full h-20 rounded bg-gradient-to-br from-orange-400 to-pink-600 mb-3"></div>
                          <span className="font-semibold">Sunset</span>
                        </Label>
                      </div>

                      <div className="relative">
                        <RadioGroupItem value="ocean" id="ocean" className="peer sr-only" />
                        <Label
                          htmlFor="ocean"
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-bronze [&:has([data-state=checked])]:border-bronze cursor-pointer"
                        >
                          <div className="w-full h-20 rounded bg-gradient-to-br from-blue-500 to-teal-400 mb-3"></div>
                          <span className="font-semibold">Ocean</span>
                        </Label>
                      </div>

                      <div className="relative">
                        <RadioGroupItem value="forest" id="forest" className="peer sr-only" />
                        <Label
                          htmlFor="forest"
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-bronze [&:has([data-state=checked])]:border-bronze cursor-pointer"
                        >
                          <div className="w-full h-20 rounded bg-gradient-to-br from-green-600 to-emerald-800 mb-3"></div>
                          <span className="font-semibold">Forest</span>
                        </Label>
                      </div>

                      <div className="relative">
                        <RadioGroupItem value="royal" id="royal" className="peer sr-only" />
                        <Label
                          htmlFor="royal"
                          className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-white p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-bronze [&:has([data-state=checked])]:border-bronze cursor-pointer"
                        >
                          <div className="w-full h-20 rounded bg-gradient-to-br from-purple-600 to-indigo-800 mb-3"></div>
                          <span className="font-semibold">Royal Purple</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Background Style</Label>
                    <Select
                      value={linkProfile?.background?.style || "solid"}
                      onValueChange={(value) => setLinkProfile({ 
                        ...linkProfile, 
                        background: { ...linkProfile?.background, style: value }
                      })}
                    >
                      <SelectTrigger className="mt-2">
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
              <Card className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Layout className="w-5 h-5 text-bronze" />
                  <h3 className="font-vollkorn text-2xl font-bold">Layout & Spacing</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="layout">Page Layout</Label>
                    <Select
                      value={linkProfile?.layout || "centered"}
                      onValueChange={(value) => setLinkProfile({ ...linkProfile, layout: value })}
                    >
                      <SelectTrigger className="mt-2">
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
                    <Label>Button Style</Label>
                    <RadioGroup
                      value={linkProfile?.background?.button_style || "rounded"}
                      onValueChange={(value) => setLinkProfile({ 
                        ...linkProfile, 
                        background: { ...linkProfile?.background, button_style: value }
                      })}
                      className="grid grid-cols-2 gap-4 mt-4"
                    >
                      <div className="relative">
                        <RadioGroupItem value="rounded" id="rounded" className="peer sr-only" />
                        <Label
                          htmlFor="rounded"
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 hover:bg-accent peer-data-[state=checked]:border-bronze cursor-pointer"
                        >
                          <div className="w-full h-12 rounded-full bg-bronze/20 border-2 border-bronze mb-2"></div>
                          <span className="text-sm font-medium">Rounded</span>
                        </Label>
                      </div>

                      <div className="relative">
                        <RadioGroupItem value="sharp" id="sharp" className="peer sr-only" />
                        <Label
                          htmlFor="sharp"
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 hover:bg-accent peer-data-[state=checked]:border-bronze cursor-pointer"
                        >
                          <div className="w-full h-12 bg-bronze/20 border-2 border-bronze mb-2"></div>
                          <span className="text-sm font-medium">Sharp</span>
                        </Label>
                      </div>

                      <div className="relative">
                        <RadioGroupItem value="soft" id="soft" className="peer sr-only" />
                        <Label
                          htmlFor="soft"
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 hover:bg-accent peer-data-[state=checked]:border-bronze cursor-pointer"
                        >
                          <div className="w-full h-12 rounded-lg bg-bronze/20 border-2 border-bronze mb-2"></div>
                          <span className="text-sm font-medium">Soft</span>
                        </Label>
                      </div>

                      <div className="relative">
                        <RadioGroupItem value="pill" id="pill" className="peer sr-only" />
                        <Label
                          htmlFor="pill"
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 hover:bg-accent peer-data-[state=checked]:border-bronze cursor-pointer"
                        >
                          <div className="w-full h-12 rounded-full bg-bronze mb-2"></div>
                          <span className="text-sm font-medium">Pill</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Button Spacing</Label>
                    <div className="mt-4">
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
                      <p className="text-xs text-muted-foreground mt-2">
                        {linkProfile?.background?.button_spacing || 12}px between buttons
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label>Page Width</Label>
                    <Select
                      value={linkProfile?.background?.page_width || "medium"}
                      onValueChange={(value) => setLinkProfile({ 
                        ...linkProfile, 
                        background: { ...linkProfile?.background, page_width: value }
                      })}
                    >
                      <SelectTrigger className="mt-2">
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
              <Card className="p-8">
                <h3 className="font-vollkorn text-2xl font-bold mb-6">Effects & Animations</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Button Hover Effects</Label>
                      <p className="text-xs text-muted-foreground">Subtle animations on hover</p>
                    </div>
                    <Switch
                      checked={linkProfile?.background?.hover_effects !== false}
                      onCheckedChange={(checked) => setLinkProfile({ 
                        ...linkProfile, 
                        background: { ...linkProfile?.background, hover_effects: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Smooth Scrolling</Label>
                      <p className="text-xs text-muted-foreground">Enhanced scroll experience</p>
                    </div>
                    <Switch
                      checked={linkProfile?.background?.smooth_scroll !== false}
                      onCheckedChange={(checked) => setLinkProfile({ 
                        ...linkProfile, 
                        background: { ...linkProfile?.background, smooth_scroll: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Fade-in Animation</Label>
                      <p className="text-xs text-muted-foreground">Elements fade in on load</p>
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

          {/* Settings Tab */}
          {currentTab === "settings" && (
            <Card className="p-8">
              <h3 className="font-vollkorn text-2xl font-bold mb-6">Settings</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Contact Button</Label>
                    <p className="text-sm text-muted-foreground">Allow visitors to contact you</p>
                  </div>
                  <Switch
                    checked={linkProfile?.contact_enabled || false}
                    onCheckedChange={(checked) => 
                      setLinkProfile({ ...linkProfile, contact_enabled: checked })
                    }
                  />
                </div>

                <div className="pt-6 border-t">
                  <h4 className="font-semibold mb-4">Analytics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{linkProfile?.total_visits || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Visits</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-sm text-muted-foreground">Button Clicks</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Analytics Tab */}
          {currentTab === "analytics" && (
            <Card className="p-8">
              <h3 className="font-vollkorn text-2xl font-bold mb-6">Analytics</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-bronze">{linkProfile?.total_visits || 0}</p>
                    <p className="text-sm text-muted-foreground mt-2">Total Page Views</p>
                  </div>
                  <div className="p-6 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-bronze">
                      {buttons.reduce((sum, btn) => sum + (btn.clicks || 0), 0)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">Total Link Clicks</p>
                  </div>
                  <div className="p-6 bg-muted rounded-lg">
                    <p className="text-3xl font-bold text-bronze">{buttons.length}</p>
                    <p className="text-sm text-muted-foreground mt-2">Active Links</p>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h4 className="font-semibold mb-4">Link Performance</h4>
                  <div className="space-y-3">
                    {buttons.map((button) => (
                      <div key={button.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{button.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-xs">{button.url}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-bronze">{button.clicks || 0}</p>
                          <p className="text-xs text-muted-foreground">clicks</p>
                        </div>
                      </div>
                    ))}
                    {buttons.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No links yet. Add buttons to see performance data.</p>
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

      <Footer />
    </div>
  );
};

export default CreviaLink;
