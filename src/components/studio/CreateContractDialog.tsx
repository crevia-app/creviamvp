import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, FileSignature, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface CreateContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingContract?: any;
  onSuccess: () => void;
}

const contractTypes = [
  { value: "sponsorship", label: "Sponsorship" },
  { value: "content_creation", label: "Content Creation" },
  { value: "brand_ambassador", label: "Brand Ambassador" },
  { value: "ugc", label: "UGC" },
  { value: "affiliate", label: "Affiliate" },
  { value: "custom", label: "Custom" },
];

const currencies = [
  { code: "KES", name: "Kenyan Shilling" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "NGN", name: "Nigerian Naira" },
];

const contractTemplates = {
  sponsorship: {
    content: `SPONSORSHIP AGREEMENT

This Sponsorship Agreement ("Agreement") is entered into as of [START_DATE] by and between:

CREATOR: [CREATOR_NAME]
CLIENT: [CLIENT_NAME]

1. SCOPE OF WORK
The Creator agrees to provide the following sponsored content:
[DELIVERABLES]

2. COMPENSATION
Total Compensation: [VALUE] [CURRENCY]
Payment Schedule: [PAYMENT_TERMS]

3. CONTENT REQUIREMENTS
- All content must be clearly marked as sponsored
- Content must align with brand guidelines provided
- Creator maintains creative control within agreed parameters

4. USAGE RIGHTS
[USAGE_RIGHTS]

5. EXCLUSIVITY
[EXCLUSIVITY_CLAUSE]

6. TERM
This Agreement begins on [START_DATE] and ends on [END_DATE].

7. TERMINATION
[TERMINATION_CLAUSE]

8. CONFIDENTIALITY
Both parties agree to keep confidential any proprietary information shared during this partnership.

SIGNATURES
________________________
Creator: [CREATOR_NAME]
Date: _______________

________________________
Client Representative: [CLIENT_NAME]
Date: _______________`,
    deliverables: ["1x Instagram Post", "2x Instagram Stories", "1x TikTok Video"],
    paymentTerms: "50% upfront, 50% upon content approval",
    usageRights: "Client receives a 12-month license for promotional use across owned channels",
    terminationClause: "Either party may terminate with 14 days written notice",
  },
  content_creation: {
    content: `CONTENT CREATION AGREEMENT

This Agreement is made between:
CREATOR: [CREATOR_NAME]
CLIENT: [CLIENT_NAME]
DATE: [START_DATE]

PROJECT OVERVIEW
The Creator will produce original content as detailed below.

DELIVERABLES
[DELIVERABLES]

COMPENSATION
Total Fee: [VALUE] [CURRENCY]
Payment Terms: [PAYMENT_TERMS]

TIMELINE
Start Date: [START_DATE]
Delivery Date: [END_DATE]

OWNERSHIP & RIGHTS
[USAGE_RIGHTS]

REVISIONS
Two (2) rounds of revisions included in the scope.

TERMINATION
[TERMINATION_CLAUSE]

SIGNATURES
________________________
Creator: [CREATOR_NAME]

________________________
Client: [CLIENT_NAME]`,
    deliverables: ["4x Original Photos", "2x Edited Videos", "Caption Copy"],
    paymentTerms: "100% upon project completion and delivery",
    usageRights: "Full ownership transfers to client upon final payment",
    terminationClause: "Termination requires payment for work completed to date",
  },
  brand_ambassador: {
    content: `BRAND AMBASSADOR AGREEMENT

PARTIES
Ambassador: [CREATOR_NAME]
Brand: [CLIENT_NAME]
Effective Date: [START_DATE]

AMBASSADOR DUTIES
The Ambassador agrees to:
- Represent the Brand positively across social platforms
- Create content as specified in deliverables
- Attend events when reasonably requested
- Not promote competing brands during the term

DELIVERABLES
[DELIVERABLES]

COMPENSATION
Ambassador Fee: [VALUE] [CURRENCY]
Payment Schedule: [PAYMENT_TERMS]

TERM
[START_DATE] to [END_DATE]

EXCLUSIVITY
[EXCLUSIVITY_CLAUSE]

CONTENT RIGHTS
[USAGE_RIGHTS]

TERMINATION
[TERMINATION_CLAUSE]

SIGNATURES
________________________
Ambassador: [CREATOR_NAME]
Date: _______________

________________________
Brand Representative: [CLIENT_NAME]
Date: _______________`,
    deliverables: ["Monthly Instagram content (4 posts)", "Quarterly YouTube mention", "Event attendance (2 per year)"],
    paymentTerms: "Monthly retainer paid on the 1st of each month",
    usageRights: "Brand may repurpose Ambassador content for marketing with credit",
    terminationClause: "30 days written notice required from either party",
  },
  ugc: {
    content: `UGC (USER-GENERATED CONTENT) AGREEMENT

Creator: [CREATOR_NAME]
Brand: [CLIENT_NAME]
Date: [START_DATE]

This Agreement covers the creation of authentic user-generated content.

CONTENT SPECIFICATIONS
[DELIVERABLES]

COMPENSATION
Fee: [VALUE] [CURRENCY]
Payment: [PAYMENT_TERMS]

USAGE RIGHTS
[USAGE_RIGHTS]

CREATOR REQUIREMENTS
- Content must appear organic and authentic
- No visible branding of competitors
- Follow brand aesthetic guidelines

DELIVERY
All content due by: [END_DATE]

TERMINATION
[TERMINATION_CLAUSE]

ACCEPTED AND AGREED:
________________________
Creator: [CREATOR_NAME]

________________________
Client: [CLIENT_NAME]`,
    deliverables: ["3x Raw Video Clips (15-30 sec each)", "5x Lifestyle Photos", "1x Testimonial Video"],
    paymentTerms: "50% deposit, 50% on delivery",
    usageRights: "Perpetual license for all paid advertising and organic use",
    terminationClause: "Either party may terminate with 7 days notice; deposit non-refundable",
  },
  affiliate: {
    content: `AFFILIATE PARTNERSHIP AGREEMENT

Affiliate: [CREATOR_NAME]
Company: [CLIENT_NAME]
Effective: [START_DATE]

PROGRAM OVERVIEW
This Agreement establishes the terms for the affiliate marketing relationship.

AFFILIATE OBLIGATIONS
- Promote products through approved channels
- Disclose affiliate relationship per FTC guidelines
- Not make false claims about products

COMPENSATION
Commission Structure: [VALUE]% per qualified sale
Payment Terms: [PAYMENT_TERMS]

TERM
[START_DATE] to [END_DATE]

INTELLECTUAL PROPERTY
[USAGE_RIGHTS]

TERMINATION
[TERMINATION_CLAUSE]

SIGNATURES
________________________
Affiliate: [CREATOR_NAME]

________________________
Company: [CLIENT_NAME]`,
    deliverables: ["Affiliate link promotion", "Monthly product review", "Quarterly performance report"],
    paymentTerms: "Commission paid monthly, 30 days after conversion",
    usageRights: "Limited license to use brand assets for promotion only",
    terminationClause: "Either party may terminate with 7 days notice; pending commissions still paid",
  },
  custom: {
    content: `CUSTOM AGREEMENT

Between: [CREATOR_NAME] ("Creator")
And: [CLIENT_NAME] ("Client")
Date: [START_DATE]

1. SERVICES
[Add your custom terms here]

DELIVERABLES
[DELIVERABLES]

2. COMPENSATION
Amount: [VALUE] [CURRENCY]
Payment Terms: [PAYMENT_TERMS]

3. TIMELINE
Start: [START_DATE]
End: [END_DATE]

4. RIGHTS
[USAGE_RIGHTS]

5. TERMINATION
[TERMINATION_CLAUSE]

SIGNATURES
________________________
Creator

________________________
Client`,
    deliverables: [],
    paymentTerms: "As agreed",
    usageRights: "As agreed between parties",
    terminationClause: "As agreed between parties",
  },
};

