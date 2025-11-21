import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, DollarSign, Briefcase, Users, Target, Sparkles } from "lucide-react";

const BrandDashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [brandProfile, setBrandProfile] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    const { data: brandData } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("profile_id", session.user.id)
      .single();

    setProfile(profileData);
    setBrandProfile(brandData);
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="font-vollkorn text-4xl font-bold mb-2">
          Welcome back, {profile?.display_name || profile?.handle}!
        </h1>
        <p className="text-muted-foreground">Here's your brand overview</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-bronze" />
            <p className="text-sm text-muted-foreground">Active Campaigns</p>
          </div>
          <p className="text-3xl font-bold">0</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-bronze" />
            <p className="text-sm text-muted-foreground">Total Spend</p>
          </div>
          <p className="text-3xl font-bold">$0</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-bronze" />
            <p className="text-sm text-muted-foreground">Creator Responses</p>
          </div>
          <p className="text-3xl font-bold">0</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-bronze" />
            <p className="text-sm text-muted-foreground">Performance Score</p>
          </div>
          <p className="text-3xl font-bold">-</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-bronze" />
            <p className="text-sm text-muted-foreground">Pending Approvals</p>
          </div>
          <p className="text-3xl font-bold">0</p>
        </Card>
      </div>

      {/* Kira Insights */}
      <Card className="p-8 mb-8 bg-gradient-to-br from-bronze/5 to-bronze/10">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-bronze" />
          <h2 className="font-vollkorn text-2xl font-bold">Kira Insights</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-background rounded-lg">
            <h3 className="font-semibold mb-2">Recommended Creators</h3>
            <p className="text-sm text-muted-foreground">Create a campaign to get matches</p>
          </div>
          <div className="p-4 bg-background rounded-lg">
            <h3 className="font-semibold mb-2">Budget Suggestions</h3>
            <p className="text-sm text-muted-foreground">Complete your profile for insights</p>
          </div>
          <div className="p-4 bg-background rounded-lg">
            <h3 className="font-semibold mb-2">Performance Predictions</h3>
            <p className="text-sm text-muted-foreground">Launch your first campaign</p>
          </div>
          <div className="p-4 bg-background rounded-lg">
            <h3 className="font-semibold mb-2">Brief Improvement Tips</h3>
            <p className="text-sm text-muted-foreground">No active campaigns yet</p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="font-vollkorn text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button className="bg-bronze hover:bg-bronze-dark">Create Campaign</Button>
          <Button variant="outline" className="bg-background">Search Creators</Button>
          <Button variant="outline" className="bg-background">Review Proposals</Button>
          <Button variant="outline" className="bg-background">Share Brand Link</Button>
        </div>
      </div>

      {/* Insights Panel */}
      <Card className="p-8">
        <h2 className="font-vollkorn text-2xl font-bold mb-6">Campaign Insights</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-3">Weekly Performance</h3>
            <p className="text-sm text-muted-foreground">No data yet - launch a campaign to see insights</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Creator Matches</h3>
            <p className="text-sm text-muted-foreground">Complete your profile to get AI-powered matches</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Campaign Timeline</h3>
            <p className="text-sm text-muted-foreground">No active campaigns</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BrandDashboard;
