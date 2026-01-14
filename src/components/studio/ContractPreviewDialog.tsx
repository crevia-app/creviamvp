import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Printer, CheckCircle2, FileSignature, Calendar, Coins, Users, PenTool, Send } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import ESignatureDialog from "./ESignatureDialog";

interface ContractPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: any;
  onContractUpdate?: () => void;
}

const ContractPreviewDialog = ({
  open,
  onOpenChange,
  contract,
  onContractUpdate,
}: ContractPreviewDialogProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signingAs, setSigningAs] = useState<"creator" | "client">("creator");
  const [localContract, setLocalContract] = useState(contract);

  useEffect(() => {
    if (contract) {
      fetchProfile();
      setLocalContract(contract);
    }
  }, [contract]);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      setProfile(data);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: contract?.currency || "KES",
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSign = async (signature: string, signedAt: string) => {
    if (!localContract) return;

    const updateData = signingAs === "creator"
      ? { creator_signature: signature, creator_signed_at: signedAt }
      : { client_signature: signature, client_signed_at: signedAt };

    const { error } = await supabase
      .from("contracts")
      .update(updateData)
      .eq("id", localContract.id);

    if (error) {
      toast.error("Failed to save signature");
      return;
    }

    // Update local state
    setLocalContract({ ...localContract, ...updateData });

    // Check if both have signed to update status
    const updatedContract = { ...localContract, ...updateData };
    if (updatedContract.creator_signature && updatedContract.client_signature) {
      await supabase
        .from("contracts")
        .update({ status: "signed" })
        .eq("id", localContract.id);
      setLocalContract({ ...updatedContract, status: "signed" });
    }

    toast.success(`${signingAs === "creator" ? "Your" : "Client"} signature saved!`);
    onContractUpdate?.();
  };

  const handleSendToClient = async () => {
    if (!localContract?.client_email) {
      toast.error("No client email address. Please add one in the contract details.");
      return;
    }

    // Update contract status to sent
    const { error } = await supabase
      .from("contracts")
      .update({ status: "sent" })
      .eq("id", localContract.id);

    if (error) {
      toast.error("Failed to update status");
      return;
    }

    setLocalContract({ ...localContract, status: "sent" });
    toast.success(`Contract sent to ${localContract.client_email}. They can sign via the shared link.`);
    onContractUpdate?.();
  };

  const openSignatureDialog = (as: "creator" | "client") => {
    setSigningAs(as);
    setShowSignatureDialog(true);
  };

  const replaceTemplatePlaceholders = (text: string) => {
    if (!text) return "";
    
    return text
      .replace(/\[CREATOR_NAME\]/g, profile?.display_name || profile?.handle || "Creator")
      .replace(/\[CLIENT_NAME\]/g, contract.client_name)
      .replace(/\[START_DATE\]/g, contract.start_date ? format(new Date(contract.start_date), "MMMM d, yyyy") : "[Start Date]")
      .replace(/\[END_DATE\]/g, contract.end_date ? format(new Date(contract.end_date), "MMMM d, yyyy") : "[End Date]")
      .replace(/\[VALUE\]/g, contract.value?.toString() || "[Value]")
      .replace(/\[CURRENCY\]/g, contract.currency)
      .replace(/\[DELIVERABLES\]/g, contract.deliverables?.join("\n• ") || "[Deliverables]")
      .replace(/\[PAYMENT_TERMS\]/g, contract.payment_terms || "[Payment Terms]")
      .replace(/\[USAGE_RIGHTS\]/g, contract.usage_rights || "[Usage Rights]")
      .replace(/\[EXCLUSIVITY_CLAUSE\]/g, contract.exclusivity ? contract.exclusivity_details || "Exclusivity applies" : "No exclusivity required")
      .replace(/\[TERMINATION_CLAUSE\]/g, contract.termination_clause || "[Termination Clause]");
  };

  if (!contract) return null;

  const contractTypeLabels: Record<string, string> = {
    sponsorship: "Sponsorship Agreement",
    content_creation: "Content Creation Agreement",
    brand_ambassador: "Brand Ambassador Agreement",
    ugc: "UGC Agreement",
    affiliate: "Affiliate Partnership Agreement",
    custom: "Custom Agreement",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="font-vollkorn text-xl">Contract Preview</span>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Contract Preview */}
        <div className="bg-white text-black p-8 rounded-lg shadow-inner print:shadow-none">
          {/* Header */}
          <div className="border-b-4 border-gray-900 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
                  {contractTypeLabels[contract.contract_type] || "Agreement"}
                </h1>
                <p className="text-gray-600 mt-1">{contract.title}</p>
              </div>
              <Badge className={`${
                contract.status === "signed" || contract.status === "active" ? "bg-green-500" :
                contract.status === "completed" ? "bg-blue-500" :
                contract.status === "sent" ? "bg-amber-500" :
                "bg-gray-500"
              } text-white capitalize`}>
                {contract.status}
              </Badge>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">Creator</p>
              <p className="font-semibold text-gray-900">
                {profile?.display_name || profile?.handle || "Creator Name"}
              </p>
              <p className="text-gray-600 text-sm">{profile?.email}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">Client</p>
              <p className="font-semibold text-gray-900">{contract.client_name}</p>
              {contract.client_email && (
                <p className="text-gray-600 text-sm">{contract.client_email}</p>
              )}
            </div>
          </div>

          {/* Key Terms */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <Coins className="h-5 w-5 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-500 text-xs uppercase">Contract Value</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(contract.value)}
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <Calendar className="h-5 w-5 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-500 text-xs uppercase">Start Date</p>
              <p className="font-semibold text-gray-900">
                {contract.start_date
                  ? format(new Date(contract.start_date), "MMM d, yyyy")
                  : "TBD"}
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg text-center">
              <Calendar className="h-5 w-5 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-500 text-xs uppercase">End Date</p>
              <p className="font-semibold text-gray-900">
                {contract.end_date
                  ? format(new Date(contract.end_date), "MMM d, yyyy")
                  : "TBD"}
              </p>
            </div>
          </div>

          {/* Deliverables */}
          {contract.deliverables && contract.deliverables.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Deliverables
              </h3>
              <ul className="space-y-2">
                {contract.deliverables.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Terms Sections */}
          {contract.payment_terms && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                Payment Terms
              </h3>
              <p className="text-gray-700">{contract.payment_terms}</p>
            </div>
          )}

          {contract.exclusivity && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wide mb-2">
                Exclusivity Clause
              </h3>
              <p className="text-amber-800">{contract.exclusivity_details || "Exclusivity terms apply to this agreement."}</p>
            </div>
          )}

          {contract.usage_rights && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                Usage Rights
              </h3>
              <p className="text-gray-700">{contract.usage_rights}</p>
            </div>
          )}

          {contract.termination_clause && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                Termination
              </h3>
              <p className="text-gray-700">{contract.termination_clause}</p>
            </div>
          )}

          {/* Full Content */}
          {contract.content && (
            <div className="mb-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                Full Agreement
              </h3>
              <div className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                {replaceTemplatePlaceholders(contract.content)}
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="pt-8 border-t-2 border-gray-200 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Signatures
              </h3>
              <div className="flex gap-2 print:hidden">
                {!localContract.creator_signature && (
                  <Button
                    size="sm"
                    onClick={() => openSignatureDialog("creator")}
                    className="gap-2 bg-[#d36725] hover:bg-[#b8571f]"
                  >
                    <PenTool className="h-4 w-4" />
                    Sign as Creator
                  </Button>
                )}
                {localContract.status !== "draft" && !localContract.client_signature && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openSignatureDialog("client")}
                    className="gap-2"
                  >
                    <PenTool className="h-4 w-4" />
                    Sign as Client
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-24 border-b-2 border-gray-300 flex items-end pb-2 relative">
                  {localContract.creator_signature ? (
                    localContract.creator_signature.startsWith("data:image") ? (
                      <img 
                        src={localContract.creator_signature} 
                        alt="Creator signature" 
                        className="max-h-20 object-contain"
                      />
                    ) : (
                      <span className="text-2xl font-vollkorn italic text-gray-700">
                        {localContract.creator_signature}
                      </span>
                    )
                  ) : (
                    <button 
                      onClick={() => openSignatureDialog("creator")}
                      className="text-gray-400 italic hover:text-[#d36725] transition-colors cursor-pointer print:cursor-default"
                    >
                      Click to sign
                    </button>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {profile?.display_name || profile?.handle || "Creator"}
                  </p>
                  <p className="text-gray-500 text-sm">Creator</p>
                  {localContract.creator_signed_at && (
                    <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      Signed: {format(new Date(localContract.creator_signed_at), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-24 border-b-2 border-gray-300 flex items-end pb-2 relative">
                  {localContract.client_signature ? (
                    localContract.client_signature.startsWith("data:image") ? (
                      <img 
                        src={localContract.client_signature} 
                        alt="Client signature" 
                        className="max-h-20 object-contain"
                      />
                    ) : (
                      <span className="text-2xl font-vollkorn italic text-gray-700">
                        {localContract.client_signature}
                      </span>
                    )
                  ) : (
                    <span className="text-gray-400 italic">
                      {localContract.status === "draft" ? "Send to client first" : "Awaiting signature"}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{localContract.client_name}</p>
                  <p className="text-gray-500 text-sm">Client</p>
                  {localContract.client_signed_at && (
                    <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      Signed: {format(new Date(localContract.client_signed_at), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Send to client button */}
            {localContract.status === "draft" && localContract.creator_signature && !localContract.client_signature && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg print:hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">Ready to send</p>
                    <p className="text-sm text-blue-700">
                      You've signed the contract. Send it to {localContract.client_name} for their signature.
                    </p>
                  </div>
                  <Button
                    onClick={handleSendToClient}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                    Send to Client
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center">
            <p className="text-gray-400 text-xs">
              Generated with Crevia Studio
            </p>
          </div>
        </div>

        {/* E-Signature Dialog */}
        <ESignatureDialog
          open={showSignatureDialog}
          onOpenChange={setShowSignatureDialog}
          signerName={signingAs === "creator" 
            ? (profile?.display_name || profile?.handle || "") 
            : localContract?.client_name || ""
          }
          onSign={handleSign}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ContractPreviewDialog;
