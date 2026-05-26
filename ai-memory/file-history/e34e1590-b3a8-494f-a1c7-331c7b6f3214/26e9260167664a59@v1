import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  FileText, 
  Send, 
  Eye,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Receipt,
  Copy,
  Filter,
  ArrowUpDown,
  TrendingUp,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { format, isAfter } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreateInvoiceDialog from "./CreateInvoiceDialog";
import { useSubscription } from "@/hooks/use-subscription";
import InvoicePreviewDialog from "./InvoicePreviewDialog";
import ReceiptPreviewDialog from "./ReceiptPreviewDialog";

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string | null;
  issue_date: string;
  due_date: string;
  status: string;
  subtotal: number;
  total: number;
  currency: string;
  created_at: string;
}

const SmartInvoicesTab = ({ workspaceId }: { workspaceId?: string } = {}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount">("newest");
  const { limits, isFree } = useSubscription();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null);
  const [businessSettings, setBusinessSettings] = useState<{
    business_name: string;
    business_email: string;
    business_phone: string;
    business_address: string;
    logo_url: string;
    tax_id: string;
    default_currency: string;
    default_tax_rate: number;
    default_payment_terms: string;
  } | null>(null);

  const fetchInvoices = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (workspaceId) {
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("invoice_id")
        .eq("room_id", workspaceId)
        .not("invoice_id", "is", null);
      const ids = [...new Set((msgs || []).map((m: any) => m.invoice_id).filter(Boolean))];
      if (ids.length === 0) { setInvoices([]); setLoading(false); return; }
      const { data, error } = await supabase.from("invoices").select("*").in("id", ids).order("created_at", { ascending: false });
      if (error) { toast.error("Failed to load invoices"); return; }
      const now = new Date();
      setInvoices((data || []).map((inv: any) => inv.status === "sent" && isAfter(now, new Date(inv.due_date)) ? { ...inv, status: "overdue" } : inv));
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load invoices");
      return;
    }

    // Auto-mark overdue invoices
    const now = new Date();
    const updated = (data || []).map(inv => {
      if (inv.status === "sent" && isAfter(now, new Date(inv.due_date))) {
        return { ...inv, status: "overdue" };
      }
      return inv;
    });

    setInvoices(updated);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
    fetchBusinessSettings();
  }, [workspaceId]);

  const fetchBusinessSettings = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await supabase
      .from("business_settings")
      .select("business_name, business_email, business_phone, business_address, logo_url, tax_id, default_currency, default_tax_rate, default_payment_terms")
      .eq("user_id", session.user.id)
      .single();
    if (data) setBusinessSettings(data as any);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete invoice");
      return;
    }
    toast.success("Invoice deleted");
    fetchInvoices();
  };

  const handleDuplicate = async (invoice: Invoice) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Get items for the invoice
    const { data: items } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoice.id);

    const date = new Date();
    const invNum = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

    const { data: newInvoice, error } = await supabase
      .from("invoices")
      .insert({
        user_id: session.user.id,
        invoice_number: invNum,
        client_name: invoice.client_name,
        client_email: invoice.client_email,
        issue_date: new Date().toISOString().split("T")[0],
        due_date: invoice.due_date,
        currency: invoice.currency,
        subtotal: invoice.subtotal,
        total: invoice.total,
        status: "draft",
      })
      .select()
      .single();

    if (error || !newInvoice) {
      toast.error("Failed to duplicate invoice");
      return;
    }

    if (items && items.length > 0) {
      await supabase.from("invoice_items").insert(
        items.map((item) => ({
          invoice_id: newInvoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
        }))
      );
    }

    toast.success("Invoice duplicated as draft");
    fetchInvoices();
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase
      .from("invoices")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
      return;
    }
    toast.success(`Invoice marked as ${status}`);
    fetchInvoices();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      draft: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", icon: <FileText className="h-3 w-3" /> },
      sent: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", icon: <Send className="h-3 w-3" /> },
      paid: { bg: "bg-emerald-50 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", icon: <CheckCircle2 className="h-3 w-3" /> },
      overdue: { bg: "bg-red-50 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", icon: <AlertCircle className="h-3 w-3" /> },
      cancelled: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", icon: <XCircle className="h-3 w-3" /> },
    };

    const style = styles[status] || styles.draft;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency || "KES",
    }).format(amount);
  };

  const filteredInvoices = invoices
    .filter((invoice) => {
      const matchesSearch = invoice.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "amount") return Number(b.total) - Number(a.total);
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "paid").length,
    pending: invoices.filter((i) => i.status === "sent").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
    totalValue: invoices.reduce((acc, i) => acc + Number(i.total), 0),
    paidValue: invoices.filter((i) => i.status === "paid").reduce((acc, i) => acc + Number(i.total), 0),
    outstandingValue: invoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((acc, i) => acc + Number(i.total), 0),
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6 p-6 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-muted rounded-xl w-2/5" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-muted rounded-2xl" />
            ))}
          </div>
          <div className="h-24 bg-muted rounded-2xl" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl min-w-0 space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-vollkorn text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Invoices
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create, send, and track professional invoices
          </p>
        </div>
        <Button
          // onClick={() => setCreateDialogOpen(true)}
          onClick={async () => {
  if (isFree) {
    const { count } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true });
    if ((count || 0) >= limits.invoicesPerMonth) {
      toast.error("You've reached your free plan limit of 5 invoices. Upgrade to Pro for unlimited invoices.");
      return;
    }
  }
  setCreateDialogOpen(true);
}}
          className="gap-2 bg-bronze hover:bg-bronze/90 shadow-lg shadow-bronze/20"
        >
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-4">
        <Card className="p-4 md:p-5 border-0 bg-gradient-to-br from-bronze/10 via-bronze/5 to-transparent shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <div className="p-2.5 rounded-xl bg-bronze/15">
              <Receipt className="h-5 w-5 text-bronze" />
            </div>
            <div className="min-w-0">
              <p className="break-words text-2xl font-bold leading-none text-foreground md:text-3xl">{stats.total}</p>
              <p className="text-xs text-muted-foreground font-medium">Total</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-5 border-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="break-words text-2xl font-bold leading-none text-foreground md:text-3xl">{stats.paid}</p>
              <p className="text-xs text-muted-foreground font-medium">Paid</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-5 border-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/15">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="break-words text-2xl font-bold leading-none text-foreground md:text-3xl">{stats.pending}</p>
              <p className="text-xs text-muted-foreground font-medium">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-5 border-0 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/15">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="min-w-0">
              <p className="break-words text-2xl font-bold leading-none text-foreground md:text-3xl">{stats.overdue}</p>
              <p className="text-xs text-muted-foreground font-medium">Overdue</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Summary */}
      <Card className="p-5 md:p-6 border-0 bg-gradient-to-r from-bronze/8 via-background to-emerald-500/8 shadow-sm">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
            </div>
            <p className="break-words text-2xl font-bold leading-tight text-foreground md:text-3xl">
              {formatCurrency(stats.totalValue, "KES")}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <p className="text-sm text-muted-foreground font-medium">Collected</p>
            </div>
            <p className="break-words text-2xl font-bold leading-tight text-emerald-500 md:text-3xl">
              {formatCurrency(stats.paidValue, "KES")}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-muted-foreground font-medium">Outstanding</p>
            </div>
            <p className="break-words text-2xl font-bold leading-tight text-amber-500 md:text-3xl">
              {formatCurrency(stats.outstandingValue, "KES")}
            </p>
          </div>
        </div>
      </Card>

      {/* Search, Filter & Sort */}
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[140px] h-11">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-full sm:w-[140px] h-11">
            <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="amount">Highest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <Card className="p-12 md:p-16 text-center border-dashed border-2">
          <div className="w-20 h-20 rounded-3xl bg-bronze/10 flex items-center justify-center mx-auto mb-5">
            <Receipt className="h-10 w-10 text-bronze" />
          </div>
          <h3 className="font-vollkorn text-xl md:text-2xl font-bold text-foreground mb-2">
            {searchQuery || statusFilter !== "all" ? "No invoices found" : "Create your first invoice"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Professional invoices with auto-calculations, multiple currencies, and more"}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <Button
              // onClick={() => setCreateDialogOpen(true)}
              onClick={async () => {
  if (isFree) {
    const { count } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true });
    if ((count || 0) >= limits.invoicesPerMonth) {
      toast.error("You've reached your free plan limit of 5 invoices. Upgrade to Pro for unlimited invoices.");
      return;
    }
  }
  setCreateDialogOpen(true);
}}
              className="gap-2 bg-bronze hover:bg-bronze/90"
            >
              <Sparkles className="h-4 w-4" />
              Create Invoice
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((invoice) => {
            const isOverdue = invoice.status === "overdue";
            
            return (
              <Card
                key={invoice.id}
                className={`group p-4 md:p-5 hover:shadow-lg transition-all duration-300 border cursor-pointer ${
                  isOverdue ? "border-red-200 dark:border-red-900/50 hover:border-red-300" : "hover:border-bronze/30"
                }`}
                onClick={() => setPreviewInvoice(invoice)}
              >
                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`p-3 rounded-2xl flex-shrink-0 transition-colors ${
                      isOverdue ? "bg-red-100 dark:bg-red-900/20" : "bg-bronze/10 group-hover:bg-bronze/15"
                    }`}>
                      {isOverdue ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <FileText className="h-5 w-5 text-bronze" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-foreground">
                          {invoice.invoice_number}
                        </h4>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {invoice.client_name}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>Issued {format(new Date(invoice.issue_date), "MMM d, yyyy")}</span>
                        <span>•</span>
                        <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                          Due {format(new Date(invoice.due_date), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between gap-4 xl:w-auto xl:justify-end" onClick={(e) => e.stopPropagation()}>
                    <div className="min-w-[8rem] text-left xl:text-right">
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(Number(invoice.total), invoice.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">{invoice.currency}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-100 transition-opacity xl:opacity-0 xl:group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setPreviewInvoice(invoice)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingInvoice(invoice)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(invoice)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {invoice.status === "draft" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "sent")}>
                            <Send className="h-4 w-4 mr-2" />
                            Mark as Sent
                          </DropdownMenuItem>
                        )}
                        {(invoice.status === "sent" || invoice.status === "overdue") && (
                          <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "paid")}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Mark as Paid
                          </DropdownMenuItem>
                        )}
                        {invoice.status === "paid" && (
                          <DropdownMenuItem onClick={() => setReceiptInvoice(invoice)}>
                            <Receipt className="h-4 w-4 mr-2" />
                            Generate Receipt
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(invoice.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <CreateInvoiceDialog
        open={createDialogOpen || !!editingInvoice}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setEditingInvoice(null);
        }}
        editingInvoice={editingInvoice}
        onSuccess={fetchInvoices}
        businessSettings={businessSettings}
      />

      <InvoicePreviewDialog
        open={!!previewInvoice}
        onOpenChange={(open) => !open && setPreviewInvoice(null)}
        invoice={previewInvoice}
      />

      <ReceiptPreviewDialog
        open={!!receiptInvoice}
        onOpenChange={(open) => !open && setReceiptInvoice(null)}
        invoice={receiptInvoice}
      />
    </div>
  );
};

export default SmartInvoicesTab;
