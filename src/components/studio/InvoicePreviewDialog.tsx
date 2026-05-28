import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Printer, Send, CheckCircle2, Clock, AlertCircle,
  Maximize2, Minimize2, Download, X, ArrowLeft, Eye,
} from "lucide-react";
import { useDownloadPDF } from "@/hooks/use-download-pdf";
import { useSubscription } from "@/hooks/use-subscription";
import { SendDocumentDialog } from "@/components/studio/SendDocumentDialog";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

/**
 * InvoicePreviewDialog — two view modes:
 *
 *  "main"  → single-flow preview (no page breaks) — default when opening
 *  "print" → paged print-layout (PAGE 1 / PAGE 2) — reached via the print icon
 *
 * In print mode the toolbar swaps to a Back button + Print-to-PDF action.
 */
const InvoicePreviewDialog = ({ open, onOpenChange, invoice }: InvoicePreviewDialogProps) => {
  const [items, setItems]                       = useState<InvoiceItem[]>([]);
  const [profile, setProfile]                   = useState<any>(null);
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  const [isFullscreen, setIsFullscreen]         = useState(false);
  const [showSendDialog, setShowSendDialog]     = useState(false);
  const [accentColor, setAccentColor]           = useState(DEFAULT_COLOR);
  // "main" = new single-flow preview  |  "print" = paged print-layout
  const [viewMode, setViewMode]                 = useState<"main" | "print">("main");

  const { isPro, isBrandWorkspace, isBusiness } = useSubscription();
  const isProUser = isPro || isBrandWorkspace || isBusiness;

  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const hasPage2 = !!(invoice?.notes || invoice?.terms || invoice?.payment_details?.method);

  const { ref: docRef, download, downloading } = useDownloadPDF(
    invoice ? `Invoice-${invoice.invoice_number}` : "Invoice",
    { ignoreElements: (el: Element) => el.classList.contains("print-page-break") }
  );

  // ── Print to PDF (used in print-mode toolbar) ──────────────────────────────
  const handlePrintPDF = async () => {
    try {
      const opts = { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false } as const;
      const M = 12;

      if (hasPage2 && page1Ref.current && page2Ref.current) {
        const [c1, c2] = await Promise.all([
          html2canvas(page1Ref.current, opts),
          html2canvas(page2Ref.current, opts),
        ]);
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const PW  = pdf.internal.pageSize.getWidth();
        const CW  = PW - M * 2;
        pdf.addImage(c1.toDataURL("image/png"), "PNG", M, M, CW, (c1.height / c1.width) * CW);
        pdf.addPage();
        const [r, g, b] = [
          parseInt(accentColor.slice(1, 3), 16),
          parseInt(accentColor.slice(3, 5), 16),
          parseInt(accentColor.slice(5, 7), 16),
        ];
        pdf.setFillColor(r, g, b);
        pdf.rect(0, 0, PW, 3, "F");
        pdf.setFontSize(7);
        pdf.setTextColor(180, 180, 180);
        pdf.text(`Invoice ${invoice?.invoice_number ?? ""} · continued`, PW - M, 10, { align: "right" });
        pdf.addImage(c2.toDataURL("image/png"), "PNG", M, 3 + M, CW, (c2.height / c2.width) * CW);
        window.open(pdf.output("bloburl") as string, "_blank");
      } else if (page1Ref.current) {
        const c   = await html2canvas(page1Ref.current, opts);
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const PW  = pdf.internal.pageSize.getWidth();
        const CW  = PW - M * 2;
        pdf.addImage(c.toDataURL("image/png"), "PNG", M, M, CW, (c.height / c.width) * CW);
        window.open(pdf.output("bloburl") as string, "_blank");
      }
    } catch {
      toast.error("Could not prepare print preview");
    }
  };

  useEffect(() => {
    if (!invoice) return;
    setAccentColor(invoice.accent_color || DEFAULT_COLOR);
    setViewMode("main"); // always open in main preview
    fetchItems();
    fetchProfile();
    fetchBusinessSettings();
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

  const businessName = businessSettings?.business_name || profile?.display_name || profile?.handle || "Your Name";

  // ── Shared sub-components ──────────────────────────────────────────────────

  /** Top accent bar */
  const AccentBar = () => <div className="h-1.5" style={{ background: accentColor }} />;

  /** Header: INVOICE label + optional logo */
  const InvoiceHeader = () => (
    <div className="flex justify-between items-start gap-3 mb-2">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">INVOICE</h1>
      {businessSettings?.logo_url && (
        <img src={businessSettings.logo_url} alt="Business Logo" className="w-12 h-12 object-contain rounded-lg flex-shrink-0" />
      )}
    </div>
  );

  /** Invoice number + sender business block */
  const BusinessBlock = () => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
      <p className="text-gray-400 text-xs sm:text-base font-mono">{invoice.invoice_number}</p>
      <div className="sm:text-right">
        <h2 className="text-base font-bold text-gray-900">{businessName}</h2>
        {(businessSettings?.business_email || profile?.email) && (
          <p className="text-gray-500 text-xs mt-0.5 break-all">{businessSettings?.business_email || profile?.email}</p>
        )}
        {businessSettings?.business_phone && <p className="text-gray-500 text-xs">{businessSettings.business_phone}</p>}
        {businessSettings?.business_address && (
          <p className="text-gray-500 text-xs whitespace-pre-line mt-0.5">{businessSettings.business_address}</p>
        )}
      </div>
    </div>
  );

  /** Bill To + Issue/Due dates */
  const BillToSection = () => (
    <div className="mb-6">
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-widest mb-1 font-bold" style={{ color: accentColor }}>Bill To</p>
        <p className="font-bold text-gray-900 text-sm sm:text-base">{invoice.client_name}</p>
        {invoice.client_email && <p className="text-gray-500 text-xs mt-0.5 break-all">{invoice.client_email}</p>}
        {invoice.client_address && <p className="text-gray-500 text-xs whitespace-pre-line mt-0.5">{invoice.client_address}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest mb-1 font-bold" style={{ color: accentColor }}>Issue Date</p>
          <p className="font-semibold text-gray-900 text-xs sm:text-sm">{format(new Date(invoice.issue_date), "MMM d, yyyy")}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest mb-1 font-bold" style={{ color: accentColor }}>Due Date</p>
          <p className="font-semibold text-gray-900 text-xs sm:text-sm">{format(new Date(invoice.due_date), "MMM d, yyyy")}</p>
        </div>
      </div>
    </div>
  );

  /** Line items — mobile cards + desktop table */
  const ItemsSection = () => (
    <div className="mb-6">
      {/* Mobile */}
      <div className="sm:hidden">
        <div className="flex justify-between pb-2 mb-2" style={{ borderBottom: `2px solid ${accentColor}` }}>
          <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: accentColor }}>Description</span>
          <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: accentColor }}>Amount</span>
        </div>
        {items.map((item, idx) => (
          <div key={item.id} className="py-3" style={{ borderBottom: `1px solid ${idx === items.length - 1 ? "#e5e7eb" : "#f3f4f6"}` }}>
            <div className="flex justify-between items-start gap-2">
              <p className="text-gray-900 font-medium text-sm flex-1 min-w-0">{item.description}</p>
              <p className="text-gray-900 font-semibold text-sm flex-shrink-0">{formatCurrency(item.total)}</p>
            </div>
            <p className="text-gray-400 text-xs mt-1">{item.quantity} × {formatCurrency(item.unit_price)}</p>
          </div>
        ))}
      </div>
      {/* Desktop */}
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
              <tr key={item.id} className={idx === items.length - 1 ? "border-b border-gray-200" : "border-b border-gray-100"}>
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
  );

  /** Subtotal / tax / discount / total */
  const TotalsSection = () => (
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
          <span className="text-base font-bold" style={{ color: accentColor }}>{formatCurrency(Number(invoice.total))}</span>
        </div>
      </div>
    </div>
  );

  /** Status badge (PAID / SENT / etc.) */
  const StatusStamp = () => (
    <div className="flex justify-center mb-6">
      <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full ${status.bg} ${status.text} font-bold text-xs tracking-widest`}>
        {status.icon}{status.label}
      </div>
    </div>
  );

  /** Notes + Terms block */
  const NotesTermsSection = ({ className = "" }: { className?: string }) => {
    if (!invoice.notes && !invoice.terms) return null;
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4", className)}
           style={{ borderTop: `1px solid ${hexToRgba(accentColor, 0.2)}` }}>
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
    );
  };

  /** Payment details card */
  const PaymentDetailsSection = ({ className = "" }: { className?: string }) => {
    if (!invoice.payment_details?.method) return null;
    const pd = invoice.payment_details as {
      method?: string; accountName?: string; bankName?: string;
      accountNumber?: string; branchCode?: string; reference?: string; instructions?: string;
    };
    const fieldLabels: Record<string, string> = {
      "Bank Transfer": JSON.stringify({ accountName: "Account Name", bankName: "Bank Name", accountNumber: "Account Number", branchCode: "Branch / SWIFT", reference: "Reference" }),
      "M-Pesa":        JSON.stringify({ accountName: "Business Name", accountNumber: "Till / Paybill / Phone", reference: "Reference" }),
    };
    const labels: Record<string, string> = JSON.parse(fieldLabels[pd.method ?? ""] || "{}");
    const rows = (Object.keys(labels) as Array<keyof typeof pd>).filter(k => pd[k]).map(k => ({ label: labels[k as string], value: pd[k] as string }));
    return (
      <div className={cn("mt-6 rounded-xl overflow-hidden", className)} style={{ border: `1px solid ${hexToRgba(accentColor, 0.25)}` }}>
        <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: hexToRgba(accentColor, 0.08), borderBottom: `1px solid ${hexToRgba(accentColor, 0.2)}` }}>
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: accentColor }}>
            <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
          </svg>
          <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: accentColor }}>Payment Details</p>
          <span className="text-[10px] text-gray-500 ml-auto font-medium">Pay via {pd.method}</span>
        </div>
        <div className="px-4 py-3">
          {rows.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-2">
              {rows.map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">{label}</p>
                  <p className="text-gray-900 text-xs font-semibold break-all">{value}</p>
                </div>
              ))}
            </div>
          )}
          {pd.instructions && (
            <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${hexToRgba(accentColor, 0.15)}` }}>
              <p className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Instructions</p>
              <p className="text-gray-600 text-xs whitespace-pre-line">{pd.instructions}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  /** Footer + optional watermark */
  const Footer = () => (
    <>
      <div className="mt-8 pt-3 text-center" style={{ borderTop: `1px solid ${hexToRgba(accentColor, 0.2)}` }}>
        <p className="text-xs font-medium" style={{ color: accentColor }}>Thank you for your business!</p>
        <p className="text-gray-300 text-[10px] mt-0.5">Generated with Crevia Studio · {format(new Date(), "yyyy")}</p>
      </div>
      {!isProUser && (
        <div className="mt-4 -mx-8 -mb-8 px-6 py-2 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-300 font-medium tracking-wide">Powered by Crevia</p>
        </div>
      )}
    </>
  );

  // ── MAIN PREVIEW — single flowing document, no page breaks ─────────────────
  const MainPreview = () => (
    <div ref={docRef} className="invoice-print-area bg-white text-black rounded-xl shadow-lg overflow-hidden">
      <AccentBar />
      <div className="p-4 sm:p-8">
        <InvoiceHeader />
        <BusinessBlock />
        <BillToSection />
        <ItemsSection />
        <TotalsSection />
        <StatusStamp />
        {/* Notes, terms, payment details all flow inline — no page break */}
        {hasPage2 && (
          <div className="mt-2">
            <NotesTermsSection />
            <PaymentDetailsSection />
          </div>
        )}
        <Footer />
      </div>
    </div>
  );

  // ── PRINT PREVIEW — paged layout (PAGE 1 + divider + PAGE 2) ──────────────
  const PrintPreview = () => (
    <div className="invoice-print-area bg-white text-black rounded-xl shadow-lg overflow-hidden">
      {/* PAGE 1 */}
      <div ref={page1Ref} className="bg-white">
        <AccentBar />
        <div className="p-4 sm:p-8">
          <InvoiceHeader />
          <BusinessBlock />
          <BillToSection />
          <ItemsSection />
          <TotalsSection />
          <StatusStamp />
          {!hasPage2 && <Footer />}
        </div>
      </div>

      {/* Page break indicator */}
      {hasPage2 && (
        <div className="print-page-break flex items-center gap-2 px-6 py-2.5 bg-gray-50 border-y border-gray-100">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.18em] select-none px-2">Page 2</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      )}

      {/* PAGE 2 */}
      {hasPage2 && (
        <div ref={page2Ref} className="bg-white">
          <div className="p-4 sm:p-8 pt-6 sm:pt-8">
            <NotesTermsSection />
            <PaymentDetailsSection />
            <Footer />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) { setIsFullscreen(false); setViewMode("main"); } onOpenChange(v); }}>
        <DialogContent className={cn(
          "overflow-hidden p-0 transition-all duration-300 [&>button:last-child]:hidden",
          isFullscreen
            ? "max-w-[100vw] w-screen h-screen max-h-screen rounded-none"
            : "w-[calc(100vw-16px)] sm:max-w-2xl lg:max-w-3xl max-h-[95dvh] sm:max-h-[90vh]"
        )}>

          {/* ── Toolbar ─────────────────────────────────────────────────────── */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-3 py-2 flex items-center gap-2">

            {viewMode === "main" ? (
              /* ── Main mode toolbar ── */
              <>
                <DialogTitle className="font-vollkorn text-sm sm:text-base truncate min-w-0 flex-1">
                  Invoice Preview
                </DialogTitle>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setShowSendDialog(true)} className="h-8 w-8 p-0" title="Send">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={download} disabled={downloading} className="h-8 w-8 p-0" title="Download PDF">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  {/* Print icon → switches to paged print-layout */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode("print")}
                    className="h-8 w-8 p-0"
                    title="Print preview (paged layout)"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)} className="h-8 w-8 p-0 hidden sm:flex" title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
                    {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0" title="Close">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              /* ── Print-preview mode toolbar ── */
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("main")}
                  className="h-8 px-2 gap-1.5 text-xs font-medium flex-shrink-0"
                  title="Back to preview"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Preview</span>
                </Button>
                <DialogTitle className="font-vollkorn text-sm sm:text-base truncate min-w-0 flex-1 flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  Print Layout
                </DialogTitle>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handlePrintPDF}
                    className="h-8 gap-1.5 px-3 text-xs font-semibold"
                    title="Open print-ready PDF"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Print / Save PDF</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0" title="Close">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* ── Document area ───────────────────────────────────────────────── */}
          <div className="overflow-y-auto max-h-[calc(95dvh-52px)] sm:max-h-[calc(90vh-52px)]">
            <div className="p-3 sm:p-6">
              {viewMode === "main" ? <MainPreview /> : <PrintPreview />}
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
