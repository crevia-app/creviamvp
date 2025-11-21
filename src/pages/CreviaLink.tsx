import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link2, Plus, Eye, Sparkles } from "lucide-react";
import { AddButtonDialog } from "@/components/crevia-link/AddButtonDialog";
import { ButtonItem } from "@/components/crevia-link/ButtonItem";

const CreviaLink = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [linkProfile, setLinkProfile] = useState<any>(null);
  const [buttons, setButtons] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);

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
    }
    setSaving(false);
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 pt-32 pb-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 text-bronze">
            <Link2 className="w-6 h-6" />
            <span className="text-sm font-poppins font-semibold">CREVIA LINK</span>
          </div>
          <h1 className="font-vollkorn text-5xl md:text-6xl font-bold mb-6">
            Your premium link-in-bio
          </h1>
          <p className="text-lg text-muted-foreground font-poppins max-w-2xl mx-auto mb-8">
            Beautiful, customizable, and powerful. Share everything you create in one elegant page.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
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
          </div>
        </div>

        {/* Editor */}
        <Tabs defaultValue="profile" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
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
          </TabsContent>

          {/* Buttons Tab */}
          <TabsContent value="buttons">
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
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card className="p-8">
              <h3 className="font-vollkorn text-2xl font-bold mb-6">Appearance</h3>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={linkProfile?.theme || "dark"}
                    onValueChange={(value) => setLinkProfile({ ...linkProfile, theme: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light Mode</SelectItem>
                      <SelectItem value="dark">Dark Mode</SelectItem>
                      <SelectItem value="gold">Premium Gold</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="layout">Layout</Label>
                  <Select
                    value={linkProfile?.layout || "centered"}
                    onValueChange={(value) => setLinkProfile({ ...linkProfile, layout: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="centered">Centered</SelectItem>
                      <SelectItem value="left">Left-aligned</SelectItem>
                      <SelectItem value="full">Full-width</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
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
          </TabsContent>
        </Tabs>

        {/* Features Section */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Sparkles className="w-8 h-8 mx-auto mb-4 text-bronze" />
            <h2 className="font-vollkorn text-3xl font-bold mb-4">Premium Features</h2>
            <p className="text-muted-foreground">Everything you need in one beautiful link</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-card border rounded-lg">
              <h3 className="font-semibold mb-2">Unlimited Links</h3>
              <p className="text-sm text-muted-foreground">Add as many buttons and links as you want</p>
            </div>
            <div className="p-6 bg-card border rounded-lg">
              <h3 className="font-semibold mb-2">Custom Themes</h3>
              <p className="text-sm text-muted-foreground">Match your brand with beautiful themes</p>
            </div>
            <div className="p-6 bg-card border rounded-lg">
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-sm text-muted-foreground">Track visits and engagement</p>
            </div>
          </div>
        </div>
      </main>

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
