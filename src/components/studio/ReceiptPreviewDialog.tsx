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
import { useDownloadPDF } from "@/hooks/use-download-pdf";

const DEFAULT_COLOR = "#B07D3A";

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

const ReceiptPreviewDialog = ({ open, onOpenChange, invoice }: ReceiptPreviewDialogProps) => {
  const [items, setItems]                       = useState<ReceiptItem[]>([]);
  const [profile, setProfile]                   = useState<any>(null);
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  const [accentColor, setAccentColor]           = useState(DEFAULT_COLOR);

  const { ref: docRef, download, downloading } = useDownloadPDF(
    invoice ? `Receipt-${invoice.invoice_number?.replace("INV", "RCT") ?? ""}` : "Receipt"
  );

  useEffect(() => {
    if (invoice) {
      setAccentColor(invoice.accent_color || DEFAULT_COLOR);
      fetchItems();
      fetchProfile();
      fetchBusinessSettings();
    }
  }, [invoice]);

  const fetchItems = async () => {
    const { data } = await supabase.from("invoice_items").select("*").eq("invoice_id", invoice.id);
    if (data) {
      setItems(data.map((item) => ({
        id: item.id, description: item.description,
        quantity: Number(item.quantity), unit_price: Number(item.unit_price), total: Number(item.total),
      })));
    }
  };

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      setProfile(data);
    }
  };

  const fetchBusinessSettings = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase.from("business_settings").select("*").eq("user_id", session.user.id).maybeSingle();
      setBusinessSettings(data);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: invoice?.currency || "KES" }).format(amount);

  const handlePrint = () => window.print();

  /** Convert hex accent to rgba for subtle tints */
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  if (!invoice) return null;

  const receiptNumber = invoice.invoice_number?.replace("INV", "RCT") ?? invoice.invoice_number;
  const businessName  = businessSettings?.business_name || profile?.display_name || profile?.handle || "Your Business";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 [&>button:last-child]:hidden">

        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          <DialogTitle className="font-vollkorn text-base sm:text-lg truncate min-w-0">Payment Receipt</DialogTitle>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={download} disabled={downloading} className="h-8 gap-1.5 px-2.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 gap-1.5 px-2.5 text-xs">
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Print</span>
            </Button>
          </div>
        </div>

        {/* ── Receipt Document ─────────────────────────────────────────────── */}
        <div className="p-4 sm:p-6">
          <div ref={docRef} className="bg-white text-black rounded-xl shadow-lg overflow-hidden print:shadow-none">

            {/* Accent bar — uses invoice's accent color (user's customization) */}
            <div className="h-1.5" style={{ background: accentColor }} />

            <div className="p-6 sm:p-8 md:p-10">

              {/* ── Header ── */}
              <div className="flex justify-between items-start mb-8 sm:mb-10">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">RECEIPT</h1>
                  <p className="text-gray-400 mt-1 text-base sm:text-lg font-mono">{receiptNumber}</p>
                </div>
                <div className="text-right">
                  {businessSettings?.logo_url && (
                    <img
                      src={businessSettings.logo_url}
                      alt="Business Logo"
                      className="w-14 h-14 sm:w-16 sm:h-16 object-contain ml-auto mb-2 rounded-lg"
                    />
                  )}
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">{businessName}</h2>
                  {(businessSettings?.business_email || profile?.email) && (
                    <p className="text-gray-500 text-sm mt-0.5 break-all">{businessSettings?.business_email || profile?.email}</p>
                  )}
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

              {/* ── PAID Stamp — uses accent color ── */}
              <div className="flex justify-center mb-6 sm:mb-8">
                <div
                  className="inline-flex items-center gap-2.5 px-8 py-3 rounded-full"
                  style={{
                    background: hexToRgba(accentColor, 0.08),
                    border: `2px solid ${hexToRgba(accentColor, 0.3)}`,
                  }}
                >
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: accentColor }} />
                  <span className="font-bold text-base sm:text-lg tracking-widest" style={{ color: accentColor }}>PAID</span>
                </div>
              </div>

              {/* ── Receipt meta ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-semibold">Received From</p>
                  <p className="font-bold text-gray-900 text-base sm:text-lg">{invoice.client_name}</p>
                  {invoice.client_email && <p className="text-gray-500 text-sm mt-0.5 break-all">{invoice.client_email}</p>}
                </div>
                <div className="sm:text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-semibold">Invoice Date</p>
                  <p className="font-semibold text-gray-900">{format(new Date(invoice.issue_date), "MMMM d, yyyy")}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-semibold">Payment Date</p>
                  <p className="font-semibold text-gray-900">{format(new Date(), "MMMM d, yyyy")}</p>
                </div>
              </div>

              {/* ── Items Table ── */}
              <div className="mb-6 sm:mb-8 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${accentColor}` }}>
                      <th className="text-left py-3 text-xs uppercase tracking-wider font-bold" style={{ color: accentColor }}>Description</th>
                      <th className="text-center py-3 text-xs uppercase tracking-wider font-bold w-20" style={{ color: accentColor }}>Qty</th>
                      <th className="text-right py-3 text-xs uppercase tracking-wider font-bold w-32" style={{ color: accentColor }}>Rate</th>
                      <th className="text-right py-3 text-xs uppercase tracking-wider font-bold w-32" style={{ color: accentColor }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id} className={`border-b ${idx === items.length - 1 ? "border-gray-200" : "border-gray-100"}`}>
                        <td className="py-3 sm:py-4 text-gray-900 font-medium text-sm">{item.description}</td>
                        <td className="py-3 sm:py-4 text-center text-gray-600 text-sm">{item.quantity}</td>
                        <td className="py-3 sm:py-4 text-right text-gray-600 text-sm">{formatCurrency(item.unit_price)}</td>
                        <td className="py-3 sm:py-4 text-right text-gray-900 font-semibold text-sm">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Totals ── */}
              <div className="flex justify-end mb-6 sm:mb-8">
                <div className="w-full sm:w-72 space-y-2">
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
                    <div className="flex justify-between text-sm" style={{ color: accentColor }}>
                      <span>Discount</span>
                      <span className="font-medium">-{formatCurrency(Number(invoice.discount_amount))}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3" style={{ borderTop: `2px solid ${accentColor}` }}>
                    <span className="text-lg font-bold text-gray-900">Total Paid</span>
                    <span className="text-lg font-bold" style={{ color: accentColor }}>{formatCurrency(Number(invoice.total))}</span>
                  </div>
                </div>
              </div>

              {/* ── Payment Confirmation box — uses accent color ── */}
              <div
                className="rounded-xl p-5 sm:p-6 mb-6 sm:mb-8"
                style={{ background: hexToRgba(accentColor, 0.06), border: `1px solid ${hexToRgba(accentColor, 0.2)}` }}
              >
                <p className="text-xs uppercase tracking-widest mb-3 font-semibold" style={{ color: accentColor }}>
                  Payment Confirmation
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Reference Invoice</p>
                    <p className="font-semibold text-gray-900">{invoice.invoice_number}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Amount Received</p>
                    <p className="font-semibold" style={{ color: accentColor }}>{formatCurrency(Number(invoice.total))}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Currency</p>
                    <p className="font-semibold text-gray-900">{invoice.currency || "KES"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="font-semibold" style={{ color: accentColor }}>Payment Complete</p>
                  </div>
                </div>
              </div>

              {/* ── Notes ── */}
              {invoice.notes && (
                <div className="pt-4 sm:pt-6 border-t border-gray-100 mb-4 sm:mb-6">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-semibold">Notes</p>
                  <p className="text-gray-600 text-sm whitespace-pre-line">{invoice.notes}</p>
                </div>
              )}

              {/* ── Footer ── */}
              <div className="mt-8 sm:mt-10 pt-4 border-t border-gray-100 text-center">
                <p className="text-sm font-medium" style={{ color: accentColor }}>Thank you for your payment!</p>
                <p className="text-gray-300 text-xs mt-1">Generated with Crevia Studio · {format(new Date(), "yyyy")}</p>
              </div>

            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default ReceiptPreviewDialog;
