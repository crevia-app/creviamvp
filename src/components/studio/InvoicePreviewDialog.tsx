import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer, Send, CheckCircle2, Clock, AlertCircle, Maximize2, Minimize2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface InvoicePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any;
}

const InvoicePreviewDialog = ({
  open,
  onOpenChange,
  invoice,
}: InvoicePreviewDialogProps) => {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (invoice) {
      fetchItems();
      fetchProfile();
      fetchBusinessSettings();
    }
  }, [invoice]);

  const fetchItems = async () => {
    const { data } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoice.id);

    if (data) {
      setItems(
        data.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          total: Number(item.total),
        }))
      );
    }
  };

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

  const fetchBusinessSettings = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from("business_settings")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      setBusinessSettings(data);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: invoice?.currency || "KES",
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleMarkAsSent = async () => {
    if (!invoice) return;
    const { error } = await supabase
      .from("invoices")
      .update({ status: "sent" })
      .eq("id", invoice.id);
    if (error) {
      toast.error("Failed to update status");
      return;
    }
    toast.success("Invoice marked as sent");
  };

  if (!invoice) return null;

  const statusConfig: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
    draft: { bg: "bg-gray-100", text: "text-gray-600", label: "DRAFT", icon: <Clock className="h-4 w-4" /> },
    sent: { bg: "bg-blue-100", text: "text-blue-700", label: "SENT", icon: <Send className="h-4 w-4" /> },
    paid: { bg: "bg-emerald-100", text: "text-emerald-700", label: "PAID", icon: <CheckCircle2 className="h-4 w-4" /> },
    overdue: { bg: "bg-red-100", text: "text-red-700", label: "OVERDUE", icon: <AlertCircle className="h-4 w-4" /> },
    cancelled: { bg: "bg-gray-100", text: "text-gray-500", label: "CANCELLED", icon: <Clock className="h-4 w-4" /> },
  };

  const status = statusConfig[invoice.status] || statusConfig.draft;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setIsFullscreen(false); onOpenChange(v); }}>
      <DialogContent className={cn(
        "overflow-y-auto p-0 transition-all duration-300",
        isFullscreen
          ? "max-w-[100vw] w-screen h-screen max-h-screen rounded-none"
          : "max-w-3xl max-h-[90vh]"
      )}>
        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-6 py-3 flex items-center justify-between">
          <DialogTitle className="font-vollkorn text-lg">Invoice Preview</DialogTitle>
          <div className="flex gap-2">
            {invoice.status === "draft" && (
              <Button variant="outline" size="sm" onClick={handleMarkAsSent} className="gap-1.5">
                <Send className="h-3.5 w-3.5" />
                Send
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)} className="gap-1.5">
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              {isFullscreen ? "Exit" : "Fullscreen"}
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Invoice Document */}
          <div className="bg-white text-black rounded-xl shadow-lg overflow-hidden print:shadow-none">
            {/* Accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-bronze via-amber-500 to-bronze" />

            <div className="p-8 md:p-10">
              {/* Header */}
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 tracking-tight">INVOICE</h1>
                  <p className="text-gray-400 mt-1 text-lg font-mono">{invoice.invoice_number}</p>
                </div>
                <div className="text-right">
                  {businessSettings?.logo_url && (
                    <img
                      src={businessSettings.logo_url}
                      alt="Business Logo"
                      className="w-14 h-14 object-contain ml-auto mb-2 rounded-lg"
                    />
                  )}
                  <h2 className="text-xl font-bold text-gray-900">
                    {businessSettings?.business_name || profile?.display_name || profile?.handle || "Your Name"}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {businessSettings?.business_email || profile?.email}
                  </p>
                  {businessSettings?.business_phone && (
                    <p className="text-gray-500 text-sm">{businessSettings.business_phone}</p>
                  )}
                  {businessSettings?.business_address && (
                    <p className="text-gray-500 text-sm whitespace-pre-line mt-1">{businessSettings.business_address}</p>
                  )}
                </div>
              </div>

              {/* Bill To & Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="md:col-span-1">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-semibold">Bill To</p>
                  <p className="font-bold text-gray-900 text-lg">{invoice.client_name}</p>
                  {invoice.client_email && (
                    <p className="text-gray-500 text-sm mt-0.5">{invoice.client_email}</p>
                  )}
                  {invoice.client_address && (
                    <p className="text-gray-500 text-sm whitespace-pre-line mt-1">{invoice.client_address}</p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-semibold">Issue Date</p>
                  <p className="font-semibold text-gray-900">{format(new Date(invoice.issue_date), "MMMM d, yyyy")}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-semibold">Due Date</p>
                  <p className="font-semibold text-gray-900">{format(new Date(invoice.due_date), "MMMM d, yyyy")}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-900">
                      <th className="text-left py-3 text-xs uppercase tracking-wider text-gray-500 font-bold">Description</th>
                      <th className="text-center py-3 text-xs uppercase tracking-wider text-gray-500 font-bold w-20">Qty</th>
                      <th className="text-right py-3 text-xs uppercase tracking-wider text-gray-500 font-bold w-32">Rate</th>
                      <th className="text-right py-3 text-xs uppercase tracking-wider text-gray-500 font-bold w-32">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id} className={`border-b ${idx === items.length - 1 ? "border-gray-200" : "border-gray-100"}`}>
                        <td className="py-4 text-gray-900 font-medium">{item.description}</td>
                        <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                        <td className="py-4 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                        <td className="py-4 text-right text-gray-900 font-semibold">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatCurrency(Number(invoice.subtotal))}</span>
                  </div>
                  {Number(invoice.tax_rate) > 0 && (
                    <div className="flex justify-between text-gray-500 text-sm">
                      <span>Tax ({invoice.tax_rate}%)</span>
                      <span className="font-medium">{formatCurrency(Number(invoice.tax_amount))}</span>
                    </div>
                  )}
                  {Number(invoice.discount_amount) > 0 && (
                    <div className="flex justify-between text-emerald-600 text-sm">
                      <span>Discount</span>
                      <span className="font-medium">-{formatCurrency(Number(invoice.discount_amount))}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t-2 border-gray-900">
                    <span className="text-lg font-bold text-gray-900">Total Due</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(Number(invoice.total))}</span>
                  </div>
                </div>
              </div>

              {/* Status Stamp */}
              <div className="flex justify-center mb-8">
                <div className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full ${status.bg} ${status.text} font-bold text-sm tracking-widest`}>
                  {status.icon}
                  {status.label}
                </div>
              </div>

              {/* Notes & Terms */}
              {(invoice.notes || invoice.terms) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                  {invoice.notes && (
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-semibold">Notes</p>
                      <p className="text-gray-600 text-sm whitespace-pre-line">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice.terms && (
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-semibold">Payment Terms</p>
                      <p className="text-gray-600 text-sm whitespace-pre-line">{invoice.terms}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="mt-10 pt-4 border-t border-gray-100 text-center">
                <p className="text-gray-400 text-sm font-medium">Thank you for your business!</p>
                <p className="text-gray-300 text-xs mt-1">
                  Generated with Crevia Studio • {format(new Date(), "yyyy")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreviewDialog;
