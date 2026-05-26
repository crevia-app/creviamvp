import { useState, useEffect } from "react";
import SuccessOverlay from "@/components/ui/SuccessOverlay";
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
import { Plus, Trash2, FileSignature, ChevronRight, User, Coins, Shield, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CreateContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingContract?: any;
  onSuccess: () => void;
  onCreated?: (id: string) => void;
  kiraContext?: Record<string, unknown> | null;
}


const currencies = [
  { code: "KES", name: "Kenyan Shilling" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "NGN", name: "Nigerian Naira" },
];

const CUSTOM_TEMPLATE = {
  content: `AGREEMENT

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
  paymentTerms: "As agreed",
  usageRights: "As agreed between parties",
  terminationClause: "As agreed between parties",
};

const steps = [
  { id: "parties", label: "Details", icon: <User className="h-4 w-4" /> },
  { id: "terms", label: "Terms", icon: <Coins className="h-4 w-4" /> },
  { id: "content", label: "Content", icon: <FileSignature className="h-4 w-4" /> },
];

const CreateContractDialog = ({
  open,
  onOpenChange,
  editingContract,
  onSuccess,
  onCreated,
  kiraContext,
}: CreateContractDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
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
      setCurrentStep(0);
    } else if (kiraContext) {
      // Prefill from Kira conversation context
      if (kiraContext.title) setTitle(kiraContext.title as string);
      if (kiraContext.client_name) setClientName(kiraContext.client_name as string);
      if (kiraContext.client_email) setClientEmail(kiraContext.client_email as string);
      if (kiraContext.contract_type) setContractType(kiraContext.contract_type as string);
      if (kiraContext.value) setValue(kiraContext.value as number);
      if (kiraContext.currency) setCurrency(kiraContext.currency as string);
      if (kiraContext.payment_terms) setPaymentTerms(kiraContext.payment_terms as string);
      if (Array.isArray(kiraContext.deliverables) && kiraContext.deliverables.length > 0) {
        setDeliverables(kiraContext.deliverables as string[]);
      }
      if (kiraContext.client_name || kiraContext.contract_type) setCurrentStep(0);
    } else {
      resetForm();
    }
  }, [editingContract, kiraContext, open]);

  const resetForm = () => {
    setTitle("");
    setClientName("");
    setClientEmail("");
    setContractType("custom");
    setStartDate("");
    setEndDate("");
    setValue(undefined);
    setCurrency("KES");
    setContent(CUSTOM_TEMPLATE.content);
    setDeliverables([""]);
    setPaymentTerms(CUSTOM_TEMPLATE.paymentTerms);
    setExclusivity(false);
    setExclusivityDetails("");
    setUsageRights(CUSTOM_TEMPLATE.usageRights);
    setTerminationClause(CUSTOM_TEMPLATE.terminationClause);
    setCurrentStep(0);
  };

  const updateDeliverable = (index: number, val: string) => {
    const newDeliverables = [...deliverables];
    newDeliverables[index] = val;
    setDeliverables(newDeliverables);
  };

  const addDeliverable = () => setDeliverables([...deliverables, ""]);

  const removeDeliverable = (index: number) => {
    if (deliverables.length > 1) setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || !clientName) {
      toast.error("Please fill in the contract title and client name");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please log in"); return; }

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
        const { error } = await supabase.from("contracts").update(contractData).eq("id", editingContract.id);
        if (error) throw error;
        onSuccess();
        onOpenChange(false);
        toast.success("Contract updated");
      } else {
        const { data: created, error } = await supabase.from("contracts").insert(contractData).select("id").single();
        if (error) throw error;
        if (created?.id) onCreated?.(created.id);
        onOpenChange(false);
        setShowSuccess(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save contract");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return title.trim() && clientName.trim();
    return true;
  };

  return (
    <>
    <SuccessOverlay
      show={showSuccess}
      title="Contract Created"
      subtitle="Your contract is ready to sign"
      onComplete={() => { setShowSuccess(false); onSuccess(); }}
    />
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl">
        {/* Header with Steps */}
        <div className="px-6 pt-6 pb-4 border-b border-border/50">
          <DialogHeader className="mb-4">
            <DialogTitle className="font-vollkorn text-xl flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileSignature className="h-4 w-4 text-primary" />
              </div>
              {editingContract ? "Edit Contract" : "New Contract"}
            </DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center gap-1">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => i <= (editingContract ? 2 : Math.max(currentStep, i)) && setCurrentStep(i)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    i === currentStep
                      ? "bg-primary/10 text-primary"
                      : i < currentStep
                      ? "text-foreground/70 hover:bg-muted"
                      : "text-muted-foreground"
                  )}
                >
                  {i < currentStep ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    step.icon
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
                {i < steps.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground mx-0.5" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">
            {/* Step 0: Details */}
            {currentStep === 0 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Contract details</h3>
                  <p className="text-xs text-muted-foreground">Name your contract and add client information</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contract Title *</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Q1 2026 Brand Partnership"
                      className="mt-1.5 h-11 rounded-xl"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Client Information
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Client Name *</Label>
                        <Input
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Company or individual"
                          className="mt-1 h-10 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Client Email</Label>
                        <Input
                          type="email"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="client@example.com"
                          className="mt-1 h-10 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 1: Terms */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Terms & deliverables</h3>
                  <p className="text-xs text-muted-foreground">Define the financial and operational terms</p>
                </div>

                {/* Dates & Value */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Start Date</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 h-10 rounded-xl text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">End Date</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 h-10 rounded-xl text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Value</Label>
                    <Input type="number" value={value || ""} onChange={(e) => setValue(e.target.value ? Number(e.target.value) : undefined)} placeholder="0" className="mt-1 h-10 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="mt-1 h-10 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {currencies.map((c) => (
                          <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Deliverables */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Deliverables</Label>
                    <Button variant="ghost" size="sm" onClick={addDeliverable} className="gap-1 h-7 text-xs rounded-lg">
                      <Plus className="h-3 w-3" /> Add
                    </Button>
                  </div>
                  {deliverables.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="w-6 h-10 flex items-center justify-center text-xs text-muted-foreground font-medium">{index + 1}</div>
                      <Input
                        value={item}
                        onChange={(e) => updateDeliverable(index, e.target.value)}
                        placeholder="e.g., 1x Instagram Post"
                        className="h-10 rounded-xl flex-1"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeDeliverable(index)} disabled={deliverables.length === 1} className="text-muted-foreground hover:text-destructive h-10 w-10 rounded-xl">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Payment Terms */}
                <div>
                  <Label className="text-xs text-muted-foreground">Payment Terms</Label>
                  <Textarea value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="e.g., 50% upfront, 50% upon approval" className="mt-1 rounded-xl resize-none" rows={2} />
                </div>

                {/* Exclusivity */}
                <div className="p-4 rounded-xl bg-muted/30 border border-border/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Exclusivity</p>
                        <p className="text-xs text-muted-foreground">Restrict competing partnerships</p>
                      </div>
                    </div>
                    <Switch checked={exclusivity} onCheckedChange={setExclusivity} />
                  </div>
                  {exclusivity && (
                    <Textarea value={exclusivityDetails} onChange={(e) => setExclusivityDetails(e.target.value)} placeholder="Describe exclusivity terms..." className="rounded-xl resize-none" rows={2} />
                  )}
                </div>

                {/* Usage Rights & Termination */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Usage Rights</Label>
                    <Textarea value={usageRights} onChange={(e) => setUsageRights(e.target.value)} placeholder="How content can be used..." className="mt-1 rounded-xl resize-none" rows={3} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Termination Clause</Label>
                    <Textarea value={terminationClause} onChange={(e) => setTerminationClause(e.target.value)} placeholder="Terms for ending the contract..." className="mt-1 rounded-xl resize-none" rows={3} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Content */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Full contract content</h3>
                  <p className="text-xs text-muted-foreground">Review and edit the complete contract text. Placeholders like [CLIENT_NAME] will be auto-filled.</p>
                </div>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Full contract text..."
                  className="rounded-xl font-mono text-sm leading-relaxed min-h-[400px] resize-none bg-muted/20 border-border/50 focus:border-primary/30"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between bg-muted/20">
          <Button
            variant="ghost"
            onClick={() => {
              if (currentStep === 0) onOpenChange(false);
              else setCurrentStep(currentStep - 1);
            }}
            className="rounded-xl"
          >
            {currentStep === 0 ? "Cancel" : "Back"}
          </Button>
          <div className="flex items-center gap-2">
            {currentStep < 2 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="rounded-xl bg-primary hover:bg-primary/90 gap-1.5"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !title || !clientName}
                className="rounded-xl bg-primary hover:bg-primary/90 gap-1.5 shadow-lg shadow-primary/20"
              >
                {loading ? "Saving..." : editingContract ? "Update Contract" : "Create Contract"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default CreateContractDialog;
