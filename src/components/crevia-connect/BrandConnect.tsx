import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import ConnectHeader from "./ConnectHeader";
import CreatorDiscoveryTab from "./brand/CreatorDiscoveryTab";
import CampaignManagerTab from "./brand/CampaignManagerTab";
import MyCreatorsTab from "./brand/MyCreatorsTab";
import KiraForBrandsTab from "./brand/KiraForBrandsTab";
import CreviaChat from "./shared/CreviaChat";

const BrandConnect = () => {
  return (
    <div className="min-h-screen">
      <ConnectHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium">
              Powered by <span className="text-primary font-bold">Kira AI</span> — your marketing strategist
            </p>
          </div>
        </div>

        <Tabs defaultValue="discovery" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="discovery">Creator Discovery</TabsTrigger>
            <TabsTrigger value="campaigns">Campaign Manager</TabsTrigger>
            <TabsTrigger value="creators">My Creators</TabsTrigger>
            <TabsTrigger value="kira">
              <div className="flex items-center gap-2">
                Kira for Brands
                <Badge variant="secondary" className="ml-1">AI</Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger value="chat">Crevia Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="discovery">
            <CreatorDiscoveryTab />
          </TabsContent>

          <TabsContent value="campaigns">
            <CampaignManagerTab />
          </TabsContent>

          <TabsContent value="creators">
            <MyCreatorsTab />
          </TabsContent>

          <TabsContent value="kira">
            <KiraForBrandsTab />
          </TabsContent>

          <TabsContent value="chat">
            <CreviaChat />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BrandConnect;