import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import ConnectHeader from "./ConnectHeader";
import OpportunitiesTab from "./creator/OpportunitiesTab";
import MyCampaignsTab from "./creator/MyCampaignsTab";
import AnalyticsTab from "./creator/AnalyticsTab";
import KiraSuggestionsTab from "./creator/KiraSuggestionsTab";
import CreviaChat from "./shared/CreviaChat";

const CreatorConnect = () => {
  return (
    <div className="min-h-screen">
      <ConnectHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium">
              Powered by <span className="text-primary font-bold">Kira AI</span> — your smart collaboration assistant
            </p>
          </div>
        </div>

        <Tabs defaultValue="opportunities" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="kira">
              <div className="flex items-center gap-2">
                Kira Suggestions
                <Badge variant="secondary" className="ml-1">AI</Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger value="chat">Crevia Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities">
            <OpportunitiesTab />
          </TabsContent>

          <TabsContent value="campaigns">
            <MyCampaignsTab />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="kira">
            <KiraSuggestionsTab />
          </TabsContent>

          <TabsContent value="chat">
            <CreviaChat />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreatorConnect;