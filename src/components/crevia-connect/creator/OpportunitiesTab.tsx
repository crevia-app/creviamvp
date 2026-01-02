import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Heart, Sparkles, Zap, TrendingUp } from "lucide-react";
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
  const [bestMatches, setBestMatches] = useState<any[]>([]);

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
    const scoredCampaigns: { campaign: any; score: number }[] = [];
    
    for (const campaign of campaignsList.slice(0, 10)) {
      try {
        const { data } = await supabase.functions.invoke("ai-match-score", {
          body: { campaign, creator: creatorProfile }
        });
        
        if (data?.score) {
          scores[campaign.id] = data.score;
          scoredCampaigns.push({ campaign, score: data.score });
        }
      } catch (err) {
        console.error("Error calculating match score:", err);
      }
    }
    
    setMatchScores(scores);
    
    // Set top 3 best matches sorted by score
    const topMatches = scoredCampaigns
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => ({ ...item.campaign, matchScore: item.score }));
    setBestMatches(topMatches);
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Opportunities</h2>
        <p className="text-muted-foreground">Discover campaigns and gigs tailored to your creative skills</p>
      </div>

      {/* Kira's Best Matches Section */}
      {bestMatches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-primary/20 to-bronze/20">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Kira's Best Matches
                <Badge variant="secondary" className="text-xs">AI Powered</Badge>
              </h3>
              <p className="text-sm text-muted-foreground">Handpicked opportunities based on your profile & skills</p>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            {bestMatches.map((campaign, index) => (
              <Card 
                key={campaign.id} 
                className="relative overflow-hidden cursor-pointer group hover-lift border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-bronze/5"
                onClick={() => setSelectedCampaign(campaign)}
              >
                {/* Best Match Badge */}
                <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-bronze text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {campaign.matchScore}% Match
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base group-hover:text-bronze transition-colors pr-16">
                      {campaign.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {campaign.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {campaign.platforms?.slice(0, 2).map((platform: string) => (
                      <Badge key={platform} variant="outline" className="text-xs">{platform}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-bronze">${campaign.budget}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToWishlist(campaign.id);
                      }}
                      className="h-8 w-8 p-0 hover:text-bronze"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      {bestMatches.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-muted-foreground">Browse All Opportunities</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      )}

      {/* Search and Filters */}
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

      {/* All Campaigns Grid */}
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

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No opportunities found matching your criteria 🔍</p>
        </div>
      )}

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
