import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { Search, Plus, MessageSquare, Users, Sparkles, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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

interface Room {
  id: string;
  name: string | null;
  is_group: boolean;
  created_by: string;
  updated_at: string;
  avatar_url: string | null;
  memberCount?: number;
  dmPartnerName?: string | null;
  dmPartnerAvatar?: string | null;
  dmPartnerInitial?: string;
  memberUserIds?: string[];
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

  // New DM dialog state
  const [dmDialogOpen, setDmDialogOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [startingDM, setStartingDM] = useState<string | null>(null);

  useEffect(() => {
    if (userId) fetchRooms();
  }, [userId]);

  const fetchRooms = async () => {
    const { data: memberRooms } = await supabase
      .from("chat_room_members")
      .select("room_id")
      .eq("user_id", userId);

    if (!memberRooms?.length) {
      setLoading(false);
      return;
    }

    const roomIds = memberRooms.map((m) => m.room_id);

    const { data: roomsData } = await supabase
      .from("chat_rooms")
      .select("*, chat_room_members(user_id)")
      .in("id", roomIds)
      .order("updated_at", { ascending: false });

    if (!roomsData) {
      setLoading(false);
      return;
    }

    const enriched: Room[] = await Promise.all(
      roomsData.map(async (r) => {
        const memberIds: string[] = (r.chat_room_members ?? []).map(
          (m: { user_id: string }) => m.user_id
        );
        const base: Room = {
          ...r,
          memberCount: memberIds.length,
          memberUserIds: memberIds,
        };

        if (r.name === null && !r.is_group) {
          const partnerId = memberIds.find((id) => id !== userId);
          if (partnerId) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("display_name, handle, avatar_url")
              .eq("id", partnerId)
              .single();

            if (profile) {
              const displayName =
                profile.display_name ||
                (profile.handle ? `@${profile.handle}` : null);
              return {
                ...base,
                dmPartnerName: displayName,
                dmPartnerAvatar: profile.avatar_url,
                dmPartnerInitial: (displayName ?? "?")[0].toUpperCase(),
              };
            }
          }
        }
        return base;
      })
    );

    setRooms(enriched);
    setLoading(false);
  };

  const createWorkspace = async () => {
    if (!createName.trim()) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("chat_rooms")
      .insert({ created_by: userId, is_group: false, name: createName.trim() })
      .select()
      .single();

    if (!error && data) {
      await supabase
        .from("chat_room_members")
        .insert({ room_id: data.id, user_id: userId, role: "admin" });
      const newRoom: Room = { ...data, memberCount: 1 };
      setRooms((prev) => [newRoom, ...prev]);
      onSelectRoom(newRoom, "workspace");
      setCreateDialogOpen(false);
      setCreateName("");
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

  const openDmDialog = async () => {
    setDmDialogOpen(true);
    setUserSearch("");
    if (!allUsers.length) {
      setLoadingUsers(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, handle, avatar_url, user_type")
        .neq("id", userId)
        .order("display_name");
      setAllUsers(data || []);
      setLoadingUsers(false);
    }
  };

  const startDirectChat = async (otherUserId: string) => {
    setStartingDM(otherUserId);
    try {
      // Check for existing DM room between these two users
      const { data: myRooms } = await supabase
        .from("chat_room_members")
        .select("room_id")
        .eq("user_id", userId);

      const { data: theirRooms } = await supabase
        .from("chat_room_members")
        .select("room_id")
        .eq("user_id", otherUserId);

      if (myRooms && theirRooms) {
        const myRoomIds = new Set(myRooms.map((r) => r.room_id));
        const commonIds = theirRooms
          .filter((r) => myRoomIds.has(r.room_id))
          .map((r) => r.room_id);

        if (commonIds.length > 0) {
          const { data: existing } = await supabase
            .from("chat_rooms")
            .select("*")
            .in("id", commonIds)
            .eq("is_group", false)
            .is("name", null);

          if (existing?.length) {
            setDmDialogOpen(false);
            // Find or add to rooms list
            const existingInList = rooms.find((r) => r.id === existing[0].id);
            if (existingInList) {
              onSelectRoom(existingInList, "dm");
            } else {
              await fetchRooms();
              onSelectRoom({ ...existing[0], memberCount: 2 }, "dm");
            }
            return;
          }
        }
      }

      // Create new DM room
      const { data: room, error } = await supabase
        .from("chat_rooms")
        .insert({ created_by: userId, is_group: false })
        .select()
        .single();

      if (error || !room) { toast.error("Failed to start conversation"); return; }

      await supabase.from("chat_room_members").insert([
        { room_id: room.id, user_id: userId, role: "admin" },
        { room_id: room.id, user_id: otherUserId, role: "member" },
      ]);

      setDmDialogOpen(false);
      await fetchRooms();
      onSelectRoom({ ...room, memberCount: 2 }, "dm");
    } finally {
      setStartingDM(null);
    }
  };

  const q = search.toLowerCase();
  const workspaces = rooms.filter(
    (r) => r.name !== null && (!q || r.name!.toLowerCase().includes(q))
  );
  const dms = rooms.filter(
    (r) =>
      r.name === null &&
      !r.is_group &&
      (!q || (r.dmPartnerName ?? "").toLowerCase().includes(q))
  );

  const filteredUsers = allUsers.filter((u) => {
    const term = userSearch.toLowerCase();
    return (
      !term ||
      u.display_name?.toLowerCase().includes(term) ||
      u.handle?.toLowerCase().includes(term)
    );
  });

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
      <div className="flex flex-col w-[268px] xl:w-[295px] flex-shrink-0 border-r border-gray-100 dark:border-border/60 bg-background overflow-hidden">
        {/* Header — search only, no "New" button */}
        <div className="px-3 pt-3 pb-2.5 border-b border-gray-100 dark:border-border/50 flex-shrink-0 space-y-2.5">
          <h3 className="font-semibold text-sm tracking-tight">Messages</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-8 h-8 text-xs bg-gray-50 dark:bg-muted/40 border-gray-100 dark:border-border/50 focus-visible:ring-bronze/30"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-4">
            {/* Active Workspaces */}
            <div>
              <div className="flex items-center justify-between px-2 py-1.5">
                <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
                  Active Workspaces
                </p>
                <button
                  onClick={() => { setCreateName(""); setCreateDialogOpen(true); }}
                  title="New workspace"
                  className="w-5 h-5 flex items-center justify-center rounded-md text-muted-foreground/50 hover:text-bronze hover:bg-bronze/10 transition-all duration-150"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {loading ? (
                <div className="space-y-0.5">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonItem key={i} />
                  ))}
                </div>
              ) : workspaces.length === 0 ? (
                <div className="px-2 py-5 text-center">
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
                <div className="space-y-0.5">
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
                            : "hover:bg-gray-50 dark:hover:bg-muted/50 border border-transparent"
                        )}
                      >
                        {/* Selectable area */}
                        <button
                          onClick={() => onSelectRoom(room, "workspace")}
                          className="flex-1 text-left p-2.5 min-w-0"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150",
                              isSelected ? "bg-bronze/20" : "bg-gray-100 dark:bg-muted group-hover:bg-bronze/10"
                            )}>
                              <Sparkles className={cn(
                                "w-4 h-4 transition-colors duration-150",
                                isSelected ? "text-bronze" : "text-muted-foreground/50 group-hover:text-bronze/60"
                              )} />
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
                              <div className="flex items-center gap-1.5">
                                <Users className="w-2.5 h-2.5 text-muted-foreground/40" />
                                <span className="text-[10px] text-muted-foreground/60">
                                  {room.memberCount || 1} member{(room.memberCount || 1) !== 1 ? "s" : ""}
                                </span>
                                <Badge variant="outline" className="h-3.5 px-1 text-[8px] border-bronze/25 text-bronze/80 ml-auto leading-none">
                                  Active
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* ⋮ context menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="mr-1.5 w-6 h-6 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted text-muted-foreground/60 hover:text-foreground flex-shrink-0"
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirm(room); }}
                              className="text-xs gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Direct Messages */}
            <div>
              <div className="flex items-center justify-between px-2 py-1.5">
                <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
                  Direct Messages
                </p>
                <button
                  onClick={openDmDialog}
                  title="New direct message"
                  className="w-5 h-5 flex items-center justify-center rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-all duration-150"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {loading ? (
                <div className="space-y-0.5">
                  {[...Array(2)].map((_, i) => (
                    <SkeletonItem key={i} />
                  ))}
                </div>
              ) : dms.length === 0 ? (
                <div className="px-2 py-5 text-center">
                  <MessageSquare className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-[11px] text-muted-foreground">
                    No direct messages
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {dms.map((room) => {
                    const isSelected = selectedRoomId === room.id;
                    const name = room.dmPartnerName ?? "Unknown user";
                    const initial = room.dmPartnerInitial ?? name[0].toUpperCase();
                    return (
                      <div
                        key={room.id}
                        className={cn(
                          "relative flex items-center rounded-xl transition-all duration-150 group border",
                          isSelected
                            ? "bg-accent border-border"
                            : "hover:bg-gray-50 dark:hover:bg-muted/50 border-transparent"
                        )}
                      >
                        <button
                          onClick={() => onSelectRoom(room, "dm")}
                          className="flex-1 text-left p-2.5 min-w-0"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {room.dmPartnerAvatar ? (
                                <img
                                  src={room.dmPartnerAvatar}
                                  alt={name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-[13px] font-semibold text-muted-foreground/70">
                                  {initial}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <p className="text-[12px] font-semibold truncate text-foreground/85">
                                  {name}
                                </p>
                                <span className="text-[9px] text-muted-foreground/50 whitespace-nowrap flex-shrink-0">
                                  {timeAgo(room.updated_at)}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground/50">
                                Direct message
                              </p>
                            </div>
                          </div>
                        </button>

                        {/* ⋮ context menu for DMs */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="mr-1.5 w-6 h-6 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted text-muted-foreground/60 hover:text-foreground flex-shrink-0"
                            >
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirm(room); }}
                              className="text-xs gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete Chat
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
            className="h-9 text-sm"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter" && !creating) createWorkspace(); }}
          />
          <div className="flex gap-2 justify-end mt-1">
            <Button variant="outline" size="sm" onClick={() => setCreateDialogOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button size="sm" onClick={createWorkspace} disabled={!createName.trim() || creating}
              className="bg-bronze hover:bg-bronze/90 text-background">
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
            className="h-9 text-sm"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") handleRename(); }}
          />
          <div className="flex gap-2 justify-end mt-1">
            <Button variant="outline" size="sm" onClick={() => setRenameDialog(null)} disabled={renaming}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleRename} disabled={!renameValue.trim() || renaming}
              className="bg-bronze hover:bg-bronze/90 text-background">
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
              {deleteConfirm?.name ? "Delete Workspace" : "Delete Chat"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Permanently delete{" "}
              <strong>{deleteConfirm?.name ?? deleteConfirm?.dmPartnerName ?? "this conversation"}</strong>{" "}
              and all its messages? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-8">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}
              className="text-xs h-8 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New DM Dialog */}
      <Dialog open={dmDialogOpen} onOpenChange={setDmDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              New Direct Message
            </DialogTitle>
          </DialogHeader>

          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
            <Input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search people..."
              className="pl-8 h-9 text-sm"
              autoFocus
            />
          </div>

          <ScrollArea className="max-h-64">
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="space-y-0.5 pr-2">
                {filteredUsers.map((user) => {
                  const name =
                    user.display_name ||
                    (user.handle ? `@${user.handle}` : "Unknown");
                  const initial = name[0].toUpperCase();
                  const isStarting = startingDM === user.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => startDirectChat(user.id)}
                      disabled={!!startingDM}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-all duration-150 text-left disabled:opacity-60"
                    >
                      <div className="w-9 h-9 rounded-full bg-bronze/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-[13px] font-semibold text-bronze/70">
                            {initial}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{name}</p>
                        {user.handle && (
                          <p className="text-xs text-muted-foreground truncate">
                            @{user.handle}
                          </p>
                        )}
                      </div>
                      {isStarting && (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkspaceInboxList;
