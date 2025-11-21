import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Settings as SettingsIcon, User, Lock, Link2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [userType, setUserType] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 pt-32 pb-20 max-w-5xl">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-8 h-8 text-bronze" />
          <h1 className="font-vollkorn text-4xl font-bold">Settings</h1>
        </div>
        <p className="text-muted-foreground mb-8">Manage your account preferences</p>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card className="p-8">
              <h2 className="font-vollkorn text-2xl font-bold mb-6">Account Information</h2>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={profile?.display_name || ""}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ""}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profile?.handle || ""}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Button className="bg-bronze hover:bg-bronze-dark">Save Changes</Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="p-8">
              <h2 className="font-vollkorn text-2xl font-bold mb-6">
                {userType === "creator" ? "Creator" : "Brand"} Preferences
              </h2>
              <div className="space-y-6">
                <div>
                  <Label>Collaboration Types</Label>
                  <p className="text-sm text-muted-foreground mt-2">
                    Configure your preferred collaboration types
                  </p>
                </div>
                <div>
                  <Label>Budget Expectations</Label>
                  <p className="text-sm text-muted-foreground mt-2">
                    Set your budget range preferences
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card className="p-8">
              <h2 className="font-vollkorn text-2xl font-bold mb-6">Integrations</h2>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Instagram</p>
                    <p className="text-sm text-muted-foreground">Not connected</p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold">TikTok</p>
                    <p className="text-sm text-muted-foreground">Not connected</p>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card className="p-8">
              <h2 className="font-vollkorn text-2xl font-bold mb-6">Privacy Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">Make your profile public</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Hide Earnings</Label>
                    <p className="text-sm text-muted-foreground">Keep earnings private</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Do Not Disturb</Label>
                    <p className="text-sm text-muted-foreground">Pause all notifications</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
