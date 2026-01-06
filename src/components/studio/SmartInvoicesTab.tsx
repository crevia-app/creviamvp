import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  FileText, 
  Send, 
  Eye,
  MoreHorizontal,
  Download,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Receipt
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateInvoiceDialog from "./CreateInvoiceDialog";
import InvoicePreviewDialog from "./InvoicePreviewDialog";

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string | null;
  issue_date: string;
  due_date: string;
  status: string;
  total: number;
  currency: string;
  created_at: string;
}

const SmartInvoicesTab = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load invoices");
      return;
    }

    setInvoices(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete invoice");
      return;
    }
    toast.success("Invoice deleted");
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
    const styles: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      draft: { variant: "secondary", icon: <FileText className="h-3 w-3" /> },
      sent: { variant: "default", icon: <Send className="h-3 w-3" /> },
      paid: { variant: "outline", icon: <CheckCircle2 className="h-3 w-3 text-green-500" /> },
      overdue: { variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
      cancelled: { variant: "secondary", icon: <XCircle className="h-3 w-3" /> },
    };

    const style = styles[status] || styles.draft;

    return (
      <Badge variant={style.variant} className="gap-1 capitalize">
        {style.icon}
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency || "KES",
    }).format(amount);
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "paid").length,
    pending: invoices.filter((i) => i.status === "sent").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
    totalValue: invoices.reduce((acc, i) => acc + Number(i.total), 0),
    paidValue: invoices.filter((i) => i.status === "paid").reduce((acc, i) => acc + Number(i.total), 0),
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-vollkorn text-2xl font-semibold text-foreground">
            Smart Invoices
          </h2>
          <p className="text-sm text-muted-foreground">
            Create and manage professional invoices
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="gap-2 bg-bronze hover:bg-bronze/90"
        >
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-bronze/10 to-transparent border-bronze/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-bronze/20">
              <Receipt className="h-5 w-5 text-bronze" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Invoices</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.paid}</p>
              <p className="text-xs text-muted-foreground">Paid</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.overdue}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Summary */}
      <Card className="p-6 bg-gradient-to-r from-bronze/5 via-background to-bronze/5 border-bronze/10">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-foreground">
              {formatCurrency(stats.totalValue, "KES")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Collected</p>
            <p className="text-3xl font-bold text-green-500">
              {formatCurrency(stats.paidValue, "KES")}
            </p>
          </div>
        </div>
      </Card>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search invoices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-bronze/10 flex items-center justify-center mx-auto mb-4">
            <Receipt className="h-8 w-8 text-bronze" />
          </div>
          <h3 className="font-vollkorn text-xl font-semibold text-foreground mb-2">
            No invoices yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Create your first invoice to get started
          </p>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="gap-2 bg-bronze hover:bg-bronze/90"
          >
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((invoice) => (
            <Card
              key={invoice.id}
              className="p-4 hover:shadow-md transition-all duration-300 hover:border-bronze/30"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-bronze/10">
                    <FileText className="h-5 w-5 text-bronze" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">
                        {invoice.invoice_number}
                      </h4>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {invoice.client_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due: {format(new Date(invoice.due_date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-foreground">
                      {formatCurrency(Number(invoice.total), invoice.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Issued: {format(new Date(invoice.issue_date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setPreviewInvoice(invoice)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingInvoice(invoice)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {invoice.status === "draft" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "sent")}>
                          <Send className="h-4 w-4 mr-2" />
                          Mark as Sent
                        </DropdownMenuItem>
                      )}
                      {invoice.status === "sent" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "paid")}>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark as Paid
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
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
          ))}
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
      />

      <InvoicePreviewDialog
        open={!!previewInvoice}
        onOpenChange={(open) => !open && setPreviewInvoice(null)}
        invoice={previewInvoice}
      />
    </div>
  );
};

export default SmartInvoicesTab;
