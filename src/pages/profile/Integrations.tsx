import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Simple SVG icons for the platforms
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

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
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sync your schedule and manage campaign deadlines",
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
      toast.success(`Disconnected from ${integration.name}`);
    } else {
      toast.success(`Connected to ${integration?.name}! (Demo mode)`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-bronze/10 to-transparent py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-vollkorn text-3xl md:text-4xl font-bold text-foreground mb-4">
            Integrations
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Connect your favorite platforms to streamline your workflow and maximize your reach.
          </p>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <Card 
                key={integration.id} 
                className="bg-card border-border/50 hover:border-bronze/50 transition-all duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-white/5 ${integration.color}`}>
                      <Icon />
                    </div>
                    {integration.connected && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                        Connected
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-foreground font-vollkorn text-xl mt-4">
                    {integration.name}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {integration.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleConnect(integration.id)}
                    variant={integration.connected ? "outline" : "default"}
                    className={
                      integration.connected
                        ? "w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        : "w-full bg-bronze hover:bg-bronze/90 text-white"
                    }
                  >
                    {integration.connected ? "Disconnect" : "Connect"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12 text-center">
          <h2 className="font-vollkorn text-xl font-semibold text-foreground mb-2">
            More integrations coming soon
          </h2>
          <p className="text-muted-foreground">
            YouTube, Twitter/X, Spotify, and more platforms will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
