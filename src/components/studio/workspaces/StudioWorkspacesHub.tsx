import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  ArrowLeft,
  Sparkles,
  Loader2,
  Users,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import CreviaChat from "@/components/crevia-connect/shared/CreviaChat";
import WorkspaceInboxList from "./WorkspaceInboxList";
import WorkspaceMembersDialog from "./WorkspaceMembersDialog";

interface SelectedRoom {
  id: string;
  name: string | null;
  type: "workspace" | "dm";
  created_by?: string;
  memberCount?: number;
}

const MIN_SIDEBAR = 260;
const MAX_SIDEBAR = 520;
const DEFAULT_SIDEBAR = 320;

const StudioWorkspacesHub = ({ initialRoomId }: { initialRoomId?: string } = {}) => {
  const [userId, setUserId] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<SelectedRoom | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [memberCount, setMemberCount] = useState(1);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR);
  const [isMobile, setIsMobile] = useState(false);

  // Members dialog
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);

  // Propose workspace dialog
  const [proposeDialogOpen, setProposeDialogOpen] = useState(false);
  const [proposeName, setProposeName] = useState("");
  const [proposeSending, setProposeSending] = useState(false);

  // Resize state
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Global resize drag listeners
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = e.clientX - startX.current;
      setSidebarWidth(Math.min(Math.max(startWidth.current + delta, MIN_SIDEBAR), MAX_SIDEBAR));
    };
    const onUp = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [sidebarWidth]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    if (!initialRoomId || !userId) return;
    supabase
      .from("chat_rooms")
      .select("id, name, is_group, created_by")
      .eq("id", initialRoomId)
      .single()
      .then(({ data: room }) => {
        if (room) {
          handleSelectRoom(
            { id: room.id, name: room.name, created_by: room.created_by },
            room.name ? "workspace" : "dm"
          );
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRoomId, userId]);

  // Auto-mark message notifications as read when a room is opened
  useEffect(() => {
    if (!selectedRoom || !userId) return;
    supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("type", "message")
      .eq("read", false)
      .filter("data->>room_id", "eq", selectedRoom.id)
      .then(() => {});
  }, [selectedRoom?.id, userId]);

  const handleSelectRoom = async (
    room: { id: string; name: string | null; created_by?: string; memberCount?: number },
    type: "workspace" | "dm"
  ) => {
    setSelectedRoom({ ...room, type });
    setShowMobileChat(true);
    setMembersDialogOpen(false);
    if (type === "workspace") {
      const { count } = await supabase
        .from("chat_room_members")
        .select("*", { count: "exact", head: true })
        .eq("room_id", room.id);
      setMemberCount(count ?? 1);
    }
  };

  const handleProposeWorkspace = async () => {
    if (!selectedRoom || !userId || !proposeName.trim()) return;
    setProposeSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      room_id: selectedRoom.id,
      sender_id: userId,
      message_type: "workspace_invite",
      content: JSON.stringify({ status: "pending", workspace_name: proposeName.trim() }),
      is_encrypted: false,
    });
    setProposeSending(false);
    if (error) {
      toast.error("Failed to send workspace invite");
    } else {
      toast.success("Workspace invite sent!");
      setProposeDialogOpen(false);
      setProposeName("");
    }
  };

  const isWorkspace = selectedRoom?.type === "workspace";
  const isDm = selectedRoom?.type === "dm";

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">

      {/* ── PANE 1: Inbox sidebar ── */}
      <div
        className={cn(
          "flex-shrink-0 overflow-hidden flex flex-col h-full",
          showMobileChat ? "hidden md:flex" : "flex w-full"
        )}
        style={!isMobile ? { width: sidebarWidth } : undefined}
      >
        {userId && (
          <WorkspaceInboxList
            selectedRoomId={selectedRoom?.id ?? null}
            onSelectRoom={handleSelectRoom}
            userId={userId}
          />
        )}
      </div>

      {/* ── Resize handle — desktop only ── */}
      <div
        onMouseDown={handleResizeStart}
        className="hidden md:flex items-center justify-center w-2 cursor-col-resize flex-shrink-0 relative group border-r border-gray-100 dark:border-border/60 hover:border-bronze/30 transition-colors duration-200 select-none"
        title="Drag to resize"
      >
        <div className="w-0.5 h-10 bg-border/30 rounded-full group-hover:bg-bronze/50 group-active:bg-bronze transition-colors duration-150" />
      </div>

      {/* ── PANE 2: Chat / empty state ── */}
      <div
        className={cn(
          "flex flex-col min-h-0 min-w-0 overflow-hidden flex-1",
          showMobileChat ? "flex" : "hidden md:flex"
        )}
      >
        {/* Mobile back button */}
        <div className="md:hidden flex-shrink-0 h-7 flex items-center gap-1.5 px-2 border-b border-gray-100 dark:border-border/50 bg-background/80 backdrop-blur-sm">
          <button
            onClick={() => setShowMobileChat(false)}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-medium text-muted-foreground truncate">All messages</span>
        </div>

        {/* Workspace / DM action bar */}
        <AnimatePresence>
          {isWorkspace && selectedRoom && (
            <motion.div
              key="ws-bar"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.16 }}
              className="flex-shrink-0 border-b border-gray-100 dark:border-border/50 px-3 py-1.5 flex items-center justify-between gap-2 overflow-hidden bg-card/50 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-bronze/15 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-bronze" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate text-foreground/90 leading-tight">
                    {selectedRoom.name ?? "Workspace"}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 flex items-center gap-1 leading-tight">
                    <Users className="w-2.5 h-2.5" />
                    {memberCount} member{memberCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setMembersDialogOpen(true)}
                className="h-7 text-xs gap-1.5 bg-bronze hover:bg-bronze/90 text-background font-semibold flex-shrink-0"
              >
                <UserPlus className="w-3 h-3" />
                Add People
              </Button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Main content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedRoom ? (
              <motion.div
                key={selectedRoom.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full flex flex-col"
              >
                <CreviaChat
                  externalRoomId={selectedRoom.id}
                  hideRoomList
                  onBack={() => setShowMobileChat(false)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="h-full flex flex-col items-center justify-center text-center p-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-bronze/8 dark:bg-bronze/10 flex items-center justify-center mb-4">
                  <MessageSquare className="w-7 h-7 text-bronze/40" />
                </div>
                <h3 className="font-semibold text-sm mb-1.5 tracking-tight">
                  Select a conversation
                </h3>
                <p className="text-[12px] text-muted-foreground max-w-[240px] leading-relaxed">
                  Choose a workspace or direct message from the list to open the thread.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Members dialog */}
      {selectedRoom && isWorkspace && (
        <WorkspaceMembersDialog
          open={membersDialogOpen}
          onOpenChange={setMembersDialogOpen}
          roomId={selectedRoom.id}
          createdBy={selectedRoom.created_by ?? ""}
          currentUserId={userId}
        />
      )}

      {/* Propose Workspace dialog */}
      <Dialog open={proposeDialogOpen} onOpenChange={(o) => { if (!o) setProposeDialogOpen(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-bronze/10">
                <Sparkles className="w-4 h-4 text-bronze" />
              </div>
              <DialogTitle className="text-sm font-semibold">Name the Workspace</DialogTitle>
            </div>
          </DialogHeader>
          <p className="text-xs text-muted-foreground mb-3">
            Give this deal room a name. The other person will see it when they accept.
          </p>
          <Input
            value={proposeName}
            onChange={(e) => setProposeName(e.target.value)}
            placeholder="e.g. Nike x Crevia Campaign"
            className="h-9 text-sm"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter" && !proposeSending) handleProposeWorkspace(); }}
          />
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" size="sm" onClick={() => setProposeDialogOpen(false)} disabled={proposeSending}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleProposeWorkspace}
              disabled={!proposeName.trim() || proposeSending}
              className="bg-bronze hover:bg-bronze/90 text-background font-semibold gap-1.5"
            >
              {proposeSending
                ? <span className="w-3.5 h-3.5 border-2 border-background/40 border-t-background rounded-full animate-spin" />
                : <Sparkles className="w-3.5 h-3.5" />}
              Send Invite
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudioWorkspacesHub;
