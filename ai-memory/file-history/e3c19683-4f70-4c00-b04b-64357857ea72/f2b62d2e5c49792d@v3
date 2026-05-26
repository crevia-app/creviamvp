import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  ArrowLeft,
  Sparkles,
  Loader2,
  MessageCircle,
  Users,
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

interface SelectedRoom {
  id: string;
  name: string | null;
  type: "workspace" | "dm";
}

interface WorkspaceMember {
  user_id: string;
  role: string;
  profile: {
    display_name: string | null;
    handle: string | null;
    avatar_url: string | null;
    user_type: string | null;
  } | null;
}

const StudioWorkspacesHub = () => {
  const [userId, setUserId] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<SelectedRoom | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Workspace members for the centre pane
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Active DM inside a workspace context
  const [activeDm, setActiveDm] = useState<{ roomId: string; name: string } | null>(null);
  const [openingDm, setOpeningDm] = useState<string | null>(null);

  // Propose workspace dialog
  const [proposeDialogOpen, setProposeDialogOpen] = useState(false);
  const [proposeName, setProposeName] = useState("");
  const [proposeSending, setProposeSending] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const handleSelectRoom = async (
    room: { id: string; name: string | null },
    type: "workspace" | "dm"
  ) => {
    setActiveDm(null);
    setSelectedRoom({ id: room.id, name: room.name, type });
    setShowMobileChat(true);

    if (type === "workspace") {
      setLoadingMembers(true);
      const { data: memberRows } = await supabase
        .from("chat_room_members")
        .select("user_id, role")
        .eq("room_id", room.id);

      const others = (memberRows || []).filter((m: any) => m.user_id !== userId);

      if (others.length > 0) {
        const otherIds = others.map((m: any) => m.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, handle, avatar_url, user_type")
          .in("id", otherIds);

        const profileMap = Object.fromEntries(
          (profiles || []).map((p: any) => [p.id, p])
        );

        setWorkspaceMembers(
          others.map((m: any) => ({
            user_id: m.user_id,
            role: m.role,
            profile: profileMap[m.user_id] ?? null,
          }))
        );
      } else {
        setWorkspaceMembers([]);
      }
      setLoadingMembers(false);
    } else {
      setWorkspaceMembers([]);
    }
  };

  const openDmWithMember = async (targetUserId: string, targetName: string) => {
    if (!userId) return;
    setOpeningDm(targetUserId);

    const { data: myRooms } = await supabase
      .from("chat_room_members")
      .select("room_id")
      .eq("user_id", userId);

    const myRoomIds = (myRooms || []).map((r: any) => r.room_id);

    if (myRoomIds.length > 0) {
      const { data: shared } = await supabase
        .from("chat_room_members")
        .select("room_id, chat_rooms:room_id(is_group)")
        .eq("user_id", targetUserId)
        .in("room_id", myRoomIds);

      const existing = (shared || []).find(
        (r: any) => r.chat_rooms?.is_group === false
      );
      if (existing) {
        setActiveDm({ roomId: existing.room_id, name: targetName });
        setOpeningDm(null);
        return;
      }
    }

    const { data: room, error } = await supabase
      .from("chat_rooms")
      .insert({ created_by: userId, is_group: false })
      .select()
      .single();

    if (error || !room) {
      toast.error("Failed to open chat");
      setOpeningDm(null);
      return;
    }

    await supabase.from("chat_room_members").insert([
      { room_id: room.id, user_id: userId, role: "admin" },
      { room_id: room.id, user_id: targetUserId, role: "member" },
    ]);

    setActiveDm({ roomId: room.id, name: targetName });
    setOpeningDm(null);
  };

  const handleProposeWorkspace = async () => {
    if (!selectedRoom || !userId || !proposeName.trim()) return;
    setProposeSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      room_id: selectedRoom.id,
      sender_id: userId,
      message_type: "workspace_invite",
      content: JSON.stringify({
        status: "pending",
        workspace_name: proposeName.trim(),
      }),
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

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* ── PANE 1: Inbox List ── */}
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

      {/* ── PANE 2: Centre ── */}
      <div
        className={cn(
          "flex flex-col min-h-0 min-w-0 overflow-hidden flex-1",
          showMobileChat ? "flex" : "hidden md:flex"
        )}
      >
        {/* Mobile back button */}
        <div className="md:hidden flex-shrink-0 px-3 py-2 border-b border-gray-100 dark:border-border/50">
          <button
            onClick={() => {
              setShowMobileChat(false);
              setActiveDm(null);
            }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All messages
          </button>
        </div>

        {/* DM toolbar — Propose Workspace */}
        <AnimatePresence>
          {selectedRoom?.type === "dm" && !activeDm && (
            <motion.div
              key="dm-toolbar"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="flex-shrink-0 border-b border-gray-100 dark:border-border/50 px-4 py-2 flex items-center gap-2 overflow-hidden"
            >
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setProposeName("");
                  setProposeDialogOpen(true);
                }}
                className="h-7 text-xs gap-1.5 border-bronze/30 text-bronze hover:bg-primary hover:text-primary-foreground font-medium"
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

        {/* Centre content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedRoom?.type === "dm" || activeDm ? (
              <motion.div
                key={activeDm?.roomId ?? selectedRoom?.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full flex flex-col"
              >
                {activeDm && (
                  <div className="flex-shrink-0 px-4 py-2 border-b border-gray-100 dark:border-border/50 flex items-center gap-2 bg-card/30">
                    <button
                      onClick={() => setActiveDm(null)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to workspace
                    </button>
                    <span className="text-[10px] text-muted-foreground/40">·</span>
                    <span className="text-xs font-medium text-foreground/70">
                      {activeDm.name}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-h-0">
                  <CreviaChat
                    externalRoomId={activeDm?.roomId ?? selectedRoom!.id}
                    hideRoomList
                    onBack={() =>
                      activeDm ? setActiveDm(null) : setShowMobileChat(false)
                    }
                  />
                </div>
              </motion.div>
            ) : isWorkspace && selectedRoom ? (
              /* Workspace member list */
              <motion.div
                key={`ws-${selectedRoom.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full overflow-y-auto"
              >
                <div className="p-6 max-w-lg mx-auto">
                  <div className="flex items-center gap-2 mb-5">
                    <Users className="w-4 h-4 text-bronze/70" />
                    <h2 className="text-sm font-semibold text-foreground/80 tracking-tight">
                      Workspace Members
                    </h2>
                  </div>

                  {loadingMembers ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/40" />
                    </div>
                  ) : workspaceMembers.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                      <p className="text-sm font-medium text-foreground/60 mb-1">
                        No other members yet
                      </p>
                      <p className="text-xs text-muted-foreground/50">
                        Invite someone via the Propose Workspace button in a DM.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {workspaceMembers.map((member) => {
                        const name =
                          member.profile?.display_name ||
                          (member.profile?.handle
                            ? `@${member.profile.handle}`
                            : "Unknown");
                        const initial = name[0].toUpperCase();
                        const isOpening = openingDm === member.user_id;

                        return (
                          <div
                            key={member.user_id}
                            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-border/40 bg-card hover:border-bronze/25 hover:shadow-sm transition-all duration-200"
                          >
                            <div className="w-10 h-10 rounded-full bg-bronze/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {member.profile?.avatar_url ? (
                                <img
                                  src={member.profile.avatar_url}
                                  alt={name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-bold text-bronze/70">
                                  {initial}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{name}</p>
                              <div className="flex items-center gap-1.5">
                                {member.profile?.handle && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    @{member.profile.handle}
                                  </p>
                                )}
                                {member.role === "admin" && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-bronze/10 text-bronze font-semibold">
                                    admin
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                openDmWithMember(member.user_id, name)
                              }
                              disabled={isOpening}
                              className="flex-shrink-0 h-8 text-xs gap-1.5 border-bronze/25 text-bronze hover:bg-bronze/8 hover:border-bronze/50 font-medium"
                            >
                              {isOpening ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <MessageCircle className="w-3 h-3" />
                              )}
                              Chat
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              /* No room selected */
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
                  Choose a deal room or message from the list to open the
                  collaboration thread.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Propose Workspace Dialog */}
      <Dialog
        open={proposeDialogOpen}
        onOpenChange={(o) => {
          if (!o) setProposeDialogOpen(false);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-bronze/10">
                <Sparkles className="w-4 h-4 text-bronze" />
              </div>
              <DialogTitle className="text-sm font-semibold">
                Name the Workspace
              </DialogTitle>
            </div>
          </DialogHeader>
          <p className="text-xs text-muted-foreground mb-3">
            Give this deal room a name. The other person will see it when they
            accept.
          </p>
          <Input
            value={proposeName}
            onChange={(e) => setProposeName(e.target.value)}
            placeholder="e.g. Nike x Crevia Campaign"
            className="h-9 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && !proposeSending) handleProposeWorkspace();
            }}
          />
          <div className="flex gap-2 justify-end mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProposeDialogOpen(false)}
              disabled={proposeSending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleProposeWorkspace}
              disabled={!proposeName.trim() || proposeSending}
              className="bg-bronze hover:bg-bronze/90 text-background font-semibold gap-1.5"
            >
              {proposeSending ? (
                <span className="w-3.5 h-3.5 border-2 border-background/40 border-t-background rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              Send Invite
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudioWorkspacesHub;
