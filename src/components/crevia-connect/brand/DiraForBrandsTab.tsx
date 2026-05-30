import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const KiraForBrandsTab = () => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("brand_profiles")
        .select("*")
        .eq("profile_id", user.id)
        .single();

      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("*")
        .eq("brand_id", user.id)
        .limit(10);

      const { data } = await supabase.functions.invoke("kira-suggestions", {
        body: {
          type: "brand",
          profile,
          campaigns
        }
      });

      if (data?.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast({
        title: "Error",
        description: "Failed to load suggestions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Kira for Brands
          </h2>
          <p className="text-muted-foreground mt-1">
            Your AI marketing strategist
          </p>
        </div>
        <Button onClick={fetchSuggestions} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {suggestions.map((suggestion, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{suggestion.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {suggestion.description}
              </p>
              <Button size="sm" className="w-full">
                {suggestion.action}
              </Button>
            </CardContent>
          </Card>
        ))}

        {suggestions.length === 0 && (
          <Card className="md:col-span-2">
            <CardContent className="pt-6 text-center text-muted-foreground">
              No suggestions available at the moment. Create campaigns to get personalized recommendations from Kira AI.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default KiraForBrandsTab;