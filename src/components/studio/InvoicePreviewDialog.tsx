import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Send, Printer } from "lucide-react";
import { format } from "date-fns";

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

  useEffect(() => {
    if (invoice) {
      fetchItems();
      fetchProfile();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="font-vollkorn text-xl">Invoice Preview</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Invoice Preview */}
        <div className="bg-white text-black p-8 rounded-lg shadow-inner print:shadow-none">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
              <p className="text-gray-600 mt-1">{invoice.invoice_number}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold text-gray-900">
                {profile?.display_name || profile?.handle || "Your Name"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">{profile?.email}</p>
            </div>
          </div>

          {/* Bill To & Dates */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-gray-500 text-sm mb-1">BILL TO</p>
              <p className="font-semibold text-gray-900">{invoice.client_name}</p>
              {invoice.client_email && (
                <p className="text-gray-600 text-sm">{invoice.client_email}</p>
              )}
              {invoice.client_address && (
                <p className="text-gray-600 text-sm whitespace-pre-line">
                  {invoice.client_address}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="mb-2">
                <p className="text-gray-500 text-sm">Issue Date</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(invoice.issue_date), "MMMM d, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Due Date</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(invoice.due_date), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 text-gray-600 font-medium">Description</th>
                  <th className="text-center py-3 text-gray-600 font-medium">Qty</th>
                  <th className="text-right py-3 text-gray-600 font-medium">Unit Price</th>
                  <th className="text-right py-3 text-gray-600 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-4 text-gray-900">{item.description}</td>
                    <td className="py-4 text-center text-gray-700">{item.quantity}</td>
                    <td className="py-4 text-right text-gray-700">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="py-4 text-right text-gray-900 font-medium">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(Number(invoice.subtotal))}</span>
              </div>
              {Number(invoice.tax_rate) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({invoice.tax_rate}%)</span>
                  <span>{formatCurrency(Number(invoice.tax_amount))}</span>
                </div>
              )}
              {Number(invoice.discount_amount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(Number(invoice.discount_amount))}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t-2 border-gray-200">
                <span>Total</span>
                <span>{formatCurrency(Number(invoice.total))}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-8 flex justify-center">
            <div
              className={`px-6 py-2 rounded-full text-sm font-medium uppercase tracking-wide ${
                invoice.status === "paid"
                  ? "bg-green-100 text-green-700"
                  : invoice.status === "overdue"
                  ? "bg-red-100 text-red-700"
                  : invoice.status === "sent"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {invoice.status}
            </div>
          </div>

          {/* Notes & Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-2 gap-8">
              {invoice.notes && (
                <div>
                  <p className="text-gray-500 text-sm mb-2">Notes</p>
                  <p className="text-gray-700 text-sm whitespace-pre-line">
                    {invoice.notes}
                  </p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <p className="text-gray-500 text-sm mb-2">Payment Terms</p>
                  <p className="text-gray-700 text-sm whitespace-pre-line">
                    {invoice.terms}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm">
              Thank you for your business!
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Generated with Crevia Studio
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreviewDialog;
