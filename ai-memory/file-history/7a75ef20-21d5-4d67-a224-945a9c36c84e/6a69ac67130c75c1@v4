import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
  File,
  CalendarDays,
  Pencil,
  X,
  FolderOpen,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useSubscription } from "@/hooks/use-subscription";
import UpgradePrompt from "@/components/subscription/UpgradePrompt";
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

interface Folder {
  id: string;
  name: string;
  user_id: string;
  workspace_id: string | null;
  created_at: string;
  canvasCount?: number;
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

const ContractsTab = ({ workspaceId }: { workspaceId?: string } = {}) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "value">("newest");
  const { limits, isFree } = useSubscription();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [previewContract, setPreviewContract] = useState<Contract | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Folder navigation state
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameFolderValue, setRenameFolderValue] = useState("");

  const fetchContracts = async (folderId: string | null = null) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (workspaceId) {
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("contract_id")
        .eq("room_id", workspaceId)
        .not("contract_id", "is", null);
      const ids = [...new Set((msgs || []).map((m: any) => m.contract_id).filter(Boolean))];
      if (ids.length === 0) { setContracts([]); setLoading(false); return; }
      const { data, error } = await supabase.from("canvases").select("*").in("id", ids).order("created_at", { ascending: false });
      if (error) { toast.error("Failed to load Canvas"); return; }
      setContracts(data || []);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("canvases")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load Canvas");
      setLoading(false);
      return;
    }

    // Filter client-side so the column-not-yet-migrated case still works
    const all = (data || []) as any[];
    const filtered = folderId
      ? all.filter(c => c.folder_id === folderId)
      : all.filter(c => !c.folder_id);

    setContracts(filtered);
    setLoading(false);
  };

  const fetchFolders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data } = await (supabase as any)
      .from("canvas_folders")
      .select("*")
      .eq("user_id", session.user.id)
      .order("name");
    if (!data) { setFolders([]); return; }
    // Attach canvas counts
    const withCounts = await Promise.all(
      (data as Folder[]).map(async (folder) => {
        const { count } = await supabase
          .from("canvases")
          .select("*", { count: "exact", head: true })
          .eq("folder_id", folder.id) as any;
        return { ...folder, canvasCount: count ?? 0 };
      })
    );
    setFolders(withCounts);
  };

  const createFolder = async () => {
    const name = folderName.trim();
    if (!name) return;
    setCreatingFolder(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setCreatingFolder(false); return; }
    const { error } = await (supabase as any)
      .from("canvas_folders")
      .insert({ name, user_id: session.user.id });
    setCreatingFolder(false);
    if (error) { toast.error("Failed to create folder"); return; }
    toast.success("Folder created");
    setCreateFolderOpen(false);
    setFolderName("");
    fetchFolders();
  };

  const deleteFolder = async (folder: Folder) => {
    const { error } = await (supabase as any)
      .from("canvas_folders")
      .delete()
      .eq("id", folder.id);
    if (error) { toast.error("Failed to delete folder"); return; }
    toast.success("Folder deleted — canvases moved to root");
    fetchFolders();
    fetchContracts(null);
  };

  const renameFolder = async (folder: Folder) => {
    const name = renameFolderValue.trim();
    if (!name) return;
    const { error } = await (supabase as any)
      .from("canvas_folders")
      .update({ name })
      .eq("id", folder.id);
    if (error) { toast.error("Failed to rename folder"); return; }
    toast.success("Folder renamed");
    setRenamingFolderId(null);
    fetchFolders();
    if (currentFolder?.id === folder.id) setCurrentFolder({ ...currentFolder, name });
  };

  const navigateToFolder = (folder: Folder) => {
    setCurrentFolderId(folder.id);
    setCurrentFolder(folder);
    fetchContracts(folder.id);
  };

  const navigateToRoot = () => {
    setCurrentFolderId(null);
    setCurrentFolder(null);
    fetchContracts(null);
    fetchFolders();
  };

  useEffect(() => {
    fetchContracts(currentFolderId);
    if (!workspaceId) fetchFolders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, currentFolderId]);

  const handleRename = async (id: string) => {
    const trimmed = renameValue.trim();
    if (!trimmed) { toast.error("Title cannot be empty"); return; }
    const { error } = await supabase.from("canvases").update({ title: trimmed }).eq("id", id);
    if (error) { toast.error("Failed to rename Canvas"); return; }
    setRenamingId(null);
    fetchContracts(currentFolderId);
    toast.success("Canvas renamed");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("canvases").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete Canvas");
      return;
    }
    toast.success("Canvas deleted");
    fetchContracts(currentFolderId);
  };

  const handleDuplicate = async (contract: Contract) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("canvases").insert({
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
      toast.error("Failed to duplicate Canvas");
      return;
    }
    toast.success("Canvas duplicated");
    fetchContracts(currentFolderId);
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
    fetchContracts(currentFolderId);
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

    const { data, error } = await supabase.from("canvases").insert({
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

    toast.success("Canvas uploaded! You can now edit all details.");
    fetchContracts(currentFolderId);
    
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
      <div className="mx-auto w-full max-w-6xl space-y-8 p-4 md:p-8">
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
    <div className="mx-auto w-full max-w-6xl min-w-0 space-y-6 p-4 md:p-8 xl:max-w-7xl">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <button
              onClick={navigateToRoot}
              className="font-vollkorn text-2xl md:text-4xl font-bold tracking-tight text-foreground hover:text-bronze transition-colors"
            >
              Canvas
            </button>
            {currentFolder && (
              <>
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground/50 flex-shrink-0" />
                <span className="font-vollkorn text-2xl md:text-4xl font-bold tracking-tight text-foreground truncate max-w-[200px] md:max-w-xs">
                  {currentFolder.name}
                </span>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {currentFolder
              ? `Inside ${currentFolder.name} · ${contracts.length} canvas${contracts.length !== 1 ? "es" : ""}`
              : "Professional agreements, e-signatures & document management"}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={() => setUploadDialogOpen(true)}
            className="gap-2 h-10 rounded-xl border-dashed hover:border-bronze/50 hover:bg-bronze/5 transition-all flex-1 md:flex-none"
          >
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </Button>

          {/* Universal "New" dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2 h-10 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all flex-1 md:flex-none">
                <Plus className="h-4 w-4" />
                New
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              {!currentFolderId && (
                <DropdownMenuItem
                  onClick={() => { setFolderName(""); setCreateFolderOpen(true); }}
                  className="rounded-lg gap-2"
                >
                  <FolderPlus className="h-4 w-4 text-bronze" />
                  New Folder
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={async () => {
                  if (isFree) {
                    const { count } = await supabase
                      .from("canvases")
                      .select("*", { count: "exact", head: true });
                    if ((count || 0) >= limits.canvasesPerMonth) {
                      toast.error("Free plan limit: 2 Canvas. Upgrade to Pro for unlimited.");
                      return;
                    }
                  }
                  setCreateDialogOpen(true);
                }}
                className="rounded-lg gap-2"
              >
                <FileSignature className="h-4 w-4 text-primary" />
                New Canvas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 gap-3 xl:grid-cols-4"
      >
        {[
          { label: "Total", value: stats.total, isCurrency: false, icon: <File className="h-4 w-4" />, iconBg: "bg-primary/10 text-primary" },
          { label: "Active", value: stats.active, isCurrency: false, icon: <CheckCircle2 className="h-4 w-4" />, iconBg: "bg-emerald-500/10 text-emerald-500" },
          { label: "Pending", value: stats.pending, isCurrency: false, icon: <Clock className="h-4 w-4" />, iconBg: "bg-amber-500/10 text-amber-500" },
          { label: "Value", value: stats.totalValue, isCurrency: true, icon: <TrendingUp className="h-4 w-4" />, iconBg: "bg-blue-500/10 text-blue-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-2.5 p-4 rounded-2xl border border-border/50 bg-card overflow-hidden"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold text-foreground leading-none md:text-2xl truncate">
                {stat.isCurrency ? formatCurrency(Number(stat.value), "KES") : stat.value}
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
        className="flex flex-col gap-2"
      >
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Canvas, clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-muted/50 border-0 focus:bg-background focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="flex-1 h-10 rounded-xl bg-muted/50 border-0">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
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
            <SelectTrigger className="flex-1 h-10 rounded-xl bg-muted/50 border-0">
              <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="value">Highest Value</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Folders Grid — shown at root only */}
      {!currentFolderId && folders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="space-y-2"
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-0.5">
            Folders
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {folders.map((folder, idx) => (
              <motion.div
                key={folder.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.04 }}
                className="group relative"
              >
                <button
                  onClick={() => navigateToFolder(folder)}
                  className="w-full flex flex-col items-start gap-2.5 p-4 rounded-2xl border border-border/50 bg-card hover:border-bronze/40 hover:bg-bronze/5 hover:shadow-md hover:shadow-bronze/5 transition-all duration-200 text-left"
                >
                  <FolderOpen className="h-8 w-8 text-bronze/60 group-hover:text-bronze transition-colors" />
                  {renamingFolderId === folder.id ? (
                    <form
                      onSubmit={(e) => { e.preventDefault(); renameFolder(folder); }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full"
                    >
                      <input
                        autoFocus
                        value={renameFolderValue}
                        onChange={(e) => setRenameFolderValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Escape" && setRenamingFolderId(null)}
                        className="w-full h-6 text-xs rounded-md border border-primary/40 bg-background px-2 focus:outline-none focus:ring-1 focus:ring-primary/40"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </form>
                  ) : (
                    <div className="w-full min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate leading-tight">{folder.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {folder.canvasCount ?? 0} canvas{(folder.canvasCount ?? 0) !== 1 ? "es" : ""}
                      </p>
                    </div>
                  )}
                </button>

                {/* Folder context menu */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 rounded-xl">
                      <DropdownMenuItem
                        onClick={() => { setRenamingFolderId(folder.id); setRenameFolderValue(folder.name); }}
                        className="rounded-lg gap-2 text-xs"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => deleteFolder(folder)}
                        className="rounded-lg gap-2 text-xs text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Canvas list label */}
      {!currentFolderId && (contracts.length > 0 || folders.length > 0) && (
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-0.5 -mb-4">
          Canvases
        </p>
      )}

      {/* Contracts List */}
      <AnimatePresence mode="wait">
        {filteredContracts.length > 0 && (
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
                    className="group relative flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 cursor-pointer md:flex-row md:items-center"
                    onClick={() => setPreviewContract(contract)}
                  >
                    {/* Type Icon */}
                    <div className={`hidden sm:flex w-12 h-12 rounded-2xl bg-gradient-to-br ${typeInfo.gradient} items-center justify-center text-lg flex-shrink-0 transition-transform group-hover:scale-105`}>
                      {typeInfo.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-0.5 flex flex-wrap items-start gap-2">
                        {renamingId === contract.id ? (
                          <form
                            onSubmit={e => { e.preventDefault(); handleRename(contract.id); }}
                            className="flex items-center gap-1.5 min-w-0"
                            onClick={e => e.stopPropagation()}
                          >
                            <input
                              autoFocus
                              value={renameValue}
                              onChange={e => setRenameValue(e.target.value)}
                              onKeyDown={e => e.key === "Escape" && setRenamingId(null)}
                              className="h-7 text-sm rounded-lg border border-primary/40 bg-background px-2 focus:outline-none focus:ring-1 focus:ring-primary/40 min-w-0 w-40 sm:w-52"
                            />
                            <button type="submit" className="h-7 px-2.5 text-xs rounded-lg bg-primary text-white hover:bg-primary/90 font-medium flex-shrink-0">
                              Save
                            </button>
                            <button type="button" onClick={() => setRenamingId(null)} className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex-shrink-0">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </form>
                        ) : (
                          <h4 className="min-w-0 break-words font-semibold text-foreground text-sm">
                            {contract.title}
                          </h4>
                        )}
                        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${status.bg} ${status.color}`}>
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
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
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
                    <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end" onClick={(e) => e.stopPropagation()}>
                      {contract.value && (
                        <div className="text-left md:text-right">
                          <p className="text-sm font-bold text-foreground tabular-nums">
                            {formatCurrency(Number(contract.value), contract.currency)}
                          </p>
                        </div>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-100 transition-all xl:opacity-0 xl:group-hover:opacity-100">
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
                          <DropdownMenuItem
                            onClick={() => { setRenamingId(contract.id); setRenameValue(contract.title); }}
                            className="rounded-lg"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Rename
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

      {/* Create Folder dialog */}
      <Dialog open={createFolderOpen} onOpenChange={(o) => { if (!o) setCreateFolderOpen(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <FolderPlus className="h-4 w-4 text-bronze" />
              New Folder
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground -mt-1">
            Organise your canvases into folders, just like Google Drive.
          </p>
          <input
            autoFocus
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !creatingFolder && createFolder()}
            placeholder="e.g. Client Projects, Q3 Campaigns"
            className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setCreateFolderOpen(false)} disabled={creatingFolder}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={createFolder}
              disabled={!folderName.trim() || creatingFolder}
              className="bg-bronze hover:bg-bronze/90 text-background gap-1.5"
            >
              {creatingFolder ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FolderPlus className="h-3.5 w-3.5" />}
              Create Folder
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CreateContractDialog
        open={createDialogOpen || !!editingContract}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setEditingContract(null);
        }}
        editingContract={editingContract}
        folderId={currentFolderId}
        onSuccess={() => fetchContracts(currentFolderId)}
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
