import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer, Send, CheckCircle2, Clock, AlertCircle, Maximize2, Minimize2, Download, Lock, Palette } from "lucide-react";
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
  const [items, setItems]                     = useState<InvoiceItem[]>([]);
  const [profile, setProfile]                 = useState<any>(null);
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  const [isFullscreen, setIsFullscreen]       = useState(false);
  const [showSendDialog, setShowSendDialog]   = useState(false);
  const [accentColor, setAccentColor]         = useState(DEFAULT_COLOR);
  const [savingColor, setSavingColor]         = useState(false);
  const [showPalette, setShowPalette]         = useState(false);

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

  // Hex → rgba helper for subtle tints
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  const currentTheme = INVOICE_THEMES.find((t) => t.hex === accentColor) || INVOICE_THEMES[0];

  return (
  <>
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setIsFullscreen(false); setShowPalette(false); } onOpenChange(v); }}>
      <DialogContent className={cn(
        "overflow-y-auto p-0 transition-all duration-300",
        isFullscreen
          ? "max-w-[100vw] w-screen h-screen max-h-screen rounded-none"
          : "max-w-3xl max-h-[90vh]"
      )}>

        {/* ── Toolbar ── */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-2.5 flex items-center justify-between gap-2">
          <DialogTitle className="font-vollkorn text-base sm:text-lg truncate min-w-0">
            Invoice Preview
          </DialogTitle>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Theme picker */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPalette((v) => !v)}
                className="gap-1.5 h-8 px-2.5"
                title="Color theme"
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 border border-white/20"
                  style={{ background: accentColor }}
                />
                <Palette className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">{currentTheme.name}</span>
                {savingColor && <span className="ml-1 h-2.5 w-2.5 rounded-full border-2 border-muted-foreground border-t-foreground animate-spin" />}
              </Button>

              {showPalette && (
                <div className="absolute right-0 top-10 z-50 w-64 rounded-2xl bg-card border border-border shadow-2xl p-3 space-y-2.5">
                  <div className="flex items-center justify-between px-0.5">
                    <p className="text-xs font-semibold text-foreground font-poppins">Invoice Theme</p>
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

            {invoice.status !== "paid" && (
              <Button variant="outline" size="sm" onClick={() => setShowSendDialog(true)} className="gap-1.5 h-8 px-2.5">
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={download} disabled={downloading} className="gap-1.5 h-8 px-2.5">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{downloading ? "Saving…" : "Download"}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 h-8 px-2.5">
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)} className="gap-1.5 h-8 px-2.5">
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span>
            </Button>
          </div>
        </div>

        {/* ── Invoice Document ── */}
        <div className="p-6">
          <div ref={docRef} className="bg-white text-black rounded-xl shadow-lg overflow-hidden print:shadow-none">

            {/* Accent bar */}
            <div className="h-2" style={{ background: accentColor }} />

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
                  <p className="text-gray-500 text-sm mt-1">{businessSettings?.business_email || profile?.email}</p>
                  {businessSettings?.business_phone && (
                    <p className="text-gray-500 text-sm">{businessSettings.business_phone}</p>
                  )}
                  {businessSettings?.business_address && (
                    <p className="text-gray-500 text-sm whitespace-pre-line mt-1">{businessSettings.business_address}</p>
                  )}
                </div>
              </div>

              {/* Bill To / Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="md:col-span-1">
                  <p className="text-xs uppercase tracking-widest mb-2 font-bold" style={{ color: accentColor }}>
                    Bill To
                  </p>
                  <p className="font-bold text-gray-900 text-lg">{invoice.client_name}</p>
                  {invoice.client_email && <p className="text-gray-500 text-sm mt-0.5">{invoice.client_email}</p>}
                  {invoice.client_address && <p className="text-gray-500 text-sm whitespace-pre-line mt-1">{invoice.client_address}</p>}
                </div>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-widest mb-2 font-bold" style={{ color: accentColor }}>
                    Issue Date
                  </p>
                  <p className="font-semibold text-gray-900">{format(new Date(invoice.issue_date), "MMMM d, yyyy")}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest mb-2 font-bold" style={{ color: accentColor }}>
                    Due Date
                  </p>
                  <p className="font-semibold text-gray-900">{format(new Date(invoice.due_date), "MMMM d, yyyy")}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8 overflow-x-auto">
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
                      <tr
                        key={item.id}
                        className={idx === items.length - 1 ? "border-b border-gray-200" : "border-b border-gray-100"}
                      >
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
                  <div className="flex justify-between pt-3" style={{ borderTop: `2px solid ${accentColor}` }}>
                    <span className="text-lg font-bold text-gray-900">Total Due</span>
                    <span className="text-lg font-bold" style={{ color: accentColor }}>
                      {formatCurrency(Number(invoice.total))}
                    </span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6" style={{ borderTop: `1px solid ${hexToRgba(accentColor, 0.2)}` }}>
                  {invoice.notes && (
                    <div>
                      <p className="text-xs uppercase tracking-widest mb-2 font-bold" style={{ color: accentColor }}>Notes</p>
                      <p className="text-gray-600 text-sm whitespace-pre-line">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice.terms && (
                    <div>
                      <p className="text-xs uppercase tracking-widest mb-2 font-bold" style={{ color: accentColor }}>Payment Terms</p>
                      <p className="text-gray-600 text-sm whitespace-pre-line">{invoice.terms}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="mt-10 pt-4 text-center" style={{ borderTop: `1px solid ${hexToRgba(accentColor, 0.2)}` }}>
                <p className="text-sm font-medium" style={{ color: accentColor }}>Thank you for your business!</p>
                <p className="text-gray-300 text-xs mt-1">
                  Generated with Crevia Studio • {format(new Date(), "yyyy")}
                </p>
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
