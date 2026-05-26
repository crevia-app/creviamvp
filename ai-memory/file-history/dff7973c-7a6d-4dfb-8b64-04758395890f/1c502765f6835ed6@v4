import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Receipt, FileSignature, Mail, MessageSquare, Search, Users, User } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SendDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "invoice" | "contract";
  documentId: string;
  defaultEmail: string;
  documentLabel: string;
  onSent?: () => void;
}

interface Room {
  id: string;
  name: string | null;
  is_group: boolean;
  dmPartnerName?: string | null;
  dmPartnerAvatar?: string | null;
}

type SendMethod = "email" | "workspace";

export function SendDocumentDialog({
  open,
  onOpenChange,
  type,
  documentId,
  defaultEmail,
  documentLabel,
  onSent,
}: SendDocumentDialogProps) {
  const [sendMethod, setSendMethod] = useState<SendMethod>("email");

  // Email state
  const [email, setEmail] = useState(defaultEmail);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  // Workspace DM state
  const [userId, setUserId] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomSearch, setRoomSearch] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [dmSending, setDmSending] = useState(false);

  const Icon = type === "invoice" ? Receipt : FileSignature;
  const fnName = type === "invoice" ? "invoice-send" : "contract-send";
  const bodyKey = type === "invoice" ? "invoice_id" : "contract_id";

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setEmail(defaultEmail);
      setNote("");
      setSendMethod("email");
      setSelectedRoom(null);
      setRoomSearch("");
    }
  }, [open, defaultEmail]);

  // Fetch current user
  useEffect(() => {
    if (!open) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, [open]);

  // Fetch rooms when workspace tab is active
  const fetchRooms = useCallback(async () => {
    if (!userId) return;
    setRoomsLoading(true);

    const { data: memberRooms } = await supabase
      .from("chat_room_members")
      .select("room_id")
      .eq("user_id", userId);

    if (!memberRooms?.length) {
      setRoomsLoading(false);
      return;
    }

    const roomIds = memberRooms.map((m) => m.room_id);
    const { data: roomsData } = await supabase
      .from("chat_rooms")
      .select("id, name, is_group, chat_room_members(user_id)")
      .in("id", roomIds)
      .order("updated_at", { ascending: false });

    if (!roomsData) {
      setRoomsLoading(false);
      return;
    }

    const enriched: Room[] = await Promise.all(
      roomsData.map(async (r) => {
        const memberIds: string[] = (r.chat_room_members ?? []).map(
          (m: { user_id: string }) => m.user_id
        );
        if (r.name === null && !r.is_group) {
          const partnerId = memberIds.find((id) => id !== userId);
          if (partnerId) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("display_name, handle, avatar_url")
              .eq("id", partnerId)
              .single();
            if (profile) {
              return {
                id: r.id,
                name: null,
                is_group: false,
                dmPartnerName: profile.display_name || (profile.handle ? `@${profile.handle}` : null),
                dmPartnerAvatar: profile.avatar_url,
              };
            }
          }
        }
        return { id: r.id, name: r.name, is_group: r.is_group };
      })
    );

    setRooms(enriched);
    setRoomsLoading(false);
  }, [userId]);

  useEffect(() => {
    if (sendMethod === "workspace" && userId && rooms.length === 0) {
      fetchRooms();
    }
  }, [sendMethod, userId, rooms.length, fetchRooms]);

  const handleEmailSend = async () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Enter a valid email address");
      return;
    }

    setSending(true);
    try {
      if (trimmed !== defaultEmail) {
        const table = type === "invoice" ? "invoices" : "contracts";
        await supabase.from(table).update({ client_email: trimmed }).eq("id", documentId);
      }

      const { error, data } = await supabase.functions.invoke(fnName, {
        body: { [bodyKey]: documentId, note: note.trim() || undefined },
      });

      if (error) {
        let msg = error.message;
        try {
          const body = await (error as any).context?.json?.();
          if (body?.error) msg = body.error;
        } catch {}
        throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);

      toast.success(`${type === "invoice" ? "Invoice" : "Contract"} sent!`, {
        description: `Sent to ${trimmed}. They'll receive an email and an in-app notification if they have a Crevia account.`,
      });
      onSent?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Failed to send", { description: err.message });
    } finally {
      setSending(false);
    }
  };

  const handleDmSend = async () => {
    if (!selectedRoom || !userId) {
      toast.error("Select a workspace or DM first");
      return;
    }

    setDmSending(true);
    try {
      const label = type === "invoice" ? "Invoice" : "Contract";
      const content = type === "invoice"
        ? `📄 Sent ${label}: ${documentLabel}`
        : `📋 Sent ${label}: ${documentLabel}`;

      const msgPayload: Record<string, unknown> = {
        room_id: selectedRoom.id,
        sender_id: userId,
        content,
        message_type: type,
        is_encrypted: false,
      };
      if (type === "invoice") msgPayload.invoice_id = documentId;
      else msgPayload.contract_id = documentId;

      const { error } = await supabase.from("chat_messages").insert(msgPayload);
      if (error) throw error;

      await supabase
        .from("chat_rooms")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", selectedRoom.id);

      const roomLabel = selectedRoom.name ?? selectedRoom.dmPartnerName ?? "the workspace";
      toast.success(`${label} shared!`, { description: `Sent to ${roomLabel}.` });
      onSent?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Failed to share", { description: err.message });
    } finally {
      setDmSending(false);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    const q = roomSearch.toLowerCase();
    if (!q) return true;
    const label = r.name ?? r.dmPartnerName ?? "";
    return label.toLowerCase().includes(q);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-bronze/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-bronze" />
            </div>
            <DialogTitle className="font-vollkorn text-lg">
              Send {type === "invoice" ? "Invoice" : "Contract"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {documentLabel}
          </DialogDescription>
        </DialogHeader>

        {/* Method toggle */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl border border-border/40">
          <button
            type="button"
            onClick={() => setSendMethod("email")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150",
              sendMethod === "email"
                ? "bg-background text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Mail className="w-3.5 h-3.5" />
            Email
          </button>
          <button
            type="button"
            onClick={() => setSendMethod("workspace")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150",
              sendMethod === "workspace"
                ? "bg-background text-foreground shadow-sm border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Workspace DM
          </button>
        </div>

        {sendMethod === "email" ? (
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="send-email" className="text-sm font-medium">
                Recipient email
              </Label>
              <Input
                id="send-email"
                type="email"
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10"
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground">
                They'll receive a full copy by email. If they have a Crevia account, they'll also get an in-app notification and can view it under <strong>Received</strong>.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="send-note" className="text-sm font-medium">
                Personal note <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="send-note"
                placeholder="Hi — please find the attached invoice. Let me know if you have any questions."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="resize-none h-20 text-sm"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-bronze hover:bg-bronze-dark text-white gap-1.5"
                onClick={handleEmailSend}
                disabled={sending}
              >
                <Send className="w-3.5 h-3.5" />
                {sending ? "Sending…" : "Send"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search workspaces & DMs…"
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            <div className="border border-border/50 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
              {roomsLoading ? (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  Loading…
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-1 text-sm text-muted-foreground">
                  <MessageSquare className="w-8 h-8 opacity-30 mb-1" />
                  {rooms.length === 0 ? "No workspaces or DMs yet" : "No matches"}
                </div>
              ) : (
                filteredRooms.map((room) => {
                  const isSelected = selectedRoom?.id === room.id;
                  const label = room.name ?? room.dmPartnerName ?? "Unknown";
                  const isWorkspace = room.is_group || room.name !== null;
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setSelectedRoom(room)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                        "border-b border-border/30 last:border-b-0",
                        isSelected
                          ? "bg-bronze/10 text-bronze"
                          : "hover:bg-muted/60 text-foreground"
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold",
                        isSelected ? "bg-bronze/20 text-bronze" : "bg-muted text-muted-foreground"
                      )}>
                        {isWorkspace
                          ? <Users className="w-3.5 h-3.5" />
                          : room.dmPartnerAvatar
                            ? <img src={room.dmPartnerAvatar} className="w-7 h-7 rounded-full object-cover" alt="" />
                            : <User className="w-3.5 h-3.5" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{label}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {isWorkspace ? "Workspace" : "Direct message"}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-bronze flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={dmSending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-bronze hover:bg-bronze-dark text-white gap-1.5"
                onClick={handleDmSend}
                disabled={dmSending || !selectedRoom}
              >
                <Send className="w-3.5 h-3.5" />
                {dmSending ? "Sending…" : "Share"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
