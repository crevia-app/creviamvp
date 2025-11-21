import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreatorDiscoveryTab = () => {
  const { toast } = useToast();
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("all");

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const { data, error } = await supabase
        .from("creator_profiles")
        .select("*, profiles(*)")
        .order("follower_count", { ascending: false });

      if (error) throw error;
      setCreators(data || []);
    } catch (error) {
      console.error("Error fetching creators:", error);
      toast({
        title: "Error",
        description: "Failed to load creators",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (creatorId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("brand_favorites")
        .insert({ brand_id: user.id, creator_id: creatorId });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Added to favorites",
      });
    } catch (error) {
      console.error("Error adding favorite:", error);
      toast({
        title: "Error",
        description: "Failed to add favorite",
        variant: "destructive",
      });
    }
  };

  const filteredCreators = creators.filter((creator) => {
    const matchesSearch = creator.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNiche = selectedNiche === "all" || creator.creator_types?.includes(selectedNiche);
    return matchesSearch && matchesNiche;
  });

  if (loading) {
    return <div className="text-center py-12">Loading creators...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search creators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedNiche} onValueChange={setSelectedNiche}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Niche" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Niches</SelectItem>
            <SelectItem value="Fashion">Fashion</SelectItem>
            <SelectItem value="Tech">Tech</SelectItem>
            <SelectItem value="Beauty">Beauty</SelectItem>
            <SelectItem value="Fitness">Fitness</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCreators.map((creator) => (
          <Card key={creator.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{creator.profiles?.display_name}</CardTitle>
                  {creator.profiles?.is_verified && (
                    <Badge variant="secondary" className="mt-2">
                      <Star className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addToFavorites(creator.profile_id)}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {creator.profiles?.bio || "No bio available"}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {creator.creator_types?.slice(0, 3).map((type: string) => (
                  <Badge key={type} variant="outline">{type}</Badge>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Followers</p>
                  <p className="font-medium">{creator.follower_count?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Engagement</p>
                  <p className="font-medium">{creator.engagement_rate || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CreatorDiscoveryTab;