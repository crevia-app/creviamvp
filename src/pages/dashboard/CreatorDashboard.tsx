import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, DollarSign, Briefcase, MessageSquare, Calendar, Target, Sparkles } from "lucide-react";

const CreatorDashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);

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

    const { data: creatorData } = await supabase
      .from("creator_profiles")
      .select("*")
      .eq("profile_id", session.user.id)
      .single();

    setProfile(profileData);
    setCreatorProfile(creatorData);
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="font-vollkorn text-4xl font-bold mb-2">
          Welcome back, {profile?.display_name || profile?.handle}!
        </h1>
        <p className="text-muted-foreground">Here's your creator overview</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-bronze" />
            <p className="text-sm text-muted-foreground">Total Earnings</p>
          </div>
          <p className="text-3xl font-bold">$0</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-bronze" />
            <p className="text-sm text-muted-foreground">Active Campaigns</p>
          </div>
          <p className="text-3xl font-bold">0</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-bronze" />
            <p className="text-sm text-muted-foreground">Pending Approvals</p>
          </div>
          <p className="text-3xl font-bold">0</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-bronze" />
            <p className="text-sm text-muted-foreground">Messages</p>
          </div>
          <p className="text-3xl font-bold">0</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-bronze" />
            <p className="text-sm text-muted-foreground">Next Payout</p>
          </div>
          <p className="text-3xl font-bold">$0</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-bronze" />
            <p className="text-sm text-muted-foreground">Visibility Score</p>
          </div>
          <p className="text-3xl font-bold">{creatorProfile?.profile_views || 0}</p>
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
            <h3 className="font-semibold mb-2">Top Opportunities</h3>
            <p className="text-sm text-muted-foreground">No active opportunities yet</p>
          </div>
          <div className="p-4 bg-background rounded-lg">
            <h3 className="font-semibold mb-2">Pricing Benchmark</h3>
            <p className="text-sm text-muted-foreground">Complete your profile to see insights</p>
          </div>
          <div className="p-4 bg-background rounded-lg">
            <h3 className="font-semibold mb-2">Suggested Brands</h3>
            <p className="text-sm text-muted-foreground">Add your niches to get matches</p>
          </div>
          <div className="p-4 bg-background rounded-lg">
            <h3 className="font-semibold mb-2">Profile Improvements</h3>
            <p className="text-sm text-muted-foreground">Profile {creatorProfile ? '75' : '25'}% complete</p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="font-vollkorn text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="bg-background">Update Niche</Button>
          <Button variant="outline" className="bg-background">Update Pricing</Button>
          <Button variant="outline" className="bg-background">Edit Portfolio</Button>
          <Button variant="outline" className="bg-background">View Campaigns</Button>
          <Button className="bg-bronze hover:bg-bronze-dark">Copy Crevia Link</Button>
        </div>
      </div>

      {/* Creator Health Panel */}
      <Card className="p-8">
        <h2 className="font-vollkorn text-2xl font-bold mb-6">Creator Health</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-3">Profile Completeness</h3>
            <div className="w-full bg-muted rounded-full h-3 mb-2">
              <div className="bg-bronze h-3 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-sm text-muted-foreground">75% Complete</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Profile Views: {creatorProfile?.profile_views || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              Campaign Clicks: {creatorProfile?.campaign_clicks || 0}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Growth Suggestions</h3>
            <p className="text-sm text-muted-foreground">
              Complete your social links to boost visibility
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CreatorDashboard;
