import { useState, useEffect } from "react";
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

const StudioWorkspacesHub = ({ initialRoomId }: { initialRoomId?: string } = {}) => {
  const [userId, setUserId] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<SelectedRoom | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [memberCount, setMemberCount] = useState(1);

  // Members dialog (Add People)
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);

  // Propose workspace dialog (DM → workspace invite)
  const [proposeDialogOpen, setProposeDialogOpen] = useState(false);
  const [proposeName, setProposeName] = useState("");
  const [proposeSending, setProposeSending] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // Auto-select when navigated from notification / external link
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

  const handleSelectRoom = async (
    room: { id: string; name: string | null; created_by?: string; memberCount?: number },
    type: "workspace" | "dm"
  ) => {
    setSelectedRoom({ ...room, type });
    setShowMobileChat(true);
    setMembersDialogOpen(false);

    // Fetch member count for the workspace header
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
      {/* ── PANE 1: Inbox ── */}
      <div
        className={cn(
          "flex-shrink-0 border-r border-gray-100 dark:border-border/60",
          showMobileChat ? "hidden md:flex" : "flex w-full md:w-auto"
        )}
      >
        {userId && (
          <WorkspaceInboxList
            selectedRoomId={selectedRoom?.id ?? null}
            onSelectRoom={handleSelectRoom}
            userId={userId}
          />
        )}
      </div>

      {/* ── PANE 2: Chat / empty state ── */}
      <div
        className={cn(
          "flex flex-col min-h-0 min-w-0 overflow-hidden flex-1",
          showMobileChat ? "flex" : "hidden md:flex"
        )}
      >
        {/* Mobile back */}
        <div className="md:hidden flex-shrink-0 px-3 py-2 border-b border-gray-100 dark:border-border/50">
          <button
            onClick={() => setShowMobileChat(false)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All messages
          </button>
        </div>

        {/* Workspace action bar — shows above chat for workspaces */}
        <AnimatePresence>
          {isWorkspace && selectedRoom && (
            <motion.div
              key="ws-bar"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.16 }}
              className="flex-shrink-0 border-b border-gray-100 dark:border-border/50 px-4 py-2 flex items-center justify-between gap-2 overflow-hidden bg-card/40"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-bronze/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-bronze" />
                </div>
                <span className="text-xs font-semibold truncate text-foreground/80">
                  {selectedRoom.name ?? "Workspace"}
                </span>
                <span className="text-[10px] text-muted-foreground/50 flex-shrink-0 flex items-center gap-1">
                  <Users className="w-2.5 h-2.5" />
                  {memberCount}
                </span>
              </div>

              {/* Add People — prominent, always visible */}
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

          {/* DM toolbar — Propose Workspace */}
          {isDm && (
            <motion.div
              key="dm-bar"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.16 }}
              className="flex-shrink-0 border-b border-gray-100 dark:border-border/50 px-4 py-2 flex items-center gap-2 overflow-hidden"
            >
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setProposeName(""); setProposeDialogOpen(true); }}
                className="h-7 text-xs gap-1.5 border-bronze/30 text-bronze hover:bg-bronze/8 hover:border-bronze/50 font-medium"
              >
                <Sparkles className="w-3 h-3" />
                Propose Workspace
              </Button>
              <span className="text-[10px] text-muted-foreground/50">
                Invite this person to a deal room
              </span>
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
