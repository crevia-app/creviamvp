import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CampaignDetailDialogProps {
  campaign: any;
  open: boolean;
  onClose: () => void;
}

const CampaignDetailDialog = ({ campaign, open, onClose }: CampaignDetailDialogProps) => {
  const { toast } = useToast();
  const [proposal, setProposal] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleApply = async () => {
    if (!proposal.trim() || !proposedPrice) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("campaign_applications")
        .insert({
          campaign_id: campaign.id,
          creator_id: user.id,
          proposal,
          proposed_price: parseFloat(proposedPrice),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application submitted successfully",
      });
      onClose();
    } catch (error) {
      console.error("Error applying:", error);
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{campaign.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">{campaign.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Requirements</h3>
            <p className="text-sm text-muted-foreground">{campaign.requirements || "No specific requirements"}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Deliverables</h3>
            <div className="flex flex-wrap gap-2">
              {campaign.deliverables?.map((deliverable: string, index: number) => (
                <Badge key={index} variant="outline">{deliverable}</Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Budget</h3>
              <p className="text-lg font-bold text-primary">${campaign.budget}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Deadline</h3>
              <p className="text-sm">{campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : "Not specified"}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Platforms</h3>
            <div className="flex flex-wrap gap-2">
              {campaign.platforms?.map((platform: string) => (
                <Badge key={platform}>{platform}</Badge>
              ))}
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-lg">Apply to this Campaign</h3>
            
            <div>
              <Label htmlFor="proposal">Your Proposal</Label>
              <Textarea
                id="proposal"
                placeholder="Explain why you're a great fit for this campaign..."
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                className="mt-2"
                rows={5}
              />
            </div>

            <div>
              <Label htmlFor="price">Proposed Price ($)</Label>
              <Input
                id="price"
                type="number"
                placeholder="Enter your price"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleApply}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignDetailDialog;