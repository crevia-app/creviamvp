import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, CheckCircle, XCircle } from "lucide-react";

interface CampaignWorkspaceDialogProps {
  application: any;
  open: boolean;
  onClose: () => void;
}

const CampaignWorkspaceDialog = ({ application, open, onClose }: CampaignWorkspaceDialogProps) => {
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (milestoneId: string, file: File) => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${milestoneId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('deliverables')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('deliverables').getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('deliverable_submissions')
        .insert({
          milestone_id: milestoneId,
          file_url: data.publicUrl,
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Deliverable uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload deliverable",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const campaignProgress = 45; // This would be calculated based on completed milestones

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{application.campaigns.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Campaign Progress</span>
              <span className="text-sm text-muted-foreground">{campaignProgress}%</span>
            </div>
            <Progress value={campaignProgress} />
          </div>

          <Tabs defaultValue="deliverables">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>

            <TabsContent value="deliverables" className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Upload Deliverables</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="deliverable-upload">Select File</Label>
                    <Input
                      id="deliverable-upload"
                      type="file"
                      className="mt-2"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Handle file upload - you would select milestone first
                          console.log("File selected:", file);
                        }
                      }}
                    />
                  </div>
                  <Button disabled={uploading} className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload Deliverable"}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Submitted Deliverables</h3>
                <p className="text-sm text-muted-foreground">
                  Your submitted deliverables will appear here
                </p>
              </div>
            </TabsContent>

            <TabsContent value="milestones" className="space-y-4">
              <h3 className="font-semibold">Campaign Milestones</h3>
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">Initial Content Creation</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Create and submit initial content drafts
                      </p>
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="border rounded-lg p-4 opacity-60">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">Revisions & Approval</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Implement feedback and get final approval
                      </p>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="chat" className="space-y-4">
              <div className="border rounded-lg p-4 min-h-[300px]">
                <p className="text-sm text-muted-foreground text-center pt-12">
                  Direct messaging with the brand will appear here
                </p>
              </div>
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              <div className="border rounded-lg p-4 min-h-[300px]">
                <p className="text-sm text-muted-foreground text-center pt-12">
                  Shared campaign files and resources will appear here
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Payment Status</Label>
                <p className="font-semibold">Escrow</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Amount</Label>
                <p className="font-semibold">${application.proposed_price}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignWorkspaceDialog;