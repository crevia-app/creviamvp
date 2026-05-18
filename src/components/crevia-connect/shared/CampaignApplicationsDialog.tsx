import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Eye, Wallet, Shield, FileSignature } from "lucide-react";
import FundEscrowDialog from "./FundEscrowDialog";
import CreateContractDialog from "@/components/studio/CreateContractDialog";
import type { ApplicationContext } from "@/components/studio/CreateContractDialog";

interface CampaignApplicationsDialogProps {
  campaign: any;
  open: boolean;
  onClose: () => void;
}

const CampaignApplicationsDialog = ({ campaign, open, onClose }: CampaignApplicationsDialogProps) => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showFundDialog, setShowFundDialog] = useState(false);

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

  const handleReject = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from("campaign_applications")
        .update({ status: "rejected" })
        .eq("id", applicationId);

      if (error) throw error;

      toast({
        title: "Application Rejected",
        description: "The creator has been notified",
      });
      fetchApplications();
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive",
      });
    }
  };

  const handleAcceptClick = (application: any) => {
    setSelectedApplication(application);
    setShowFundDialog(true);
  };

  const handleFundingComplete = async () => {
    setShowFundDialog(false);
    setSelectedApplication(null);
    fetchApplications();
    toast({
      title: "Creator Accepted & Escrow Funded!",
      description: "The first 50% payment is now in escrow. The creator has been notified.",
    });
  };

  const checkEscrowStatus = async (applicationId: string) => {
    const { data } = await supabase
      .from("escrow_payments")
      .select("*")
      .eq("application_id", applicationId)
      .maybeSingle();
    return data;
  };

  const pendingApplications = applications.filter(app => app.status === "pending");
  const acceptedApplications = applications.filter(app => app.status === "accepted");
  const rejectedApplications = applications.filter(app => app.status === "rejected");

  return (
    <>
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
              {/* Escrow Info Banner */}
              <Card className="p-4 border-bronze/30 bg-bronze/5">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-bronze mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-bronze text-sm">Crevia Pay Escrow Protection</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      When you accept a creator, you'll fund a 50/50 split escrow. 50% is released when work begins, 
                      and 50% when deliverables are approved.
                    </p>
                  </div>
                </div>
              </Card>

              {pendingApplications.map((app) => (
                <Card key={app.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {app.creator_profiles?.profiles?.display_name || app.creator_profiles?.profiles?.handle}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Applied {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary">{app.status}</Badge>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Proposal</h4>
                      <p className="text-sm text-muted-foreground">{app.proposal || "No proposal submitted"}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Proposed Price</p>
                        <p className="text-lg font-bold">KES {Number(app.proposed_price || 0).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          50% upfront: KES {(Number(app.proposed_price || 0) / 2).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(app.id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAcceptClick(app)}
                          className="gap-2"
                        >
                          <Wallet className="h-4 w-4" />
                          Accept & Fund
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
                <AcceptedApplicationCard
                  key={app.id}
                  application={app}
                  campaign={campaign}
                  checkEscrowStatus={checkEscrowStatus}
                />
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
                        {app.creator_profiles?.profiles?.display_name || app.creator_profiles?.profiles?.handle}
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

      {/* Fund Escrow Dialog */}
      {selectedApplication && (
        <FundEscrowDialog
          open={showFundDialog}
          onOpenChange={setShowFundDialog}
          application={selectedApplication}
          campaign={campaign}
          onSuccess={handleFundingComplete}
        />
      )}
    </>
  );
};

// Separate component for accepted applications to handle async escrow status
const AcceptedApplicationCard = ({ application, campaign, checkEscrowStatus }: { application: any; campaign: any; checkEscrowStatus: (id: string) => Promise<any> }) => {
  const [escrow, setEscrow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateCanvas, setShowCreateCanvas] = useState(false);

  useEffect(() => {
    const fetchEscrow = async () => {
      const data = await checkEscrowStatus(application.id);
      setEscrow(data);
      setLoading(false);
    };
    fetchEscrow();
  }, [application.id]);

  const getEscrowBadge = () => {
    if (loading) return <Badge variant="secondary">Loading...</Badge>;
    if (!escrow) return <Badge variant="outline">No Escrow</Badge>;
    
    if (escrow.first_payment_status === "released" && escrow.second_payment_status === "released") {
      return <Badge className="bg-green-500">Completed</Badge>;
    }
    if (escrow.first_payment_status === "paid" || escrow.second_payment_status === "paid") {
      return <Badge className="bg-blue-500">In Escrow</Badge>;
    }
    return <Badge variant="secondary">Pending Funding</Badge>;
  };

  const creatorName = application.creator_profiles?.profiles?.display_name
    || application.creator_profiles?.profiles?.handle
    || "Creator";
  const creatorEmail = application.creator_profiles?.profiles?.email || null;

  const appContext: ApplicationContext = {
    campaignTitle: campaign?.title || "Campaign",
    creatorName,
    creatorEmail,
    proposedPrice: Number(application.proposed_price || 0),
    deliverables: Array.isArray(campaign?.deliverables) ? campaign.deliverables : [],
  };

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{creatorName}</h3>
              <p className="text-sm text-muted-foreground">
                Accepted {new Date(application.updated_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getEscrowBadge()}
              <Badge>Accepted</Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Price</p>
              <p className="text-lg font-bold">KES {Number(application.proposed_price || 0).toLocaleString()}</p>
              {escrow && (
                <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                  <span>Phase 1: {escrow.first_payment_status}</span>
                  <span>Phase 2: {escrow.second_payment_status}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setShowCreateCanvas(true)}
                className="gap-1.5 bg-bronze hover:bg-bronze/90 text-white"
              >
                <FileSignature className="h-4 w-4" />
                Create Canvas
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                View Workspace
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <CreateContractDialog
        open={showCreateCanvas}
        onOpenChange={setShowCreateCanvas}
        applicationContext={appContext}
        onSuccess={() => setShowCreateCanvas(false)}
      />
    </>
  );
};

export default CampaignApplicationsDialog;
