import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  Target, 
  Eye,
  ArrowRight,
  Sparkles,
  Users,
  BarChart3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const [userType, setUserType] = useState<"creator" | "brand" | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
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

    setProfile(profileData);
    setUserType(profileData?.user_type || null);

    if (profileData?.user_type === "creator") {
      const { data: creatorData } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("profile_id", session.user.id)
        .single();
      setCreatorProfile(creatorData);
    } else {
      const { data: brandData } = await supabase
        .from("brand_profiles")
        .select("*")
        .eq("profile_id", session.user.id)
        .single();
      setBrandProfile(brandData);
    }
  };

  const renderCreatorHome = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="font-vollkorn text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
          Welcome back, {profile?.display_name || "Creator"} 👋
        </h1>
        <p className="text-sm md:text-base text-muted-foreground font-poppins">
          Here's what's happening with your creative journey today ✨
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-poppins font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-bronze" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-vollkorn font-bold">$0</div>
            <p className="text-xs text-muted-foreground">No campaigns yet 🚀</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-poppins font-medium">Active Campaigns</CardTitle>
            <Briefcase className="h-4 w-4 text-bronze" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-vollkorn font-bold">0</div>
            <p className="text-xs text-muted-foreground">Get started today 💪</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-poppins font-medium">Profile Views</CardTitle>
            <Eye className="h-4 w-4 text-bronze" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-vollkorn font-bold">{creatorProfile?.profile_views || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-poppins font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-bronze" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-vollkorn font-bold">{creatorProfile?.engagement_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">Average</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Top Opportunities */}
        <Card className="md:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="font-vollkorn text-xl">Your Top Opportunities 🎯</CardTitle>
            <CardDescription className="font-poppins">Campaigns matched to your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-poppins mb-4">No campaigns available yet 🔍</p>
              <Link to="/crevia-connect?tab=opportunities">
                <Button className="gap-2">
                  Browse Opportunities <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Kira Insights */}
        <Card className="bg-gradient-to-br from-bronze/10 to-bronze/5 border-bronze/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-bronze" />
              <CardTitle className="font-vollkorn text-xl">Kira Says 💬</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-sm font-poppins">✨ Complete your profile to get better campaign matches!</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-sm font-poppins">📊 Update your social metrics for more visibility</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-sm font-poppins">🎨 Set up your Crevia Link to showcase your work</p>
              </div>
            </div>
            <Link to="/crevia-ai">
              <Button variant="outline" className="w-full gap-2 border-bronze/30 hover:bg-bronze/10">
                Talk to Kira <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-vollkorn text-xl">Quick Actions ⚡</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Link to="/crevia-connect?tab=opportunities">
              <Button variant="outline" className="w-full gap-2 justify-start">
                <Target className="h-4 w-4" /> Find Campaigns
              </Button>
            </Link>
            <Link to="/crevia-ai">
              <Button variant="outline" className="w-full gap-2 justify-start">
                <Sparkles className="h-4 w-4" /> Open Kira
              </Button>
            </Link>
            <Link to="/crevia-link">
              <Button variant="outline" className="w-full gap-2 justify-start">
                <BarChart3 className="h-4 w-4" /> Edit Crevia Link
              </Button>
            </Link>
            <Link to="/profile/settings">
              <Button variant="outline" className="w-full gap-2 justify-start">
                <Users className="h-4 w-4" /> Update Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-vollkorn text-xl">Recent Activity 📅</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground font-poppins">No recent activity yet 🌱</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBrandHome = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="font-vollkorn text-4xl font-bold text-foreground">
          Welcome back, {profile?.display_name || "Brand"} 👋
        </h1>
        <p className="text-muted-foreground font-poppins">
          Here's your campaign overview and performance insights 📈
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-poppins font-medium">Active Campaigns</CardTitle>
            <Briefcase className="h-4 w-4 text-bronze" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-vollkorn font-bold">0</div>
            <p className="text-xs text-muted-foreground">Create your first campaign 🚀</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-poppins font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-bronze" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-vollkorn font-bold">$0</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-poppins font-medium">Creator Matches</CardTitle>
            <Users className="h-4 w-4 text-bronze" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-vollkorn font-bold">0</div>
            <p className="text-xs text-muted-foreground">Waiting for campaigns 🔍</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-poppins font-medium">ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-bronze" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-vollkorn font-bold">-</div>
            <p className="text-xs text-muted-foreground">No data yet</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Top Creator Recommendations */}
        <Card className="md:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="font-vollkorn text-xl">Top Creator Recommendations 🌟</CardTitle>
            <CardDescription className="font-poppins">Creators that match your brand</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-poppins mb-4">Create a campaign to get creator recommendations 💡</p>
              <Link to="/crevia-connect?tab=discovery">
                <Button className="gap-2">
                  Discover Creators <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Kira Insights */}
        <Card className="bg-gradient-to-br from-bronze/10 to-bronze/5 border-bronze/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-bronze" />
              <CardTitle className="font-vollkorn text-xl">Kira Says 💬</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-sm font-poppins">🎯 Create your first campaign to start finding creators!</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-sm font-poppins">📊 Complete your brand profile for better matches</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-sm font-poppins">💡 Set clear goals to optimize your campaigns</p>
              </div>
            </div>
            <Link to="/crevia-ai">
              <Button variant="outline" className="w-full gap-2 border-bronze/30 hover:bg-bronze/10">
                Talk to Kira <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-vollkorn text-xl">Quick Actions ⚡</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Link to="/crevia-connect?tab=campaigns">
              <Button variant="outline" className="w-full gap-2 justify-start">
                <Briefcase className="h-4 w-4" /> Create Campaign
              </Button>
            </Link>
            <Link to="/crevia-ai">
              <Button variant="outline" className="w-full gap-2 justify-start">
                <Sparkles className="h-4 w-4" /> Open Kira
              </Button>
            </Link>
            <Link to="/crevia-connect?tab=discovery">
              <Button variant="outline" className="w-full gap-2 justify-start">
                <Users className="h-4 w-4" /> Discover Creators
              </Button>
            </Link>
            <Link to="/profile/settings">
              <Button variant="outline" className="w-full gap-2 justify-start">
                <BarChart3 className="h-4 w-4" /> View Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Timeline */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-vollkorn text-xl">Campaign Timeline 📅</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground font-poppins">No campaigns yet 🌱</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto px-3 md:px-6 py-4 md:py-8">
      {userType === "creator" ? renderCreatorHome() : renderBrandHome()}
    </div>
  );
};

export default Dashboard;
