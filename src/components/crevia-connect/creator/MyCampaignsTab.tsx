import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CampaignWorkspaceDialog from "../shared/CampaignWorkspaceDialog";

const MyCampaignsTab = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("campaign_applications")
        .select("*, campaigns(*)")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "default",
      approved: "default",
      rejected: "destructive",
      completed: "default"
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const activeApplications = applications.filter(app => app.status === "accepted");
  const pendingApplications = applications.filter(app => app.status === "pending");
  const completedApplications = applications.filter(app => app.status === "completed");

  if (loading) {
    return <div className="text-center py-12">Loading campaigns...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({activeApplications.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingApplications.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedApplications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeApplications.map((application) => (
            <Card key={application.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedApplication(application)}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{application.campaigns.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {application.campaigns.description}
                  </p>
                </div>
                {getStatusBadge(application.status)}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium">${application.proposed_price}</span>
                <span className="text-muted-foreground">Applied {new Date(application.created_at).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingApplications.map((application) => (
            <Card key={application.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{application.campaigns.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {application.campaigns.description}
                  </p>
                </div>
                {getStatusBadge(application.status)}
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedApplications.map((application) => (
            <Card key={application.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{application.campaigns.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {application.campaigns.description}
                  </p>
                </div>
                {getStatusBadge(application.status)}
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {selectedApplication && (
        <CampaignWorkspaceDialog
          application={selectedApplication}
          open={!!selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </div>
  );
};

export default MyCampaignsTab;