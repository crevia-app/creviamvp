import { useState, useEffect } from "react";
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
  Users
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
}

const contractTypes = {
  sponsorship: { label: "Sponsorship", color: "bg-purple-500/10 text-purple-500" },
  content_creation: { label: "Content Creation", color: "bg-blue-500/10 text-blue-500" },
  brand_ambassador: { label: "Brand Ambassador", color: "bg-amber-500/10 text-amber-500" },
  ugc: { label: "UGC", color: "bg-green-500/10 text-green-500" },
  affiliate: { label: "Affiliate", color: "bg-pink-500/10 text-pink-500" },
  custom: { label: "Custom", color: "bg-gray-500/10 text-gray-500" },
};

const ContractsTab = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [previewContract, setPreviewContract] = useState<Contract | null>(null);

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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      draft: { variant: "secondary", icon: <FileText className="h-3 w-3" /> },
      sent: { variant: "default", icon: <Send className="h-3 w-3" /> },
      signed: { variant: "outline", icon: <FileSignature className="h-3 w-3 text-green-500" /> },
      active: { variant: "outline", icon: <CheckCircle2 className="h-3 w-3 text-blue-500" /> },
      completed: { variant: "outline", icon: <CheckCircle2 className="h-3 w-3 text-green-500" /> },
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

  const formatCurrency = (amount: number | null, currency: string) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency || "KES",
    }).format(amount);
  };

  const filteredContracts = contracts.filter(
    (contract) =>
      contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: contracts.length,
    active: contracts.filter((c) => c.status === "active").length,
    pending: contracts.filter((c) => c.status === "sent" || c.status === "draft").length,
    completed: contracts.filter((c) => c.status === "completed").length,
    totalValue: contracts.reduce((acc, c) => acc + (Number(c.value) || 0), 0),
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
            Contracts
          </h2>
          <p className="text-sm text-muted-foreground">
            Create and manage professional contracts
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="gap-2 bg-bronze hover:bg-bronze/90"
        >
          <Plus className="h-4 w-4" />
          Create Contract
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-bronze/10 to-transparent border-bronze/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-bronze/20">
              <FileSignature className="h-5 w-5 text-bronze" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Contracts</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contracts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Contracts List */}
      {filteredContracts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-bronze/10 flex items-center justify-center mx-auto mb-4">
            <FileSignature className="h-8 w-8 text-bronze" />
          </div>
          <h3 className="font-vollkorn text-xl font-semibold text-foreground mb-2">
            No contracts yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Create your first contract to get started
          </p>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="gap-2 bg-bronze hover:bg-bronze/90"
          >
            <Plus className="h-4 w-4" />
            Create Contract
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredContracts.map((contract) => (
            <Card
              key={contract.id}
              className="p-4 hover:shadow-md transition-all duration-300 hover:border-bronze/30"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-bronze/10">
                    <FileSignature className="h-5 w-5 text-bronze" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-foreground">
                        {contract.title}
                      </h4>
                      {getStatusBadge(contract.status)}
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        contractTypes[contract.contract_type as keyof typeof contractTypes]?.color || 
                        contractTypes.custom.color
                      }`}>
                        {contractTypes[contract.contract_type as keyof typeof contractTypes]?.label || 
                         contract.contract_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {contract.client_name}
                      </p>
                    </div>
                    {contract.start_date && contract.end_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(contract.start_date), "MMM d, yyyy")} - {format(new Date(contract.end_date), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {contract.value && (
                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground">
                        {formatCurrency(Number(contract.value), contract.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">Contract Value</p>
                    </div>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setPreviewContract(contract)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingContract(contract)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
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
                          Mark as Completed
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
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
          ))}
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
      />
    </div>
  );
};

export default ContractsTab;
