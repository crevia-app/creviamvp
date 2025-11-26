import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Settings as SettingsIcon, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    setProfile(profileData);
    setUserType(profileData?.user_type || null);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setUploading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-3 md:px-6 py-6 md:py-8 max-w-5xl">
      <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
        <SettingsIcon className="w-6 h-6 md:w-8 md:h-8 text-bronze" />
        <h1 className="font-vollkorn text-2xl md:text-4xl font-bold">Settings</h1>
      </div>
      <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">Manage your account preferences</p>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-6 md:mb-8 h-auto">
          <TabsTrigger value="account" className="text-xs sm:text-sm py-2">Account</TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs sm:text-sm py-2">Appearance</TabsTrigger>
          <TabsTrigger value="preferences" className="text-xs sm:text-sm py-2">Preferences</TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs sm:text-sm py-2 col-span-2 sm:col-span-1">Integrations</TabsTrigger>
          <TabsTrigger value="privacy" className="text-xs sm:text-sm py-2 col-span-2 sm:col-span-1 md:col-span-1">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card className="p-4 md:p-8">
            <h2 className="font-vollkorn text-xl md:text-2xl font-bold mb-4 md:mb-6">Account Information</h2>
            <div className="space-y-4 md:space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center gap-4 pb-4 border-b">
                <div className="relative">
                  <Avatar className="h-24 w-24 md:h-32 md:w-32">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-bronze text-white text-2xl md:text-3xl">
                      {profile?.display_name?.charAt(0) || profile?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleAvatarClick}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 bg-bronze hover:bg-bronze-dark text-white rounded-full p-2 shadow-lg transition-colors disabled:opacity-50"
                    aria-label="Change profile picture"
                  >
                    <Camera className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {uploading ? "Uploading..." : "Click camera icon to change profile picture"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max size: 5MB • JPG, PNG, GIF
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="displayName" className="text-sm md:text-base">Display Name</Label>
                <Input
                  id="displayName"
                  value={profile?.display_name || ""}
                  className="mt-2 h-10 md:h-11"
                  placeholder="Your display name"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm md:text-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ""}
                  className="mt-2 h-10 md:h-11"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <Label htmlFor="username" className="text-sm md:text-base">Username</Label>
                <Input
                  id="username"
                  value={profile?.handle || ""}
                  className="mt-2 h-10 md:h-11"
                  placeholder="@username"
                />
              </div>
              <div className="pt-2">
                <Button className="w-full sm:w-auto bg-bronze hover:bg-bronze-dark text-sm md:text-base px-6 py-5 md:py-6">
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="p-4 md:p-8">
            <h2 className="font-vollkorn text-xl md:text-2xl font-bold mb-4 md:mb-6">Appearance</h2>
            <ThemeToggle />
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="p-4 md:p-8">
            <h2 className="font-vollkorn text-xl md:text-2xl font-bold mb-4 md:mb-6">
              {userType === "creator" ? "Creator" : "Brand"} Preferences
            </h2>
            <div className="space-y-4 md:space-y-6">
              <div>
                <Label className="text-sm md:text-base">Collaboration Types</Label>
                <p className="text-xs md:text-sm text-muted-foreground mt-2">
                  Configure your preferred collaboration types
                </p>
              </div>
              <div>
                <Label className="text-sm md:text-base">Budget Expectations</Label>
                <p className="text-xs md:text-sm text-muted-foreground mt-2">
                  Set your budget range preferences
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card className="p-4 md:p-8">
            <h2 className="font-vollkorn text-xl md:text-2xl font-bold mb-4 md:mb-6">Integrations</h2>
            <div className="space-y-3 md:space-y-4">
              <div className="p-3 md:p-4 border rounded-lg flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm md:text-base truncate">Instagram</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Not connected</p>
                </div>
                <Button variant="outline" size="sm" className="flex-shrink-0 text-xs md:text-sm">Connect</Button>
              </div>
              <div className="p-3 md:p-4 border rounded-lg flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm md:text-base truncate">TikTok</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Not connected</p>
                </div>
                <Button variant="outline" size="sm" className="flex-shrink-0 text-xs md:text-sm">Connect</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card className="p-4 md:p-8">
            <h2 className="font-vollkorn text-xl md:text-2xl font-bold mb-4 md:mb-6">Privacy Settings</h2>
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-start md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Label className="text-sm md:text-base">Profile Visibility</Label>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Make your profile public</p>
                </div>
                <Switch defaultChecked className="flex-shrink-0" />
              </div>
              <div className="flex items-start md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Label className="text-sm md:text-base">Hide Earnings</Label>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Keep earnings private</p>
                </div>
                <Switch className="flex-shrink-0" />
              </div>
              <div className="flex items-start md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Label className="text-sm md:text-base">Do Not Disturb</Label>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Pause all notifications</p>
                </div>
                <Switch className="flex-shrink-0" />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
