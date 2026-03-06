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
import { Settings as SettingsIcon, Camera, Languages } from "lucide-react";
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
import { useLanguage } from "@/i18n/LanguageContext";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
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
        <h1 className="font-vollkorn text-2xl md:text-4xl font-bold">{t("settings.title")}</h1>
      </div>
      <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">{t("settings.subtitle")}</p>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 md:mb-8 h-auto">
          <TabsTrigger value="account" className="text-xs sm:text-sm py-2">{t("settings.account")}</TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs sm:text-sm py-2">{t("settings.appearance")}</TabsTrigger>
          <TabsTrigger value="privacy" className="text-xs sm:text-sm py-2">{t("settings.privacy")}</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card className="p-4 md:p-8">
            <h2 className="font-vollkorn text-xl md:text-2xl font-bold mb-4 md:mb-6">{t("settings.accountInfo")}</h2>
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
                    {uploading ? t("settings.uploading") : t("settings.profilePicture")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("settings.maxSize")}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="displayName" className="text-sm md:text-base">{t("settings.displayName")}</Label>
                <Input
                  id="displayName"
                  value={profile?.display_name || ""}
                  className="mt-2 h-10 md:h-11"
                  placeholder={t("settings.displayNamePlaceholder")}
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm md:text-base">{t("settings.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ""}
                  className="mt-2 h-10 md:h-11"
                  placeholder={t("settings.emailPlaceholder")}
                />
              </div>
              <div>
                <Label htmlFor="username" className="text-sm md:text-base">{t("settings.username")}</Label>
                <Input
                  id="username"
                  value={profile?.handle || ""}
                  className="mt-2 h-10 md:h-11"
                  placeholder={t("settings.usernamePlaceholder")}
                />
              </div>
              <div>
                <Label htmlFor="bio" className="text-sm md:text-base">{t("settings.bio")}</Label>
                <textarea
                  id="bio"
                  value={profile?.bio || ""}
                  className="mt-2 w-full min-h-[80px] md:min-h-[100px] p-3 text-sm md:text-base rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                  placeholder={t("settings.bioPlaceholder")}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("settings.bioMax")}
                </p>
              </div>
              <div className="pt-2">
                <Button className="w-full sm:w-auto bg-bronze hover:bg-bronze-dark text-sm md:text-base px-6 py-5 md:py-6">
                  {t("common.save")}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="p-4 md:p-8">
            <h2 className="font-vollkorn text-xl md:text-2xl font-bold mb-4 md:mb-6">{t("settings.appearance")}</h2>
            <div className="space-y-6">
              <div>
                <Label className="text-sm md:text-base mb-2 block">{t("settings.theme")}</Label>
                <ThemeToggle />
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Languages className="w-5 h-5 text-bronze" />
                  <Label className="text-sm md:text-base">{t("settings.language")}</Label>
                </div>
                <Select value={language} onValueChange={(val) => {
                  setLanguage(val);
                  toast({
                    title: t("toast.languageChanged"),
                    description: t("toast.languageChangedDesc"),
                  });
                }}>
                  <SelectTrigger className="w-full md:w-80 h-11">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="mr-2">{lang.flag}</span> {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs md:text-sm text-muted-foreground mt-2">
                  {t("settings.languageDesc")}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>


        <TabsContent value="privacy">
          <Card className="p-4 md:p-8">
            <h2 className="font-vollkorn text-xl md:text-2xl font-bold mb-4 md:mb-6">{t("settings.privacySettings")}</h2>
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-start md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Label className="text-sm md:text-base">{t("settings.profileVisibility")}</Label>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{t("settings.profileVisibilityDesc")}</p>
                </div>
                <Switch defaultChecked className="flex-shrink-0" />
              </div>
              <div className="flex items-start md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Label className="text-sm md:text-base">{t("settings.hideEarnings")}</Label>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{t("settings.hideEarningsDesc")}</p>
                </div>
                <Switch className="flex-shrink-0" />
              </div>
              <div className="flex items-start md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Label className="text-sm md:text-base">{t("settings.doNotDisturb")}</Label>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{t("settings.doNotDisturbDesc")}</p>
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
