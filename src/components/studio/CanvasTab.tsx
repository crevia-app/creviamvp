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
  Lock,
  Globe,
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
import CreateCanvasDialog from "./CreateCanvasDialog";
import { useSubscription } from "@/hooks/use-subscription";
import UpgradePrompt from "@/components/subscription/UpgradePrompt";
import CanvasPreviewDialog from "./CanvasPreviewDialog";
import UploadCanvasDialog from "./UploadCanvasDialog";
import { SendDocumentDialog } from "@/components/studio/SendDocumentDialog";
import { ManageAccessDialog, type AccessLevel } from "@/components/studio/ManageAccessDialog";

interface Canvas {
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
  access_level?: AccessLevel;
  share_token?: string;
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

const ContractsTab = ({ workspaceId, initialContractId }: { workspaceId?: string; initialContractId?: string } = {}) => {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "value">("newest");
  const { limits, isFree, canvasesUsedThisMonth } = useSubscription();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCanvas, setEditingCanvas] = useState<Canvas | null>(null);
  const [previewCanvas, setPreviewCanvas] = useState<Canvas | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [sendCanvas, setSendCanvas] = useState<Canvas | null>(null);
  const [accessCanvas, setAccessCanvas] = useState<Canvas | null>(null);
  const [accessFolder, setAccessFolder] = useState<Folder & { access_level?: AccessLevel; share_token?: string } | null>(null);
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

  const fetchCanvases = async (folderId: string | null = null) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (workspaceId) {
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("contract_id")
        .eq("room_id", workspaceId)
        .not("contract_id", "is", null);
      const ids = [...new Set((msgs || []).map((m: any) => m.contract_id).filter(Boolean))];
      if (ids.length === 0) { setCanvases([]); setLoading(false); return; }
      const { data, error } = await supabase.from("canvases").select("*").in("id", ids).order("created_at", { ascending: false });
      if (error) { toast.error("Failed to load Canvas"); return; }
      setCanvases(data || []);
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

    setCanvases(filtered);
    setLoading(false);
  };

