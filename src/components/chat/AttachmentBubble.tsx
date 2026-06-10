import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Receipt, FileSignature, ExternalLink, Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import InvoicePreviewDialog from "@/components/studio/InvoicePreviewDialog";

interface AttachmentBubbleProps {
  type: "invoice" | "contract";
  attachmentId: string;
  isMine: boolean;
}

const INVOICE_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft:   { label: "Draft",   color: "text-muted-foreground", icon: Clock },
  unpaid:  { label: "Unpaid",  color: "text-orange-500",       icon: AlertCircle },
  partial: { label: "Partial", color: "text-yellow-500",       icon: Clock },
  paid:    { label: "Paid",    color: "text-emerald-500",      icon: CheckCircle2 },
};

const CONTRACT_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft:     { label: "Draft",     color: "text-muted-foreground", icon: Clock },
  sent:      { label: "Sent",      color: "text-blue-500",         icon: Clock },
  signed:    { label: "Signed",    color: "text-emerald-500",      icon: CheckCircle2 },
  active:    { label: "Active",    color: "text-emerald-500",      icon: CheckCircle2 },
  completed: { label: "Completed", color: "text-emerald-600",      icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "text-destructive",      icon: AlertCircle },
};

export default function AttachmentBubble({ type, attachmentId, isMine }: AttachmentBubbleProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleOpen = async () => {
    if (data) { setPreviewOpen(true); return; }
    setLoading(true);
    try {
      if (type === "invoice") {
        const { data: inv } = await supabase
          .from("invoices")
          .select("*")
          .eq("id", attachmentId)
          .single();
        setData(inv);
      } else {
        const { data: contract } = await supabase
          .from("canvases")
          .select("*")
          .eq("id", attachmentId)
          .single();
        setData(contract);
      }
    } finally {
      setLoading(false);
      setPreviewOpen(true);
    }
  };

  const isInvoice = type === "invoice";
  const Icon = isInvoice ? Receipt : FileSignature;
  const label = isInvoice ? "Invoice" : "Canvas";

  const statusMap = isInvoice ? INVOICE_STATUS_CONFIG : CONTRACT_STATUS_CONFIG;
  const statusCfg = data ? (statusMap[data.status] ?? statusMap.draft) : null;
  const StatusIcon = statusCfg?.icon ?? Clock;

  const formatAmount = (amount: number | null, currency = "KES") => {
    if (!amount) return null;
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={loading}
        className={cn(
          "group w-full text-left rounded-xl border overflow-hidden transition-all duration-200 focus:outline-none",
          isMine
            ? "border-background/25 bg-background/10 hover:bg-background/20 focus:ring-2 focus:ring-background/30"
            : "border-bronze/25 bg-bronze/5 hover:bg-bronze/10 hover:border-bronze/40 focus:ring-2 focus:ring-bronze/30"
        )}
      >
        <div className="flex items-center gap-3 px-3 py-2.5">
          {/* Icon */}
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
            isMine ? "bg-background/20" : "bg-bronze/15"
          )}>
            <Icon className={cn("w-4 h-4", isMine ? "text-background/80" : "text-bronze")} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-xs font-semibold leading-tight truncate",
              isMine ? "text-background/90" : "text-foreground"
            )}>
              {data
                ? isInvoice
                  ? `Invoice ${data.invoice_number ?? "#"} · ${data.client_name}`
                  : data.title
                : `${label} Attached`}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {statusCfg && (
                <>
                  <StatusIcon className={cn("w-2.5 h-2.5 flex-shrink-0", isMine ? "opacity-70" : statusCfg.color)} />
                  <span className={cn(
                    "text-[10px] font-medium",
                    isMine ? "text-background/60" : statusCfg.color
                  )}>
                    {statusCfg.label}
                  </span>
                  {isInvoice && data?.total && (
                    <>
                      <span className={cn("text-[10px]", isMine ? "text-background/40" : "text-muted-foreground/50")}>·</span>
                      <span className={cn("text-[10px] font-semibold", isMine ? "text-background/70" : "text-foreground/80")}>
                        {formatAmount(data.total, data.currency)}
                      </span>
                    </>
                  )}
                  {!isInvoice && data?.value && (
                    <>
                      <span className={cn("text-[10px]", isMine ? "text-background/40" : "text-muted-foreground/50")}>·</span>
                      <span className={cn("text-[10px] font-semibold", isMine ? "text-background/70" : "text-foreground/80")}>
                        {formatAmount(data.value, data.currency)}
                      </span>
                    </>
                  )}
                </>
              )}
              {!statusCfg && (
                <span className={cn("text-[10px]", isMine ? "text-background/50" : "text-muted-foreground")}>
                  Tap to view
                </span>
              )}
            </div>
          </div>

          {/* Action indicator */}
          {loading ? (
            <Loader2 className={cn(
              "w-3.5 h-3.5 animate-spin flex-shrink-0",
              isMine ? "text-background/50" : "text-bronze/60"
            )} />
          ) : (
            <ExternalLink className={cn(
              "w-3.5 h-3.5 flex-shrink-0 transition-opacity opacity-0 group-hover:opacity-100",
              isMine ? "text-background/60" : "text-bronze/60"
            )} />
          )}
        </div>
      </button>

      {/* Preview dialogs — only mount when data is loaded */}
      {data && type === "invoice" && (
        <InvoicePreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          invoice={data}
        />
      )}
    </>
  );
}
