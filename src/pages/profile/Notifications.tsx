import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const Notifications = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    campaigns: true, messages: true, payments: true, kira: true, verification: true, muteAll: false, creatorMode: false,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/auth");
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-8 h-8 text-bronze" />
          <h1 className="font-vollkorn text-4xl font-bold">{t("notifications.title")}</h1>
        </div>
        <p className="text-muted-foreground mb-8">{t("notifications.subtitle")}</p>

        <Card className="p-8 mb-6">
          <h2 className="font-vollkorn text-2xl font-bold mb-6">{t("notifications.preferences")}</h2>
          <div className="space-y-6">
            {[
              { id: "campaigns", label: t("notifications.campaignUpdates"), desc: t("notifications.campaignUpdatesDesc") },
              { id: "messages", label: t("notifications.messages"), desc: t("notifications.messagesDesc") },
              { id: "payments", label: t("notifications.paymentUpdates"), desc: t("notifications.paymentUpdatesDesc") },
              { id: "kira", label: t("notifications.kiraRecommendations"), desc: t("notifications.kiraRecommendationsDesc") },
              { id: "verification", label: t("notifications.verificationAlerts"), desc: t("notifications.verificationAlertsDesc") },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <Label htmlFor={item.id}>{item.label}</Label>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  id={item.id}
                  checked={settings[item.id as keyof typeof settings] as boolean}
                  onCheckedChange={(checked) => setSettings({ ...settings, [item.id]: checked })}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="font-vollkorn text-2xl font-bold mb-6">{t("notifications.specialSettings")}</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="muteAll">{t("notifications.muteAll")}</Label>
                <p className="text-sm text-muted-foreground">{t("notifications.muteAllDesc")}</p>
              </div>
              <Switch id="muteAll" checked={settings.muteAll} onCheckedChange={(checked) => setSettings({ ...settings, muteAll: checked })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="creatorMode">{t("notifications.creatorMode")}</Label>
                <p className="text-sm text-muted-foreground">{t("notifications.creatorModeDesc")}</p>
              </div>
              <Switch id="creatorMode" checked={settings.creatorMode} onCheckedChange={(checked) => setSettings({ ...settings, creatorMode: checked })} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
