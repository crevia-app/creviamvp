import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Bell, MessageSquare, FileText, Sparkles, Shield, BellOff } from "lucide-react";

const notificationGroups = [
  {
    title: "Crevia Studio",
    items: [
      { id: "chat", icon: MessageSquare, label: "Chat Messages", desc: "New messages and replies in Crevia Chat" },
      { id: "invoices", icon: FileText, label: "Invoices & Contracts", desc: "Status updates on invoices and contract signatures" },
    ],
  },
  {
    title: "Kira AI",
    items: [
      { id: "kira", icon: Sparkles, label: "Kira Suggestions", desc: "AI-powered tips and recommendations" },
    ],
  },
  {
    title: "Account",
    items: [
      { id: "billing", icon: Bell, label: "Billing & Subscription", desc: "Payment confirmations and plan changes" },
      { id: "security", icon: Shield, label: "Security Alerts", desc: "Login activity and password changes" },
    ],
  },
];

const Notifications = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Record<string, boolean>>({
    chat: true, invoices: true, kira: true, billing: true, security: true, muteAll: false,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/auth");
    };
    checkAuth();
  }, []);

  const toggle = (id: string) => setSettings((s) => ({ ...s, [id]: !s[id] }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-7 h-7 text-bronze" />
          <h1 className="font-vollkorn text-4xl font-bold">Notifications</h1>
        </div>
        <p className="text-muted-foreground mb-10">Choose what you want to be notified about</p>

        {notificationGroups.map((group) => (
          <Card key={group.title} className="p-6 mb-5">
            <h2 className="font-vollkorn text-lg font-semibold mb-4 text-muted-foreground uppercase tracking-wide text-xs">{group.title}</h2>
            <div className="space-y-5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-bronze shrink-0" />
                      <div>
                        <Label htmlFor={item.id} className="font-medium">{item.label}</Label>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <Switch
                      id={item.id}
                      checked={!settings.muteAll && settings[item.id]}
                      disabled={settings.muteAll}
                      onCheckedChange={() => toggle(item.id)}
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        ))}

        <Card className="p-6 border-destructive/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellOff className="w-4 h-4 text-destructive shrink-0" />
              <div>
                <Label htmlFor="muteAll" className="font-medium">Mute All Notifications</Label>
                <p className="text-sm text-muted-foreground">Temporarily pause everything for 24 hours</p>
              </div>
            </div>
            <Switch id="muteAll" checked={settings.muteAll} onCheckedChange={() => toggle("muteAll")} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
