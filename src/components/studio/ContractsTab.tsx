import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Sparkles
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreateContractDialog from "./CreateContractDialog";
import ContractPreviewDialog from "./ContractPreviewDialog";

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

const contractTypes: Record<string, { label: string; color: string }> = {
  sponsorship: { label: "Sponsorship", color: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" },
  content_creation: { label: "Content Creation", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" },
  brand_ambassador: { label: "Brand Ambassador", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" },
  ugc: { label: "UGC", color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" },
  affiliate: { label: "Affiliate", color: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400" },
  custom: { label: "Custom", color: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400" },
  uploaded: { label: "Uploaded", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400" },
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
    toast.success("Contract duplicated as draft");
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
    toast.success(`Contract marked as ${status}`);
    fetchContracts();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Read file as text for .txt files or store reference
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    
    let content = "";
    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      content = await file.text();
    } else {
      content = `[Uploaded file: ${file.name}]\n\nThis contract was uploaded from a file. The original document format is preserved for reference.\n\nFile type: ${file.type || "unknown"}\nFile size: ${(file.size / 1024).toFixed(1)} KB\nUploaded: ${new Date().toLocaleString()}`;
    }

    const { error } = await supabase.from("contracts").insert({
      user_id: session.user.id,
      title: fileName,
      client_name: "To be specified",
      contract_type: "uploaded",
      content,
      status: "draft",
      currency: "KES",
    });

    if (error) {
      toast.error("Failed to upload contract");
      return;
    }

    toast.success("Contract uploaded! Edit it to fill in the details.");
    fetchContracts();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      draft: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", icon: <FileText className="h-3 w-3" /> },
      sent: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", icon: <Send className="h-3 w-3" /> },
      signed: { bg: "bg-emerald-50 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", icon: <FileSignature className="h-3 w-3" /> },
      active: { bg: "bg-green-50 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400", icon: <CheckCircle2 className="h-3 w-3" /> },
      completed: { bg: "bg-purple-50 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400", icon: <CheckCircle2 className="h-3 w-3" /> },
      cancelled: { bg: "bg-red-50 dark:bg-red-900/30", text: "text-red-500 dark:text-red-400", icon: <XCircle className="h-3 w-3" /> },
    };

    const style = styles[status] || styles.draft;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount: number | null, currency: string) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency || "KES",
    }).format(amount);
  };

  // Filter & sort
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
      <div className="p-6 md:p-8 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-muted rounded-xl w-2/5" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-muted rounded-2xl" />
            ))}
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.doc,.docx,.pdf"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-vollkorn text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Contracts
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create, sign, and manage professional agreements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="gap-2 bg-bronze hover:bg-bronze/90 shadow-lg shadow-bronze/20"
          >
            <Plus className="h-4 w-4" />
            New Contract
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-4 md:p-5 border-0 bg-gradient-to-br from-bronze/10 via-bronze/5 to-transparent shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-bronze/15">
              <FileSignature className="h-5 w-5 text-bronze" />
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground font-medium">Total</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-5 border-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{stats.active}</p>
              <p className="text-xs text-muted-foreground font-medium">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-5 border-0 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-xs text-muted-foreground font-medium">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 md:p-5 border-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/15">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-lg md:text-xl font-bold text-foreground">{formatCurrency(stats.totalValue, "KES")}</p>
              <p className="text-xs text-muted-foreground font-medium">Total Value</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search, Filter & Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contracts or clients..."
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
            <SelectItem value="signed">Signed</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
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
            <SelectItem value="value">Highest Value</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contracts List */}
      {filteredContracts.length === 0 ? (
        <Card className="p-12 md:p-16 text-center border-dashed border-2">
          <div className="w-20 h-20 rounded-3xl bg-bronze/10 flex items-center justify-center mx-auto mb-5">
            <FileSignature className="h-10 w-10 text-bronze" />
          </div>
          <h3 className="font-vollkorn text-xl md:text-2xl font-bold text-foreground mb-2">
            {searchQuery || statusFilter !== "all" ? "No contracts found" : "Create your first contract"}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "all" 
              ? "Try adjusting your search or filters" 
              : "Professional contracts with e-signatures, templates, and more"}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="gap-2 bg-bronze hover:bg-bronze/90"
              >
                <Sparkles className="h-4 w-4" />
                Create from Template
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Contract
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredContracts.map((contract) => {
            const typeInfo = contractTypes[contract.contract_type] || contractTypes.custom;
            const hasSignatures = contract.creator_signature || contract.client_signature;
            
            return (
              <Card
                key={contract.id}
                className="group p-4 md:p-5 hover:shadow-lg transition-all duration-300 border hover:border-bronze/30 cursor-pointer"
                onClick={() => setPreviewContract(contract)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="p-3 rounded-2xl bg-bronze/10 group-hover:bg-bronze/15 transition-colors flex-shrink-0">
                      <FileSignature className="h-5 w-5 text-bronze" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-semibold text-foreground truncate">
                          {contract.title}
                        </h4>
                        {getStatusBadge(contract.status)}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {contract.client_name}
                        </span>
                        {hasSignatures && (
                          <span className="flex items-center gap-1 text-xs text-emerald-500">
                            <FileSignature className="h-3 w-3" />
                            {contract.creator_signature && contract.client_signature ? "Fully signed" : "Partially signed"}
                          </span>
                        )}
                      </div>
                      {contract.start_date && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {format(new Date(contract.start_date), "MMM d, yyyy")}
                          {contract.end_date && ` — ${format(new Date(contract.end_date), "MMM d, yyyy")}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                    {contract.value && (
                      <div className="text-right hidden sm:block">
                        <p className="text-lg font-bold text-foreground">
                          {formatCurrency(Number(contract.value), contract.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">Value</p>
                      </div>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setPreviewContract(contract)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View & Sign
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingContract(contract)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(contract)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {contract.status === "draft" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(contract.id, "sent")}>
                            <Send className="h-4 w-4 mr-2" />
                            Mark as Sent
                          </DropdownMenuItem>
                        )}
                        {contract.status === "sent" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(contract.id, "signed")}>
                            <FileSignature className="h-4 w-4 mr-2" />
                            Mark as Signed
                          </DropdownMenuItem>
                        )}
                        {contract.status === "signed" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(contract.id, "active")}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Mark as Active
                          </DropdownMenuItem>
                        )}
                        {contract.status === "active" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(contract.id, "completed")}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Complete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(contract.id)}
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

      <CreateContractDialog
        open={createDialogOpen || !!editingContract}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setEditingContract(null);
        }}
        editingContract={editingContract}
        onSuccess={fetchContracts}
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
