import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Trash2, FileText, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

interface RateCardService {
  id?: string;
  category: string;
  service_name: string;
  description: string;
  base_price: number;
  price_type: string;
  turnaround_days: number | null;
  order_index: number;
}

interface CreateRateCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRateCard?: any;
  onSuccess: () => void;
}

const currencies = [
  { code: "KES", name: "Kenyan Shilling" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "NGN", name: "Nigerian Naira" },
];

const priceTypes = [
  { value: "fixed", label: "Fixed Price" },
  { value: "hourly", label: "Per Hour" },
  { value: "per_post", label: "Per Post" },
  { value: "per_video", label: "Per Video" },
  { value: "negotiable", label: "Negotiable" },
];

const serviceCategories = [
  "Content Creation",
  "Social Media",
  "Photography",
  "Videography",
  "Brand Partnerships",
  "Consulting",
  "Events",
  "Other",
];

const CreateRateCardDialog = ({
  open,
  onOpenChange,
  editingRateCard,
  onSuccess,
}: CreateRateCardDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("KES");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [services, setServices] = useState<RateCardService[]>([
    {
      category: "Content Creation",
      service_name: "",
      description: "",
      base_price: 0,
      price_type: "fixed",
      turnaround_days: null,
      order_index: 0,
    },
  ]);

  useEffect(() => {
    if (editingRateCard) {
      setName(editingRateCard.name);
      setDescription(editingRateCard.description || "");
      setCurrency(editingRateCard.currency);
      setValidFrom(editingRateCard.valid_from || "");
      setValidUntil(editingRateCard.valid_until || "");
      fetchServices(editingRateCard.id);
    } else {
      resetForm();
    }
  }, [editingRateCard, open]);

  const fetchServices = async (rateCardId: string) => {
    const { data } = await supabase
      .from("rate_card_services")
      .select("*")
      .eq("rate_card_id", rateCardId)
      .order("order_index");

    if (data && data.length > 0) {
      setServices(
        data.map((s) => ({
          id: s.id,
          category: s.category,
          service_name: s.service_name,
          description: s.description || "",
          base_price: Number(s.base_price),
          price_type: s.price_type,
          turnaround_days: s.turnaround_days,
          order_index: s.order_index,
        }))
      );
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCurrency("KES");
    setValidFrom("");
    setValidUntil("");
    setServices([
      {
        category: "Content Creation",
        service_name: "",
        description: "",
        base_price: 0,
        price_type: "fixed",
        turnaround_days: null,
        order_index: 0,
      },
    ]);
  };

  const updateService = (index: number, field: string, value: any) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    setServices(newServices);
  };

  const addService = () => {
    setServices([
      ...services,
      {
        category: "Content Creation",
        service_name: "",
        description: "",
        base_price: 0,
        price_type: "fixed",
        turnaround_days: null,
        order_index: services.length,
      },
    ]);
  };

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!name || services.some((s) => !s.service_name)) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to create rate cards");
        return;
      }

      if (editingRateCard) {
        // Update rate card
        const { error: cardError } = await supabase
          .from("rate_cards")
          .update({
            name,
            description: description || null,
            currency,
            valid_from: validFrom || null,
            valid_until: validUntil || null,
          })
          .eq("id", editingRateCard.id);

        if (cardError) throw cardError;

        // Delete existing services and insert new ones
        await supabase
          .from("rate_card_services")
          .delete()
          .eq("rate_card_id", editingRateCard.id);

        const { error: servicesError } = await supabase
          .from("rate_card_services")
          .insert(
            services.map((s, index) => ({
              rate_card_id: editingRateCard.id,
              category: s.category,
              service_name: s.service_name,
              description: s.description || null,
              base_price: s.base_price,
              price_type: s.price_type,
              turnaround_days: s.turnaround_days,
              order_index: index,
            }))
          );

        if (servicesError) throw servicesError;

        toast.success("Rate card updated successfully");
      } else {
        // Create new rate card
        const { data: card, error: cardError } = await supabase
          .from("rate_cards")
          .insert({
            user_id: session.user.id,
            name,
            description: description || null,
            currency,
            valid_from: validFrom || null,
            valid_until: validUntil || null,
          })
          .select()
          .single();

        if (cardError) throw cardError;

        // Insert services
        const { error: servicesError } = await supabase
          .from("rate_card_services")
          .insert(
            services.map((s, index) => ({
              rate_card_id: card.id,
              category: s.category,
              service_name: s.service_name,
              description: s.description || null,
              base_price: s.base_price,
              price_type: s.price_type,
              turnaround_days: s.turnaround_days,
              order_index: index,
            }))
          );

        if (servicesError) throw servicesError;

        toast.success("Rate card created successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save rate card");
    } finally {
      setLoading(false);
    }
  };

  const totalValue = services.reduce((acc, s) => acc + s.base_price, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-vollkorn text-xl">
            <FileText className="h-5 w-5 text-bronze" />
            {editingRateCard ? "Edit Rate Card" : "Create New Rate Card"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Rate Card Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., 2026 Content Rates"
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
                      {c.code} - {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your services"
              className="mt-1"
              rows={2}
            />
          </div>

          {/* Validity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Valid From</Label>
              <Input
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Valid Until</Label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Services</Label>
              <Button variant="outline" size="sm" onClick={addService} className="gap-1">
                <Plus className="h-4 w-4" />
                Add Service
              </Button>
            </div>

            <div className="space-y-4">
              {services.map((service, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="pt-2 text-muted-foreground cursor-move">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-xs">Category</Label>
                          <Select
                            value={service.category}
                            onValueChange={(val) => updateService(index, "category", val)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {serviceCategories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-xs">Service Name *</Label>
                          <Input
                            value={service.service_name}
                            onChange={(e) => updateService(index, "service_name", e.target.value)}
                            placeholder="e.g., Instagram Reel"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={service.description}
                          onChange={(e) => updateService(index, "description", e.target.value)}
                          placeholder="What's included in this service"
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-xs">Price</Label>
                          <Input
                            type="number"
                            value={service.base_price}
                            onChange={(e) => updateService(index, "base_price", Number(e.target.value))}
                            className="mt-1"
                            min={0}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Price Type</Label>
                          <Select
                            value={service.price_type}
                            onValueChange={(val) => updateService(index, "price_type", val)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {priceTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Turnaround (days)</Label>
                          <Input
                            type="number"
                            value={service.turnaround_days || ""}
                            onChange={(e) => updateService(index, "turnaround_days", e.target.value ? Number(e.target.value) : null)}
                            className="mt-1"
                            min={1}
                            placeholder="—"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeService(index)}
                      disabled={services.length === 1}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-bronze/10 to-transparent p-4 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="font-medium text-foreground">Total Services Value</span>
              <span className="text-2xl font-bold text-bronze">{formatCurrency(totalValue)}</span>
            </div>
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
              {loading ? "Saving..." : editingRateCard ? "Update Rate Card" : "Create Rate Card"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRateCardDialog;
