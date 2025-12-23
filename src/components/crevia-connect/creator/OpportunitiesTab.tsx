import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Heart, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CampaignDetailDialog from "../shared/CampaignDetailDialog";

const OpportunitiesTab = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [matchScores, setMatchScores] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*, brand_profiles(*)")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
      
      // Calculate AI match scores
      if (data) {
        calculateMatchScores(data);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchScores = async (campaignsList: any[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: creatorProfile } = await supabase
      .from("creator_profiles")
      .select("*")
      .eq("profile_id", user.id)
      .single();

    if (!creatorProfile) return;

    const scores: Record<string, number> = {};
    
    for (const campaign of campaignsList.slice(0, 5)) {
      try {
        const { data } = await supabase.functions.invoke("ai-match-score", {
          body: { campaign, creator: creatorProfile }
        });
        
        if (data?.score) {
          scores[campaign.id] = data.score;
        }
      } catch (err) {
        console.error("Error calculating match score:", err);
      }
    }
    
    setMatchScores(scores);
  };

  const addToWishlist = async (campaignId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("wishlist")
        .insert({ campaign_id: campaignId, creator_id: user.id });

      if (error) throw error;

      toast({
        title: "Added to wishlist! 💖",
        description: "You can find it in your saved campaigns",
      });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({
        title: "Oops! 😅",
        description: "Failed to add to wishlist. Try again!",
        variant: "destructive",
      });
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === "all" || campaign.industry === selectedIndustry;
    const matchesPlatform = selectedPlatform === "all" || campaign.platforms?.includes(selectedPlatform);
    
    return matchesSearch && matchesIndustry && matchesPlatform;
  });

  if (loading) {
    return <div className="text-center py-12">Finding amazing opportunities... ✨</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-4">
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              <SelectItem value="Fashion">Fashion</SelectItem>
              <SelectItem value="Tech">Tech</SelectItem>
              <SelectItem value="Beauty">Beauty</SelectItem>
              <SelectItem value="Fitness">Fitness</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="YouTube">YouTube</SelectItem>
              <SelectItem value="TikTok">TikTok</SelectItem>
              <SelectItem value="Twitter">Twitter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCampaigns.map((campaign, index) => (
          <Card key={campaign.id} className="hover-lift hover-glow cursor-pointer group animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => setSelectedCampaign(campaign)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg group-hover:text-bronze transition-colors duration-300">{campaign.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToWishlist(campaign.id);
                  }}
                  className="transition-all duration-300 hover:scale-110 hover:text-bronze"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
              {matchScores[campaign.id] && (
                <div className="flex items-center gap-2 mt-2 animate-fade-in">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <Badge variant="secondary" className="transition-all duration-300 group-hover:scale-105">
                    {matchScores[campaign.id]}% Match
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {campaign.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {campaign.platforms?.slice(0, 3).map((platform: string) => (
                  <Badge key={platform} variant="outline" className="transition-all duration-300 hover:scale-105 hover:border-bronze">{platform}</Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium group-hover:text-bronze transition-colors duration-300">${campaign.budget}</span>
                <Badge className="transition-all duration-300 group-hover:scale-105">{campaign.applications_count || 0} applicants</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCampaign && (
        <CampaignDetailDialog
          campaign={selectedCampaign}
          open={!!selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </div>
  );
};

export default OpportunitiesTab;