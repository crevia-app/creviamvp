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
import { Textarea } from "@/components/ui/textarea";
import { Printer, CheckCircle2, FileSignature, Calendar, Coins, PenTool, Send, Edit3, Save, X, Download } from "lucide-react";
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
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  const [savingContent, setSavingContent] = useState(false);

  useEffect(() => {
    if (contract) {
      fetchProfile();
      setLocalContract(contract);
      setEditableContent(contract.content || "");
      setIsEditingContent(false);
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

    setLocalContract({ ...localContract, ...updateData });

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

  const handleSaveContent = async () => {
    if (!localContract) return;
    setSavingContent(true);

    const { error } = await supabase
      .from("contracts")
      .update({ content: editableContent })
      .eq("id", localContract.id);

    setSavingContent(false);

    if (error) {
      toast.error("Failed to save changes");
      return;
    }

    setLocalContract({ ...localContract, content: editableContent });
    setIsEditingContent(false);
    toast.success("Contract content updated");
    onContractUpdate?.();
  };

  const handleSendToClient = async () => {
    if (!localContract?.client_email) {
      toast.error("No client email. Please add one in contract details.");
      return;
    }

    const { error } = await supabase
      .from("contracts")
      .update({ status: "sent" })
      .eq("id", localContract.id);

    if (error) {
      toast.error("Failed to update status");
      return;
    }

    setLocalContract({ ...localContract, status: "sent" });
    toast.success(`Contract sent to ${localContract.client_email}`);
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
    uploaded: "Uploaded Contract",
  };

  const statusColors: Record<string, string> = {
    signed: "bg-emerald-500",
    active: "bg-green-500",
    completed: "bg-blue-500",
    sent: "bg-amber-500",
    draft: "bg-gray-400",
    cancelled: "bg-red-500",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-6 py-3 flex items-center justify-between">
          <DialogTitle className="font-vollkorn text-lg">Contract Preview</DialogTitle>
          <div className="flex items-center gap-2">
            {!isEditingContent && localContract.content && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingContent(true)}
                className="gap-1.5"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Contract Document */}
          <div className="bg-white text-black rounded-xl shadow-lg overflow-hidden print:shadow-none">
            {/* Accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-bronze via-amber-500 to-bronze" />
            
            <div className="p-8 md:p-10">
              {/* Header */}
              <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-100">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                    {contractTypeLabels[contract.contract_type] || "Agreement"}
                  </h1>
                  <p className="text-gray-500 mt-1 text-lg">{contract.title}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold text-white uppercase tracking-wider ${statusColors[localContract.status] || "bg-gray-400"}`}>
                  {localContract.status}
                </span>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-semibold">Creator / Service Provider</p>
                  <p className="font-bold text-gray-900 text-lg">
                    {profile?.display_name || profile?.handle || "Creator Name"}
                  </p>
                  <p className="text-gray-500 text-sm mt-0.5">{profile?.email}</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-semibold">Client / Brand</p>
                  <p className="font-bold text-gray-900 text-lg">{contract.client_name}</p>
                  {contract.client_email && (
                    <p className="text-gray-500 text-sm mt-0.5">{contract.client_email}</p>
                  )}
                </div>
              </div>

              {/* Key Terms Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-gradient-to-br from-bronze/5 to-transparent border border-bronze/10 rounded-xl text-center">
                  <Coins className="h-5 w-5 text-bronze mx-auto mb-2" />
                  <p className="text-gray-400 text-xs uppercase font-semibold">Value</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {formatCurrency(contract.value)}
                  </p>
                </div>
                <div className="p-4 border border-gray-100 rounded-xl text-center">
                  <Calendar className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs uppercase font-semibold">Start</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {contract.start_date ? format(new Date(contract.start_date), "MMM d, yyyy") : "TBD"}
                  </p>
                </div>
                <div className="p-4 border border-gray-100 rounded-xl text-center">
                  <Calendar className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs uppercase font-semibold">End</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {contract.end_date ? format(new Date(contract.end_date), "MMM d, yyyy") : "TBD"}
                  </p>
                </div>
              </div>

              {/* Deliverables */}
              {contract.deliverables && contract.deliverables.length > 0 && contract.deliverables[0] && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Deliverables
                  </h3>
                  <div className="space-y-2">
                    {contract.deliverables.filter((d: string) => d).map((item: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Terms Sections */}
              <div className="space-y-5 mb-8">
                {contract.payment_terms && (
                  <div className="p-4 border-l-4 border-bronze bg-bronze/5 rounded-r-lg">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">Payment Terms</h3>
                    <p className="text-gray-700 text-sm">{contract.payment_terms}</p>
                  </div>
                )}
                {contract.exclusivity && (
                  <div className="p-4 border-l-4 border-amber-400 bg-amber-50 rounded-r-lg">
                    <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">Exclusivity Clause</h3>
                    <p className="text-amber-800 text-sm">{contract.exclusivity_details || "Exclusivity terms apply."}</p>
                  </div>
                )}
                {contract.usage_rights && (
                  <div className="p-4 border-l-4 border-blue-400 bg-blue-50 rounded-r-lg">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">Usage Rights</h3>
                    <p className="text-gray-700 text-sm">{contract.usage_rights}</p>
                  </div>
                )}
                {contract.termination_clause && (
                  <div className="p-4 border-l-4 border-gray-300 bg-gray-50 rounded-r-lg">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">Termination</h3>
                    <p className="text-gray-700 text-sm">{contract.termination_clause}</p>
                  </div>
                )}
              </div>

              {/* Full Content - Editable */}
              {(localContract.content || isEditingContent) && (
                <div className="mb-8 pt-6 border-t-2 border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Full Agreement
                    </h3>
                    {isEditingContent && (
                      <div className="flex gap-2 print:hidden">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setIsEditingContent(false);
                            setEditableContent(localContract.content || "");
                          }}
                          className="gap-1 text-gray-500"
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveContent}
                          disabled={savingContent}
                          className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Save className="h-3.5 w-3.5" />
                          {savingContent ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    )}
                  </div>
                  {isEditingContent ? (
                    <Textarea
                      value={editableContent}
                      onChange={(e) => setEditableContent(e.target.value)}
                      className="min-h-[300px] font-mono text-sm leading-relaxed bg-white border-2 border-bronze/20 focus:border-bronze"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-mono bg-gray-50 p-6 rounded-xl border border-gray-100">
                      {replaceTemplatePlaceholders(localContract.content)}
                    </div>
                  )}
                </div>
              )}

              {/* Signatures Section */}
              <div className="pt-8 border-t-2 border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <FileSignature className="h-4 w-4 text-bronze" />
                    Electronic Signatures
                  </h3>
                  <div className="flex gap-2 print:hidden">
                    {!localContract.creator_signature && (
                      <Button
                        size="sm"
                        onClick={() => openSignatureDialog("creator")}
                        className="gap-2 bg-bronze hover:bg-bronze/90 shadow-md shadow-bronze/20"
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Creator Signature */}
                  <div className="space-y-3">
                    <div className="h-28 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50/50 relative overflow-hidden">
                      {localContract.creator_signature ? (
                        <>
                          <div className="absolute top-2 right-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
                              <CheckCircle2 className="h-3 w-3" />
                              Signed
                            </span>
                          </div>
                          {localContract.creator_signature.startsWith("data:image") ? (
                            <img src={localContract.creator_signature} alt="Signature" className="max-h-20 object-contain" />
                          ) : (
                            <span className="text-3xl font-vollkorn italic text-gray-700">
                              {localContract.creator_signature}
                            </span>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => openSignatureDialog("creator")}
                          className="flex flex-col items-center gap-2 text-gray-400 hover:text-bronze transition-colors print:cursor-default"
                        >
                          <PenTool className="h-5 w-5" />
                          <span className="text-xs font-medium">Click to sign</span>
                        </button>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{profile?.display_name || profile?.handle || "Creator"}</p>
                      <p className="text-gray-400 text-xs">Creator / Service Provider</p>
                      {localContract.creator_signed_at && (
                        <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {format(new Date(localContract.creator_signed_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Client Signature */}
                  <div className="space-y-3">
                    <div className="h-28 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50/50 relative overflow-hidden">
                      {localContract.client_signature ? (
                        <>
                          <div className="absolute top-2 right-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
                              <CheckCircle2 className="h-3 w-3" />
                              Signed
                            </span>
                          </div>
                          {localContract.client_signature.startsWith("data:image") ? (
                            <img src={localContract.client_signature} alt="Signature" className="max-h-20 object-contain" />
                          ) : (
                            <span className="text-3xl font-vollkorn italic text-gray-700">
                              {localContract.client_signature}
                            </span>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <PenTool className="h-5 w-5" />
                          <span className="text-xs font-medium">
                            {localContract.status === "draft" ? "Send to client first" : "Awaiting signature"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{localContract.client_name}</p>
                      <p className="text-gray-400 text-xs">Client / Brand</p>
                      {localContract.client_signed_at && (
                        <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {format(new Date(localContract.client_signed_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Send to Client CTA */}
                {localContract.status === "draft" && localContract.creator_signature && !localContract.client_signature && (
                  <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl print:hidden">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-blue-900">Ready to send</p>
                        <p className="text-sm text-blue-600">
                          Send to {localContract.client_name} for their signature.
                        </p>
                      </div>
                      <Button
                        onClick={handleSendToClient}
                        className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md"
                      >
                        <Send className="h-4 w-4" />
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-10 pt-4 border-t border-gray-100 text-center">
                <p className="text-gray-300 text-xs">
                  Generated with Crevia Studio • {format(new Date(), "yyyy")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* E-Signature Dialog */}
        <ESignatureDialog
          open={showSignatureDialog}
          onOpenChange={setShowSignatureDialog}
          signerName={signingAs === "creator" ? (profile?.display_name || profile?.handle || "") : localContract.client_name}
          onSign={handleSign}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ContractPreviewDialog;
