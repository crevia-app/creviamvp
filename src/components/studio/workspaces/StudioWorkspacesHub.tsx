import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import CreviaChat from "@/components/crevia-connect/shared/CreviaChat";
import WorkspaceInboxList from "./WorkspaceInboxList";
import WorkspaceInfoSheet from "./WorkspaceInfoSheet";

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
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR);
  const [isMobile, setIsMobile] = useState(false);

  // Workspace info sheet
  const [infoSheetOpen, setInfoSheetOpen] = useState(false);

  // Resize state
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
    setInfoSheetOpen(false);
  };

  const handleOpenInfo = useCallback(() => {
    if (selectedRoom?.type === "workspace") setInfoSheetOpen(true);
  }, [selectedRoom]);

  const isWorkspace = selectedRoom?.type === "workspace";

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
                  onOpenGroupInfo={isWorkspace ? handleOpenInfo : undefined}
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
                  Choose a workspace from the list to open the thread.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Workspace info sheet */}
      {selectedRoom && isWorkspace && userId && (
        <WorkspaceInfoSheet
          open={infoSheetOpen}
          onOpenChange={setInfoSheetOpen}
          roomId={selectedRoom.id}
          roomName={selectedRoom.name}
          createdBy={selectedRoom.created_by ?? ""}
          currentUserId={userId}
        />
      )}
    </div>
  );
};

export default StudioWorkspacesHub;