  const fetchFolders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    // Fetch folders + all folder-assigned canvases in parallel — eliminates N+1 count queries
    const [{ data, error }, { data: canvasRows }] = await Promise.all([
      (supabase as any)
        .from("canvas_folders")
        .select("*")
        .eq("user_id", session.user.id)
        .order("name"),
      supabase
        .from("canvases")
        .select("folder_id")
        .eq("user_id", session.user.id)
        .not("folder_id", "is", null),
    ]);
    if (error) { console.error("fetchFolders:", error); setFolders([]); return; }
    if (!data) { setFolders([]); return; }
    // Build count map client-side — O(n) single pass
    const countMap: Record<string, number> = {};
    (canvasRows || []).forEach((c: any) => {
      countMap[c.folder_id] = (countMap[c.folder_id] || 0) + 1;
    });
    setFolders((data as Folder[]).map(f => ({ ...f, canvasCount: countMap[f.id] ?? 0 })));
  };

  const createFolder = async () => {
    const name = folderName.trim();
    if (!name) return;
    setCreatingFolder(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setCreatingFolder(false); return; }
    const { data: newFolder, error } = await (supabase as any)
      .from("canvas_folders")
      .insert({ name, user_id: session.user.id })
      .select()
      .single();
    setCreatingFolder(false);
    if (error) { toast.error("Failed to create folder"); return; }
    // Optimistic update — folder appears instantly, no refetch wait
    setFolders(prev => [...prev, { ...newFolder, canvasCount: 0 }].sort((a: Folder, b: Folder) => a.name.localeCompare(b.name)));
    toast.success("Folder created");
    setCreateFolderOpen(false);
    setFolderName("");
  };

  const deleteFolder = async (folder: Folder) => {
    const { error } = await (supabase as any)
      .from("canvas_folders")
      .delete()
      .eq("id", folder.id);
    if (error) { toast.error("Failed to delete folder"); return; }
    toast.success("Folder deleted — canvases moved to root");
    fetchFolders();
    fetchCanvases(null);
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
    fetchCanvases(folder.id);
  };

  const navigateToRoot = () => {
    setCurrentFolderId(null);
    setCurrentFolder(null);
    fetchCanvases(null);
    fetchFolders();
  };

  useEffect(() => {
    if (workspaceId) {
      fetchCanvases(currentFolderId);
    } else {
      // Run both in parallel — independent queries, no reason to serialize
      Promise.all([fetchCanvases(currentFolderId), fetchFolders()]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, currentFolderId]);

  // Auto-open a specific canvas when navigating from a notification
  useEffect(() => {
    if (!initialContractId || canvases.length === 0) return;
    const target = canvases.find((c) => c.id === initialContractId);
    if (target) setPreviewCanvas(target);
  }, [initialContractId, canvases]);

  const handleRename = async (id: string) => {
    const trimmed = renameValue.trim();
    if (!trimmed) { toast.error("Title cannot be empty"); return; }
    const { error } = await supabase.from("canvases").update({ title: trimmed }).eq("id", id);
    if (error) { toast.error("Failed to rename Canvas"); return; }
    setRenamingId(null);
    fetchCanvases(currentFolderId);
    toast.success("Canvas renamed");
  };

  const handleDelete = async (id: string) => {
    setCanvases((prev) => prev.filter((c) => c.id !== id));
    const { error } = await supabase.from("canvases").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete Canvas");
      fetchCanvases(currentFolderId);
      return;
    }
    toast.success("Canvas deleted");
  };

  const handleDuplicate = async (canvas: Canvas) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("canvases").insert({
      user_id: session.user.id,
      title: `${canvas.title} (Copy)`,
      client_name: canvas.client_name,
      client_email: canvas.client_email,
      contract_type: canvas.contract_type,
      content: canvas.content,
      deliverables: canvas.deliverables,
      payment_terms: canvas.payment_terms,
      exclusivity: canvas.exclusivity,
      exclusivity_details: canvas.exclusivity_details,
      usage_rights: canvas.usage_rights,
      termination_clause: canvas.termination_clause,
      value: canvas.value,
      currency: canvas.currency,
      status: "draft",
    });

    if (error) {
      toast.error("Failed to duplicate Canvas");
      return;
    }
    toast.success("Canvas duplicated");
    fetchCanvases(currentFolderId);
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase
      .from("canvases")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
      return;
    }
    toast.success(`Status updated to ${status}`);
    fetchCanvases(currentFolderId);
  };

  const handleFileUpload = async (file: File, canvasType: string, title: string) => {
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

      content = `[Original file: ${file.name}]\n[File type: ${file.type || fileExt}]\n[Uploaded: ${new Date().toLocaleString()}]\n\n---\n\nYou can edit this canvas content below. The original document has been securely stored.\n\n---\n\n[Add or paste your canvas terms here]`;
    }

    const { data, error } = await supabase.from("canvases").insert({
      user_id: session.user.id,
      title,
      client_name: "To be specified",
      contract_type: canvasType,
      content,
      status: "draft",
      currency: "KES",
    }).select().single();

    if (error) {
      toast.error("Failed to create canvas record");
      return;
    }

    toast.success("Canvas uploaded! You can now edit all details.");
    fetchCanvases(currentFolderId);
    
    // Open the edit dialog immediately so user can fill in details
    if (data) {
      setEditingCanvas(data as Canvas);
    }
  };

  const formatCurrency = (amount: number | null, currency: string) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency || "KES",
    }).format(amount);
  };

  const filteredCanvases = canvases
    .filter((canvas) => {
      const matchesSearch = canvas.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        canvas.client_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || canvas.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "value") return (Number(b.value) || 0) - (Number(a.value) || 0);
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const stats = {
    total: canvases.length,
    active: canvases.filter((c) => c.status === "active" || c.status === "signed").length,
    pending: canvases.filter((c) => c.status === "sent" || c.status === "draft").length,
    totalValue: canvases.filter(c => c.status !== "cancelled").reduce((acc, c) => acc + (Number(c.value) || 0), 0),
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
              ? `Inside ${currentFolder.name} · ${canvases.length} canvas${canvases.length !== 1 ? "es" : ""}`
              : "Document management & e-signatures"}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
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
                onClick={() => {
                  if (isFree && canvasesUsedThisMonth >= limits.canvasesPerMonth) {
                    toast.error("Monthly limit reached", {
                      description: `Free plan allows ${limits.canvasesPerMonth} canvas drafts per month. Upgrade to Pro for unlimited.`,
                    });
                    return;
                  }
                  setCreateDialogOpen(true);
                }}
                className="rounded-lg gap-2"
              >
                <FileSignature className="h-4 w-4 text-primary" />
                New Canvas
                {isFree && (
                  <span className={`ml-auto text-[10px] ${isFree && canvasesUsedThisMonth >= limits.canvasesPerMonth ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                    {isFree && canvasesUsedThisMonth >= limits.canvasesPerMonth
                      ? "Limit reached"
                      : `${limits.canvasesPerMonth - canvasesUsedThisMonth} left`}
                  </span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Search & Sort */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Canvas, clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 text-base rounded-xl bg-muted/50 border-0 focus:bg-background focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-44 h-11 rounded-xl bg-muted/50 border-0">
            <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
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
                <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-background/80 border border-border/60 shadow-sm text-foreground hover:bg-muted transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 rounded-xl">
                      <DropdownMenuItem
                        onClick={() => { setRenamingFolderId(folder.id); setRenameFolderValue(folder.name); }}
                        className="rounded-lg gap-2 text-xs"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setAccessFolder(folder as any)}
                        className="rounded-lg gap-2 text-xs"
                      >
                        {(folder as any).access_level === "link_access"
                          ? <Globe className="h-3.5 w-3.5 text-bronze" />
                          : <Lock className="h-3.5 w-3.5" />}
                        Manage Access
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
      {!currentFolderId && (canvases.length > 0 || folders.length > 0) && (
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-0.5 -mb-4">
          Canvases
        </p>
      )}

      {/* Contracts List */}
      <AnimatePresence mode="wait">
        {filteredCanvases.length > 0 && (
          <motion.div key="list" className="space-y-2">
            {filteredCanvases.map((canvas, index) => {
              const typeInfo = contractTypeConfig[canvas.contract_type] || contractTypeConfig.custom;
              const status = statusConfig[canvas.status] || statusConfig.draft;
              const hasSignatures = canvas.creator_signature || canvas.client_signature;
              const bothSigned = canvas.creator_signature && canvas.client_signature;
              
              return (
                <motion.div
                  key={canvas.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div
                    className="group relative flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-4 transition-all duration-300 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 cursor-pointer md:flex-row md:items-center touch-manipulation"
                    onClick={() => setPreviewCanvas(canvas)}
                  >
                    {/* Type Icon */}
                    <div className={`hidden sm:flex w-12 h-12 rounded-2xl bg-gradient-to-br ${typeInfo.gradient} items-center justify-center text-lg flex-shrink-0 transition-transform group-hover:scale-105`}>
                      {typeInfo.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-0.5 flex flex-wrap items-start gap-2">
                        {renamingId === canvas.id ? (
                          <form
                            onSubmit={e => { e.preventDefault(); handleRename(canvas.id); }}
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
                            {canvas.title}
                          </h4>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {canvas.client_name}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:flex items-center gap-1">
                          {typeInfo.label}
                        </span>
                        {canvas.start_date && (
                          <>
                            <span className="hidden md:inline">•</span>
                            <span className="hidden md:flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {format(new Date(canvas.start_date), "MMM d, yyyy")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Value & Actions */}
                    <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end" onClick={(e) => e.stopPropagation()}>
                      {canvas.value && (
                        <div className="text-left md:text-right">
                          <p className="text-sm font-bold text-foreground tabular-nums">
                            {formatCurrency(Number(canvas.value), canvas.currency)}
                          </p>
                        </div>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl opacity-100 transition-all md:opacity-0 md:group-hover:opacity-100" onClick={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 rounded-xl">
                          <DropdownMenuItem onClick={() => setEditingCanvas(canvas)} className="rounded-lg">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSendCanvas(canvas)} className="rounded-lg">
                            <Send className="h-4 w-4 mr-2" />
                            Send
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => { setRenamingId(canvas.id); setRenameValue(canvas.title); }}
                            className="rounded-lg"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(canvas)} className="rounded-lg">
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setAccessCanvas(canvas)} className="rounded-lg">
                            {canvas.access_level === "link_access"
                              ? <Globe className="h-4 w-4 mr-2 text-bronze" />
                              : <Lock className="h-4 w-4 mr-2" />}
                            Manage Access
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {canvas.status === "sent" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(canvas.id, "signed")} className="rounded-lg">
                              <FileSignature className="h-4 w-4 mr-2" />
                              Mark as Signed
                            </DropdownMenuItem>
                          )}
                          {canvas.status === "active" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(canvas.id, "completed")} className="rounded-lg">
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Complete
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive rounded-lg"
                            onClick={() => handleDelete(canvas.id)}
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
            className="w-full h-11 rounded-xl border border-border bg-background px-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" className="h-11" onClick={() => setCreateFolderOpen(false)} disabled={creatingFolder}>
              Cancel
            </Button>
            <Button
              className="h-11 bg-bronze hover:bg-bronze/90 text-background gap-1.5"
              onClick={createFolder}
              disabled={!folderName.trim() || creatingFolder}
            >
              {creatingFolder ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FolderPlus className="h-3.5 w-3.5" />}
              Create Folder
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CreateCanvasDialog
        open={createDialogOpen || !!editingCanvas}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setEditingCanvas(null);
        }}
        editingCanvas={editingCanvas}
        folderId={currentFolderId}
        onSuccess={(newCanvas?: any) => {
          if (newCanvas && !editingCanvas) {
            // Optimistic prepend — list updates before the success animation ends
            setCanvases(prev => [newCanvas as Canvas, ...prev]);
          } else {
            // Edit path: full refetch to reflect changes
            fetchCanvases(currentFolderId);
          }
        }}
      />

      <UploadCanvasDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleFileUpload}
      />

      <CanvasPreviewDialog
        open={!!previewCanvas}
        onOpenChange={(open) => !open && setPreviewCanvas(null)}
        canvas={previewCanvas}
        onCanvasUpdate={() => fetchCanvases(currentFolderId)}
      />

      {sendCanvas && (
        <SendDocumentDialog
          open={!!sendCanvas}
          onOpenChange={(open) => !open && setSendCanvas(null)}
          type="canvas"
          documentId={sendCanvas.id}
          defaultEmail={sendCanvas.client_email || ""}
          documentLabel={sendCanvas.title}
          onSent={() => setSendCanvas(null)}
        />
      )}

      {/* Manage Access — canvas */}
      {accessCanvas && (
        <ManageAccessDialog
          open={!!accessCanvas}
          onOpenChange={(open) => !open && setAccessCanvas(null)}
          target="canvas"
          id={accessCanvas.id}
          title={accessCanvas.title}
          currentAccessLevel={accessCanvas.access_level ?? "restricted"}
          shareToken={accessCanvas.share_token}
          onAccessChanged={(level) => {
            setCanvases(prev =>
              prev.map(c => c.id === accessCanvas.id ? { ...c, access_level: level } : c)
            );
          }}
        />
      )}

      {/* Manage Access — folder */}
      {accessFolder && (
        <ManageAccessDialog
          open={!!accessFolder}
          onOpenChange={(open) => !open && setAccessFolder(null)}
          target="folder"
          id={accessFolder.id}
          title={accessFolder.name}
          currentAccessLevel={(accessFolder as any).access_level ?? "restricted"}
          shareToken={(accessFolder as any).share_token}
          onAccessChanged={(level) => {
            setFolders(prev =>
              prev.map(f => f.id === accessFolder.id ? { ...f, access_level: level } : f) as any
            );
          }}
        />
      )}
    </div>
  );
};

export default ContractsTab;
