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
import { Settings as SettingsIcon, Camera, Smartphone, Crown, Download, Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { languages } from "@/data/countries";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuth();
    
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    
    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
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
    
    // TODO: Check premium status from database
    // For now, simulating premium check
    setIsPremium(false);
  };

  const handleInstallApp = async () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to premium to install widgets on your phone",
        variant: "destructive",
      });
      return;
    }

    if (!deferredPrompt) {
      toast({
        title: "Already Installed",
        description: "App is already installed or not available for installation",
      });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      toast({
        title: "App Installed!",
        description: "Crevia has been added to your home screen",
      });
    }
    
    setDeferredPrompt(null);
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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-6 md:mb-8 h-auto">
          <TabsTrigger value="account" className="text-xs sm:text-sm py-2">Account</TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs sm:text-sm py-2">Appearance</TabsTrigger>
          <TabsTrigger value="preferences" className="text-xs sm:text-sm py-2">Preferences</TabsTrigger>
          <TabsTrigger value="widgets" className="text-xs sm:text-sm py-2">Widgets</TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs sm:text-sm py-2">Integrations</TabsTrigger>
          <TabsTrigger value="privacy" className="text-xs sm:text-sm py-2">Privacy</TabsTrigger>
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
              <div>
                <Label htmlFor="bio" className="text-sm md:text-base">Short Bio</Label>
                <textarea
                  id="bio"
                  value={profile?.bio || ""}
                  className="mt-2 w-full min-h-[80px] md:min-h-[100px] p-3 text-sm md:text-base rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                  placeholder="Tell us a little about yourself..."
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Max 160 characters
                </p>
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
            <div className="space-y-6">
              <div>
                <Label className="text-sm md:text-base mb-2 block">Theme</Label>
                <ThemeToggle />
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Languages className="w-5 h-5 text-bronze" />
                  <Label className="text-sm md:text-base">Language</Label>
                </div>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-full md:w-80 h-11">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language.code} value={language.code}>
                        {language.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs md:text-sm text-muted-foreground mt-2">
                  Change the language of the interface
                </p>
              </div>
            </div>
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

        <TabsContent value="widgets">
          <Card className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="font-vollkorn text-xl md:text-2xl font-bold">Mobile Widgets</h2>
              {!isPremium && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-bronze/10 text-bronze rounded-full border border-bronze/20">
                  <Crown className="w-4 h-4" />
                  <span className="text-xs font-semibold">Premium</span>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              {/* Feature Hero */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-bronze/20 via-bronze/10 to-transparent border border-bronze/30 p-6">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-bronze rounded-xl">
                      <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-vollkorn text-lg font-bold">Install Crevia on Your Phone</h3>
                      <p className="text-sm text-muted-foreground">Quick access with home screen widgets</p>
                    </div>
                  </div>
                  
                  {isInstalled ? (
                    <div className="flex items-center gap-2 text-green-500 bg-green-500/10 rounded-lg px-4 py-3">
                      <Download className="w-5 h-5" />
                      <span className="font-medium">App installed on this device</span>
                    </div>
                  ) : (
                    <Button
                      onClick={handleInstallApp}
                      disabled={!isPremium}
                      className="w-full bg-bronze hover:bg-bronze-dark text-white disabled:opacity-50"
                    >
                      {!isPremium ? (
                        <>
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Install
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Install App
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-bronze/20 rounded-full blur-3xl" />
              </div>

              {/* Widget Features */}
              <div className="space-y-4">
                <h4 className="font-vollkorn font-bold text-lg">Widget Features</h4>
                
                {userType === "creator" ? (
                  <div className="grid gap-3">
                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-bronze rounded-full" />
                        <span className="font-semibold text-sm">Campaign Stats</span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-4">
                        Track active campaigns, earnings, and pending applications at a glance
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-bronze rounded-full" />
                        <span className="font-semibold text-sm">Quick Messages</span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-4">
                        View unread messages and respond directly from your home screen
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-bronze rounded-full" />
                        <span className="font-semibold text-sm">Analytics Dashboard</span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-4">
                        Monitor profile views, engagement rates, and follower growth
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-bronze rounded-full" />
                        <span className="font-semibold text-sm">Campaign Overview</span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-4">
                        Monitor active campaigns, applications, and budget usage in real-time
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-bronze rounded-full" />
                        <span className="font-semibold text-sm">Creator Discovery</span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-4">
                        Quick access to browse and shortlist creators for your campaigns
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-bronze rounded-full" />
                        <span className="font-semibold text-sm">Messages & Alerts</span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-4">
                        Stay on top of creator messages and campaign milestone updates
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {!isPremium && (
                <div className="p-4 bg-muted/50 border border-bronze/20 rounded-lg">
                  <p className="text-sm text-center text-muted-foreground">
                    Upgrade to <span className="text-bronze font-semibold">Premium</span> to unlock mobile widgets and install Crevia on your phone
                  </p>
                </div>
              )}
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
