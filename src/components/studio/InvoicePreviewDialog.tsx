import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer, Send, CheckCircle2, Clock, AlertCircle, Maximize2, Minimize2, Download, Lock, Palette, X } from "lucide-react";
import { useDownloadPDF } from "@/hooks/use-download-pdf";
import { useSubscription } from "@/hooks/use-subscription";
import { SendDocumentDialog } from "@/components/studio/SendDocumentDialog";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const INVOICE_THEMES = [
  { name: "Crevia Gold",  hex: "#B07D3A", pro: false },
  { name: "Noir",         hex: "#18181B", pro: true  },
  { name: "Cobalt",       hex: "#1E40AF", pro: true  },
  { name: "Emerald",      hex: "#065F46", pro: true  },
  { name: "Amethyst",     hex: "#5B21B6", pro: true  },
  { name: "Crimson",      hex: "#991B1B", pro: true  },
  { name: "Slate",        hex: "#1E293B", pro: true  },
  { name: "Copper",       hex: "#92400E", pro: true  },
  { name: "Rose",         hex: "#9D174D", pro: true  },
  { name: "Teal",         hex: "#0F4C5C", pro: true  },
  { name: "Graphite",     hex: "#374151", pro: true  },
  { name: "Midnight",     hex: "#0C1445", pro: true  },
] as const;

const DEFAULT_COLOR = "#B07D3A";

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