const CreateContractDialog = ({
  open,
  onOpenChange,
  editingContract,
  onSuccess,
}: CreateContractDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [contractType, setContractType] = useState("custom");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [value, setValue] = useState<number | undefined>();
  const [currency, setCurrency] = useState("KES");
  const [content, setContent] = useState("");
  const [deliverables, setDeliverables] = useState<string[]>([""]);
  const [paymentTerms, setPaymentTerms] = useState("");
  const [exclusivity, setExclusivity] = useState(false);
  const [exclusivityDetails, setExclusivityDetails] = useState("");
  const [usageRights, setUsageRights] = useState("");
  const [terminationClause, setTerminationClause] = useState("");

  useEffect(() => {
    if (editingContract) {
      setTitle(editingContract.title);
      setClientName(editingContract.client_name);
      setClientEmail(editingContract.client_email || "");
      setContractType(editingContract.contract_type);
      setStartDate(editingContract.start_date || "");
      setEndDate(editingContract.end_date || "");
      setValue(editingContract.value || undefined);
      setCurrency(editingContract.currency);
      setContent(editingContract.content || "");
      setDeliverables(editingContract.deliverables || [""]);
      setPaymentTerms(editingContract.payment_terms || "");
      setExclusivity(editingContract.exclusivity || false);
      setExclusivityDetails(editingContract.exclusivity_details || "");
      setUsageRights(editingContract.usage_rights || "");
      setTerminationClause(editingContract.termination_clause || "");
    } else {
      resetForm();
    }
  }, [editingContract, open]);

  const resetForm = () => {
    setTitle("");
    setClientName("");
    setClientEmail("");
    setContractType("custom");
    setStartDate("");
    setEndDate("");
    setValue(undefined);
    setCurrency("KES");
    setContent("");
    setDeliverables([""]);
    setPaymentTerms("");
    setExclusivity(false);
    setExclusivityDetails("");
    setUsageRights("");
    setTerminationClause("");
  };

  const applyTemplate = (type: string) => {
    const template = contractTemplates[type as keyof typeof contractTemplates];
    if (template) {
      setContent(template.content);
      setDeliverables(template.deliverables.length > 0 ? template.deliverables : [""]);
      setPaymentTerms(template.paymentTerms);
      setUsageRights(template.usageRights);
      setTerminationClause(template.terminationClause);
      toast.success("Template applied! Customize the content below.");
    }
  };

  const updateDeliverable = (index: number, value: string) => {
    const newDeliverables = [...deliverables];
    newDeliverables[index] = value;
    setDeliverables(newDeliverables);
  };

  const addDeliverable = () => {
    setDeliverables([...deliverables, ""]);
  };

  const removeDeliverable = (index: number) => {
    if (deliverables.length > 1) {
      setDeliverables(deliverables.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!title || !clientName) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to create contracts");
        return;
      }

      const contractData = {
        user_id: session.user.id,
        title,
        client_name: clientName,
        client_email: clientEmail || null,
        contract_type: contractType,
        start_date: startDate || null,
        end_date: endDate || null,
        value: value || null,
        currency,
        content: content || null,
        deliverables: deliverables.filter(d => d.trim()),
        payment_terms: paymentTerms || null,
        exclusivity,
        exclusivity_details: exclusivityDetails || null,
        usage_rights: usageRights || null,
        termination_clause: terminationClause || null,
      };

      if (editingContract) {
        const { error } = await supabase
          .from("contracts")
          .update(contractData)
          .eq("id", editingContract.id);

        if (error) throw error;
        toast.success("Contract updated successfully");
      } else {
        const { error } = await supabase
          .from("contracts")
          .insert(contractData);

        if (error) throw error;
        toast.success("Contract created successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save contract");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-vollkorn text-xl">
            <FileSignature className="h-5 w-5 text-bronze" />
            {editingContract ? "Edit Contract" : "Create New Contract"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contract Type & Template */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Contract Type</Label>
              <Select
                value={contractType}
                onValueChange={(val) => {
                  setContractType(val);
                  if (!editingContract) applyTemplate(val);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contractTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Contract Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Q1 2026 Brand Partnership"
                className="mt-1"
              />
            </div>
          </div>

          {/* Quick Templates */}
          {!editingContract && (
            <div className="p-4 bg-bronze/5 rounded-xl border border-bronze/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-bronze" />
                <span className="text-sm font-medium text-foreground">Quick Templates</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {contractTypes.filter(t => t.value !== "custom").map((type) => (
                  <Badge
                    key={type.value}
                    variant="outline"
                    className="cursor-pointer hover:bg-bronze/10 transition-colors"
                    onClick={() => {
                      setContractType(type.value);
                      applyTemplate(type.value);
                    }}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Client Details */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-xl">
            <h3 className="font-semibold text-foreground">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Client Name *</Label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Company or individual name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Client Email</Label>
                <Input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Dates & Value */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Contract Value</Label>
              <Input
                type="number"
                value={value || ""}
                onChange={(e) => setValue(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Deliverables */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Deliverables</Label>
              <Button variant="outline" size="sm" onClick={addDeliverable} className="gap-1">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            {deliverables.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateDeliverable(index, e.target.value)}
                  placeholder="e.g., 1x Instagram Post"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDeliverable(index)}
                  disabled={deliverables.length === 1}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Payment Terms */}
          <div>
            <Label>Payment Terms</Label>
            <Textarea
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              placeholder="e.g., 50% upfront, 50% upon content approval"
              className="mt-1"
              rows={2}
            />
          </div>

          {/* Exclusivity */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <Label>Exclusivity Clause</Label>
                <p className="text-xs text-muted-foreground">
                  Does this contract include exclusivity terms?
                </p>
              </div>
              <Switch checked={exclusivity} onCheckedChange={setExclusivity} />
            </div>
            {exclusivity && (
              <Textarea
                value={exclusivityDetails}
                onChange={(e) => setExclusivityDetails(e.target.value)}
                placeholder="Describe the exclusivity terms..."
                rows={2}
              />
            )}
          </div>

          {/* Usage Rights */}
          <div>
            <Label>Usage Rights</Label>
            <Textarea
              value={usageRights}
              onChange={(e) => setUsageRights(e.target.value)}
              placeholder="Define how content can be used..."
              className="mt-1"
              rows={2}
            />
          </div>

          {/* Termination */}
          <div>
            <Label>Termination Clause</Label>
            <Textarea
              value={terminationClause}
              onChange={(e) => setTerminationClause(e.target.value)}
              placeholder="Terms for ending the contract..."
              className="mt-1"
              rows={2}
            />
          </div>

          {/* Full Contract Content */}
          <div>
            <Label>Full Contract Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Full contract text..."
              className="mt-1 font-mono text-sm"
              rows={12}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-bronze hover:bg-bronze/90"
            >
              {loading ? "Saving..." : editingContract ? "Update Contract" : "Create Contract"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateContractDialog;
