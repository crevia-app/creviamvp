import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/use-subscription";
import { useFeatureGate } from "@/components/subscription/UpgradeModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Search, Plus, Users, Sparkles, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface LastMessage {
  content: string | null;
  message_type: string;
  sender_name: string | null;
  sender_id: string;
  is_encrypted: boolean;
}

interface Room {
  id: string;
  name: string | null;
  is_group: boolean;
  created_by: string;
  updated_at: string;
  avatar_url: string | null;
  memberCount?: number;
  memberUserIds?: string[];
  lastMessage?: LastMessage | null;
  unreadCount?: number;
  myRole?: string; // current user's role in this room
}

interface WorkspaceInboxListProps {
  selectedRoomId: string | null;
  onSelectRoom: (room: Room, type: "workspace" | "dm") => void;
  userId: string;
}

const timeAgo = (date: string) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: false })
      .replace("about ", "")
      .replace(" minutes", "m")
      .replace(" minute", "m")
      .replace(" hours", "h")
      .replace(" hour", "h")
      .replace(" days", "d")
      .replace(" day", "d");
  } catch {
    return "";
  }
};

const WorkspaceInboxList = ({
  selectedRoomId,
  onSelectRoom,
  userId,
}: WorkspaceInboxListProps) => {
  const { canCreateWorkspace } = useSubscription();
  const { triggerUpgrade: triggerWorkspaceUpgrade } = useFeatureGate("Workspaces");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Workspace CRUD state
  const [renameDialog, setRenameDialog] = useState<Room | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Room | null>(null);
  const [deleting, setDeleting] = useState(false);

  // New workspace dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetchRooms();

    // Real-time: bump a room to the top whenever a new message arrives
    const channel = supabase
      .channel(`inbox:${userId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_rooms" },
        (payload) => {
          const updated = payload.new as { id: string; updated_at: string };
          setRooms((prev) => {
            const idx = prev.findIndex((r) => r.id === updated.id);
            if (idx === -1) return prev;
            const room = { ...prev[idx], updated_at: updated.updated_at };
            const rest = prev.filter((_, i) => i !== idx);
            return [room, ...rest];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_room_members", filter: `user_id=eq.${userId}` },
        () => {
          // A new room was shared with this user — refresh the full list
          fetchRooms();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const fetchRooms = async () => {
    const { data: memberRooms } = await supabase
      .from("chat_room_members")
      .select("room_id, role")
      .eq("user_id", userId);

    if (!memberRooms?.length) {
      setLoading(false);
      return;
    }

    const roomIds = memberRooms.map((m) => m.room_id);
    // Map roomId → current user's role
    const myRoleMap: Record<string, string> = {};
    for (const m of memberRooms) myRoleMap[m.room_id] = m.role;

    const [roomsResult, lastMsgsResult, readResult] = await Promise.all([
      supabase
        .from("chat_rooms")
        .select("*, chat_room_members(user_id)")
        .in("id", roomIds)
        .not("name", "is", null)
        .order("updated_at", { ascending: false }),

      // Last message per room via a raw join — fetch recent messages and dedupe in JS
      supabase
        .from("chat_messages")
        .select("id, room_id, content, message_type, sender_id, is_encrypted, created_at")
        .in("room_id", roomIds)
        .order("created_at", { ascending: false })
        .limit(roomIds.length * 3),

      supabase
        .from("chat_read_receipts")
        .select("room_id, last_read_at")
        .eq("user_id", userId)
        .in("room_id", roomIds),
    ]);

    if (!roomsResult.data) { setLoading(false); return; }

    // Build a map of roomId → last message (deduplicated)
    const lastMsgMap: Record<string, { content: string | null; message_type: string; sender_id: string; is_encrypted: boolean }> = {};
    for (const msg of lastMsgsResult.data ?? []) {
      if (!lastMsgMap[msg.room_id]) lastMsgMap[msg.room_id] = msg;
    }

    // Read receipt map
    const readMap: Record<string, string> = {};
    for (const r of readResult.data ?? []) readMap[r.room_id] = r.last_read_at;

    // Fetch sender names for last messages
    const senderIds = [...new Set(Object.values(lastMsgMap).map((m) => m.sender_id))];
    const senderMap: Record<string, string | null> = {};
    if (senderIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", senderIds);
      for (const p of profiles ?? []) senderMap[p.id] = p.display_name;
    }

    const enriched: Room[] = roomsResult.data.map((r) => {
      const memberIds: string[] = (r.chat_room_members ?? []).map(
        (m: { user_id: string }) => m.user_id
      );
      const lm = lastMsgMap[r.id];
      const lastReadAt = readMap[r.id];

      return {
        ...r,
        memberCount: memberIds.length,
        memberUserIds: memberIds,
        lastMessage: lm
          ? { content: lm.content, message_type: lm.message_type, sender_name: senderMap[lm.sender_id] ?? null, sender_id: lm.sender_id, is_encrypted: lm.is_encrypted }
          : null,
        unreadCount: lastReadAt ? undefined : undefined,
        myRole: myRoleMap[r.id] ?? "member",
      };
    });

    setRooms(enriched);
    setLoading(false);
  };

  const createWorkspace = async () => {
    if (!canCreateWorkspace) { triggerWorkspaceUpgrade(); return; }
    if (!createName.trim()) return;

    setCreating(true);
    const { data, error } = await supabase
      .from("chat_rooms")
      .insert({ created_by: userId, is_group: true, name: createName.trim() })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create workspace", { description: error.message });
      setCreating(false);
      return;
    }

    if (data) {
      const { error: memberError } = await supabase
        .from("chat_room_members")
        .insert({ room_id: data.id, user_id: userId, role: "admin" });

      if (memberError) {
        toast.error("Workspace created but failed to add you as admin", { description: memberError.message });
      } else {
        const newRoom: Room = { ...data, memberCount: 1 };
        setRooms((prev) => [newRoom, ...prev]);
        onSelectRoom(newRoom, "workspace");
        setCreateDialogOpen(false);
        setCreateName("");
        toast.success("Workspace created!");
      }
    }

    setCreating(false);
  };

  const handleRename = async () => {
    if (!renameDialog || !renameValue.trim()) return;
    setRenaming(true);
    const { error } = await supabase
      .from("chat_rooms")
      .update({ name: renameValue.trim() })
      .eq("id", renameDialog.id);

    if (error) {
      toast.error("Failed to rename workspace");
    } else {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === renameDialog.id ? { ...r, name: renameValue.trim() } : r
        )
      );
      toast.success("Workspace renamed");
      setRenameDialog(null);
    }
    setRenaming(false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    await supabase.from("chat_room_members").delete().eq("room_id", deleteConfirm.id);
    const { error } = await supabase.from("chat_rooms").delete().eq("id", deleteConfirm.id);

    if (error) {
      toast.error("Failed to delete workspace");
    } else {
      setRooms((prev) => prev.filter((r) => r.id !== deleteConfirm.id));
      toast.success("Workspace deleted");
      setDeleteConfirm(null);
    }
    setDeleting(false);
  };

  const q = search.toLowerCase();
  const workspaces = rooms.filter(
    (r) => r.name !== null && (!q || r.name!.toLowerCase().includes(q))
  );

  const SkeletonItem = () => (
    <div className="flex items-center gap-2.5 p-2.5 rounded-xl">
      <div className="w-9 h-9 rounded-xl bg-muted animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 bg-muted animate-pulse rounded w-3/4" />
        <div className="h-2 bg-muted animate-pulse rounded w-1/2" />
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col w-full h-full bg-background overflow-hidden">
        {/* Header — single command row */}
        <div className="flex items-center justify-between w-full gap-3 px-4 py-2 border-b border-gray-100 dark:border-border/50 flex-shrink-0">
          <h3 className="text-xl font-semibold tracking-tight flex-shrink-0">
            Workspaces
          </h3>
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-8 h-10 w-full text-sm bg-gray-50 dark:bg-muted/40 border-gray-100 dark:border-border/50 focus-visible:ring-bronze/30"
            />
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => { setCreateName(""); setCreateDialogOpen(true); }}
              title="New workspace"
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 hover:scale-105 active:scale-95"
              style={{ background: "#F0782F", color: "#ffffff" }}
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="pb-2">
            {/* Active Workspaces */}
            <div>
              {loading ? (
                <div className="space-y-0.5 px-2 pt-1">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonItem key={i} />
                  ))}
                </div>
              ) : workspaces.length === 0 ? (
                <div className="px-4 py-5 text-center">
                  <Sparkles className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-[11px] text-muted-foreground">
                    No workspaces yet
                  </p>
                  <button
                    onClick={() => { setCreateName(""); setCreateDialogOpen(true); }}
                    className="text-[11px] text-bronze hover:underline mt-1"
                  >
                    Create one
                  </button>
                </div>
              ) : (
                <div className="space-y-0.5 px-2 pt-1">
                  {workspaces.map((room, idx) => {
                    const isSelected = selectedRoomId === room.id;
                    return (
                      <motion.div
                        key={room.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.04 }}
                        className={cn(
                          "relative flex items-center rounded-xl transition-all duration-150 group",
                          isSelected
                            ? "bg-bronze/10 border border-bronze/20 shadow-sm"
                            : "[@media(hover:hover)]:hover:bg-gray-50 dark:[@media(hover:hover)]:hover:bg-muted/50 active:bg-muted/30 border border-transparent"
                        )}
                      >
                        {/* Selectable area */}
                        <button
                          onClick={() => onSelectRoom(room, "workspace")}
                          className="flex-1 text-left p-2.5 min-w-0 touch-manipulation"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 overflow-hidden",
                              isSelected ? "bg-bronze/20" : "bg-gray-100 dark:bg-muted [@media(hover:hover)]:group-hover:bg-bronze/10"
                            )}>
                              {room.avatar_url ? (
                                <img src={room.avatar_url} alt={room.name ?? ""} className="w-full h-full object-cover" />
                              ) : (
                                <Sparkles className={cn(
                                  "w-4 h-4 transition-colors duration-150",
                                  isSelected ? "text-bronze" : "text-muted-foreground/50 [@media(hover:hover)]:group-hover:text-bronze/60"
                                )} />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <p className={cn(
                                  "text-[12px] font-semibold truncate leading-snug",
                                  isSelected ? "text-foreground" : "text-foreground/85"
                                )}>
                                  {room.name}
                                </p>
                                <span className="text-[9px] text-muted-foreground/50 whitespace-nowrap flex-shrink-0">
                                  {timeAgo(room.updated_at)}
                                </span>
                              </div>
                              {/* Last message preview — WhatsApp style */}
                              {room.lastMessage ? (
                                <p className="text-[10px] text-muted-foreground/70 truncate leading-snug">
                                  {room.lastMessage.sender_id === userId
                                    ? <span className="text-muted-foreground/50">You: </span>
                                    : room.lastMessage.sender_name
                                    ? <span className="text-bronze/70">{room.lastMessage.sender_name}: </span>
                                    : null}
                                  {room.lastMessage.message_type === "file"
                                    ? "📎 File"
                                    : room.lastMessage.message_type === "voice"
                                    ? "🎤 Voice note"
                                    : room.lastMessage.message_type === "poll"
                                    ? "📊 Poll"
                                    : room.lastMessage.message_type === "invoice"
                                    ? "🧾 Invoice"
                                    : room.lastMessage.is_encrypted
                                    ? "New message"
                                    : (room.lastMessage.content || "").slice(0, 45)}
                                </p>
                              ) : (
                                <p className="text-[10px] text-muted-foreground/40 truncate leading-snug">
                                  {room.memberCount || 1} member{(room.memberCount || 1) !== 1 ? "s" : ""}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>

                        {/* ⋮ context menu — owner+admin can rename; only owner can delete */}
                        {(room.created_by === userId || room.myRole === "admin") && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="mr-1.5 w-6 h-6 flex items-center justify-center rounded-lg opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity [@media(hover:hover)]:hover:bg-muted text-muted-foreground/60 [@media(hover:hover)]:hover:text-foreground flex-shrink-0"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); setRenameValue(room.name ?? ""); setRenameDialog(room); }}
                                className="text-xs gap-2"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Rename
                              </DropdownMenuItem>
                              {room.created_by === userId && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(room); }}
                                    className="text-xs gap-2 text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Create Workspace Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={(o) => { if (!o) setCreateDialogOpen(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">New Workspace</DialogTitle>
          </DialogHeader>
          <Input
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="e.g. Nike x Crevia Campaign"
            className="h-11 text-base"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter" && !creating) createWorkspace(); }}
          />
          <div className="flex gap-2 justify-end mt-1">
            <Button variant="outline" className="h-11" onClick={() => setCreateDialogOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button className="h-11 bg-bronze hover:bg-bronze/90 text-background" onClick={createWorkspace} disabled={!createName.trim() || creating}>
              {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={!!renameDialog} onOpenChange={(o) => { if (!o) setRenameDialog(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Rename Workspace</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="Workspace name"
            className="h-11 text-base"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") handleRename(); }}
          />
          <div className="flex gap-2 justify-end mt-1">
            <Button variant="outline" className="h-11" onClick={() => setRenameDialog(null)} disabled={renaming}>
              Cancel
            </Button>
            <Button className="h-11 bg-bronze hover:bg-bronze/90 text-background" onClick={handleRename} disabled={!renameValue.trim() || renaming}>
              {renaming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(o) => { if (!o) setDeleteConfirm(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-semibold">
              Delete Workspace
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Permanently delete{" "}
              <strong>{deleteConfirm?.name ?? "this workspace"}</strong>{" "}
              and all its messages? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}
              className="h-11 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WorkspaceInboxList;
