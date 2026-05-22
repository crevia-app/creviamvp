import { useState, useEffect, useRef } from "react";
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
import { Link2, Plus, Eye, Sparkles, Type, Palette, Layout, Copy, Check, Globe, Shield, Bell, BarChart3, TrendingUp, MousePointer, ExternalLink, Camera, AlertCircle, Users, Star, ArrowUp, ArrowDown, ChevronUp, ChevronDown, Image as ImageIcon, User, MousePointerClick, SlidersHorizontal, BarChart2 } from "lucide-react";
import ThemeSelector from "@/components/crevia-link/ThemeSelector";
import { PRO_THEME_IDS } from "@/lib/linkThemes";
import { AddButtonDialog } from "@/components/crevia-link/AddButtonDialog";
import { EditButtonDialog } from "@/components/crevia-link/EditButtonDialog";
import { ButtonItem } from "@/components/crevia-link/ButtonItem";
import LinkSidebarDesktop from "@/components/crevia-link/LinkSidebarDesktop";
import LinkTabsMobile from "@/components/crevia-link/LinkTabsMobile";
import LivePreview from "@/components/crevia-link/LivePreview";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSubscription } from "@/hooks/use-subscription";

interface CreviaLinkProps {
  isEmbedded?: boolean;
}

// Username validation
const validateUsername = (username: string): string | null => {
  if (!username) return "Username is required";
  if (username.length < 3) return "Username must be at least 3 characters";
  if (username.length > 30) return "Username must be under 30 characters";
  if (/^[._-]/.test(username)) return "Username cannot start with a dot, underscore, or hyphen";
  if (/[._-]$/.test(username)) return "Username cannot end with a dot, underscore, or hyphen";
  if (/[._-]{2,}/.test(username)) return "Username cannot have consecutive special characters";
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) return "Only letters, numbers, dots, underscores, and hyphens allowed";
  if (/^\d+$/.test(username)) return "Username cannot be only numbers";
  const reserved = ["admin", "support", "help", "about", "pricing", "auth", "dashboard", "api", "crevia", "kira", "settings", "profile", "signup", "login"];
  if (reserved.includes(username.toLowerCase())) return "This username is reserved";
  return null;
};

const PREMIUM_THEMES = PRO_THEME_IDS;

