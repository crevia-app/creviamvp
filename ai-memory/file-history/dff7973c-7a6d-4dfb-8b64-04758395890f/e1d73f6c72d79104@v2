import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer, Download, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface ReceiptItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface ReceiptPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any;
}

const ReceiptPreviewDialog = ({
  open,
  onOpenChange,
  invoice,
}: ReceiptPreviewDialogProps) => {
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [businessSettings, setBusinessSettings] = useState<any>(null);

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
        .maybeSingle();
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

  if (!invoice) return null;

  const receiptNumber = invoice.invoice_number.replace("INV", "RCT");
  const paidDate = new Date().toISOString();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-6 py-3 flex items-center justify-between">
          <DialogTitle className="font-vollkorn text-lg">Payment Receipt</DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Receipt Document */}
          <div className="bg-white text-black rounded-xl shadow-lg overflow-hidden print:shadow-none">
            {/* Accent bar - Emerald for receipt */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />

            <div className="p-8 md:p-10">
              {/* Header */}
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 tracking-tight">RECEIPT</h1>
                  <p className="text-gray-400 mt-1 text-lg font-mono">{receiptNumber}</p>
                </div>
                <div className="text-right">
                  {businessSettings?.logo_url && (
                    <img
                      src={businessSettings.logo_url}
                      alt="Business Logo"
                      className="w-16 h-16 object-contain ml-auto mb-2 rounded-lg"
                    />
                  )}
                  <h2 className="text-xl font-bold text-gray-900">
                    {businessSettings?.business_name || profile?.display_name || profile?.handle || "Your Business"}
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
                  {businessSettings?.tax_id && (
                    <p className="text-gray-400 text-xs mt-1">Tax ID: {businessSettings.tax_id}</p>
                  )}
                </div>
              </div>

              {/* PAID Stamp */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-2.5 px-8 py-3 rounded-full bg-emerald-50 border-2 border-emerald-200">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  <span className="text-emerald-700 font-bold text-lg tracking-widest">PAID</span>
                </div>
              </div>

              {/* Receipt Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-semibold">Received From</p>
                  <p className="font-bold text-gray-900 text-lg">{invoice.client_name}</p>
                  {invoice.client_email && (
                    <p className="text-gray-500 text-sm mt-0.5">{invoice.client_email}</p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-semibold">Invoice Date</p>
                  <p className="font-semibold text-gray-900">{format(new Date(invoice.issue_date), "MMMM d, yyyy")}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-semibold">Payment Date</p>
                  <p className="font-semibold text-gray-900">{format(new Date(), "MMMM d, yyyy")}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-emerald-800">
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
                  <div className="flex justify-between pt-3 border-t-2 border-emerald-800">
                    <span className="text-lg font-bold text-gray-900">Total Paid</span>
                    <span className="text-lg font-bold text-emerald-700">{formatCurrency(Number(invoice.total))}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-emerald-50 rounded-xl p-6 mb-8">
                <p className="text-emerald-800 text-xs uppercase tracking-widest mb-3 font-semibold">Payment Confirmation</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Reference Invoice</p>
                    <p className="font-semibold text-gray-900">{invoice.invoice_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Amount Received</p>
                    <p className="font-semibold text-emerald-700">{formatCurrency(Number(invoice.total))}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Currency</p>
                    <p className="font-semibold text-gray-900">{invoice.currency || "KES"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-semibold text-emerald-700">Payment Complete</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="pt-6 border-t border-gray-100 mb-6">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-semibold">Notes</p>
                  <p className="text-gray-600 text-sm whitespace-pre-line">{invoice.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-10 pt-4 border-t border-gray-100 text-center">
                <p className="text-gray-400 text-sm font-medium">Thank you for your payment!</p>
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

export default ReceiptPreviewDialog;