const InvoicePreviewDialog = ({ open, onOpenChange, invoice }: InvoicePreviewDialogProps) => {
  const [items, setItems]                       = useState<InvoiceItem[]>([]);
  const [profile, setProfile]                   = useState<any>(null);
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  const [isFullscreen, setIsFullscreen]         = useState(false);
  const [showSendDialog, setShowSendDialog]     = useState(false);
  const [accentColor, setAccentColor]           = useState(DEFAULT_COLOR);
  const [savingColor, setSavingColor]           = useState(false);
  const [showPalette, setShowPalette]           = useState(false);

  const { isPro, isBrandWorkspace } = useSubscription();
  const isProUser = isPro || isBrandWorkspace;

  const { ref: docRef, download, downloading } = useDownloadPDF(
    invoice ? `Invoice-${invoice.invoice_number}` : "Invoice"
  );

  useEffect(() => {
    if (!invoice) return;
    setAccentColor(invoice.accent_color || DEFAULT_COLOR);
    fetchItems();
    fetchProfile();
    fetchBusinessSettings();
  }, [invoice]);

  const fetchItems = async () => {
    const { data } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoice.id);
    if (data) {
      setItems(data.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        total: Number(item.total),
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

  const handleColorSelect = async (hex: string, isPro: boolean) => {
    if (isPro && !isProUser) {
      toast.error("Pro feature", { description: "Upgrade to Pro to unlock all invoice color themes." });
      return;
    }
    setAccentColor(hex);
    setShowPalette(false);
    setSavingColor(true);
    const { error } = await supabase
      .from("invoices")
      .update({ accent_color: hex } as any)
      .eq("id", invoice.id);
    if (error) toast.error("Couldn't save color", { description: error.message });
    setSavingColor(false);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: invoice?.currency || "KES",
    }).format(amount);

  if (!invoice) return null;

  const statusConfig: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
    draft:     { bg: "bg-gray-100",    text: "text-gray-600",    label: "DRAFT",     icon: <Clock className="h-4 w-4" /> },
    sent:      { bg: "bg-blue-100",    text: "text-blue-700",    label: "SENT",      icon: <Send className="h-4 w-4" /> },
    paid:      { bg: "bg-emerald-100", text: "text-emerald-700", label: "PAID",      icon: <CheckCircle2 className="h-4 w-4" /> },
    overdue:   { bg: "bg-red-100",     text: "text-red-700",     label: "OVERDUE",   icon: <AlertCircle className="h-4 w-4" /> },
    cancelled: { bg: "bg-gray-100",    text: "text-gray-500",    label: "CANCELLED", icon: <Clock className="h-4 w-4" /> },
  };
  const status = statusConfig[invoice.status] || statusConfig.draft;

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  const currentTheme = INVOICE_THEMES.find((t) => t.hex === accentColor) || INVOICE_THEMES[0];
  const businessName = businessSettings?.business_name || profile?.display_name || profile?.handle || "Your Name";

  return (
  <>
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setIsFullscreen(false); setShowPalette(false); } onOpenChange(v); }}>
      {/* Hide shadcn's auto-generated close button — we have our own in the toolbar */}
      <DialogContent className={cn(
        "overflow-hidden p-0 transition-all duration-300 [&>button:last-child]:hidden",
        isFullscreen
          ? "max-w-[100vw] w-screen h-screen max-h-screen rounded-none"
          : "w-[calc(100vw-16px)] sm:max-w-2xl lg:max-w-3xl max-h-[95dvh] sm:max-h-[90vh]"
      )}>

        {/* ── Toolbar ── */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-3 py-2 flex items-center gap-2">
          <DialogTitle className="font-vollkorn text-sm sm:text-base truncate min-w-0 flex-1">
            Invoice Preview
          </DialogTitle>

          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Theme picker */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPalette((v) => !v)}
                className="h-8 w-8 p-0"
                title="Color theme"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-border/40"
                  style={{ background: accentColor }}
                />
              </Button>

              {showPalette && (
                <div className="absolute right-0 top-10 z-50 w-56 rounded-2xl bg-card border border-border shadow-2xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between px-0.5">
                    <p className="text-xs font-semibold text-foreground">Invoice Theme</p>
                    {!isProUser && (
                      <span className="text-[10px] font-bold text-bronze bg-bronze/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Pro
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {INVOICE_THEMES.map((theme) => {
                      const locked = theme.pro && !isProUser;
                      const active = accentColor === theme.hex;
                      return (
                        <button
                          key={theme.hex}
                          title={theme.name}
                          onClick={() => handleColorSelect(theme.hex, theme.pro)}
                          className={cn(
                            "relative w-8 h-8 rounded-xl transition-all duration-150",
                            active ? "ring-2 ring-offset-2 ring-foreground scale-110" : "hover:scale-105",
                            locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                          )}
                          style={{ background: theme.hex }}
                        >
                          {locked && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <Lock className="w-3 h-3 text-white drop-shadow" />
                            </span>
                          )}
                          {active && !locked && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white drop-shadow" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {!isProUser && (
                    <p className="text-[11px] text-muted-foreground text-center pt-1 border-t border-border/50">
                      Upgrade to Pro to unlock all 12 themes
                    </p>
                  )}
                </div>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={() => setShowSendDialog(true)} className="h-8 w-8 p-0" title="Send">
              <Send className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={download} disabled={downloading} className="h-8 w-8 p-0" title="Download">
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="h-8 w-8 p-0 hidden sm:flex" title="Print">
              <Printer className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)} className="h-8 w-8 p-0 hidden sm:flex" title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0" title="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ── Invoice Document ── */}
        <div className="overflow-y-auto max-h-[calc(95dvh-52px)] sm:max-h-[calc(90vh-52px)]">
          <div className="p-3 sm:p-6">
            <div ref={docRef} className="bg-white text-black rounded-xl shadow-lg overflow-hidden print:shadow-none">

              {/* Accent bar */}
              <div className="h-1.5" style={{ background: accentColor }} />

              <div className="p-4 sm:p-8">

                {/* ── Header: INVOICE + business info ── */}
                {/* Mobile: stacked; Desktop: side-by-side */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">INVOICE</h1>
                    <p className="text-gray-400 mt-0.5 text-xs sm:text-base font-mono">{invoice.invoice_number}</p>
                  </div>
                  <div className="sm:text-right">
                    {businessSettings?.logo_url && (
                      <img
                        src={businessSettings.logo_url}
                        alt="Business Logo"
                        className="w-12 h-12 object-contain sm:ml-auto mb-1.5 rounded-lg"
                      />
                    )}
                    <h2 className="text-base font-bold text-gray-900">{businessName}</h2>
                    {(businessSettings?.business_email || profile?.email) && (
                      <p className="text-gray-500 text-xs mt-0.5 break-all">{businessSettings?.business_email || profile?.email}</p>
                    )}
                    {businessSettings?.business_phone && (
                      <p className="text-gray-500 text-xs">{businessSettings.business_phone}</p>
                    )}
                    {businessSettings?.business_address && (
                      <p className="text-gray-500 text-xs whitespace-pre-line mt-0.5">{businessSettings.business_address}</p>
                    )}
                  </div>
                </div>

                {/* ── Bill To + Dates ── */}
                {/* Mobile: Bill To full width, then Issue/Due in 2-col */}
                <div className="mb-6">
                  <div className="mb-4">
                    <p className="text-[10px] uppercase tracking-widest mb-1 font-bold" style={{ color: accentColor }}>
                      Bill To
                    </p>
                    <p className="font-bold text-gray-900 text-sm sm:text-base">{invoice.client_name}</p>
                    {invoice.client_email && <p className="text-gray-500 text-xs mt-0.5 break-all">{invoice.client_email}</p>}
                    {invoice.client_address && <p className="text-gray-500 text-xs whitespace-pre-line mt-0.5">{invoice.client_address}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest mb-1 font-bold" style={{ color: accentColor }}>
                        Issue Date
                      </p>
                      <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                        {format(new Date(invoice.issue_date), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest mb-1 font-bold" style={{ color: accentColor }}>
                        Due Date
                      </p>
                      <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                        {format(new Date(invoice.due_date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── Items ── */}
                {/* Mobile: card list. Desktop: table */}
                <div className="mb-6">
                  {/* Mobile card list */}
                  <div className="sm:hidden">
                    <div className="flex justify-between pb-2 mb-2" style={{ borderBottom: `2px solid ${accentColor}` }}>
                      <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: accentColor }}>Description</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: accentColor }}>Amount</span>
                    </div>
                    {items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="py-3"
                        style={{ borderBottom: `1px solid ${idx === items.length - 1 ? "#e5e7eb" : "#f3f4f6"}` }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-gray-900 font-medium text-sm flex-1 min-w-0">{item.description}</p>
                          <p className="text-gray-900 font-semibold text-sm flex-shrink-0">{formatCurrency(item.total)}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-400 text-xs">{item.quantity} × {formatCurrency(item.unit_price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: `2px solid ${accentColor}` }}>
                          <th className="text-left py-3 text-xs uppercase tracking-wider font-bold" style={{ color: accentColor }}>Description</th>
                          <th className="text-center py-3 text-xs uppercase tracking-wider font-bold w-16" style={{ color: accentColor }}>Qty</th>
                          <th className="text-right py-3 text-xs uppercase tracking-wider font-bold w-28" style={{ color: accentColor }}>Rate</th>
                          <th className="text-right py-3 text-xs uppercase tracking-wider font-bold w-28" style={{ color: accentColor }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, idx) => (
                          <tr
                            key={item.id}
                            className={idx === items.length - 1 ? "border-b border-gray-200" : "border-b border-gray-100"}
                          >
                            <td className="py-3 text-gray-900 font-medium text-sm">{item.description}</td>
                            <td className="py-3 text-center text-gray-600 text-sm">{item.quantity}</td>
                            <td className="py-3 text-right text-gray-600 text-sm">{formatCurrency(item.unit_price)}</td>
                            <td className="py-3 text-right text-gray-900 font-semibold text-sm">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ── Totals ── */}
                <div className="flex justify-end mb-6">
                  <div className="w-full sm:w-64 space-y-1.5">
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
                    <div className="flex justify-between pt-2.5" style={{ borderTop: `2px solid ${accentColor}` }}>
                      <span className="text-base font-bold text-gray-900">Total Due</span>
                      <span className="text-base font-bold" style={{ color: accentColor }}>
                        {formatCurrency(Number(invoice.total))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Status Stamp ── */}
                <div className="flex justify-center mb-6">
                  <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full ${status.bg} ${status.text} font-bold text-xs tracking-widest`}>
                    {status.icon}
                    {status.label}
                  </div>
                </div>

                {/* ── Notes & Terms ── */}
                {(invoice.notes || invoice.terms) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4" style={{ borderTop: `1px solid ${hexToRgba(accentColor, 0.2)}` }}>
                    {invoice.notes && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest mb-1.5 font-bold" style={{ color: accentColor }}>Notes</p>
                        <p className="text-gray-600 text-xs whitespace-pre-line">{invoice.notes}</p>
                      </div>
                    )}
                    {invoice.terms && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest mb-1.5 font-bold" style={{ color: accentColor }}>Payment Terms</p>
                        <p className="text-gray-600 text-xs whitespace-pre-line">{invoice.terms}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Footer ── */}
                <div className="mt-8 pt-3 text-center" style={{ borderTop: `1px solid ${hexToRgba(accentColor, 0.2)}` }}>
                  <p className="text-xs font-medium" style={{ color: accentColor }}>Thank you for your business!</p>
                  <p className="text-gray-300 text-[10px] mt-0.5">
                    Generated with Crevia Studio · {format(new Date(), "yyyy")}
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>

    {invoice && (
      <SendDocumentDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        type="invoice"
        documentId={invoice.id}
        defaultEmail={invoice.client_email || ""}
        documentLabel={`Invoice ${invoice.invoice_number} · ${invoice.client_name}`}
        onSent={() => onOpenChange(false)}
      />
    )}
  </>
  );
};

export default InvoicePreviewDialog;