const CreviaLink = ({ isEmbedded = false }: CreviaLinkProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isPro, isBusiness, isBrandWorkspace } = useSubscription();
  const isProUser = isPro || isBusiness || isBrandWorkspace;
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [linkProfile, setLinkProfile] = useState<any>(null);
  const [buttons, setButtons] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);
  const [showEditButton, setShowEditButton] = useState(false);
  const [editingButton, setEditingButton] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  
  const currentTab = new URLSearchParams(location.search).get("tab") || "profile";

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }

    // Run both queries in parallel instead of sequentially
    const [{ data: userProfile }, { data: existingLink }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", session.user.id).single(),
      supabase.from("link_profiles").select("*").eq("user_id", session.user.id).single(),
    ]);

    setProfile(userProfile);

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

  const handleUsernameChange = (value: string) => {
    const sanitized = value.toLowerCase().trim();
    setLinkProfile({ ...linkProfile, username: sanitized });
    setUsernameError(validateUsername(sanitized));
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB allowed.", variant: "destructive" });
      return;
    }

    setUploadingPicture(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${session.user.id}/link-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      // .from("chat-files")//->wrong bucket
      .from("avatars") //->correct bucket
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploadingPicture(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("link_profiles")
      .update({ profile_picture: publicUrl })
      .eq("id", linkProfile.id);

    if (updateError) {
      toast({ title: "Failed to update", description: updateError.message, variant: "destructive" });
    } else {
      setLinkProfile({ ...linkProfile, profile_picture: publicUrl });
      toast({ title: "Profile picture updated!" });
    }

    setUploadingPicture(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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

  const handleEditButton = (button: any) => {
    setEditingButton(button);
    setShowEditButton(true);
  };

  const handleSaveEditButton = async (updatedButton: any) => {
    const { error } = await supabase
      .from("link_buttons")
      .update({
        title: updatedButton.title,
        url: updatedButton.url,
        icon: updatedButton.icon,
        style: updatedButton.style,
      })
      .eq("id", updatedButton.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setButtons(buttons.map(b => b.id === updatedButton.id ? { ...b, ...updatedButton } : b));
      toast({ title: "Button updated!" });
    }
  };

  const handleMoveButton = async (id: string, direction: "up" | "down") => {
    const idx = buttons.findIndex(b => b.id === id);
    if (direction === "up" && idx <= 0) return;
    if (direction === "down" && idx >= buttons.length - 1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newButtons = [...buttons];
    [newButtons[idx], newButtons[swapIdx]] = [newButtons[swapIdx], newButtons[idx]];
    
    // Update order_index for both
    const updates = newButtons.map((b, i) => ({ ...b, order_index: i }));
    setButtons(updates);

    // Persist both
    await Promise.all([
      supabase.from("link_buttons").update({ order_index: updates[idx].order_index }).eq("id", updates[idx].id),
      supabase.from("link_buttons").update({ order_index: updates[swapIdx].order_index }).eq("id", updates[swapIdx].id),
    ]);
  };

  const handleSave = async () => {
    // Validate username before saving
    const error = validateUsername(linkProfile?.username || "");
    if (error) {
      setUsernameError(error);
      toast({ title: "Invalid username", description: error, variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error: saveError } = await supabase
      .from("link_profiles")
      .update({
        username: linkProfile.username,
        display_name: linkProfile.display_name,
        bio: linkProfile.bio,
        theme: linkProfile.theme,
        layout: linkProfile.layout,
        show_verified_badge: linkProfile.show_verified_badge,
        show_crevia_branding: linkProfile.show_crevia_branding,
        contact_enabled: linkProfile.contact_enabled,
        contact_email: linkProfile.contact_email,
        background: linkProfile.background,
        profile_picture: linkProfile.profile_picture,
        seo_title: linkProfile.seo_title,
        seo_description: linkProfile.seo_description,
      })
      .eq("id", linkProfile.id);

    if (saveError) {
      toast({
        title: "Error saving",
        description: saveError.message,
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

  // Refresh analytics from DB when the analytics tab is opened
  useEffect(() => {
    const isAnalyticsTab = currentTab === "analytics" ||
      new URLSearchParams(location.search).get("section") === "analytics";
    if (!isAnalyticsTab || !linkProfile?.id) return;

    const refresh = async () => {
      const [{ data: freshProfile }, { data: freshButtons }] = await Promise.all([
        supabase.from("link_profiles").select("*").eq("id", linkProfile.id).single(),
        supabase.from("link_buttons").select("*").eq("profile_id", linkProfile.id).order("order_index"),
      ]);
      if (freshProfile) setLinkProfile(freshProfile);
      if (freshButtons) setButtons(freshButtons);
    };
    refresh();
  }, [currentTab, location.search, linkProfile?.id]);

  // Computed analytics
  const totalClicks = buttons.reduce((sum, btn) => sum + (btn.clicks || 0), 0);
  const totalViews = linkProfile?.total_visits || 0;
  const clickRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";
  const topLink = buttons.length > 0
    ? [...buttons].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0]
    : null;
  const activeLinks = buttons.filter(b => b.visible !== false).length;

  // Profile picture section shared between standalone and embedded
  const renderProfilePicture = () => (
    <div className="flex flex-col items-center gap-4 mb-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleProfilePictureUpload}
      />
      <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <Avatar className="h-24 w-24 ring-4 ring-bronze/20">
          <AvatarImage src={linkProfile?.profile_picture} />
          <AvatarFallback className="bg-bronze/10 text-bronze text-2xl font-bold">
            {linkProfile?.display_name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="h-6 w-6 text-white" />
        </div>
        {uploadingPicture && (
          <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Click to change profile picture</p>
    </div>
  );

  // Username field shared
  const renderUsernameField = (idPrefix: string = "") => (
    <div>
      <Label className="text-sm font-medium mb-2 block">Username</Label>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm whitespace-nowrap">crevia.app/</span>
        <Input
          value={linkProfile?.username || ""}
          onChange={(e) => handleUsernameChange(e.target.value)}
          placeholder="yourusername"
          className={cn("flex-1 h-11", usernameError && "border-destructive")}
        />
      </div>
      {usernameError && (
        <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {usernameError}
        </p>
      )}
      <p className="text-xs text-muted-foreground mt-1">3-30 chars. Letters, numbers, dots, underscores, hyphens. Cannot start/end with special chars.</p>
    </div>
  );

  // Analytics section shared
  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-5 border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-bronze/10">
              <Eye className="w-5 h-5 text-bronze" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalViews}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Views</p>
        </Card>
        <Card className="p-5 border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <MousePointer className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalClicks}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Clicks</p>
        </Card>
        <Card className="p-5 border-border/50 col-span-2 md:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{clickRate}%</p>
          <p className="text-sm text-muted-foreground mt-1">Click-Through Rate</p>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5 border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Link2 className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{activeLinks}</p>
          <p className="text-sm text-muted-foreground mt-1">Active Links</p>
        </Card>
        <Card className="p-5 border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-xl font-bold text-foreground truncate">{topLink?.title || "—"}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Top Link {topLink ? `(${topLink.clicks || 0} clicks)` : ""}
          </p>
        </Card>
      </div>

      {/* Link Performance */}
      <Card className="p-6 border-border/50">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-bronze" />
          <h3 className="font-vollkorn text-xl sm:text-2xl font-bold">Link Performance</h3>
        </div>
        <div className="space-y-3">
          {buttons.length > 0 ? (
            buttons
              .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
              .map((button) => {
                const percentage = totalClicks > 0 ? ((button.clicks || 0) / totalClicks * 100).toFixed(0) : 0;
                return (
                  <div key={button.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{button.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{button.url}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold text-bronze">{button.clicks || 0}</p>
                        <p className="text-xs text-muted-foreground">{percentage}% of clicks</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-bronze rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No links yet. Add buttons to see analytics.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // When embedded in Crevia Studio, use a cleaner layout without the sidebar
  if (isEmbedded) {
    const embeddedTab = new URLSearchParams(location.search).get("section") || "profile";
    
    return (
      <div className="bg-background">
        {/* Embedded Tab Navigation */}
        <div className="hidden md:block sticky top-0 z-30 border-b border-border/60 bg-background">
          <ScrollArea className="w-full">
            <div className="flex items-center justify-around px-6 md:px-10 py-2 w-full">
              {[
                { id: "profile",    label: "Profile",    icon: User },
                { id: "buttons",    label: "Buttons",    icon: MousePointerClick },
                { id: "appearance", label: "Appearance", icon: Palette },
                { id: "analytics",  label: "Analytics",  icon: BarChart2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = embeddedTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => navigate(`/crevia-studio?tab=link&section=${tab.id}`)}
                    className={cn(
                      "relative flex flex-col items-center gap-1 px-5 py-2.5 rounded-xl min-w-[72px] transition-all duration-200 select-none",
                      isActive
                        ? "text-bronze"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {isActive && (
                      <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-bronze" />
                    )}
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
                      isActive ? "bg-bronze/15" : ""
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wide whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" className="h-1.5" />
          </ScrollArea>
        </div>

        {/* Embedded Content with Preview */}
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 md:py-8 xl:flex-row xl:items-start">
          {/* Main Content */}
          <div className="min-w-0 flex-1 xl:max-w-[54rem]">
            {embeddedTab === "profile" && (
              <Card className="min-w-0 p-6 border-border/50">
                <h3 className="font-vollkorn text-2xl font-bold mb-6">Profile Information</h3>
                <div className="space-y-5">
                  {renderProfilePicture()}
                  {renderUsernameField("embedded-")}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Display Name</Label>
                    <Input
                      value={linkProfile?.display_name || ""}
                      onChange={(e) => setLinkProfile({ ...linkProfile, display_name: e.target.value })}
                      placeholder="Your Name"
                      className="h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Bio</Label>
                    <Textarea
                      value={linkProfile?.bio || ""}
                      onChange={(e) => setLinkProfile({ ...linkProfile, bio: e.target.value.slice(0, 150) })}
                      placeholder="Tell people about yourself..."
                      className="min-h-[100px] resize-none text-base"
                      maxLength={150}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{linkProfile?.bio?.length || 0}/150</p>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSave} disabled={saving} className="bg-bronze hover:bg-bronze-dark">
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowPreviewModal(true)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {embeddedTab === "buttons" && (
              <Card className="min-w-0 p-6 border-border/50">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-vollkorn text-2xl font-bold">Links & Buttons</h3>
                  <Button onClick={() => setShowAddButton(true)} className="bg-bronze hover:bg-bronze-dark">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Button
                  </Button>
                </div>
                {buttons.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Link2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p>No buttons yet. Add one to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {buttons.map((button, idx) => (
                      <ButtonItem
                        key={button.id}
                        button={button}
                        onEdit={handleEditButton}
                        onDelete={handleDeleteButton}
                        onToggleVisibility={handleToggleVisibility}
                        onMoveUp={(id) => handleMoveButton(id, "up")}
                        onMoveDown={(id) => handleMoveButton(id, "down")}
                        isFirst={idx === 0}
                        isLast={idx === buttons.length - 1}
                      />
                    ))}
                  </div>
                )}
              </Card>
            )}

            {embeddedTab === "appearance" && (
              <div className="space-y-6">
                {/* Theme & Colors (includes background style) */}
                <Card className="min-w-0 p-6 border-border/50">
                  <div className="flex items-center gap-3 mb-6">
                    <Palette className="w-6 h-6 text-bronze" />
                    <h3 className="font-vollkorn text-2xl font-bold">Theme & Colors</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <Label className="text-sm font-medium mb-4 block">Color Scheme</Label>
                      <ThemeSelector
                        value={linkProfile?.theme || "elite_obsidian"}
                        onChange={(themeId, fontKey) =>
                          setLinkProfile({ ...linkProfile, theme: themeId, background: { ...linkProfile?.background, style: "solid", font_family: fontKey } })
                        }
                        isProUser={isProUser}
                        onUpgrade={() => navigate("/profile/payments-billing")}
                      />
                    </div>

                    {/* Custom Background Image */}
                    <div className="pt-4 border-t border-border/40">
                      <Label className="text-sm font-medium mb-2 block">Custom Background Image</Label>
                      <div className="space-y-3">
                        <Label className="text-xs text-muted-foreground block">Upload your own background image</Label>
                        {linkProfile?.background?.custom_bg_url && (
                          <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                            <img src={linkProfile.background.custom_bg_url} alt="Background" className="w-full h-full object-cover" />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 h-7 text-xs"
                              onClick={() => setLinkProfile({
                                ...linkProfile,
                                theme: linkProfile?.theme === "custom_image" ? "dark" : linkProfile?.theme,
                                background: { ...linkProfile?.background, custom_bg_url: null, style: "solid" }
                              })}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="emb-bg-image-upload"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const { data: { session } } = await supabase.auth.getSession();
                              if (!session) return;
                              const ext = file.name.split(".").pop();
                              const path = `${session.user.id}/bg-${Date.now()}.${ext}`;
                              const { error } = await supabase.storage.from("avatars").upload(path, file);
                              if (error) {
                                toast({ title: "Upload failed", description: error.message, variant: "destructive" });
                                return;
                              }
                              const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
                              setLinkProfile({
                                ...linkProfile,
                                theme: "custom_image",
                                background: { ...linkProfile?.background, style: "custom_image", custom_bg_url: urlData.publicUrl }
                              });
                              toast({ title: "Background uploaded!" });
                            }}
                          />
                          <Button
                            variant="outline"
                            className="w-full border-dashed border-2 border-bronze/40 hover:border-bronze"
                            onClick={() => document.getElementById("emb-bg-image-upload")?.click()}
                          >
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Choose Image
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Typography */}
                <Card className="min-w-0 p-6 border-border/50">
                  <div className="flex items-center gap-3 mb-6">
                    <Type className="w-6 h-6 text-bronze" />
                    <h3 className="font-vollkorn text-2xl font-bold">Typography</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Font Family</Label>
                      <Select
                        value={linkProfile?.background?.font_family || "poppins"}
                        onValueChange={(value) => setLinkProfile({ 
                          ...linkProfile, 
                          background: { ...linkProfile?.background, font_family: value }
                        })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="poppins">Poppins (Modern)</SelectItem>
                          <SelectItem value="vollkorn">Vollkorn (Classic)</SelectItem>
                          <SelectItem value="inter">Inter (Clean)</SelectItem>
                          <SelectItem value="playfair">Playfair (Elegant)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>

                {/* Layout */}
                <Card className="min-w-0 p-6 border-border/50">
                  <div className="flex items-center gap-3 mb-6">
                    <Layout className="w-6 h-6 text-bronze" />
                    <h3 className="font-vollkorn text-2xl font-bold">Layout</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Button Style</Label>
                      <RadioGroup
                        value={linkProfile?.background?.button_style || "rounded"}
                        onValueChange={(value) => setLinkProfile({ 
                          ...linkProfile, 
                          background: { ...linkProfile?.background, button_style: value }
                        })}
                        className="grid grid-cols-2 gap-3"
                      >
                        {[
                          { value: "rounded", label: "Rounded", class: "rounded-full" },
                          { value: "sharp", label: "Sharp", class: "" },
                          { value: "soft", label: "Soft", class: "rounded-lg" },
                          { value: "pill", label: "Pill", class: "rounded-full bg-bronze" },
                        ].map((style) => (
                          <div key={style.value}>
                            <RadioGroupItem value={style.value} id={`emb-btn-${style.value}`} className="peer sr-only" />
                            <Label
                              htmlFor={`emb-btn-${style.value}`}
                              className="flex flex-col items-center p-4 rounded-xl border-2 border-muted peer-data-[state=checked]:border-bronze cursor-pointer"
                            >
                              <div className={cn("w-full h-10 mb-2", style.value === "pill" ? style.class : `${style.class} bg-bronze/20 border-2 border-bronze`)} />
                              <span className="text-sm font-medium">{style.label}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={saving} className="flex-1 bg-bronze hover:bg-bronze-dark h-12">
                    {saving ? "Saving..." : "Save Appearance"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPreviewModal(true)}
                    className="h-12 lg:hidden"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
            )}

            {embeddedTab === "analytics" && renderAnalytics()}
          </div>

          {/* Live Preview - Desktop Only */}
          <div className="hidden xl:block xl:w-[300px] xl:flex-shrink-0 2xl:w-[340px]">
            <div className="sticky top-24">
              <p className="text-sm font-medium text-center text-muted-foreground mb-4">Live Preview</p>
              <LivePreview linkProfile={linkProfile} buttons={buttons} />
              <div className="mt-4 flex gap-2">
                <Button
                  className="flex-1 bg-bronze hover:bg-bronze-dark text-white gap-1.5 text-xs h-9"
                  onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/${linkProfile?.username}`); toast({ title: "Link copied!" }); }}
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Link
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5 text-xs h-9"
                  onClick={() => navigate(`/${linkProfile?.username}`)}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Page
                </Button>
              </div>
            </div>
          </div>
        </div>

        <AddButtonDialog
          open={showAddButton}
          onOpenChange={setShowAddButton}
          onAdd={handleAddButton}
        />
        <EditButtonDialog
          open={showEditButton}
          onOpenChange={setShowEditButton}
          onSave={handleSaveEditButton}
          button={editingButton}
        />
      </div>
    );
  }

  // Standalone view with sidebar
  return (
    <div className="h-full flex flex-col bg-background">
      <LinkTabsMobile userType={profile?.user_type || "creator"} />
      
      <div className="flex flex-1 w-full overflow-hidden">
        <LinkSidebarDesktop userType={profile?.user_type || "creator"} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-background md:ml-[100px] flex">
          {/* Content container */}
          <div className="flex-1 max-w-3xl px-5 sm:px-6 md:px-8 pt-2 pb-10 md:pt-10 md:pb-14">
            <div className="w-full space-y-8 md:space-y-10">

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
                  onClick={() => navigate(`/${linkProfile?.username}`)}
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
                  {renderProfilePicture()}

                  <div>
                    <Label htmlFor="username" className="text-base font-medium mb-3 block">Username</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm whitespace-nowrap">crevia.app/</span>
                      <Input
                        id="username"
                        value={linkProfile?.username || ""}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="yourusername"
                        className={cn("flex-1 h-12 text-base", usernameError && "border-destructive")}
                      />
                    </div>
                    {usernameError && (
                      <p className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {usernameError}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">3-30 chars. Letters, numbers, dots, underscores, hyphens.</p>
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
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-vollkorn text-xl sm:text-3xl md:text-4xl font-bold text-bronze">Links & Buttons</h3>
                <Button onClick={() => setShowAddButton(true)} className="bg-bronze hover:bg-bronze-dark">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Button
                </Button>
              </div>
              
              {buttons.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Link2 className="w-14 h-14 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-poppins">No buttons yet. Add one to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {buttons.map((button, idx) => (
                    <ButtonItem
                      key={button.id}
                      button={button}
                      onEdit={handleEditButton}
                      onDelete={handleDeleteButton}
                      onToggleVisibility={handleToggleVisibility}
                      onMoveUp={(id) => handleMoveButton(id, "up")}
                      onMoveDown={(id) => handleMoveButton(id, "down")}
                      isFirst={idx === 0}
                      isLast={idx === buttons.length - 1}
                    />
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* ===== APPEARANCE TAB ===== */}
          {currentTab === "appearance" && (
            <div className="space-y-6 md:space-y-10">
              {/* Save Buttons */}
              <div className="flex gap-4">
                <Button onClick={handleSave} disabled={saving} className="flex-1 bg-bronze hover:bg-bronze-dark h-14 md:h-16 text-base md:text-lg font-poppins font-semibold">
                  {saving ? "Saving..." : "Save Appearance"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPreviewModal(true)}
                  className="h-14 md:h-16"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Preview
                </Button>
              </div>

              {/* Live Preview inline on mobile */}
              <div className="md:hidden">
                <p className="text-sm font-medium text-center text-muted-foreground mb-4">Live Preview</p>
                <LivePreview linkProfile={linkProfile} buttons={buttons} />
                <div className="mt-4 flex gap-2">
                  <Button
                    className="flex-1 bg-bronze hover:bg-bronze-dark text-white gap-1.5 text-sm h-11"
                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/${linkProfile?.username}`); toast({ title: "Link copied!" }); }}
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-1.5 text-sm h-11"
                    onClick={() => navigate(`/${linkProfile?.username}`)}
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View Page
                  </Button>
                </div>
              </div>

              {/* Typography Section */}
              <Card className="p-4 sm:p-6 md:p-9 border-border/50">
                <div className="flex items-center gap-3 mb-6 md:mb-10">
                  <Type className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-bronze flex-shrink-0" />
                  <h3 className="font-vollkorn text-xl sm:text-2xl md:text-4xl font-bold">Typography</h3>
                </div>
                
                <div className="space-y-6 md:space-y-10">
                  <div>
                    <Label htmlFor="fontFamily" className="text-sm sm:text-base md:text-lg font-medium mb-2 md:mb-4 block">Font Family</Label>
                    <Select
                      value={linkProfile?.background?.font_family || "poppins"}
                      onValueChange={(value) => setLinkProfile({ 
                        ...linkProfile, 
                        background: { ...linkProfile?.background, font_family: value }
                      })}
                    >
                      <SelectTrigger className="mt-2 h-10 sm:h-11 md:h-12 text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="poppins">Poppins (Modern)</SelectItem>
                        <SelectItem value="vollkorn">Vollkorn (Classic)</SelectItem>
                        <SelectItem value="inter">Inter (Clean)</SelectItem>
                        <SelectItem value="playfair">Playfair (Elegant)</SelectItem>
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
                    <ThemeSelector
                      value={linkProfile?.theme || "elite_obsidian"}
                      onChange={(themeId, fontKey) =>
                        setLinkProfile({ ...linkProfile, theme: themeId, background: { ...linkProfile?.background, style: "solid", font_family: fontKey } })
                      }
                      isProUser={isProUser}
                      onUpgrade={() => navigate("/profile/payments-billing")}
                    />
                  </div>

                  {/* Custom Background Image */}
                  <div className="pt-4 border-t border-border/40">
                    <Label className="text-sm sm:text-base font-medium mb-2 block">Custom Background Image</Label>
                    <div className="space-y-3">
                      <Label className="text-xs text-muted-foreground block">Upload your own background image</Label>
                      {linkProfile?.background?.custom_bg_url && (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                          <img src={linkProfile.background.custom_bg_url} alt="Background" className="w-full h-full object-cover" />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 h-7 text-xs"
                            onClick={() => setLinkProfile({
                              ...linkProfile,
                              theme: linkProfile?.theme === "custom_image" ? "dark" : linkProfile?.theme,
                              background: { ...linkProfile?.background, custom_bg_url: null, style: "solid" }
                            })}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="bg-image-upload"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const { data: { session } } = await supabase.auth.getSession();
                            if (!session) return;
                            const ext = file.name.split(".").pop();
                            const path = `${session.user.id}/bg-${Date.now()}.${ext}`;
                            const { error } = await supabase.storage.from("avatars").upload(path, file);
                            if (error) {
                              toast({ title: "Upload failed", description: error.message, variant: "destructive" });
                              return;
                            }
                            const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
                            setLinkProfile({
                              ...linkProfile,
                              theme: "custom_image",
                              background: { ...linkProfile?.background, style: "custom_image", custom_bg_url: urlData.publicUrl }
                            });
                            toast({ title: "Background uploaded!" });
                          }}
                        />
                        <Button
                          variant="outline"
                          className="w-full border-dashed border-2 border-bronze/40 hover:border-bronze"
                          onClick={() => document.getElementById("bg-image-upload")?.click()}
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Choose Image
                        </Button>
                      </div>
                    </div>
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
                          <RadioGroupItem value={style.value} id={`standalone-btn-${style.value}`} className="peer sr-only" />
                          <Label
                            htmlFor={`standalone-btn-${style.value}`}
                            className="flex flex-col items-center justify-center rounded-lg md:rounded-xl border-2 border-muted p-3 sm:p-4 md:p-6 hover:bg-muted peer-data-[state=checked]:border-bronze peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-bronze/20 cursor-pointer transition-all"
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


          {/* ===== ANALYTICS TAB ===== */}
          {currentTab === "analytics" && renderAnalytics()}
        </div>
          </div>

          {/* Live Preview - Desktop Only (Standalone) */}
          <div className="hidden lg:block w-[340px] flex-shrink-0 sticky top-0 h-dvh py-8 pr-6">
            <div className="sticky top-8">
              <p className="text-sm font-medium text-center text-muted-foreground mb-4">Live Preview</p>
              <LivePreview linkProfile={linkProfile} buttons={buttons} />
              <div className="mt-4 flex gap-2">
                <Button
                  className="flex-1 bg-bronze hover:bg-bronze-dark text-white gap-1.5 text-xs h-9"
                  onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/${linkProfile?.username}`); toast({ title: "Link copied!" }); }}
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Link
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-1.5 text-xs h-9"
                  onClick={() => navigate(`/${linkProfile?.username}`)}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Page
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AddButtonDialog
        open={showAddButton}
        onOpenChange={setShowAddButton}
        onAdd={handleAddButton}
      />
      <EditButtonDialog
        open={showEditButton}
        onOpenChange={setShowEditButton}
        onSave={handleSaveEditButton}
        button={editingButton}
      />

      {/* Unsaved live preview modal — mobile only */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[400] flex flex-col bg-background/95 backdrop-blur-md xl:hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-border/50 flex-shrink-0">
            <p className="font-poppins text-sm font-semibold text-foreground">Preview</p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                Unsaved changes
              </span>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                aria-label="Close preview"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Preview content */}
          <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start pt-8 pb-10 px-4">
            <LivePreview linkProfile={linkProfile} buttons={buttons} />
            <p className="text-xs text-muted-foreground text-center mt-5 max-w-[240px] leading-relaxed">
              This is a preview of your unsaved changes. Save to make them live.
            </p>
            <div className="flex gap-3 mt-5 w-full max-w-[280px]">
              <Button
                variant="outline"
                className="flex-1 h-10 text-sm"
                onClick={() => setShowPreviewModal(false)}
              >
                Keep Editing
              </Button>
              <Button
                className="flex-1 h-10 text-sm bg-bronze hover:bg-bronze/90 text-white"
                onClick={() => { handleSave(); setShowPreviewModal(false); }}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreviaLink;
