import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Eye, Heart, MousePointerClick, Award } from "lucide-react";

const AnalyticsTab = () => {
  const [analytics, setAnalytics] = useState({
    profileViews: 0,
    brandFollows: 0,
    campaignClicks: 0,
    conversionRate: 0,
    visibilityScore: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("creator_profiles")
        .select("profile_views, campaign_clicks")
        .eq("profile_id", user.id)
        .single();

      const { count: favoriteCount } = await supabase
        .from("brand_favorites")
        .select("*", { count: "exact", head: true })
        .eq("creator_id", user.id);

      const { count: applicationCount } = await supabase
        .from("campaign_applications")
        .select("*", { count: "exact", head: true })
        .eq("creator_id", user.id);

      const { count: approvedCount } = await supabase
        .from("campaign_applications")
        .select("*", { count: "exact", head: true })
        .eq("creator_id", user.id)
        .eq("status", "accepted");

      const conversionRate = applicationCount ? (approvedCount! / applicationCount! * 100) : 0;

      setAnalytics({
        profileViews: profile?.profile_views || 0,
        brandFollows: favoriteCount || 0,
        campaignClicks: profile?.campaign_clicks || 0,
        conversionRate: Math.round(conversionRate),
        visibilityScore: Math.min(100, Math.round((profile?.profile_views || 0) / 10))
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.profileViews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total profile views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brand Follows</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.brandFollows}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Brands who favorited you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaign Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.campaignClicks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total campaign interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Applications to approvals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visibility Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.visibilityScore}/100</div>
            <p className="text-xs text-muted-foreground mt-1">
              Your platform visibility
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Why Brands Choose You</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            AI insights coming soon - Dira will analyze your profile and provide personalized insights on what makes you stand out to brands.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;