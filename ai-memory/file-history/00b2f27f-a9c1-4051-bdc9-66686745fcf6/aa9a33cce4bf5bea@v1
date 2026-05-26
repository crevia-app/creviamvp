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
import { Settings as SettingsIcon, Camera, Languages, Shield, TriangleAlert, Trash2 } from "lucide-react";
import SecurityTab from "@/components/settings/SecurityTab";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { languages } from "@/data/countries";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

const Settings = () => {
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable form fields
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");

  // Privacy settings
  const [profilePublic, setProfilePublic] = useState(true);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    setProfile(profileData);
    setUserType(profileData?.user_type || null);
    setDisplayName(profileData?.display_name || "");
    setEmail(profileData?.email || "");
    setHandle(profileData?.handle || "");
    setBio(profileData?.bio || "");
    setProfilePublic(profileData?.profile_public !== false);
    setDoNotDisturb(!!profileData?.do_not_disturb);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid file type", description: "Please upload an image file", variant: "destructive" });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload an image smaller than 5MB", variant: "destructive" });
        return;
      }

      setUploading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      // Fixed path per user so upsert overwrites cleanly and RLS folder check passes
      const filePath = `${session.user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Cache-buster so the browser doesn't serve the stale image after an overwrite
      const bustedUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: bustedUrl })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: bustedUrl });
      toast({ title: "Profile picture updated", description: "Your profile picture has been updated successfully" });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({ title: "Upload failed", description: "Failed to upload profile picture. Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName || null,
          handle: handle,
          bio: bio || null,
        })
        .eq('id', session.user.id);

      if (error) throw error;

      setProfile({ ...profile, display_name: displayName, handle, bio });
      toast({ title: "Settings saved", description: "Your account settings have been updated." });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({ title: "Save failed", description: error.message || "Failed to save settings.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handlePrivacyToggle = async (field: "profile_public" | "do_not_disturb", value: boolean) => {
    if (field === "profile_public") setProfilePublic(value);
    else setDoNotDisturb(value);
    setSavingPrivacy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { error } = await supabase.from("profiles").update({ [field]: value }).eq("id", session.user.id);
      if (error) throw error;
      toast({
        title: field === "profile_public"
          ? (value ? "Profile is now public" : "Profile is now private")
          : (value ? "Do Not Disturb on" : "Do Not Disturb off"),
        description: field === "profile_public"
          ? (value ? "Anyone can view your public profile." : "Your profile is hidden from public view.")
          : (value ? "Notifications are paused." : "You'll receive notifications again."),
      });
    } catch (err: any) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
      if (field === "profile_public") setProfilePublic(!value);
      else setDoNotDisturb(!value);
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.rpc("delete_user");
      if (error) throw error;
      await supabase.auth.signOut();
      toast({ title: t("settings.deleteAccountSuccess"), description: t("settings.deleteAccountSuccessDesc") });
      navigate("/");
    } catch (err: any) {
      toast({ title: t("settings.deleteAccountError"), description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setDeleteInput("");
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
          <TabsTrigger value="security" className="text-xs sm:text-sm py-2 gap-1">
            <Shield className="w-3.5 h-3.5 hidden sm:inline" />
            Security
          </TabsTrigger>
          <TabsTrigger value="privacy" className="text-xs sm:text-sm py-2">{t("settings.privacy")}</TabsTrigger>
        </TabsList>

        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>

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
                      {displayName?.charAt(0) || email?.charAt(0) || "U"}
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
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-2 h-10 md:h-11"
                  placeholder={t("settings.displayNamePlaceholder")}
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm md:text-base">{t("settings.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="mt-2 h-10 md:h-11 opacity-60 cursor-not-allowed"
                  placeholder={t("settings.emailPlaceholder")}
                />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here.</p>
              </div>
              <div>
                <Label htmlFor="username" className="text-sm md:text-base">{t("settings.username")}</Label>
                <Input
                  id="username"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="mt-2 h-10 md:h-11"
                  placeholder={t("settings.usernamePlaceholder")}
                />
              </div>
              <div>
                <Label htmlFor="bio" className="text-sm md:text-base">{t("settings.bio")}</Label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-2 w-full min-h-[80px] md:min-h-[100px] p-3 text-sm md:text-base rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                  placeholder={t("settings.bioPlaceholder")}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {bio.length}/160 — {t("settings.bioMax")}
                </p>
              </div>
              {/* Language */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Languages className="w-5 h-5 text-bronze" />
                  <Label className="text-sm md:text-base">{t("settings.language")}</Label>
                </div>
                <Select value={language} onValueChange={(val) => {
                  setLanguage(val);
                  toast({ title: t("toast.languageChanged"), description: t("toast.languageChangedDesc") });
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
                <p className="text-xs md:text-sm text-muted-foreground mt-2">{t("settings.languageDesc")}</p>
              </div>

              <div className="pt-2 border-t">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full sm:w-auto bg-bronze hover:bg-bronze-dark text-sm md:text-base px-6 py-5 md:py-6"
                >
                  {saving ? "Saving..." : t("common.save")}
                </Button>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-destructive/20">
                <div className="flex items-center gap-2 mb-3">
                  <TriangleAlert className="w-5 h-5 text-destructive" />
                  <h3 className="text-sm md:text-base font-semibold text-destructive">{t("settings.dangerZone")}</h3>
                </div>
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{t("settings.deleteAccount")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">{t("settings.dangerZoneDesc")}</p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setDeleteOpen(true)}
                    className="flex-shrink-0 gap-2 h-11"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("settings.deleteAccount")}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Delete Account Dialog */}
          <Dialog open={deleteOpen} onOpenChange={(v) => { setDeleteOpen(v); if (!v) setDeleteInput(""); }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive font-vollkorn text-xl">
                  <TriangleAlert className="h-5 w-5" />
                  {t("settings.deleteAccountConfirmTitle")}
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed pt-1">
                  {t("settings.deleteAccountConfirmDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label className="text-sm font-medium">{t("settings.deleteAccountConfirmLabel")}</Label>
                  <Input
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    placeholder={t("settings.deleteAccountConfirmPlaceholder")}
                    className="mt-1.5 h-11 text-base font-mono border-destructive/40 focus-visible:ring-destructive/30"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setDeleteOpen(false)} className="flex-1 h-11">
                    {t("common.cancel")}
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={deleteInput !== "DELETE" || deleting}
                    onClick={handleDeleteAccount}
                    className="flex-1 h-11 gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleting ? "Deleting…" : t("settings.deleteAccountConfirm")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                <Switch
                  checked={profilePublic}
                  disabled={savingPrivacy}
                  onCheckedChange={(v) => handlePrivacyToggle("profile_public", v)}
                  className="flex-shrink-0"
                />
              </div>
              <div className="flex items-start md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Label className="text-sm md:text-base">{t("settings.doNotDisturb")}</Label>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{t("settings.doNotDisturbDesc")}</p>
                </div>
                <Switch
                  checked={doNotDisturb}
                  disabled={savingPrivacy}
                  onCheckedChange={(v) => handlePrivacyToggle("do_not_disturb", v)}
                  className="flex-shrink-0"
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
