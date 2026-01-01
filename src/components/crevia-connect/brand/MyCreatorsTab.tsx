import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const MyCreatorsTab = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("brand_favorites")
        .select("*, creator_profiles(*, profiles(*))")
        .eq("brand_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading creatives...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">My Creatives</h2>
        <p className="text-muted-foreground">
          Creators and freelancers you've worked with or favorited
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {favorites.map((fav) => (
          <Card key={fav.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {fav.creator_profiles?.profiles?.display_name}
                  </CardTitle>
                  {fav.creator_profiles?.profiles?.is_verified && (
                    <Badge variant="secondary" className="mt-2">
                      <Star className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {fav.creator_profiles?.profiles?.bio || "No bio available"}
              </p>
              {fav.notes && (
                <div className="mb-4 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-1">Notes:</p>
                  <p className="text-sm text-muted-foreground">{fav.notes}</p>
                </div>
              )}
              <Button className="w-full" variant="outline">
                View Profile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {favorites.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No favorited creatives yet. Start discovering talent from the Talent Discovery tab!
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyCreatorsTab;