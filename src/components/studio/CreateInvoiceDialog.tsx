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
import { Plus, Trash2, Receipt } from "lucide-react";
import { toast } from "sonner";

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingInvoice?: any;
  onSuccess: () => void;
}

const currencies = [
  { code: "KES", name: "Kenyan Shilling" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "NGN", name: "Nigerian Naira" },
  { code: "ZAR", name: "South African Rand" },
  { code: "GHS", name: "Ghanaian Cedi" },
  { code: "TZS", name: "Tanzanian Shilling" },
  { code: "UGX", name: "Ugandan Shilling" },
];

const CreateInvoiceDialog = ({
  open,
  onOpenChange,
  editingInvoice,
  onSuccess,
}: CreateInvoiceDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("KES");
  const [taxRate, setTaxRate] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("Payment is due within 30 days of invoice date.");
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit_price: 0, total: 0 },
  ]);

  useEffect(() => {
    if (editingInvoice) {
      setInvoiceNumber(editingInvoice.invoice_number);
      setClientName(editingInvoice.client_name);
      setClientEmail(editingInvoice.client_email || "");
      setClientAddress(editingInvoice.client_address || "");
      setIssueDate(editingInvoice.issue_date);
      setDueDate(editingInvoice.due_date);
      setCurrency(editingInvoice.currency);
      setTaxRate(editingInvoice.tax_rate || 0);
      setDiscountAmount(editingInvoice.discount_amount || 0);
      setNotes(editingInvoice.notes || "");
      setTerms(editingInvoice.terms || "");
      
      // Fetch items
      fetchItems(editingInvoice.id);
    } else {
      generateInvoiceNumber();
      resetForm();
    }
  }, [editingInvoice, open]);

  const fetchItems = async (invoiceId: string) => {
    const { data } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoiceId);

    if (data && data.length > 0) {
      setItems(data.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total: Number(item.total),
      })));
    }
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    setInvoiceNumber(`INV-${year}${month}-${random}`);
  };

  const resetForm = () => {
    setClientName("");
    setClientEmail("");
    setClientAddress("");
    setIssueDate(new Date().toISOString().split("T")[0]);
    setDueDate("");
    setCurrency("KES");
    setTaxRate(0);
    setDiscountAmount(0);
    setNotes("");
    setTerms("Payment is due within 30 days of invoice date.");
    setItems([{ description: "", quantity: 1, unit_price: 0, total: 0 }]);
  };

  const updateItemTotal = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === "quantity" || field === "unit_price") {
      newItems[index].total = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((acc, item) => acc + item.total, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount - discountAmount;
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = async () => {
    if (!clientName || !dueDate || items.some((i) => !i.description)) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to create invoices");
        return;
      }

      const { subtotal, taxAmount, total } = calculateTotals();

      if (editingInvoice) {
        // Update invoice
        const { error: invoiceError } = await supabase
          .from("invoices")
          .update({
            invoice_number: invoiceNumber,
            client_name: clientName,
            client_email: clientEmail || null,
            client_address: clientAddress || null,
            issue_date: issueDate,
            due_date: dueDate,
            currency,
            tax_rate: taxRate,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            subtotal,
            total,
            notes: notes || null,
            terms: terms || null,
          })
          .eq("id", editingInvoice.id);

        if (invoiceError) throw invoiceError;

        // Delete existing items and insert new ones
        await supabase.from("invoice_items").delete().eq("invoice_id", editingInvoice.id);

        const { error: itemsError } = await supabase.from("invoice_items").insert(
          items.map((item) => ({
            invoice_id: editingInvoice.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total,
          }))
        );

        if (itemsError) throw itemsError;

        toast.success("Invoice updated successfully");
      } else {
        // Create new invoice
        const { data: invoice, error: invoiceError } = await supabase
          .from("invoices")
          .insert({
            user_id: session.user.id,
            invoice_number: invoiceNumber,
            client_name: clientName,
            client_email: clientEmail || null,
            client_address: clientAddress || null,
            issue_date: issueDate,
            due_date: dueDate,
            currency,
            tax_rate: taxRate,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            subtotal,
            total,
            notes: notes || null,
            terms: terms || null,
          })
          .select()
          .single();

        if (invoiceError) throw invoiceError;

        // Insert items
        const { error: itemsError } = await supabase.from("invoice_items").insert(
          items.map((item) => ({
            invoice_id: invoice.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total,
          }))
        );

        if (itemsError) throw itemsError;

        toast.success("Invoice created successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save invoice");
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

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
            <Receipt className="h-5 w-5 text-bronze" />
            {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Invoice Number</Label>
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Issue Date</Label>
              <Input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

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
            <div>
              <Label>Client Address</Label>
              <Textarea
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Full address"
                className="mt-1"
                rows={2}
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Line Items</h3>
              <Button variant="outline" size="sm" onClick={addItem} className="gap-1">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-2 mb-1">
              <div className="col-span-5">
                <Label className="text-xs text-muted-foreground font-medium">Description</Label>
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground font-medium">Quantity</Label>
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground font-medium">Unit Price</Label>
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground font-medium">Total</Label>
              </div>
              <div className="col-span-1" />
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-5">
                    <Input
                      placeholder="Service or product name"
                      value={item.description}
                      onChange={(e) => updateItemTotal(index, "description", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="1"
                      value={item.quantity}
                      onChange={(e) => updateItemTotal(index, "quantity", Number(e.target.value))}
                      min={1}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={item.unit_price}
                      onChange={(e) => updateItemTotal(index, "unit_price", Number(e.target.value))}
                      min={0}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      value={formatCurrency(item.total)}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Currency and Tax */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div>
              <Label>Tax Rate (%)</Label>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="mt-1"
                min={0}
                max={100}
              />
            </div>
            <div>
              <Label>Discount</Label>
              <Input
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="mt-1"
                min={0}
              />
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gradient-to-r from-bronze/10 to-transparent p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium text-green-500">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-bronze">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Notes and Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes for the client"
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label>Payment Terms</Label>
              <Textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Payment terms and conditions"
                className="mt-1"
                rows={3}
              />
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
              {loading ? "Saving..." : editingInvoice ? "Update Invoice" : "Create Invoice"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceDialog;
