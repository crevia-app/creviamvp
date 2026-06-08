import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Receipt, FileSignature, TrendingUp, Clock, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

const FinanceOverview = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [{ data: contractsData }, { data: invoicesData }] = await Promise.all([
      supabase.from("canvases").select("*").order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
    ]);
    setContracts(contractsData || []);
    setInvoices(invoicesData || []);
    setLoading(false);
  };

  // Computed stats
  const totalInvoiceValue = invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const paidInvoices = invoices.filter(inv => inv.status === "paid");
  const pendingInvoices = invoices.filter(inv => inv.status !== "paid");
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const signedContracts = contracts.filter(c => c.status === "signed").length;
  const activeWorkspaces = contracts.filter(c => c.status !== "completed").length;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount);

  return (
    <div className="min-h-dvh bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:px-6 md:py-12">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-bronze" />
            <h1 className="font-vollkorn text-2xl md:text-3xl font-bold">Finance Overview</h1>
          </div>
          <p className="text-muted-foreground text-sm">Read-only summary across all your active workspaces</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-muted/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Revenue", value: formatCurrency(totalPaid), icon: TrendingUp, color: "text-green-500 bg-green-500/10" },
                { label: "Pending", value: formatCurrency(totalPending), icon: Clock, color: "text-amber-500 bg-amber-500/10" },
                { label: "Active Workspaces", value: activeWorkspaces.toString(), icon: Sparkles, color: "text-bronze bg-bronze/10" },
                { label: "Signed Canvas", value: signedContracts.toString(), icon: FileSignature, color: "text-blue-500 bg-blue-500/10" },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Card className="p-4 border-border/50">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <p className="font-vollkorn text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Invoices */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Receipt className="w-4 h-4 text-bronze" />
                <h2 className="font-vollkorn text-xl font-bold">Invoices</h2>
                <Badge variant="outline" className="text-[10px] border-bronze/30 text-bronze ml-auto">
                  {invoices.length} total
                </Badge>
              </div>
              {invoices.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <Receipt className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No invoices yet</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {invoices.map((inv, idx) => (
                    <motion.div
                      key={inv.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                    >
                      <Card className="p-4 border-border/50 hover:border-bronze/20 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              inv.status === "paid" ? "bg-green-500/10" : inv.status === "overdue" ? "bg-red-500/10" : "bg-amber-500/10"
                            }`}>
                              {inv.status === "paid" ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : inv.status === "overdue" ? (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              ) : (
                                <Clock className="w-4 h-4 text-amber-500" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{inv.invoice_number}</p>
                              <p className="text-xs text-muted-foreground">{inv.client_name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-bronze">
                              {formatCurrency(Number(inv.total))}
                            </p>
                            <Badge variant="outline" className={`text-[9px] capitalize ${
                              inv.status === "paid" ? "border-green-300 text-green-600" :
                              inv.status === "overdue" ? "border-red-300 text-red-600" :
                              "border-amber-300 text-amber-600"
                            }`}>
                              {inv.status}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Contracts */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileSignature className="w-4 h-4 text-bronze" />
                <h2 className="font-vollkorn text-xl font-bold">Canvas</h2>
                <Badge variant="outline" className="text-[10px] border-bronze/30 text-bronze ml-auto">
                  {contracts.length} total
                </Badge>
              </div>
              {contracts.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                  <FileSignature className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No Canvas yet</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {contracts.map((c, idx) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                    >
                      <Card className="p-4 border-border/50 hover:border-bronze/20 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              c.status === "signed" ? "bg-green-500/10" : "bg-muted"
                            }`}>
                              {c.status === "signed" ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <Clock className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{c.title}</p>
                              <p className="text-xs text-muted-foreground">{c.client_name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {c.value && (
                              <p className="text-sm font-bold text-bronze">
                                {formatCurrency(Number(c.value))}
                              </p>
                            )}
                            <Badge variant="outline" className={`text-[9px] capitalize ${
                              c.status === "signed" ? "border-green-300 text-green-600" : "border-border text-muted-foreground"
                            }`}>
                              {c.status}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FinanceOverview;
