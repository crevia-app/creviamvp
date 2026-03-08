import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";

// Simple SVG icons for the platforms
const GoogleCalendarIcon = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
    <path d="M19.5 3h-3V1.5c0-.275-.225-.5-.5-.5s-.5.225-.5.5V3h-7V1.5c0-.275-.225-.5-.5-.5s-.5.225-.5.5V3h-3C3.675 3 3 3.675 3 4.5v15c0 .825.675 1.5 1.5 1.5h15c.825 0 1.5-.675 1.5-1.5v-15c0-.825-.675-1.5-1.5-1.5zm0 16.5h-15V8h15v11.5zm0-13h-15V4.5h3V5c0 .275.225.5.5.5s.5-.225.5-.5v-.5h7V5c0 .275.225.5.5.5s.5-.225.5-.5v-.5h3v2z"/>
    <path d="M11 10h2v2h-2zm0 4h2v2h-2zm-4-4h2v2H7zm0 4h2v2H7zm8-4h2v2h-2zm0 4h2v2h-2z"/>
  </svg>
);

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.FC;
  connected: boolean;
  color: string;
}

const Integrations = () => {
  const { t } = useLanguage();
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "google-calendar",
      name: t("integrations.googleCalendar"),
      description: t("integrations.googleCalendarDesc"),
      icon: GoogleCalendarIcon,
      connected: false,
      color: "text-blue-500",
    },
  ]);

  const handleConnect = (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId
          ? { ...integration, connected: !integration.connected }
          : integration
      )
    );
    
    const integration = integrations.find((i) => i.id === integrationId);
    if (integration?.connected) {
      toast.success(`${t("integrations.disconnectedFrom")} ${integration.name}`);
    } else {
      toast.success(`${t("integrations.connectedTo")} ${integration?.name}! ${t("integrations.demoMode")}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-bronze/10 to-transparent py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-vollkorn text-3xl md:text-4xl font-bold text-foreground mb-4">{t("integrations.title")}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("integrations.subtitle")}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <Card key={integration.id} className="bg-card border-border/50 hover:border-bronze/50 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-white/5 ${integration.color}`}><Icon /></div>
                    {integration.connected && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">{t("common.connected")}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-foreground font-vollkorn text-xl mt-4">{integration.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">{integration.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleConnect(integration.id)}
                    variant={integration.connected ? "outline" : "default"}
                    className={integration.connected ? "w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300" : "w-full bg-bronze hover:bg-bronze/90 text-white"}
                  >
                    {integration.connected ? t("common.disconnect") : t("common.connect")}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <h2 className="font-vollkorn text-xl font-semibold text-foreground mb-2">{t("integrations.moreComingSoon")}</h2>
          <p className="text-muted-foreground">{t("integrations.moreComingSoonDesc")}</p>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
