import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Receipt, FileSignature, Clock, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { format } from "date-fns";
import InvoicePreviewDialog from "@/components/studio/InvoicePreviewDialog";
import ContractPreviewDialog from "@/components/studio/ContractPreviewDialog";

const INVOICE_STATUS: Record<string, { label: string; color: string }> = {
  draft:   { label: "Draft",   color: "bg-gray-100 text-gray-600" },
  sent:    { label: "Sent",    color: "bg-blue-100 text-blue-700" },
  paid:    { label: "Paid",    color: "bg-emerald-100 text-emerald-700" },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-700" },
};

const CONTRACT_STATUS: Record<string, { label: string; color: string }> = {
  draft:     { label: "Draft",     color: "bg-gray-100 text-gray-600" },
  sent:      { label: "Sent",      color: "bg-blue-100 text-blue-700" },
  signed:    { label: "Signed",    color: "bg-emerald-100 text-emerald-700" },
  active:    { label: "Active",    color: "bg-emerald-100 text-emerald-700" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
};

const ReceivedDocuments = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const email = session.user.email;
      if (!email) { setLoading(false); return; }

      const [{ data: inv }, { data: con }] = await Promise.all([
        supabase
          .from("invoices")
          .select("*")
          .eq("client_email", email)
          .order("created_at", { ascending: false }),
        supabase
          .from("contracts")
          .select("*")
          .eq("client_email", email)
          .order("created_at", { ascending: false }),
      ]);

      setInvoices(inv ?? []);
      setContracts(con ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const formatCurrency = (amount: number, currency = "KES") =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency }).format(amount);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-bronze border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/30">
        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
          <h1 className="font-vollkorn text-3xl font-bold mb-1">Received</h1>
          <p className="text-muted-foreground text-sm">
            Invoices and contracts sent to you.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
        <Tabs defaultValue="invoices">
          <TabsList className="h-10 mb-6">
            <TabsTrigger value="invoices" className="gap-1.5">
              <Receipt className="h-4 w-4" />
              Invoices ({invoices.length})
            </TabsTrigger>
            <TabsTrigger value="contracts" className="gap-1.5">
              <FileSignature className="h-4 w-4" />
              Contracts ({contracts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invoices">
            {invoices.length === 0 ? (
              <Card className="p-12 text-center">
                <Receipt className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No invoices received yet.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {invoices.map((inv) => {
                  const st = INVOICE_STATUS[inv.status] ?? INVOICE_STATUS.sent;
                  return (
                    <Card
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className="p-4 cursor-pointer hover:border-bronze/30 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-bronze/10 flex items-center justify-center flex-shrink-0">
                            <Receipt className="h-4 w-4 text-bronze" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">
                              Invoice {inv.invoice_number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Due {format(new Date(inv.due_date), "dd MMM yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <p className="font-bold text-sm">{formatCurrency(inv.total, inv.currency)}</p>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>
                            {st.label}
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="contracts">
            {contracts.length === 0 ? (
              <Card className="p-12 text-center">
                <FileSignature className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No contracts received yet.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {contracts.map((con) => {
                  const st = CONTRACT_STATUS[con.status] ?? CONTRACT_STATUS.sent;
                  return (
                    <Card
                      key={con.id}
                      onClick={() => setSelectedContract(con)}
                      className="p-4 cursor-pointer hover:border-bronze/30 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-bronze/10 flex items-center justify-center flex-shrink-0">
                            <FileSignature className="h-4 w-4 text-bronze" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{con.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(con.created_at), "dd MMM yyyy")}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${st.color}`}>
                          {st.label}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedInvoice && (
        <InvoicePreviewDialog
          open={!!selectedInvoice}
          onOpenChange={(v) => { if (!v) setSelectedInvoice(null); }}
          invoice={selectedInvoice}
        />
      )}
      {selectedContract && (
        <ContractPreviewDialog
          open={!!selectedContract}
          onOpenChange={(v) => { if (!v) setSelectedContract(null); }}
          contract={selectedContract}
          onContractUpdate={() => {}}
        />
      )}
    </div>
  );
};

export default ReceivedDocuments;
