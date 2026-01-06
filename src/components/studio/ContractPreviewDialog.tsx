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
import { Printer, CheckCircle2, FileSignature, Calendar, Coins, Users } from "lucide-react";
import { format } from "date-fns";

interface ContractPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: any;
}

const ContractPreviewDialog = ({
  open,
  onOpenChange,
  contract,
}: ContractPreviewDialogProps) => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (contract) {
      fetchProfile();
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
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-6">
              Signatures
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-20 border-b-2 border-gray-300 flex items-end pb-2">
                  {contract.creator_signature ? (
                    <span className="text-2xl font-script italic text-gray-700">
                      {contract.creator_signature}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">Signature pending</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {profile?.display_name || profile?.handle || "Creator"}
                  </p>
                  <p className="text-gray-500 text-sm">Creator</p>
                  {contract.creator_signed_at && (
                    <p className="text-gray-500 text-xs mt-1">
                      Signed: {format(new Date(contract.creator_signed_at), "MMMM d, yyyy")}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-20 border-b-2 border-gray-300 flex items-end pb-2">
                  {contract.client_signature ? (
                    <span className="text-2xl font-script italic text-gray-700">
                      {contract.client_signature}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">Signature pending</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{contract.client_name}</p>
                  <p className="text-gray-500 text-sm">Client</p>
                  {contract.client_signed_at && (
                    <p className="text-gray-500 text-xs mt-1">
                      Signed: {format(new Date(contract.client_signed_at), "MMMM d, yyyy")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center">
            <p className="text-gray-400 text-xs">
              Generated with Crevia Studio
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContractPreviewDialog;
