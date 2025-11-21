import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Eye } from "lucide-react";

interface CampaignApplicationsDialogProps {
  campaign: any;
  open: boolean;
  onClose: () => void;
}

const CampaignApplicationsDialog = ({ campaign, open, onClose }: CampaignApplicationsDialogProps) => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchApplications();
    }
  }, [open, campaign.id]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("campaign_applications")
        .select("*, creator_profiles(*, profiles(*))")
        .eq("campaign_id", campaign.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("campaign_applications")
        .update({ status })
        .eq("id", applicationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Application ${status}`,
      });
      fetchApplications();
    } catch (error) {
      console.error("Error updating application:", error);
      toast({
        title: "Error",
        description: "Failed to update application",
        variant: "destructive",
      });
    }
  };

  const pendingApplications = applications.filter(app => app.status === "pending");
  const acceptedApplications = applications.filter(app => app.status === "accepted");
  const rejectedApplications = applications.filter(app => app.status === "rejected");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {campaign.title} - Applications ({applications.length})
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending ({pendingApplications.length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({acceptedApplications.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedApplications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingApplications.map((app) => (
              <Card key={app.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {app.creator_profiles?.profiles?.display_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Applied {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">{app.status}</Badge>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Proposal</h4>
                    <p className="text-sm text-muted-foreground">{app.proposal}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Proposed Price</p>
                      <p className="text-lg font-bold">${app.proposed_price}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(app.id, "rejected")}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(app.id, "accepted")}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {pendingApplications.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No pending applications
              </p>
            )}
          </TabsContent>

          <TabsContent value="accepted" className="space-y-4">
            {acceptedApplications.map((app) => (
              <Card key={app.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {app.creator_profiles?.profiles?.display_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Accepted {new Date(app.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge>Accepted</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="text-lg font-bold">${app.proposed_price}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      View Workspace
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {acceptedApplications.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No accepted applications yet
              </p>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedApplications.map((app) => (
              <Card key={app.id} className="p-6 opacity-60">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {app.creator_profiles?.profiles?.display_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Rejected {new Date(app.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="destructive">Rejected</Badge>
                </div>
              </Card>
            ))}

            {rejectedApplications.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No rejected applications
              </p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignApplicationsDialog;