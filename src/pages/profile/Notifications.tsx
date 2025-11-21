import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";

const Notifications = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    campaigns: true,
    messages: true,
    payments: true,
    kira: true,
    verification: true,
    muteAll: false,
    creatorMode: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 pt-32 pb-20 max-w-4xl">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-8 h-8 text-bronze" />
          <h1 className="font-vollkorn text-4xl font-bold">Notifications</h1>
        </div>
        <p className="text-muted-foreground mb-8">Manage how you receive updates</p>

        <Card className="p-8 mb-6">
          <h2 className="font-vollkorn text-2xl font-bold mb-6">Notification Preferences</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="campaigns">Campaign Updates</Label>
                <p className="text-sm text-muted-foreground">Get notified about campaign changes</p>
              </div>
              <Switch
                id="campaigns"
                checked={settings.campaigns}
                onCheckedChange={(checked) => setSettings({ ...settings, campaigns: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="messages">Messages</Label>
                <p className="text-sm text-muted-foreground">New messages and responses</p>
              </div>
              <Switch
                id="messages"
                checked={settings.messages}
                onCheckedChange={(checked) => setSettings({ ...settings, messages: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="payments">Payment Updates</Label>
                <p className="text-sm text-muted-foreground">Payouts and billing notifications</p>
              </div>
              <Switch
                id="payments"
                checked={settings.payments}
                onCheckedChange={(checked) => setSettings({ ...settings, payments: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="kira">Kira Recommendations</Label>
                <p className="text-sm text-muted-foreground">AI-powered insights and suggestions</p>
              </div>
              <Switch
                id="kira"
                checked={settings.kira}
                onCheckedChange={(checked) => setSettings({ ...settings, kira: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="verification">Verification Alerts</Label>
                <p className="text-sm text-muted-foreground">Updates about verification status</p>
              </div>
              <Switch
                id="verification"
                checked={settings.verification}
                onCheckedChange={(checked) => setSettings({ ...settings, verification: checked })}
              />
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="font-vollkorn text-2xl font-bold mb-6">Special Settings</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="muteAll">Mute All (24 hours)</Label>
                <p className="text-sm text-muted-foreground">Temporarily pause all notifications</p>
              </div>
              <Switch
                id="muteAll"
                checked={settings.muteAll}
                onCheckedChange={(checked) => setSettings({ ...settings, muteAll: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="creatorMode">Creator Mode</Label>
                <p className="text-sm text-muted-foreground">Boost visibility to brands</p>
              </div>
              <Switch
                id="creatorMode"
                checked={settings.creatorMode}
                onCheckedChange={(checked) => setSettings({ ...settings, creatorMode: checked })}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
