import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  FileSignature, 
  Eye,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  XCircle,
  Users,
  Upload,
  Copy,
  Filter,
  ArrowUpDown,
  TrendingUp,
  Sparkles,
  File,
  CalendarDays
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
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
import CreateContractDialog from "./CreateContractDialog";
import ContractPreviewDialog from "./ContractPreviewDialog";
import UploadContractDialog from "./UploadContractDialog";

interface Contract {
  id: string;
  title: string;
  client_name: string;
  client_email: string | null;
  contract_type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  value: number | null;
  currency: string;
  created_at: string;
  creator_signature: string | null;
  client_signature: string | null;
  content: string | null;
  deliverables: string[] | null;
  payment_terms: string | null;
  exclusivity: boolean | null;
  exclusivity_details: string | null;
  usage_rights: string | null;
  termination_clause: string | null;
}

const contractTypeConfig: Record<string, { label: string; icon: string; gradient: string }> = {
  sponsorship: { label: "Sponsorship", icon: "💎", gradient: "from-violet-500/10 to-purple-500/5" },
  content_creation: { label: "Content", icon: "🎬", gradient: "from-blue-500/10 to-cyan-500/5" },
  brand_ambassador: { label: "Ambassador", icon: "🤝", gradient: "from-amber-500/10 to-orange-500/5" },
  ugc: { label: "UGC", icon: "📱", gradient: "from-green-500/10 to-emerald-500/5" },
  affiliate: { label: "Affiliate", icon: "🔗", gradient: "from-pink-500/10 to-rose-500/5" },
  custom: { label: "Custom", icon: "📄", gradient: "from-slate-500/10 to-gray-500/5" },
  uploaded: { label: "Uploaded", icon: "📎", gradient: "from-indigo-500/10 to-blue-500/5" },
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  draft: { label: "Draft", color: "text-muted-foreground", bg: "bg-muted", icon: <FileText className="h-3 w-3" /> },
  sent: { label: "Sent", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", icon: <Send className="h-3 w-3" /> },
  signed: { label: "Signed", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", icon: <FileSignature className="h-3 w-3" /> },
  active: { label: "Active", color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10", icon: <CheckCircle2 className="h-3 w-3" /> },
  completed: { label: "Completed", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10", icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled: { label: "Cancelled", color: "text-destructive", bg: "bg-destructive/10", icon: <XCircle className="h-3 w-3" /> },
};

const ContractsTab = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "value">("newest");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [previewContract, setPreviewContract] = useState<Contract | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchContracts = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load contracts");
      return;
    }

    setContracts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("contracts").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete contract");
      return;
    }
    toast.success("Contract deleted");
    fetchContracts();
  };

  const handleDuplicate = async (contract: Contract) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("contracts").insert({
      user_id: session.user.id,
      title: `${contract.title} (Copy)`,
      client_name: contract.client_name,
      client_email: contract.client_email,
      contract_type: contract.contract_type,
      content: contract.content,
      deliverables: contract.deliverables,
      payment_terms: contract.payment_terms,
      exclusivity: contract.exclusivity,
      exclusivity_details: contract.exclusivity_details,
      usage_rights: contract.usage_rights,
      termination_clause: contract.termination_clause,
      value: contract.value,
      currency: contract.currency,
      status: "draft",
    });

    if (error) {
      toast.error("Failed to duplicate contract");
      return;
    }
    toast.success("Contract duplicated");
    fetchContracts();
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase
      .from("contracts")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
      return;
    }
    toast.success(`Status updated to ${status}`);
    fetchContracts();
  };

  const handleFileUpload = async (file: File, contractType: string, title: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const fileExt = file.name.split(".").pop()?.toLowerCase();
    
    let content = "";

    // For text-based files, read the content directly for editing
    if (fileExt === "txt" || fileExt === "md") {
      content = await file.text();
    } else {
      // For PDF, DOCX, etc. — upload to storage and create editable content
      const storagePath = `${session.user.id}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from("contract-uploads")
        .upload(storagePath, file);

      if (uploadError) {
        toast.error("Failed to upload file: " + uploadError.message);
        return;
      }

      content = `[Original file: ${file.name}]\n[File type: ${file.type || fileExt}]\n[Uploaded: ${new Date().toLocaleString()}]\n\n---\n\nYou can edit this contract content below. The original document has been securely stored.\n\n---\n\n[Add or paste your contract terms here]`;
    }

    const { data, error } = await supabase.from("contracts").insert({
      user_id: session.user.id,
      title,
      client_name: "To be specified",
      contract_type: contractType,
      content,
      status: "draft",
      currency: "KES",
    }).select().single();

    if (error) {
      toast.error("Failed to create contract record");
      return;
    }

    toast.success("Contract uploaded! You can now edit all details.");
    fetchContracts();
    
    // Open the edit dialog immediately so user can fill in details
    if (data) {
      setEditingContract(data as Contract);
    }
  };

  const formatCurrency = (amount: number | null, currency: string) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency || "KES",
    }).format(amount);
  };

  const filteredContracts = contracts
    .filter((contract) => {
      const matchesSearch = contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.client_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "value") return (Number(b.value) || 0) - (Number(a.value) || 0);
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const stats = {
    total: contracts.length,
    active: contracts.filter((c) => c.status === "active" || c.status === "signed").length,
    pending: contracts.filter((c) => c.status === "sent" || c.status === "draft").length,
    totalValue: contracts.filter(c => c.status !== "cancelled").reduce((acc, c) => acc + (Number(c.value) || 0), 0),
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-8">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-muted rounded-2xl w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-2xl" />
            ))}
          </div>
          <div className="h-12 bg-muted rounded-2xl" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">

      {/* Header — Clean & Minimal */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h2 className="font-vollkorn text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Contracts
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Professional agreements, e-signatures & document management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setUploadDialogOpen(true)}
            className="gap-2 h-10 rounded-xl border-dashed hover:border-bronze/50 hover:bg-bronze/5 transition-all"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="gap-2 h-10 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
          >
            <Plus className="h-4 w-4" />
            New Contract
          </Button>
        </div>
      </motion.div>

      {/* Stats — Glass Morphism Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { label: "Total", value: stats.total, icon: <File className="h-4 w-4" />, accent: "primary" },
          { label: "Active", value: stats.active, icon: <CheckCircle2 className="h-4 w-4" />, accent: "emerald" },
          { label: "Pending", value: stats.pending, icon: <Clock className="h-4 w-4" />, accent: "amber" },
          { label: "Value", value: formatCurrency(stats.totalValue, "KES"), icon: <TrendingUp className="h-4 w-4" />, accent: "blue" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="relative group p-4 rounded-2xl border border-border/50 bg-card hover:border-border transition-all overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
              stat.accent === "primary" ? "from-primary/5 to-transparent" :
              stat.accent === "emerald" ? "from-emerald-500/5 to-transparent" :
              stat.accent === "amber" ? "from-amber-500/5 to-transparent" :
              "from-blue-500/5 to-transparent"
            }`} />
            <div className="relative">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                stat.accent === "primary" ? "bg-primary/10 text-primary" :
                stat.accent === "emerald" ? "bg-emerald-500/10 text-emerald-500" :
                stat.accent === "amber" ? "bg-amber-500/10 text-amber-500" :
                "bg-blue-500/10 text-blue-500"
              }`}>
                {stat.icon}
              </div>
              <p className={`font-bold text-foreground ${stat.label === "Value" ? "text-base md:text-lg" : "text-2xl md:text-3xl"}`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Search & Filters — Unified Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contracts, clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-muted/50 border-0 focus:bg-background focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[130px] h-10 rounded-xl bg-muted/50 border-0">
            <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="signed">Signed</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-full sm:w-[130px] h-10 rounded-xl bg-muted/50 border-0">
            <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="value">Highest Value</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Contracts List */}
      <AnimatePresence mode="wait">
        {filteredContracts.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-12 md:p-20 text-center border border-dashed border-border/60 bg-muted/20 rounded-3xl">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6">
                <FileSignature className="h-9 w-9 text-primary" />
              </div>
              <h3 className="font-vollkorn text-2xl font-bold text-foreground mb-2">
                {searchQuery || statusFilter !== "all" ? "No contracts found" : "Create your first contract"}
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm leading-relaxed">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Build professional contracts with templates, e-signatures, and document management — all in one place."}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="gap-2 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-11"
                  >
                    <Sparkles className="h-4 w-4" />
                    Create from Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2 rounded-xl h-11 border-dashed"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Document
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        ) : (
          <motion.div key="list" className="space-y-2">
            {filteredContracts.map((contract, index) => {
              const typeInfo = contractTypeConfig[contract.contract_type] || contractTypeConfig.custom;
              const status = statusConfig[contract.status] || statusConfig.draft;
              const hasSignatures = contract.creator_signature || contract.client_signature;
              const bothSigned = contract.creator_signature && contract.client_signature;
              
              return (
                <motion.div
                  key={contract.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div
                    className="group relative flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 cursor-pointer transition-all duration-300"
                    onClick={() => setPreviewContract(contract)}
                  >
                    {/* Type Icon */}
                    <div className={`hidden sm:flex w-12 h-12 rounded-2xl bg-gradient-to-br ${typeInfo.gradient} items-center justify-center text-lg flex-shrink-0 transition-transform group-hover:scale-105`}>
                      {typeInfo.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-semibold text-foreground truncate text-sm">
                          {contract.title}
                        </h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${status.bg} ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                        {bothSigned && (
                          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            Signed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {contract.client_name}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:flex items-center gap-1">
                          {typeInfo.label}
                        </span>
                        {contract.start_date && (
                          <>
                            <span className="hidden md:inline">•</span>
                            <span className="hidden md:flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {format(new Date(contract.start_date), "MMM d, yyyy")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Value & Actions */}
                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      {contract.value && (
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-bold text-foreground tabular-nums">
                            {formatCurrency(Number(contract.value), contract.currency)}
                          </p>
                        </div>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl">
                          <DropdownMenuItem onClick={() => setPreviewContract(contract)} className="rounded-lg">
                            <Eye className="h-4 w-4 mr-2" />
                            View & Sign
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingContract(contract)} className="rounded-lg">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(contract)} className="rounded-lg">
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {contract.status === "draft" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(contract.id, "sent")} className="rounded-lg">
                              <Send className="h-4 w-4 mr-2" />
                              Mark as Sent
                            </DropdownMenuItem>
                          )}
                          {contract.status === "sent" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(contract.id, "signed")} className="rounded-lg">
                              <FileSignature className="h-4 w-4 mr-2" />
                              Mark as Signed
                            </DropdownMenuItem>
                          )}
                          {contract.status === "signed" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(contract.id, "active")} className="rounded-lg">
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark Active
                            </DropdownMenuItem>
                          )}
                          {contract.status === "active" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(contract.id, "completed")} className="rounded-lg">
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Complete
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive rounded-lg"
                            onClick={() => handleDelete(contract.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <CreateContractDialog
        open={createDialogOpen || !!editingContract}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setEditingContract(null);
        }}
        editingContract={editingContract}
        onSuccess={fetchContracts}
      />

      <UploadContractDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleFileUpload}
      />

      <ContractPreviewDialog
        open={!!previewContract}
        onOpenChange={(open) => !open && setPreviewContract(null)}
        contract={previewContract}
        onContractUpdate={fetchContracts}
      />
    </div>
  );
};

export default ContractsTab;
