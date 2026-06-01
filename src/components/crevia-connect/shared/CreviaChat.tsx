import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import VoiceRecorder from "./VoiceRecorder";
import VoiceNotePlayer from "./VoiceNotePlayer";
import MessageContextMenu from "./MessageContextMenu";
import EmojiReactionPicker from "./EmojiReactionPicker";
import MessageReactions from "./MessageReactions";
import AttachmentBubble from "@/components/chat/AttachmentBubble";
import WorkspacePollMessage from "@/components/crevia-connect/shared/WorkspacePollMessage";
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  Mic,
  File,
  X,
  Check,
  CheckCheck,
  Download,
  MessageSquare,
  ArrowLeft,
  Users,
  Plus,
  Search,
  Shield,
  Lock,
  Receipt,
  FileSignature,
  MoreVertical,
  UserPlus,
  Info,
  Hash,
  Pin,
  Reply,
  Video,
  ZoomIn,
  SearchIcon,
  Sparkles,
  Loader2,
  CheckCircle2,
  Globe,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { format, isToday, isYesterday } from "date-fns";
import ChatMediaPanel from "./ChatMediaPanel";
import { useE2EEncryption } from "@/hooks/use-e2e-encryption";
import { iconOptions } from "@/components/crevia-link/iconOptions";
// useIOSKeyboardFit removed: same reason as Dira — it applied position:fixed; top:vv.offsetTop
// which pushes the container DOWN on modern iOS (where position:fixed is already relative to
// the visual viewport), leaving a black gap above the header.
// AppLayout h-dvh + flex chain + the keyboardOpen padding on the input handle it correctly.
import { useVisualViewport } from "@/hooks/use-visual-viewport";

interface ChatRoom {
  id: string;
  name: string | null;
  is_group: boolean;
  created_by: string;
  avatar_url: string | null;
  updated_at: string;
  members?: RoomMember[];
  lastMessage?: ChatMessage | null;
  unreadCount?: number;
}

interface RoomMember {
  user_id: string;
  role: string;
  profile?: {
    display_name: string | null;
    handle: string;
    avatar_url: string | null;
    user_type: string;
  };
}

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string | null;
  message_type: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  invoice_id: string | null;
  contract_id: string | null;
  is_encrypted: boolean;
  created_at: string;
  deleted_for_everyone?: boolean;
  reply_to_id?: string | null;
  sender?: {
    display_name: string | null;
    handle: string;
    avatar_url: string | null;
  };
  replyTo?: {
    id: string;
    content: string | null;
    sender_id: string;
    sender?: { display_name: string | null; handle: string };
  } | null;
}

interface AttachableInvoice {
  id: string;
  invoice_number: string;
  client_name: string;
  total: number;
  currency: string;
  status: string;
}

interface AttachableContract {
  id: string;
  title: string;
  client_name: string;
  status: string;
  value: number | null;
  currency: string;
}

// Proper URL detection without global regex issues
function linkifyContent(content: string): (string | JSX.Element)[] {
  const urlPattern = /(https?:\/\/[^\s<]+[^\s<.,;:!?"')\]])/g;
  const result: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = urlPattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      result.push(content.slice(lastIndex, match.index));
    }
    const url = match[0];
    result.push(
      <a
        key={`link-${match.index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline font-medium hover:opacity-80 break-all"
        onClick={(e) => e.stopPropagation()}
      >
        {url}
      </a>
    );
    lastIndex = match.index + url.length;
  }

  if (lastIndex < content.length) {
    result.push(content.slice(lastIndex));
  }

  return result.length > 0 ? result : [content];
}

interface CreiaChatProps {
  externalRoomId?: string;
  hideRoomList?: boolean;
  onBack?: () => void;
}

// Generates a unique, consistent hue-based color for each user (WhatsApp-style)
const avatarStyle = (seed: string): React.CSSProperties => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return { background: `hsl(${hue},55%,65%)`, color: `hsl(${hue},55%,22%)` };
};

const CreviaChat = ({ externalRoomId, hideRoomList, onBack }: CreiaChatProps = {}) => {
  const navigate = useNavigate();
  const { keyboardOpen } = useVisualViewport();
  const [currentUserId, setCurrentUserId] = useState("");
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [showGroupCreate, setShowGroupCreate] = useState(false);
  const [showInvoicePicker, setShowInvoicePicker] = useState(false);
  const [showContractPicker, setShowContractPicker] = useState(false);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [invoices, setInvoices] = useState<AttachableInvoice[]>([]);
  const [contracts, setContracts] = useState<AttachableContract[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [reactions, setReactions] = useState<Record<string, { emoji: string; count: number; reacted: boolean }[]>>({});
  const [pinnedMessageIds, setPinnedMessageIds] = useState<Set<string>>(new Set());
  const [favoritedMessageIds, setFavoritedMessageIds] = useState<Set<string>>(new Set());
  const [deletedForMeIds, setDeletedForMeIds] = useState<Set<string>>(new Set());
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [forwardingMessageId, setForwardingMessageId] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [videoErrors, setVideoErrors] = useState<Set<string>>(new Set());

  // New features state
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [messageSearch, setMessageSearch] = useState("");
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);
  const [externalRoomNotFound, setExternalRoomNotFound] = useState(false);
  const [contactLinkProfile, setContactLinkProfile] = useState<{ id: string; username: string; bio: string | null } | null>(null);
  const [contactSocialLinks, setContactSocialLinks] = useState<{ id: string; platform: string; url: string }[]>([]);
  const [memberReadTimes, setMemberReadTimes] = useState<Record<string, string>>({});
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const onlineChannelRef = useRef<any>(null);

  // Three separate file inputs so we never mutate `accept` at click time —
  // iOS Safari blocks the file picker when accept is changed right before .click().
  const fileAnyRef   = useRef<HTMLInputElement>(null);
  const fileVideoRef = useRef<HTMLInputElement>(null);
  // Keep the old name as an alias so any remaining references still compile.
  const fileInputRef = fileAnyRef;
  // Auto-resizing textarea — used to read/write scrollHeight in onChange.
  const chatTextareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const presenceChannelRef = useRef<any>(null);
  const selectedExternalRef = useRef<string>("");

  // Scroll to the latest message when the iOS keyboard opens so the input
  // is never obscured by unread content. Replaces the removed useIOSKeyboardFit callback.
  useEffect(() => {
    if (!keyboardOpen || typeof window === "undefined" || window.innerWidth >= 768) return;
    const t = setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    return () => clearTimeout(t);
  }, [keyboardOpen]);

  const { initEncryption, setupRoomEncryption, redistributeRoomKey, encrypt, decrypt, decryptMessages, getRoomKey, getPublicKey } =
    useE2EEncryption(currentUserId);

  const encryptContent = useCallback(
    async (plaintext: string, roomId: string): Promise<{ content: string; is_encrypted: boolean }> => {
      const members = selectedRoom?.members ?? [];
      const memberIds = members.map((m) => m.user_id);

      // Verify every room member has a registered public key before encrypting.
      for (const memberId of memberIds) {
        const key = await getPublicKey(memberId);
        if (!key) {
          if (memberId === currentUserId) {
            // Own key is missing — re-run initialisation and block this send.
            initEncryption();
            throw new Error("Your encryption keys are being set up. Please try again in a moment.");
          }
          const profile = members.find((m) => m.user_id === memberId)?.profile;
          const name = profile?.display_name || profile?.handle || "A participant";
          throw new Error(`${name} hasn't set up encryption yet. Message not sent.`);
        }
      }

      // Attempt encryption using the current user's copy of the room key.
      let encrypted = await encrypt(plaintext, roomId);

      if (!encrypted) {
        // Before generating a new key, check if any key already exists for this
        // room. If it does, we must not generate a new one — that would make all
        // previously encrypted messages unreadable. Instead, the other participant
        // needs to redistribute their copy of the existing key to us.
        const { data: existingKeys } = await (supabase
          .from("room_encrypted_keys" as any)
          .select("id")
          .eq("room_id", roomId)
          .limit(1)) as { data: { id: string }[] | null };

        if (existingKeys && existingKeys.length > 0) {
          // Key exists in the DB but not for the current user — ask the other
          // party to open the chat, which triggers redistribution via selectRoom.
          throw new Error(
            "Securing chat... The other person needs to open the chat once to sync your key. Then try again."
          );
        }

        // Truly new room — no key exists anywhere. Generate the first one.
        await setupRoomEncryption(roomId, memberIds);
        encrypted = await encrypt(plaintext, roomId);
      }

      if (!encrypted) {
        throw new Error("Encryption failed. Please try again.");
      }

      return { content: encrypted, is_encrypted: true };
    },
    [currentUserId, selectedRoom, encrypt, getPublicKey, initEncryption, setupRoomEncryption]
  );



  const handleDeclineInvite = async (msg: ChatMessage) => {
    await supabase.from("chat_messages").update({
      content: JSON.stringify({ status: "declined" }),
    }).eq("id", msg.id);
  };

  const handleAcceptInvite = async (msg: ChatMessage) => {
    if (!currentUserId) return;
    let inv: any = { status: "pending" };
    try { if (msg.content) inv = JSON.parse(msg.content); } catch {}
    const workspaceName = inv.workspace_name || "New Workspace";

    const { data: room, error } = await supabase
      .from("chat_rooms")
      .insert({ name: workspaceName, created_by: currentUserId, is_group: false })
      .select()
      .single();

    if (error || !room) {
      toast.error("Failed to create workspace");
      return;
    }

    await supabase.from("chat_room_members").insert([
      { room_id: room.id, user_id: currentUserId, role: "admin" },
      ...(msg.sender_id !== currentUserId ? [{ room_id: room.id, user_id: msg.sender_id, role: "member" }] : []),
    ]);

    await supabase.from("chat_messages").update({
      content: JSON.stringify({ status: "accepted", workspace_id: room.id, workspace_name: workspaceName }),
    }).eq("id", msg.id);

    toast.success(`Workspace "${workspaceName}" created!`);
    await fetchRooms();
  };

  // Initialize
  useEffect(() => {
    initChat();
  }, []);

  // Sync external room selection into the chat when controlled from hub.
  // Fast path (hideRoomList=true): skip loading all rooms — fetch just this one
  // room + its members in 3 parallel queries so the chat opens immediately.
  useEffect(() => {
    if (!externalRoomId || !currentUserId) return;
    if (selectedExternalRef.current === externalRoomId) return;

    if (hideRoomList) {
      selectedExternalRef.current = externalRoomId;
      (async () => {
        // 2 parallel queries first (room info + member list)
        const [{ data: roomData }, { data: memberRows }] = await Promise.all([
          supabase.from("chat_rooms").select("*").eq("id", externalRoomId).single(),
          supabase.from("chat_room_members").select("user_id, role").eq("room_id", externalRoomId),
        ]);
        if (!roomData) { setExternalRoomNotFound(true); return; }

        // 1 query to batch-load all member profiles
        const memberIds = (memberRows || []).map((m: any) => m.user_id as string);
        const { data: profileRows } = memberIds.length
          ? await supabase.from("profiles").select("id, display_name, handle, avatar_url, user_type").in("id", memberIds)
          : { data: [] };
        const pMap = new Map<string, any>((profileRows || []).map((p: any) => [p.id, p]));

        const members: RoomMember[] = (memberRows || []).map((m: any) => ({
          user_id: m.user_id,
          role: m.role,
          profile: pMap.get(m.user_id),
        }));

        setExternalRoomNotFound(false);
        await selectRoom({ ...roomData, members, lastMessage: null, unreadCount: 0 });
      })();
      return;
    }

    // Normal path (room list is visible): wait for all rooms to finish loading.
    if (loadingRooms) return;
    const room = rooms.find((r) => r.id === externalRoomId);
    if (!room) { setExternalRoomNotFound(true); return; }
    setExternalRoomNotFound(false);
    selectRoom(room);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalRoomId, currentUserId, rooms, loadingRooms]);

  // Subscribe to new/updated messages — scoped to the active room only.
  // Depends on selectedRoom?.id (string) not the full object so the channel
  // is only rebuilt when the room actually changes, not on every render.
  useEffect(() => {
    if (!currentUserId || !selectedRoom?.id) return;

    const roomId = selectedRoom.id;

    const channel = supabase
      .channel(`chat-realtime:${currentUserId}:${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          (async () => {
            const msgWithProfile = await loadSenderProfile(newMsg);
            if (msgWithProfile.reply_to_id) {
              msgWithProfile.replyTo = await loadReplyContext(msgWithProfile.reply_to_id);
            }
            if (msgWithProfile.is_encrypted && msgWithProfile.content) {
              try {
                msgWithProfile.content = await decrypt(msgWithProfile.content, roomId);
              } catch {
                // keep original content if decryption fails
              }
            }
            // Skip if already added optimistically (sender's own message)
            setMessages((prev) => {
              if (prev.some(m => m.id === msgWithProfile.id)) return prev;
              return [...prev, msgWithProfile];
            });
            if (newMsg.sender_id !== currentUserId) {
              if (typingTimeoutsRef.current[newMsg.sender_id]) {
                clearTimeout(typingTimeoutsRef.current[newMsg.sender_id]);
                delete typingTimeoutsRef.current[newMsg.sender_id];
              }
              setTypingUsers((prev) => prev.filter((id) => id !== newMsg.sender_id));
            }
          })();
          updateReadReceipt(roomId);
          fetchRooms();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const updated = payload.new as any;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === updated.id
                ? { ...m, deleted_for_everyone: updated.deleted_for_everyone, content: updated.content, file_url: updated.file_url, file_name: updated.file_name }
                : m
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, selectedRoom?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync profile picture / display name changes for all visible users in real time
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`profile-sync-chat:${currentUserId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          const updated = payload.new as any;
          const uid = updated.id as string;
          const patch = {
            display_name: updated.display_name,
            handle: updated.handle,
            avatar_url: updated.avatar_url,
            user_type: updated.user_type,
          };

          // Patch rooms list member cache
          setRooms((prev) =>
            prev.map((room) => ({
              ...room,
              members: room.members?.map((m) =>
                m.user_id === uid ? { ...m, profile: { ...m.profile, ...patch } } : m
              ),
            }))
          );

          // Patch selected room member cache
          setSelectedRoom((prev) =>
            prev
              ? {
                  ...prev,
                  members: prev.members?.map((m) =>
                    m.user_id === uid ? { ...m, profile: { ...m.profile, ...patch } } : m
                  ),
                }
              : prev
          );

          // Patch sender info on already-loaded messages
          setMessages((prev) =>
            prev.map((msg) =>
              msg.sender_id === uid
                ? { ...msg, sender: { ...msg.sender, ...patch } }
                : msg
            )
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId]);

  // Typing indicator — uses Broadcast (low-latency fire-and-forget) instead of
  // Presence so the signal appears instantly on the other side, like WhatsApp.
  useEffect(() => {
    if (!selectedRoom || !currentUserId) return;

    const channel = supabase.channel(`typing-${selectedRoom.id}`);

    channel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const { userId, typing } = payload as { userId: string; typing: boolean };
        if (userId === currentUserId) return;

        if (typing) {
          setTypingUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
          // Safety fallback: auto-clear after 3 s if the stop event never arrives
          if (typingTimeoutsRef.current[userId]) clearTimeout(typingTimeoutsRef.current[userId]);
          typingTimeoutsRef.current[userId] = setTimeout(() => {
            setTypingUsers((prev) => prev.filter((id) => id !== userId));
            delete typingTimeoutsRef.current[userId];
          }, 3000);
        } else {
          if (typingTimeoutsRef.current[userId]) {
            clearTimeout(typingTimeoutsRef.current[userId]);
            delete typingTimeoutsRef.current[userId];
          }
          setTypingUsers((prev) => prev.filter((id) => id !== userId));
        }
      })
      .subscribe();

    presenceChannelRef.current = channel;

    return () => {
      Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
      typingTimeoutsRef.current = {};
      supabase.removeChannel(channel);
      presenceChannelRef.current = null;
    };
  }, [selectedRoom?.id, currentUserId]);

  // Read receipts — fetch member read times and subscribe to live updates
  useEffect(() => {
    if (!selectedRoom) { setMemberReadTimes({}); return; }
    const fetchReceipts = async () => {
      const { data } = await supabase
        .from("chat_read_receipts")
        .select("user_id, last_read_at")
        .eq("room_id", selectedRoom.id);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r: any) => { map[r.user_id] = r.last_read_at; });
        setMemberReadTimes(map);
      }
    };
    fetchReceipts();
    const ch = supabase
      .channel(`read-receipts:${selectedRoom.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_read_receipts", filter: `room_id=eq.${selectedRoom.id}` },
        (payload: any) => {
          if (payload.new?.user_id) {
            setMemberReadTimes((prev) => ({ ...prev, [payload.new.user_id]: payload.new.last_read_at }));
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selectedRoom?.id]);

  // Online presence — track who is viewing this room right now
  useEffect(() => {
    if (!selectedRoom || !currentUserId) { setOnlineUserIds(new Set()); return; }
    if (onlineChannelRef.current) supabase.removeChannel(onlineChannelRef.current);

    const ch = supabase.channel(`presence:${selectedRoom.id}`, {
      config: { presence: { key: currentUserId } },
    });
    ch
      .on("presence", { event: "sync" }, () => {
        const state = ch.presenceState();
        setOnlineUserIds(new Set(Object.keys(state)));
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          await ch.track({ user_id: currentUserId, online_at: new Date().toISOString() });
        }
      });
    onlineChannelRef.current = ch;
    return () => {
      if (onlineChannelRef.current) { supabase.removeChannel(onlineChannelRef.current); onlineChannelRef.current = null; }
      setOnlineUserIds(new Set());
    };
  }, [selectedRoom?.id, currentUserId]);

  // Fetch the other user's Crevia link profile + social links when contact info opens
  useEffect(() => {
    if (!showRoomInfo || !selectedRoom || selectedRoom.is_group) {
      setContactLinkProfile(null);
      setContactSocialLinks([]);
      return;
    }
    const other = selectedRoom.members?.find((m) => m.user_id !== currentUserId);
    if (!other) return;

    (async () => {
      const { data: lp } = await supabase
        .from("link_profiles")
        .select("id, username, bio")
        .eq("user_id", other.user_id)
        .maybeSingle();

      setContactLinkProfile(lp ?? null);

      if (lp?.id) {
        const { data: sl } = await supabase
          .from("link_social_icons")
          .select("id, platform, url, order_index")
          .eq("profile_id", lp.id)
          .order("order_index", { ascending: true });
        setContactSocialLinks(sl ?? []);
      } else {
        setContactSocialLinks([]);
      }
    })();
  }, [showRoomInfo, selectedRoom?.id, currentUserId]);

  // Scroll to bottom on new messages.
  // useLayoutEffect fires synchronously before the browser paints — eliminates
  // the visible scroll jump on initial load (useEffect fires after paint).
  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a broadcast typing event
  const broadcastTyping = useCallback((isTyping: boolean) => {
    if (!presenceChannelRef.current || !currentUserId) return;
    presenceChannelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: currentUserId, typing: isTyping },
    });
  }, [currentUserId]);

  const handleTyping = useCallback(() => {
    broadcastTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    // Stop-typing signal fires 1.5 s after the last keystroke (matches WhatsApp cadence)
    typingTimeoutRef.current = setTimeout(() => broadcastTyping(false), 1500);
  }, [broadcastTyping]);

  const loadSenderProfile = async (msg: ChatMessage): Promise<ChatMessage> => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, handle, avatar_url")
      .eq("id", msg.sender_id)
      .single();
    return { ...msg, sender: data || undefined };
  };

  const loadReplyContext = async (replyToId: string): Promise<ChatMessage["replyTo"]> => {
    const { data } = await supabase
      .from("chat_messages")
      .select("id, content, sender_id, is_encrypted, room_id")
      .eq("id", replyToId)
      .single() as any;
    if (!data) return null;
    
    // Get sender name
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, handle")
      .eq("id", data.sender_id)
      .single();

    let content = data.content;
    if (data.is_encrypted && content) {
      try {
        content = await decrypt(content, data.room_id);
      } catch {
        content = "🔒 Encrypted message";
      }
    }

    return {
      id: data.id,
      content,
      sender_id: data.sender_id,
      sender: profile || undefined,
    };
  };

  const initChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);
    if (hideRoomList) {
      // Room list is not shown — skip the heavy fetchRooms() (30+ queries).
      // The externalRoomId effect will load just the one needed room directly.
      setLoadingRooms(false);
    } else {
      await fetchRooms();
    }
  };

  useEffect(() => {
    if (currentUserId) {
      initEncryption();
    }
  }, [currentUserId, initEncryption]);

  const fetchRooms = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: memberRooms } = await supabase
      .from("chat_room_members")
      .select("room_id")
      .eq("user_id", user.id);

    if (!memberRooms || memberRooms.length === 0) {
      setRooms([]);
      setLoadingRooms(false);
      return;
    }

    const roomIds = memberRooms.map((m) => m.room_id);

    const { data: roomsData } = await supabase
      .from("chat_rooms")
      .select("*")
      .in("id", roomIds)
      .order("updated_at", { ascending: false });

    if (!roomsData) {
      setLoadingRooms(false);
      return;
    }

    const enrichedRooms: ChatRoom[] = await Promise.all(
      roomsData.map(async (room) => {
        const { data: members } = await supabase
          .from("chat_room_members")
          .select("user_id, role")
          .eq("room_id", room.id);

        const memberProfiles: RoomMember[] = [];
        if (members) {
          for (const m of members) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("display_name, handle, avatar_url, user_type")
              .eq("id", m.user_id)
              .single();
            memberProfiles.push({ ...m, profile: profile || undefined });
          }
        }

        const { data: lastMsgs } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("room_id", room.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const { data: receipt } = await supabase
          .from("chat_read_receipts")
          .select("last_read_at")
          .eq("room_id", room.id)
          .eq("user_id", user.id)
          .maybeSingle();

        let unreadCount = 0;
        if (receipt?.last_read_at) {
          const { count } = await supabase
            .from("chat_messages")
            .select("*", { count: "exact", head: true })
            .eq("room_id", room.id)
            .neq("sender_id", user.id)
            .gt("created_at", receipt.last_read_at);
          unreadCount = count || 0;
        } else if (lastMsgs && lastMsgs.length > 0) {
          const { count } = await supabase
            .from("chat_messages")
            .select("*", { count: "exact", head: true })
            .eq("room_id", room.id)
            .neq("sender_id", user.id);
          unreadCount = count || 0;
        }

        let lastMessage = lastMsgs?.[0] || null;
        if (lastMessage?.is_encrypted && lastMessage.content) {
          try {
            const decryptedContent = await decrypt(lastMessage.content, room.id);
            lastMessage = { ...lastMessage, content: decryptedContent || lastMessage.content };
          } catch {
            lastMessage = { ...lastMessage, content: "🔒 Encrypted message" };
          }
        }

        return {
          ...room,
          members: memberProfiles,
          lastMessage,
          unreadCount,
        };
      })
    );

    setRooms(enrichedRooms);
    setLoadingRooms(false);
  };

  const fetchMessages = async (roomId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    if (!data) return;

    // ── Batch load sender profiles (1 query instead of N) ──────────────
    const senderIds = [...new Set(data.map((m: any) => m.sender_id as string))];
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id, display_name, handle, avatar_url")
      .in("id", senderIds);
    const profileMap = new Map<string, any>((profileRows || []).map((p: any) => [p.id, p]));

    // ── Batch load reply-context messages (1–2 queries instead of N) ───
    const replyIds = [...new Set(
      data.filter((m: any) => m.reply_to_id).map((m: any) => m.reply_to_id as string)
    )];
    const replyMap = new Map<string, any>();
    if (replyIds.length > 0) {
      const { data: replyMsgs } = await supabase
        .from("chat_messages")
        .select("id, content, sender_id, is_encrypted, room_id")
        .in("id", replyIds);
      if (replyMsgs) {
        const replySenderIds = [...new Set(replyMsgs.map((m: any) => m.sender_id as string))];
        const { data: replyProfiles } = await supabase
          .from("profiles").select("id, display_name, handle").in("id", replySenderIds);
        const rpMap = new Map<string, any>((replyProfiles || []).map((p: any) => [p.id, p]));
        for (const rm of replyMsgs) {
          let content = rm.content;
          if (rm.is_encrypted && content) {
            try { content = await decrypt(content, rm.room_id); } catch { content = "🔒 Encrypted message"; }
          }
          replyMap.set(rm.id, { id: rm.id, content, sender_id: rm.sender_id, sender: rpMap.get(rm.sender_id) });
        }
      }
    }

    // Assemble enriched messages — zero per-message DB round-trips
    const enriched: ChatMessage[] = data.map((msg: any) => ({
      ...msg,
      sender: profileMap.get(msg.sender_id),
      replyTo: msg.reply_to_id ? (replyMap.get(msg.reply_to_id) ?? null) : undefined,
    }));

    const decrypted = await decryptMessages(enriched);
    setMessages(decrypted as ChatMessage[]);
    updateReadReceipt(roomId);
  };

  const updateReadReceipt = async (roomId: string) => {
    if (!currentUserId) return;
    await supabase
      .from("chat_read_receipts")
      .upsert(
        { room_id: roomId, user_id: currentUserId, last_read_at: new Date().toISOString() },
        { onConflict: "room_id,user_id" }
      );
  };

  const selectRoom = async (room: ChatRoom) => {
    setSelectedRoom(room);
    setReplyingTo(null);
    setShowMessageSearch(false);
    setMessageSearch("");

    // Fetch messages and check encryption key in parallel — decryptMessages
    // uses its own key access, so it doesn't need to wait for getRoomKey.
    const keyCheckPromise = (async () => {
      if (currentUserId && room.members && room.members.length > 0) {
        const memberIds = room.members.map(m => m.user_id);
        const roomKey = await getRoomKey(room.id);
        if (roomKey) redistributeRoomKey(room.id, memberIds);
      }
    })();

    await Promise.all([fetchMessages(room.id), keyCheckPromise]);
  };

  const retryDecryption = async (roomId: string, members: RoomMember[]) => {
    if (!currentUserId || members.length === 0) return;
    toast.info("Syncing encryption key...");
    const memberIds = members.map(m => m.user_id);
    const didRedistribute = await redistributeRoomKey(roomId, memberIds);
    if (!didRedistribute) {
      toast.info("Ask the other person to open the chat to sync the key.");
      return;
    }
    await fetchMessages(roomId);
  };

  const startDirectChat = async (otherUserId: string) => {
    if (!currentUserId) return;

    const { data: myRooms } = await supabase
      .from("chat_room_members")
      .select("room_id")
      .eq("user_id", currentUserId);

    const { data: theirRooms } = await supabase
      .from("chat_room_members")
      .select("room_id")
      .eq("user_id", otherUserId);

    if (myRooms && theirRooms) {
      const myRoomIds = new Set(myRooms.map((r) => r.room_id));
      const commonRoomIds = theirRooms
        .filter((r) => myRoomIds.has(r.room_id))
        .map((r) => r.room_id);

      if (commonRoomIds.length > 0) {
        const { data: existingRooms } = await supabase
          .from("chat_rooms")
          .select("*")
          .in("id", commonRoomIds)
          .eq("is_group", false);

        if (existingRooms && existingRooms.length > 0) {
          const room = existingRooms[0];
          setShowNewChat(false);
          await fetchRooms();
          const enriched = rooms.find((r) => r.id === room.id);
          if (enriched) {
            selectRoom(enriched);
          } else {
            await fetchRooms();
            selectRoom({ ...room, members: [], lastMessage: null, unreadCount: 0 });
            fetchMessages(room.id);
          }
          return;
        }
      }
    }

    const { data: newRoom, error } = await supabase
      .from("chat_rooms")
      .insert({ created_by: currentUserId, is_group: false })
      .select()
      .single();

    if (error || !newRoom) {
      toast.error("Failed to create conversation");
      return;
    }

    await supabase.from("chat_room_members").insert([
      { room_id: newRoom.id, user_id: currentUserId, role: "member" },
      { room_id: newRoom.id, user_id: otherUserId, role: "member" },
    ]);

    await setupRoomEncryption(newRoom.id, [currentUserId, otherUserId]);

    setShowNewChat(false);
    await fetchRooms();
    selectRoom({ ...newRoom, members: [], lastMessage: null, unreadCount: 0 });
    fetchMessages(newRoom.id);
  };

  const createGroupChat = async () => {
    if (!currentUserId || !groupName.trim() || selectedGroupMembers.length === 0) {
      toast.error("Please add a name and at least one member");
      return;
    }

    const { data: newRoom, error } = await supabase
      .from("chat_rooms")
      .insert({ name: groupName.trim(), is_group: true, created_by: currentUserId })
      .select()
      .single();

    if (error || !newRoom) {
      toast.error("Failed to create group");
      return;
    }

    const memberInserts = [
      { room_id: newRoom.id, user_id: currentUserId, role: "admin" },
      ...selectedGroupMembers.map((uid) => ({
        room_id: newRoom.id,
        user_id: uid,
        role: "member",
      })),
    ];

    await supabase.from("chat_room_members").insert(memberInserts);

    const allMemberIds = [currentUserId, ...selectedGroupMembers];
    await setupRoomEncryption(newRoom.id, allMemberIds);

    setShowGroupCreate(false);
    setGroupName("");
    setSelectedGroupMembers([]);
    await fetchRooms();
    selectRoom({ ...newRoom, members: [], lastMessage: null, unreadCount: 0 });
    fetchMessages(newRoom.id);
    toast.success("Group created!");
  };

  const fetchAllUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", currentUserId)
      .limit(100);
    setAllUsers(data || []);
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedRoom || !currentUserId) return;

    try {
      setUploadingFile(true);
      let fileData: { url: string; name: string; type: string; size: number } | null = null;

      if (selectedFile) {
        // File size limits
        const MAX_IMAGE = 10 * 1024 * 1024;  // 10 MB
        const MAX_VIDEO = 50 * 1024 * 1024;  // 50 MB
        const MAX_FILE  = 20 * 1024 * 1024;  // 20 MB
        const isImage = selectedFile.type.startsWith("image/");
        const isVideo = selectedFile.type.startsWith("video/");
        const limit = isImage ? MAX_IMAGE : isVideo ? MAX_VIDEO : MAX_FILE;
        const limitLabel = isImage ? "10 MB" : isVideo ? "50 MB" : "20 MB";

        if (selectedFile.size > limit) {
          toast.error(`File too large. ${isImage ? "Images" : isVideo ? "Videos" : "Files"} must be under ${limitLabel}.`);
          setUploadingFile(false);
          return;
        }

        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("chat-files")
          .upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
        fileData = { url: fileName, name: selectedFile.name, type: selectedFile.type, size: selectedFile.size };
      }

      const plainContent = newMessage || (fileData ? `Sent a file: ${fileData.name}` : "");
      const { content: finalContent, is_encrypted } = await encryptContent(plainContent, selectedRoom.id);

      // Privacy by Default — never allow a plaintext message to reach the DB.
      if (!is_encrypted) {
        throw new Error("Encryption is required. Message not sent.");
      }

      const messageData: any = {
        room_id: selectedRoom.id,
        sender_id: currentUserId,
        content: finalContent,
        message_type: fileData ? "file" : "text",
        file_url: fileData?.url,
        file_name: fileData?.name,
        file_type: fileData?.type,
        file_size: fileData?.size,
        is_encrypted,
      };

      // Add reply reference
      if (replyingTo) {
        messageData.reply_to_id = replyingTo.id;
      }

      // Insert and get the row back so we can append it to local state immediately
      // (no waiting for the WebSocket round-trip — WhatsApp-style instant display).
      const { data: insertedMsg, error: insertErr } = await supabase
        .from("chat_messages")
        .insert(messageData)
        .select()
        .single();
      if (insertErr) throw insertErr;

      // Optimistic local append — show the sender's own message instantly
      const myProfile = selectedRoom.members?.find(m => m.user_id === currentUserId)?.profile;
      setMessages(prev => [...prev, {
        ...insertedMsg,
        content: plainContent,  // show plaintext; recipient sees decrypted via their own key
        sender: {
          display_name: myProfile?.display_name ?? null,
          handle:       myProfile?.handle       ?? "",
          avatar_url:   myProfile?.avatar_url   ?? null,
        },
        replyTo: replyingTo ?? null,
      } as ChatMessage]);

      // Patch the notification body the trigger just created with the real plaintext preview.
      supabase.rpc("update_message_notification_preview", {
        p_room_id: selectedRoom.id,
        p_preview: plainContent.slice(0, 120),
      });

      await supabase
        .from("chat_rooms")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", selectedRoom.id);

      setNewMessage("");
      setSelectedFile(null);
      setReplyingTo(null);
      broadcastTyping(false);
      // Reset auto-resize height so the bar snaps back to single-line.
      if (chatTextareaRef.current) {
        chatTextareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Send error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setUploadingFile(false);
    }
  };

  const sendInvoiceAttachment = async (invoice: AttachableInvoice) => {
    if (!selectedRoom || !currentUserId) return;

    const plainContent = `📄 Invoice ${invoice.invoice_number} — ${new Intl.NumberFormat("en-KE", { style: "currency", currency: invoice.currency }).format(Number(invoice.total))} (${invoice.status})`;
    const { content, is_encrypted } = await encryptContent(plainContent, selectedRoom.id);

    await supabase.from("chat_messages").insert({
      room_id: selectedRoom.id,
      sender_id: currentUserId,
      content,
      message_type: "invoice",
      invoice_id: invoice.id,
      is_encrypted,
    });

    await supabase.from("chat_rooms").update({ updated_at: new Date().toISOString() }).eq("id", selectedRoom.id);
    setShowInvoicePicker(false);
    toast.success("Invoice attached!");
  };

  const sendContractAttachment = async (contract: AttachableContract) => {
    if (!selectedRoom || !currentUserId) return;

    const plainContent = `📋 Canvas: ${contract.title} — ${contract.client_name} (${contract.status})`;
    const { content, is_encrypted } = await encryptContent(plainContent, selectedRoom.id);

    await supabase.from("chat_messages").insert({
      room_id: selectedRoom.id,
      sender_id: currentUserId,
      content,
      message_type: "contract",
      contract_id: contract.id,
      is_encrypted,
    });

    await supabase.from("chat_rooms").update({ updated_at: new Date().toISOString() }).eq("id", selectedRoom.id);
    setShowContractPicker(false);
    toast.success("Canvas attached!");
  };

  const sendVoiceNote = async (blob: Blob, duration: number) => {
    if (!selectedRoom || !currentUserId) return;
    setUploadingVoice(true);
    try {
      const ext = blob.type.includes("wav") ? "wav" : blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : "webm";
      const fileName = `${currentUserId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("voice-notes")
        .upload(fileName, blob, { contentType: blob.type || "audio/webm" });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("voice-notes")
        .getPublicUrl(fileName);

      const plainContent = `🎤 Voice note (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")})`;
      const { content, is_encrypted } = await encryptContent(plainContent, selectedRoom.id);

      const voiceFileName = `voice-${Date.now()}.${ext}`;
      const { data: voiceMsg, error: voiceInsertErr } = await supabase
        .from("chat_messages")
        .insert({
          room_id: selectedRoom.id,
          sender_id: currentUserId,
          content,
          message_type: "voice",
          file_url: urlData.publicUrl,
          file_name: voiceFileName,
          file_type: blob.type || "audio/webm",
          file_size: blob.size,
          is_encrypted,
        })
        .select()
        .single();
      if (voiceInsertErr) throw voiceInsertErr;

      // Optimistic append — voice note appears in the chat immediately
      const myProfile = selectedRoom.members?.find(m => m.user_id === currentUserId)?.profile;
      setMessages(prev => {
        if (prev.some(m => m.id === voiceMsg.id)) return prev;
        return [...prev, {
          ...voiceMsg,
          content: plainContent,
          sender: {
            display_name: myProfile?.display_name ?? null,
            handle:       myProfile?.handle       ?? "",
            avatar_url:   myProfile?.avatar_url   ?? null,
          },
          replyTo: null,
        } as ChatMessage];
      });

      await supabase.from("chat_rooms").update({ updated_at: new Date().toISOString() }).eq("id", selectedRoom.id);
      setIsRecordingVoice(false);
    } catch (error) {
      console.error("Voice upload error:", error);
      toast.error("Failed to send voice note");
    } finally {
      setUploadingVoice(false);
    }
  };

  const fetchInvoices = async () => {
    const { data } = await supabase
      .from("invoices")
      .select("id, invoice_number, client_name, total, currency, status")
      .order("created_at", { ascending: false })
      .limit(20);
    setInvoices((data as AttachableInvoice[]) || []);
  };

  const fetchContracts = async () => {
    const { data } = await supabase
      .from("canvases")
      .select("id, title, client_name, status, value, currency")
      .order("created_at", { ascending: false })
      .limit(20);
    setContracts((data as AttachableContract[]) || []);
  };

  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
      let blob: Blob;

      if (fileUrl.startsWith("http")) {
        // Cross-origin URL — fetch as blob so the browser actually downloads
        // instead of navigating (the <a download> attribute is ignored cross-origin).
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        blob = await res.blob();
      } else {
        const { data, error } = await supabase.storage.from("chat-files").download(fileUrl);
        if (error) throw error;
        blob = data;
      }

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Download failed. Please try again.");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset so same file can be re-selected
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const maxBytes = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    const maxLabel = isVideo ? "50 MB" : "10 MB";
    if (file.size > maxBytes) {
      toast.error(`File too large. Max ${maxLabel}.`);
      return;
    }
    setSelectedFile(file);
  };

  const getFilePublicUrl = useCallback((filePath: string) => {
    if (filePath.startsWith("http")) return filePath;
    if (signedUrls[filePath]) return signedUrls[filePath];

    supabase.storage.from("chat-files").createSignedUrl(filePath, 3600).then(({ data, error }) => {
      if (data?.signedUrl) {
        setSignedUrls(prev => ({ ...prev, [filePath]: data.signedUrl }));
      } else if (error) {
        // Signed URL failed (likely a permissions issue for the recipient).
        // Fall back to public URL — works when the bucket allows public reads.
        const { data: pub } = supabase.storage.from("chat-files").getPublicUrl(filePath);
        if (pub?.publicUrl) {
          setSignedUrls(prev => ({ ...prev, [filePath]: pub.publicUrl }));
        }
      }
    });
    return "";
  }, [signedUrls]);

  // Helpers
  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.is_group) return room.name || "Group Chat";
    const otherMember = room.members?.find((m) => m.user_id !== currentUserId);
    return otherMember?.profile?.display_name || otherMember?.profile?.handle || "Chat";
  };

  const getRoomAvatar = (room: ChatRoom) => {
    if (room.is_group) return null;
    const otherMember = room.members?.find((m) => m.user_id !== currentUserId);
    return otherMember?.profile?.avatar_url;
  };

  const getRoomInitial = (room: ChatRoom) => {
    const name = getRoomDisplayName(room);
    return name[0]?.toUpperCase() || "C";
  };

  const getOtherUserType = (room: ChatRoom) => {
    if (room.is_group) return null;
    const otherMember = room.members?.find((m) => m.user_id !== currentUserId);
    return otherMember?.profile?.user_type;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, "h:mm a");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const parseDurationFromContent = (content: string | null): number => {
    if (!content) return 0;
    const match = content.match(/\((\d+):(\d+)\)/);
    if (match) return parseInt(match[1]) * 60 + parseInt(match[2]);
    return 0;
  };

  const getTypingDisplayNames = (): string => {
    if (!selectedRoom?.members) return "";
    return typingUsers
      .map((uid) => {
        const member = selectedRoom.members?.find((m) => m.user_id === uid);
        return member?.profile?.display_name || member?.profile?.handle || "Someone";
      })
      .join(", ");
  };

  const getMessageReadStatus = (msg: ChatMessage): "read" | "delivered" | "sent" => {
    if (!selectedRoom) return "sent";
    const others = selectedRoom.members?.filter((m) => m.user_id !== currentUserId) ?? [];
    if (others.length === 0) return "sent";
    const msgTime = new Date(msg.created_at).getTime();
    const allRead = others.every((m) => {
      const t = memberReadTimes[m.user_id];
      return t && new Date(t).getTime() >= msgTime;
    });
    if (allRead) return "read";
    const anyRead = others.some((m) => {
      const t = memberReadTimes[m.user_id];
      return t && new Date(t).getTime() >= msgTime;
    });
    return anyRead ? "delivered" : "sent";
  };

  // Fetch reactions, pins, favorites, deletions when messages change
  const fetchMessageMeta = useCallback(async () => {
    if (!currentUserId || messages.length === 0) return;
    const msgIds = messages.map((m) => m.id);

    const { data: reactionData } = await supabase
      .from("message_reactions")
      .select("message_id, emoji, user_id")
      .in("message_id", msgIds);

    if (reactionData) {
      const grouped: Record<string, { emoji: string; count: number; reacted: boolean }[]> = {};
      for (const r of reactionData) {
        if (!grouped[r.message_id]) grouped[r.message_id] = [];
        const existing = grouped[r.message_id].find((e) => e.emoji === r.emoji);
        if (existing) {
          existing.count++;
          if (r.user_id === currentUserId) existing.reacted = true;
        } else {
          grouped[r.message_id].push({ emoji: r.emoji, count: 1, reacted: r.user_id === currentUserId });
        }
      }
      setReactions(grouped);
    }

    if (selectedRoom) {
      const { data: pinData } = await supabase
        .from("pinned_messages")
        .select("message_id")
        .eq("room_id", selectedRoom.id);
      setPinnedMessageIds(new Set(pinData?.map((p) => p.message_id) || []));
    }

    const { data: favData } = await supabase
      .from("favorite_messages")
      .select("message_id")
      .eq("user_id", currentUserId)
      .in("message_id", msgIds);
    setFavoritedMessageIds(new Set(favData?.map((f) => f.message_id) || []));

    const { data: delData } = await supabase
      .from("deleted_messages")
      .select("message_id")
      .eq("user_id", currentUserId)
      .in("message_id", msgIds);
    setDeletedForMeIds(new Set(delData?.map((d) => d.message_id) || []));
  }, [currentUserId, messages, selectedRoom]);

  useEffect(() => {
    fetchMessageMeta();
  }, [fetchMessageMeta]);

  useEffect(() => {
    if (!selectedRoom) return;
    const channel = supabase
      .channel("reactions-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "message_reactions" }, () => {
        fetchMessageMeta();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedRoom, fetchMessageMeta]);

  const handleDeleteForMe = async (messageId: string) => {
    await supabase.from("deleted_messages").insert({ message_id: messageId, user_id: currentUserId });
    setDeletedForMeIds((prev) => new Set([...prev, messageId]));
    toast.success("Message deleted for you");
  };

  const handleDeleteForEveryone = async (messageId: string) => {
    await supabase
      .from("chat_messages")
      .update({ deleted_for_everyone: true, content: null, file_url: null, file_name: null })
      .eq("id", messageId);
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, deleted_for_everyone: true, content: null, file_url: null, file_name: null } : m))
    );
    toast.success("Message deleted for everyone");
  };

  const handleForward = (messageId: string) => {
    setForwardingMessageId(messageId);
    setShowForwardDialog(true);
    fetchRooms();
  };

  const forwardMessageToRoom = async (targetRoomId: string) => {
    const msg = messages.find((m) => m.id === forwardingMessageId);
    if (!msg || !currentUserId) return;

    const forwardContent = msg.content ? `↪ Forwarded: ${msg.content}` : "↪ Forwarded message";
    const { content, is_encrypted } = await encryptContent(forwardContent, targetRoomId);

    await supabase.from("chat_messages").insert({
      room_id: targetRoomId,
      sender_id: currentUserId,
      content,
      message_type: msg.message_type,
      file_url: msg.file_url,
      file_name: msg.file_name,
      file_type: msg.file_type,
      file_size: msg.file_size,
      is_encrypted,
    });

    await supabase.from("chat_rooms").update({ updated_at: new Date().toISOString() }).eq("id", targetRoomId);
    setShowForwardDialog(false);
    setForwardingMessageId(null);
    toast.success("Message forwarded");
  };

  const handlePinToggle = async (messageId: string, isPinned: boolean) => {
    if (!selectedRoom) return;
    if (isPinned) {
      await supabase.from("pinned_messages").delete().eq("message_id", messageId);
      setPinnedMessageIds((prev) => { const n = new Set(prev); n.delete(messageId); return n; });
      toast.success("Message unpinned");
    } else {
      await supabase.from("pinned_messages").insert({ message_id: messageId, room_id: selectedRoom.id, pinned_by: currentUserId });
      setPinnedMessageIds((prev) => new Set([...prev, messageId]));
      toast.success("Message pinned");
    }
  };

  const handleFavoriteToggle = async (messageId: string, isFavorited: boolean) => {
    if (isFavorited) {
      await supabase.from("favorite_messages").delete().eq("message_id", messageId).eq("user_id", currentUserId);
      setFavoritedMessageIds((prev) => { const n = new Set(prev); n.delete(messageId); return n; });
      toast.success("Removed from favorites");
    } else {
      await supabase.from("favorite_messages").insert({ message_id: messageId, user_id: currentUserId });
      setFavoritedMessageIds((prev) => new Set([...prev, messageId]));
      toast.success("Added to favorites");
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    const existing = reactions[messageId]?.find((r) => r.emoji === emoji && r.reacted);
    if (existing) {
      await supabase.from("message_reactions").delete().eq("message_id", messageId).eq("user_id", currentUserId).eq("emoji", emoji);
    } else {
      await supabase.from("message_reactions").insert({ message_id: messageId, user_id: currentUserId, emoji });
    }
    fetchMessageMeta();
  };

  const handleReply = (msg: ChatMessage) => {
    setReplyingTo(msg);
  };

  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMsgId(msgId);
      setTimeout(() => setHighlightedMsgId(null), 2000);
    }
  };

  const groupMessagesByDate = (msgs: ChatMessage[]) => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = "";

    for (const msg of msgs) {
      const msgDate = new Date(msg.created_at);
      let dateLabel: string;
      if (isToday(msgDate)) dateLabel = "Today";
      else if (isYesterday(msgDate)) dateLabel = "Yesterday";
      else dateLabel = format(msgDate, "MMMM d, yyyy");

      if (dateLabel !== currentDate) {
        currentDate = dateLabel;
        groups.push({ date: dateLabel, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    }
    return groups;
  };

  const filteredRooms = rooms.filter((room) => {
    if (!searchQuery) return true;
    const name = getRoomDisplayName(room).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const filteredUsers = allUsers.filter(
    (u) =>
      u.display_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.handle?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Message search within conversation
  const searchResults = messageSearch.trim()
    ? messages.filter((m) => m.content?.toLowerCase().includes(messageSearch.toLowerCase()))
    : [];

  const messageGroups = groupMessagesByDate(messages);

  // Check if file is a video
  const isVideoType = (type: string | null) =>
    type?.startsWith("video/") || false;

  const isImageType = (type: string | null) =>
    type?.startsWith("image/") || false;

  return (
    <div className={hideRoomList ? "flex h-full w-full flex-col overflow-hidden bg-background" : "mx-auto flex h-[calc(100dvh-264px)] w-full min-w-0 max-w-7xl flex-col overflow-hidden bg-background md:h-[calc(100dvh-180px)]"}>
      {/* Header — hidden when embedded in the hub (hideRoomList=true) */}
      {!hideRoomList && (
        <div className="flex items-center justify-between p-3 md:p-4 border-b bg-background flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="font-vollkorn text-lg md:text-xl font-bold">Workspace</h2>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Lock className="h-3 w-3" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Encrypted</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowGroupCreate(true);
                fetchAllUsers();
              }}
              className="gap-1.5 text-xs"
            >
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Group</span>
            </Button>
            <Button
              onClick={() => {
                setShowNewChat(true);
                fetchAllUsers();
              }}
              size="sm"
              className="gap-1.5 bg-bronze hover:bg-bronze/90 text-background text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </Button>
          </div>
        </div>
      )}

      {/* Access denied state when embedded and user is not a workspace member */}
      {hideRoomList && externalRoomNotFound && !loadingRooms && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
          <div className="p-3 rounded-full bg-muted">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-poppins text-sm font-medium text-foreground">Not a member</p>
          <p className="font-poppins text-xs text-muted-foreground max-w-[220px]">
            You're not part of this workspace. Ask a member to add you.
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 ${hideRoomList && externalRoomNotFound ? "hidden" : ""}`}>
        {/* Sidebar / Room List */}
        <div
          className={`${hideRoomList ? "hidden" : selectedRoom ? "hidden md:flex" : "flex"} min-w-0 border-b bg-muted/20 md:w-[18rem] md:border-b-0 md:border-r xl:w-[22rem] 2xl:w-96 flex-col flex-shrink-0`}
        >
          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {loadingRooms ? (
              <div className="p-8 text-center text-muted-foreground">
                <div className="animate-pulse space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded-xl" />
                  ))}
                </div>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs mt-1 opacity-70">Start a new chat with anyone on Crevia</p>
              </div>
            ) : (
              <div className="px-2 pb-2 space-y-0.5">
                {filteredRooms.map((room) => {
                  const avatar = getRoomAvatar(room);
                  const initial = getRoomInitial(room);
                  const displayName = getRoomDisplayName(room);
                  const otherType = getOtherUserType(room);
                  const hasUnread = (room.unreadCount || 0) > 0;

                  return (
                    <button
                      key={room.id}
                      className={`w-full text-left p-3 rounded-xl cursor-pointer transition-colors ${
                        selectedRoom?.id === room.id
                          ? "bg-bronze/10 border border-bronze/20"
                          : "hover:bg-muted/50 active:bg-muted/50"
                      }`}
                      onClick={() => selectRoom(room)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div
                            className="h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden"
                            style={room.is_group ? { background: "hsl(36,60%,65%)", color: "hsl(36,60%,22%)" } : avatarStyle(room.members?.find(m => m.user_id !== currentUserId)?.user_id || displayName)}
                          >
                            {room.is_group ? (
                              <Users className="h-5 w-5" />
                            ) : avatar ? (
                              <img
                                src={avatar}
                                alt=""
                                className="h-11 w-11 rounded-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            ) : (
                              initial
                            )}
                          </div>
                          {hasUnread && (
                            <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-bronze text-[10px] font-bold flex items-center justify-center text-background">
                              {room.unreadCount! > 9 ? "9+" : room.unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <p className={`font-poppins text-sm truncate ${hasUnread ? "font-bold" : "font-semibold"}`}>
                                {displayName}
                              </p>
                              {room.is_group && (
                                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                                  Group
                                </Badge>
                              )}
                              {otherType && (
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] px-1 py-0 h-4 capitalize ${
                                    otherType === "brand"
                                      ? "border-blue-300 text-blue-600 dark:text-blue-400"
                                      : "border-purple-300 text-purple-600 dark:text-purple-400"
                                  }`}
                                >
                                  {otherType}
                                </Badge>
                              )}
                            </div>
                            {room.lastMessage && (
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {formatTime(room.lastMessage.created_at)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Shield className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                            <p className={`text-xs truncate ${hasUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                              {room.lastMessage?.content || "Start a conversation"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={`${selectedRoom ? "flex" : hideRoomList ? "hidden" : "hidden md:flex"} flex-1 min-h-0 min-w-0 flex-col bg-background`}>
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-3 md:p-4 border-b bg-background/95 backdrop-blur flex-shrink-0">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {/* Back button — show in non-embedded mode OR embedded mobile (replaces the removed "All messages" bar) */}
                    {(!hideRoomList || onBack) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onBack ? onBack() : setSelectedRoom(null)}
                        className="md:hidden -ml-2 h-8 w-8 p-0 flex-shrink-0"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                    )}
                    <button
                      onClick={() => setShowRoomInfo(true)}
                      className="flex items-center gap-3 min-w-0 hover:opacity-75 transition-opacity"
                    >
                    {(() => {
                      const otherMember = !selectedRoom.is_group
                        ? selectedRoom.members?.find((m) => m.user_id !== currentUserId)
                        : undefined;
                      const isOtherOnline = otherMember ? onlineUserIds.has(otherMember.user_id) : false;
                      const avatarSeed = otherMember?.user_id || getRoomDisplayName(selectedRoom);
                      const avatarUrl = getRoomAvatar(selectedRoom);
                      return (
                        <div className="relative h-10 w-10 flex-shrink-0">
                          <div
                            className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden"
                            style={selectedRoom.is_group ? { background: "hsl(36,60%,65%)", color: "hsl(36,60%,22%)" } : avatarStyle(avatarSeed)}
                          >
                            {selectedRoom.is_group ? (
                              <Users className="h-4 w-4" />
                            ) : avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt=""
                                className="h-10 w-10 rounded-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            ) : (
                              getRoomInitial(selectedRoom)
                            )}
                          </div>
                          {isOtherOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                          )}
                        </div>
                      );
                    })()}
                    {(() => {
                      const otherMember = !selectedRoom.is_group
                        ? selectedRoom.members?.find((m) => m.user_id !== currentUserId)
                        : undefined;
                      const isOtherOnline = otherMember ? onlineUserIds.has(otherMember.user_id) : false;
                      return (
                        <div className="min-w-0 flex-1">
                          <p className="font-poppins font-semibold text-sm truncate">
                            {getRoomDisplayName(selectedRoom)}
                          </p>
                          <div className="flex items-center gap-1.5">
                            {typingUsers.length > 0 ? (
                              <span className="text-[10px] text-emerald-500 font-medium animate-pulse">
                                {getTypingDisplayNames()} typing...
                              </span>
                            ) : isOtherOnline ? (
                              <span className="text-[10px] text-emerald-500 font-medium">online</span>
                            ) : selectedRoom.is_group && selectedRoom.members ? (
                              <span className="text-[10px] text-muted-foreground">
                                {selectedRoom.members.length} members
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })()}
                    </button>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowMessageSearch(!showMessageSearch)}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setShowRoomInfo(true)}>
                          <Info className="h-4 w-4 mr-2" />
                          {selectedRoom.is_group ? "Group Info" : "Contact Info"}
                        </DropdownMenuItem>
                        {selectedRoom.is_group && selectedRoom.created_by === currentUserId && (
                          <DropdownMenuItem
                            onClick={() => {
                              fetchAllUsers();
                              setShowGroupCreate(true);
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Members
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Message Search Bar */}
                {showMessageSearch && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search in conversation..."
                        value={messageSearch}
                        onChange={(e) => setMessageSearch(e.target.value)}
                        className="pl-9 h-8 text-xs"
                        autoFocus
                      />
                    </div>
                    {searchResults.length > 0 && (
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {searchResults.length} found
                      </span>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => { setShowMessageSearch(false); setMessageSearch(""); }} className="h-8 w-8 p-0">
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}

                {/* Search results */}
                {showMessageSearch && searchResults.length > 0 && (
                  <div className="mt-1 max-h-32 overflow-y-auto">
                    {searchResults.slice(0, 5).map((msg) => (
                      <button
                        key={msg.id}
                        onClick={() => scrollToMessage(msg.id)}
                        className="w-full text-left px-2 py-1.5 hover:bg-muted/50 rounded text-xs flex items-center gap-2"
                      >
                        <span className="text-muted-foreground text-[10px] whitespace-nowrap">{format(new Date(msg.created_at), "MMM d, h:mm a")}</span>
                        <span className="truncate">{msg.content}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Messages — native scroll for iOS Safari reliability.
                  Radix ScrollArea wraps in a display:table subtree that breaks
                  iOS touch-momentum scrolling and misfires scroll detection.
                  Plain overflow-y-auto + overscroll-contain + touch-pan-y is
                  the correct cross-platform primitive for a chat list. */}
              <div
                className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y p-3 md:p-4"
                style={{ overflowAnchor: "auto" }}
              >
                <div className="space-y-4 max-w-3xl mx-auto pb-4">

                  {messageGroups.map((group) => (
                    <div key={group.date}>
                      {/* Date separator */}
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider px-2">
                          {group.date}
                        </span>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      {group.messages.map((msg, msgIndex) => {
                        const isMine = msg.sender_id === currentUserId;
                        const isInvoice = msg.message_type === "invoice";
                        const isContract = msg.message_type === "contract";
                        const isFile = msg.message_type === "file";
                        const isVoice = msg.message_type === "voice";
                        const isWorkspaceInvite = msg.message_type === "workspace_invite";
                        const isPoll = msg.message_type === "poll";
                        const isDeletedForEveryone = (msg as any).deleted_for_everyone;
                        const isDeletedForMe = deletedForMeIds.has(msg.id);
                        const isPinned = pinnedMessageIds.has(msg.id);
                        const isFavorited = favoritedMessageIds.has(msg.id);
                        const msgReactions = reactions[msg.id] || [];
                        const isHighlighted = highlightedMsgId === msg.id;

                        // Message grouping — same sender consecutive messages
                        const visibleMsgs = group.messages.filter(m => !deletedForMeIds.has(m.id));
                        const visIdx = visibleMsgs.indexOf(msg);
                        const prevMsg = visibleMsgs[visIdx - 1];
                        const nextMsg = visibleMsgs[visIdx + 1];
                        const isFirstInSeq = !prevMsg || prevMsg.sender_id !== msg.sender_id;
                        const isLastInSeq = !nextMsg || nextMsg.sender_id !== msg.sender_id;

                        if (isDeletedForMe) return null;

                        return (
                          <div
                            key={msg.id}
                            id={`msg-${msg.id}`}
                            className={`flex ${isMine ? "justify-end" : "justify-start"} ${isLastInSeq ? "mb-3" : "mb-0.5"} group transition-colors duration-500 ${
                              isHighlighted ? "bg-bronze/10 rounded-xl -mx-2 px-2 py-1" : ""
                            }`}
                          >
                            {/* Avatar for group chats — only show on last in sequence */}
                            {!isMine && selectedRoom.is_group && (
                              isLastInSeq ? (
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 mt-1 flex-shrink-0 overflow-hidden"
                                  style={avatarStyle(msg.sender_id)}
                                >
                                  {msg.sender?.avatar_url ? (
                                    <img
                                      src={msg.sender.avatar_url}
                                      alt=""
                                      className="w-7 h-7 rounded-full object-cover"
                                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                    />
                                  ) : (
                                    msg.sender?.display_name?.[0]?.toUpperCase() || "U"
                                  )}
                                </div>
                              ) : (
                                <div className="w-7 mr-2 flex-shrink-0" />
                              )
                            )}

                            {/* Action buttons - before message for own */}
                            {isMine && !isDeletedForEveryone && (
                              <div className="flex items-center gap-0.5 mr-1 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleReply(msg)}>
                                  <Reply className="h-3 w-3" />
                                </Button>
                                <EmojiReactionPicker onReact={(emoji) => handleReaction(msg.id, emoji)} />
                                <MessageContextMenu
                                  messageId={msg.id}
                                  roomId={msg.room_id}
                                  content={msg.content}
                                  isMine={isMine}
                                  currentUserId={currentUserId}
                                  isPinned={isPinned}
                                  isFavorited={isFavorited}
                                  onDeleteForMe={handleDeleteForMe}
                                  onDeleteForEveryone={handleDeleteForEveryone}
                                  onForward={handleForward}
                                  onPinToggle={handlePinToggle}
                                  onFavoriteToggle={handleFavoriteToggle}
                                />
                              </div>
                            )}

                            <div className={`max-w-[85%] md:max-w-[70%]`}>
                              {/* Sender name in groups — only on first in sequence */}
                              {!isMine && selectedRoom.is_group && isFirstInSeq && (
                                <p className="text-[10px] font-semibold text-muted-foreground mb-0.5 ml-1">
                                  {msg.sender?.display_name || msg.sender?.handle || "User"}
                                </p>
                              )}

                              {/* Pinned indicator */}
                              {isPinned && (
                                <div className="flex items-center gap-1 mb-0.5 ml-1">
                                  <Pin className="h-2.5 w-2.5 text-bronze" />
                                  <span className="text-[9px] text-bronze font-medium">Pinned</span>
                                </div>
                              )}

                              {isDeletedForEveryone ? (
                                <div className={`rounded-2xl px-3 md:px-4 py-2.5 ${
                                  isMine ? "bg-bronze/30 rounded-br-md" : "bg-muted/50 rounded-bl-md"
                                } border border-dashed border-muted-foreground/20`}>
                                  <p className="text-xs italic text-muted-foreground">🚫 This message was deleted</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <p className="text-[10px] opacity-60">
                                      {format(new Date(msg.created_at), "h:mm a")}
                                    </p>
                                  </div>
                                </div>
                              ) : isWorkspaceInvite ? (
                                <>
                                  {/* ── Workspace invite card ── */}
                                  {(() => {
                                    let inv: any = { status: "pending" };
                                    try { if (msg.content) inv = JSON.parse(msg.content); } catch {}
                                    const status = inv.status ?? "pending";
                                    return (
                                      <div className="max-w-[230px] rounded-2xl border border-bronze/30 bg-bronze/5 dark:bg-bronze/10 overflow-hidden shadow-sm">
                                        <div className="px-3.5 py-2.5 border-b border-bronze/15">
                                          <div className="flex items-center gap-1.5 mb-0.5">
                                            <Sparkles className="w-3 h-3 text-bronze" />
                                            <span className="text-[11px] font-semibold text-bronze">Workspace Invite</span>
                                          </div>
                                          {inv.workspace_name && (
                                            <p className="text-[12px] font-semibold text-foreground truncate mb-0.5">{inv.workspace_name}</p>
                                          )}
                                          <p className="text-[11px] text-muted-foreground leading-snug">
                                            {isMine
                                              ? "You proposed a workspace"
                                              : `${msg.sender?.display_name || "Someone"} wants to start a workspace with you`}
                                          </p>
                                        </div>
                                        <div className="px-3.5 py-2.5 space-y-2">
                                          {status === "pending" && !isMine && (
                                            <div className="flex gap-1.5">
                                              <Button size="sm" onClick={() => handleAcceptInvite(msg)}
                                                className="flex-1 h-7 text-[10px] bg-bronze hover:bg-bronze/90 text-background font-semibold">
                                                Accept
                                              </Button>
                                              <Button size="sm" variant="outline" onClick={() => handleDeclineInvite(msg)}
                                                className="flex-1 h-7 text-[10px] border-border hover:bg-muted">
                                                Decline
                                              </Button>
                                            </div>
                                          )}
                                          {status === "pending" && isMine && (
                                            <p className="text-[10px] text-muted-foreground/60 text-center">Waiting for response…</p>
                                          )}
                                          {status === "accepted" && (
                                            <button
                                              onClick={() => inv.workspace_id && navigate(`/crevia-studio?tab=chat&roomId=${inv.workspace_id}`)}
                                              className="flex items-center gap-1.5 w-full hover:opacity-75 active:opacity-50 transition-opacity"
                                            >
                                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                              <span className="text-[11px] text-emerald-600 font-semibold truncate">
                                                Accepted — {inv.workspace_name}
                                              </span>
                                            </button>
                                          )}
                                          {status === "declined" && (
                                            <div className="flex items-center gap-1.5">
                                              <X className="w-3.5 h-3.5 text-muted-foreground/50" />
                                              <span className="text-[10px] text-muted-foreground">Declined</span>
                                            </div>
                                          )}
                                          <p className="text-[9px] text-muted-foreground/40 text-right">
                                            {format(new Date(msg.created_at), "h:mm a")}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </>
                              ) : (
                                <>
                                  <div
                                    className={`rounded-2xl px-3 md:px-4 py-2.5 ${
                                      isMine
                                        ? `bg-bronze text-background ${isLastInSeq ? "rounded-br-sm" : ""}`
                                        : `bg-muted ${isLastInSeq ? "rounded-bl-sm" : ""}`
                                    } ${(isInvoice || isContract) ? "border-2 " + (isMine ? "border-background/20" : "border-bronze/20") : ""}`}
                                  >
                                    {/* Reply context */}
                                    {msg.replyTo && (
                                      <button
                                        onClick={() => scrollToMessage(msg.replyTo!.id)}
                                        className={`w-full text-left mb-2 p-2 rounded-lg border-l-2 ${
                                          isMine
                                            ? "bg-background/10 border-background/40"
                                            : "bg-foreground/5 border-bronze/40"
                                        }`}
                                      >
                                        <p className={`text-[10px] font-semibold ${isMine ? "text-background/70" : "text-bronze"}`}>
                                          {msg.replyTo.sender_id === currentUserId
                                            ? "You"
                                            : msg.replyTo.sender?.display_name || msg.replyTo.sender?.handle || "User"}
                                        </p>
                                        <p className={`text-[11px] truncate ${isMine ? "text-background/60" : "text-muted-foreground"}`}>
                                          {msg.replyTo.content || "Message"}
                                        </p>
                                      </button>
                                    )}

                                    {/* Poll — interactive voting card */}
                                    {isPoll && msg.content && (
                                      <WorkspacePollMessage
                                        messageId={msg.id}
                                        content={msg.content}
                                        currentUserId={currentUserId}
                                        isMine={isMine}
                                      />
                                    )}

                                    {/* Invoice attachment — interactive card */}
                                    {isInvoice && msg.invoice_id && (
                                      <div className="mb-1.5">
                                        <AttachmentBubble
                                          type="invoice"
                                          attachmentId={msg.invoice_id}
                                          isMine={isMine}
                                        />
                                      </div>
                                    )}

                                    {/* Contract attachment — interactive card */}
                                    {isContract && msg.contract_id && (
                                      <div className="mb-1.5">
                                        <AttachmentBubble
                                          type="contract"
                                          attachmentId={msg.contract_id}
                                          isMine={isMine}
                                        />
                                      </div>
                                    )}

                                    {/* File attachment */}
                                    {isFile && msg.file_url && (
                                      <div className="mb-2">
                                        {isImageType(msg.file_type) ? (
                                          <div className="mb-1">
                                            {(() => {
                                              const url = getFilePublicUrl(msg.file_url!);
                                              return url ? (
                                                <div className="relative group/img">
                                                  <img
                                                    src={url}
                                                    alt={msg.file_name || "Image"}
                                                    className="max-w-full rounded-lg cursor-pointer max-h-[280px] object-cover"
                                                    onClick={() => setLightboxUrl(url)}
                                                    loading="lazy"
                                                  />
                                                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                    <Button
                                                      size="sm"
                                                      variant="secondary"
                                                      onClick={(e) => { e.stopPropagation(); setLightboxUrl(url); }}
                                                      className="h-7 w-7 p-0 bg-background/80 backdrop-blur"
                                                    >
                                                      <ZoomIn className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                      size="sm"
                                                      variant="secondary"
                                                      onClick={(e) => { e.stopPropagation(); downloadFile(msg.file_url!, msg.file_name || "image"); }}
                                                      className="h-7 w-7 p-0 bg-background/80 backdrop-blur"
                                                    >
                                                      <Download className="h-3.5 w-3.5" />
                                                    </Button>
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="h-32 rounded-lg bg-muted/50 animate-pulse flex items-center justify-center">
                                                  <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
                                                </div>
                                              );
                                            })()}
                                            <p className="text-[10px] opacity-60 truncate mt-1">{msg.file_name}</p>
                                          </div>
                                        ) : isVideoType(msg.file_type) ? (
                                          <div className="mb-1">
                                            {getFilePublicUrl(msg.file_url!) ? (
                                              <video
                                                src={getFilePublicUrl(msg.file_url!)!}
                                                controls
                                                playsInline
                                                preload="metadata"
                                                className="w-full max-w-[280px] sm:max-w-sm rounded-xl bg-black"
                                                style={{ maxHeight: "260px" }}
                                              />
                                            ) : (
                                              <div className="w-full max-w-[280px] sm:max-w-sm aspect-video rounded-xl bg-black/60 animate-pulse flex items-center justify-center">
                                                <Video className="h-7 w-7 text-white/20" />
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <a
                                            href={getFilePublicUrl(msg.file_url!) ?? undefined}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (!getFilePublicUrl(msg.file_url!)) e.preventDefault();
                                            }}
                                            className={`p-3 rounded-xl bg-background/10 flex items-center gap-3 min-h-[56px] transition-colors active:bg-background/20 ${getFilePublicUrl(msg.file_url!) ? "cursor-pointer" : "cursor-wait"}`}
                                          >
                                            <div className="h-9 w-9 rounded-lg bg-background/10 flex items-center justify-center flex-shrink-0">
                                              {getFilePublicUrl(msg.file_url!) ? (
                                                <File className="h-4 w-4" />
                                              ) : (
                                                <Loader2 className="h-4 w-4 animate-spin opacity-50" />
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-xs font-medium truncate">{msg.file_name}</p>
                                              <p className="text-[10px] opacity-60">{formatFileSize(msg.file_size)}</p>
                                            </div>
                                            <button
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                downloadFile(msg.file_url!, msg.file_name || "file");
                                              }}
                                              className="h-8 w-8 rounded-full bg-background/10 flex items-center justify-center active:bg-background/30 transition-colors flex-shrink-0"
                                            >
                                              <Download className="h-3.5 w-3.5" />
                                            </button>
                                          </a>
                                        )}
                                      </div>
                                    )}

                                    {/* Voice note */}
                                    {isVoice && msg.file_url && (
                                      <VoiceNotePlayer
                                        audioUrl={msg.file_url}
                                        duration={parseDurationFromContent(msg.content)}
                                        isMine={isMine}
                                      />
                                    )}

                                    {msg.content && !isVoice && !(isFile && msg.file_url) && (
                                      msg.content === "[Unable to decrypt message]" || msg.content === "[Encryption key unavailable]" ? (
                                        <div className="flex items-center gap-2">
                                          <Lock className="h-3.5 w-3.5 opacity-60" />
                                          <span className="text-xs italic opacity-70">{msg.content}</span>
                                          {selectedRoom?.members && selectedRoom.members.length > 0 && (
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-5 px-1.5 text-[10px] opacity-70 hover:opacity-100"
                                              onClick={() => retryDecryption(msg.room_id, selectedRoom.members!)}
                                            >
                                              Retry
                                            </Button>
                                          )}
                                        </div>
                                      ) : (
                                        <p className="text-xs md:text-sm whitespace-pre-wrap break-words">
                                          {linkifyContent(msg.content)}
                                        </p>
                                      )
                                    )}

                                    <div className="flex items-center gap-1 mt-1">
                                      <p className="text-[10px] opacity-60">
                                        {format(new Date(msg.created_at), "h:mm a")}
                                      </p>
                                      {isMine && (() => {
                                        const status = getMessageReadStatus(msg);
                                        if (status === "read") return <CheckCheck className="h-3 w-3 text-bronze ml-0.5" />;
                                        if (status === "delivered") return <CheckCheck className="h-3 w-3 opacity-50 ml-0.5" />;
                                        return <Check className="h-3 w-3 opacity-40 ml-0.5" />;
                                      })()}
                                    </div>
                                  </div>

                                  {/* Reactions display */}
                                  <MessageReactions
                                    reactions={msgReactions}
                                    messageId={msg.id}
                                    currentUserId={currentUserId}
                                    onUpdate={fetchMessageMeta}
                                  />
                                </>
                              )}
                            </div>

                            {/* Action buttons - after message for other's messages */}
                            {!isMine && !isDeletedForEveryone && (
                              <div className="flex items-center gap-0.5 ml-1 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleReply(msg)}>
                                  <Reply className="h-3 w-3" />
                                </Button>
                                <EmojiReactionPicker onReact={(emoji) => handleReaction(msg.id, emoji)} />
                                <MessageContextMenu
                                  messageId={msg.id}
                                  roomId={msg.room_id}
                                  content={msg.content}
                                  isMine={isMine}
                                  currentUserId={currentUserId}
                                  isPinned={isPinned}
                                  isFavorited={isFavorited}
                                  onDeleteForMe={handleDeleteForMe}
                                  onDeleteForEveryone={handleDeleteForEveryone}
                                  onForward={handleForward}
                                  onPinToggle={handlePinToggle}
                                  onFavoriteToggle={handleFavoriteToggle}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {typingUsers.length > 0 && (
                    <div className="flex justify-start mb-2">
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground ml-1">
                            {getTypingDisplayNames()} typing
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* overflow-anchor: auto on this sentinel tells the browser to
                      lock the scroll position here as content above grows */}
                  <div ref={messagesEndRef} style={{ overflowAnchor: "auto", height: 1 }} />
                </div>
              </div>

              {/* Input Area — dynamic bottom padding like Dira: shrinks when keyboard is up */}
              <div
                className="border-t bg-background/95 backdrop-blur flex-shrink-0 pt-3 px-3 md:p-4"
                style={
                  typeof window !== "undefined" && window.innerWidth < 768
                    ? {
                        paddingBottom: keyboardOpen
                          ? "0.75rem"
                          : hideRoomList
                            ? "calc(var(--nav-bottom-offset) + 0.75rem)"
                            : "calc(0.75rem + env(safe-area-inset-bottom,0px))",
                      }
                    : undefined
                }
              >
                <div className="max-w-3xl mx-auto">
                  {/* Reply preview */}
                  {replyingTo && (
                    <div className="mb-2 p-2.5 bg-muted/60 rounded-lg flex items-start gap-2 border-l-2 border-bronze">
                      <Reply className="h-3.5 w-3.5 text-bronze mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-bronze">
                          Replying to {replyingTo.sender_id === currentUserId ? "yourself" : replyingTo.sender?.display_name || replyingTo.sender?.handle || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {replyingTo.content || "Message"}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)} className="h-6 w-6 p-0 flex-shrink-0">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}

                  {/* Conversion progress is now shown inline on the video thumbnail — no blocking banner */}

                  {selectedFile && !isRecordingVoice && (
                    <div className="mb-2 p-2 bg-muted rounded-lg flex items-center gap-2">
                      {selectedFile.type.startsWith("image/") ? (
                        <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0">
                          <img src={URL.createObjectURL(selectedFile)} alt="" className="h-full w-full object-cover" />
                        </div>
                      ) : selectedFile.type.startsWith("video/") ? (
                        <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0 bg-black">
                          <video
                            src={URL.createObjectURL(selectedFile)}
                            className="h-full w-full object-cover"
                            muted
                            playsInline
                          />
                        </div>
                      ) : (
                        <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => setSelectedFile(null)} className="h-6 w-6 p-0">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}

                  {isRecordingVoice ? (
                    <VoiceRecorder
                      onRecordingComplete={sendVoiceNote}
                      onCancel={() => setIsRecordingVoice(false)}
                      isUploading={uploadingVoice}
                    />
                  ) : (
                    <>
                      {/*
                        Three separate hidden inputs — one per accept type.
                        iOS Safari blocks the file picker when `accept` is
                        mutated on the same element right before .click().
                        Pre-wired refs require zero runtime mutation.
                      */}
                      <input ref={fileAnyRef}   type="file" accept="*/*"      className="sr-only" onChange={handleFileSelect} />
                      <input ref={fileVideoRef} type="file" accept="video/*"   className="sr-only" onChange={handleFileSelect} />

                      {/* Auto-resizing pill input bar.
                          items-end keeps + and send pinned to the bottom edge
                          as the textarea grows beyond one line. */}
                      <div className="flex items-end gap-1 bg-muted/40 rounded-2xl border border-border/60 px-2 py-1.5 shadow-sm transition-all duration-200 focus-within:border-bronze/50 focus-within:bg-card focus-within:shadow-md">

                        {/* Attach menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-background/80 flex-shrink-0 mb-0.5">
                              <Plus className="h-5 w-5 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-52">
                            <DropdownMenuItem onClick={() => fileAnyRef.current?.click()}>
                              <Paperclip className="h-4 w-4 mr-2" />Attach File
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { fetchInvoices(); setShowInvoicePicker(true); }}>
                              <Receipt className="h-4 w-4 mr-2" />Attach Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { fetchContracts(); setShowContractPicker(true); }}>
                              <FileSignature className="h-4 w-4 mr-2" />Attach Canvas
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Auto-resizing textarea — min 1 line, max 5 lines (~120px) */}
                        <textarea
                          ref={chatTextareaRef}
                          placeholder="Type a message..."
                          value={newMessage}
                          rows={1}
                          onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                            // Auto-resize: reset to auto first so shrinking works correctly
                            e.target.style.height = "auto";
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                            }
                          }}
                          disabled={uploadingFile}
                          className="flex-1 min-w-0 resize-none overflow-y-auto border-none outline-none focus:ring-0 focus:outline-none bg-transparent text-sm leading-relaxed py-1.5 px-2 placeholder:text-muted-foreground/60 min-h-[36px] max-h-[120px]"
                          style={{ height: "36px" }}
                          autoComplete="off"
                          autoCorrect="off"
                          spellCheck={false}
                        />

                        {/* Send / Mic — stays at bottom when textarea grows */}
                        {newMessage.trim() || selectedFile ? (
                          <Button
                            onClick={sendMessage}
                            disabled={uploadingFile || (!newMessage.trim() && !selectedFile)}
                            size="icon"
                            className="h-9 w-9 rounded-full bg-bronze hover:bg-bronze/90 text-background flex-shrink-0 disabled:opacity-30 mb-0.5"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => setIsRecordingVoice(true)}
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full flex-shrink-0 text-bronze hover:bg-bronze/10 mb-0.5"
                          >
                            <Mic className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center p-6">
                <div className="w-20 h-20 rounded-full bg-bronze/10 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-10 w-10 text-bronze/50" />
                </div>
                <p className="text-lg font-semibold mb-1">Crevia Workspace</p>
                <p className="text-sm opacity-70 mb-1">End-to-end encrypted messaging</p>
                <p className="text-xs opacity-50">Chat with brands, creators, or create groups</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      <Dialog open={!!lightboxUrl} onOpenChange={() => setLightboxUrl(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <DialogHeader className="sr-only">
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {lightboxUrl && (
            <div className="relative flex items-center justify-center min-h-[50vh]">
              <img
                src={lightboxUrl}
                alt="Full size"
                className="max-w-full max-h-[90vh] object-contain"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = lightboxUrl;
                    a.download = "image";
                    a.target = "_blank";
                    a.click();
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white backdrop-blur"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setLightboxUrl(null)}
                  className="bg-white/10 hover:bg-white/20 text-white backdrop-blur"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Chat Dialog */}
      <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
            <DialogDescription>Search for any user on Crevia to start chatting</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or @handle..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-[350px]">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {userSearch ? "No users found" : "Start typing to search"}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => startDirectChat(user.id)}
                      className="w-full p-3 rounded-xl hover:bg-muted transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-bronze/10 flex items-center justify-center text-sm font-semibold overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            user.display_name?.[0]?.toUpperCase() || "U"
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate text-sm">{user.display_name || "User"}</p>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">@{user.handle}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Group Dialog */}
      <Dialog open={showGroupCreate} onOpenChange={setShowGroupCreate}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-bronze" />
              Create Group Chat
            </DialogTitle>
            <DialogDescription>Add a name and select members for your group</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            {selectedGroupMembers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedGroupMembers.map((uid) => {
                  const user = allUsers.find((u) => u.id === uid);
                  return (
                    <Badge key={uid} variant="secondary" className="gap-1 pr-1">
                      {user?.display_name || user?.handle || "User"}
                      <button
                        onClick={() =>
                          setSelectedGroupMembers((prev) => prev.filter((id) => id !== uid))
                        }
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users to add..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-[250px]">
              <div className="space-y-1">
                {filteredUsers.map((user) => {
                  const isSelected = selectedGroupMembers.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedGroupMembers((prev) => prev.filter((id) => id !== user.id));
                        } else {
                          setSelectedGroupMembers((prev) => [...prev, user.id]);
                        }
                      }}
                      className={`w-full p-3 rounded-xl transition-colors text-left ${
                        isSelected ? "bg-bronze/10 border border-bronze/20" : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox checked={isSelected} className="flex-shrink-0" />
                        <div className="h-8 w-8 rounded-full bg-bronze/10 flex items-center justify-center text-xs font-semibold overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            user.display_name?.[0]?.toUpperCase() || "U"
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.display_name || "User"}</p>
                          <p className="text-xs text-muted-foreground">@{user.handle}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
            <Button
              onClick={createGroupChat}
              disabled={!groupName.trim() || selectedGroupMembers.length === 0}
              className="w-full bg-bronze hover:bg-bronze/90 gap-2"
            >
              <Users className="h-4 w-4" />
              Create Group ({selectedGroupMembers.length} members)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Picker */}
      <Dialog open={showInvoicePicker} onOpenChange={setShowInvoicePicker}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-bronze" />
              Attach Invoice
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[350px]">
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No invoices found</div>
            ) : (
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => sendInvoiceAttachment(inv)}
                    className="w-full p-4 rounded-xl border hover:border-bronze/30 hover:bg-muted/50 transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{inv.invoice_number}</p>
                        <p className="text-xs text-muted-foreground">{inv.client_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">
                          {new Intl.NumberFormat("en-KE", { style: "currency", currency: inv.currency }).format(Number(inv.total))}
                        </p>
                        <Badge variant="outline" className="text-[9px] capitalize">
                          {inv.status}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Contract Picker */}
      <Dialog open={showContractPicker} onOpenChange={setShowContractPicker}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-bronze" />
              Attach Canvas
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[350px]">
            {contracts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No Canvas found</div>
            ) : (
              <div className="space-y-2">
                {contracts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => sendContractAttachment(c)}
                    className="w-full p-4 rounded-xl border hover:border-bronze/30 hover:bg-muted/50 transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.client_name}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] capitalize">
                        {c.status}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Room Info Dialog */}
      <Dialog open={showRoomInfo} onOpenChange={setShowRoomInfo}>
        <DialogContent className="sm:max-w-[420px] max-h-[85vh] flex flex-col p-0 gap-0" aria-describedby={undefined}>
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/50 flex-shrink-0">
            <DialogTitle>
              {selectedRoom?.is_group ? "Group Info" : "Contact Info"}
            </DialogTitle>
          </DialogHeader>

          {selectedRoom && (
            <ScrollArea className="flex-1 overflow-hidden">
              <div className="px-6 py-5 space-y-5">

                {/* Avatar + name */}
                <div className="flex flex-col items-center gap-3">
                  {(() => {
                    const other = selectedRoom.members?.find((m) => m.user_id !== currentUserId);
                    const seed = other?.user_id || getRoomDisplayName(selectedRoom);
                    return (
                      <div
                        className="h-20 w-20 rounded-full flex items-center justify-center overflow-hidden"
                        style={selectedRoom.is_group ? { background: "hsl(36,60%,65%)", color: "hsl(36,60%,22%)" } : avatarStyle(seed)}
                      >
                        {selectedRoom.is_group ? (
                          <Users className="h-8 w-8" />
                        ) : other?.profile?.avatar_url ? (
                          <img
                            src={other.profile.avatar_url}
                            alt=""
                            className="h-20 w-20 rounded-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <span className="text-2xl font-bold">{getRoomInitial(selectedRoom)}</span>
                        )}
                      </div>
                    );
                  })()}
                  <div className="text-center">
                    <p className="font-bold text-lg leading-tight">{getRoomDisplayName(selectedRoom)}</p>
                    {!selectedRoom.is_group && (() => {
                      const other = selectedRoom.members?.find((m) => m.user_id !== currentUserId);
                      return other?.profile?.handle ? (
                        <p className="text-sm text-muted-foreground mt-0.5">@{other.profile.handle}</p>
                      ) : null;
                    })()}
                    {selectedRoom.is_group && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {selectedRoom.members?.length} members
                      </p>
                    )}
                  </div>
                </div>

                {/* ── DM only: Crevia link + social links ── */}
                {!selectedRoom.is_group && (
                  <>
                    {/* Crevia Profile link */}
                    {contactLinkProfile?.username && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Crevia Profile
                        </p>
                        <a
                          href={`https://crevia.app/${contactLinkProfile.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl bg-bronze/5 border border-bronze/20 hover:bg-bronze/10 transition-colors"
                        >
                          <div className="h-8 w-8 rounded-lg bg-bronze/15 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-4 w-4 text-bronze" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                              crevia.app/{contactLinkProfile.username}
                            </p>
                            {contactLinkProfile.bio && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {contactLinkProfile.bio}
                              </p>
                            )}
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </a>
                      </div>
                    )}

                    {/* Social links */}
                    {contactSocialLinks.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Social Links
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {contactSocialLinks.map((link) => {
                            const opt = iconOptions.find((o) => o.value === link.platform);
                            const Icon = opt?.icon ?? Globe;
                            return (
                              <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-muted/70 transition-colors text-xs font-medium"
                              >
                                <Icon className="h-3.5 w-3.5 text-bronze" />
                                <span>{opt?.label ?? link.platform}</span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ── Group only: members list ── */}
                {selectedRoom.is_group && selectedRoom.members && selectedRoom.members.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Members
                    </p>
                    <div className="space-y-1">
                      {selectedRoom.members.map((member) => (
                        <div key={member.user_id} className="flex items-center gap-3 p-2 rounded-lg">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0"
                            style={avatarStyle(member.user_id)}
                          >
                            {member.profile?.avatar_url ? (
                              <img
                                src={member.profile.avatar_url}
                                alt=""
                                className="h-8 w-8 rounded-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            ) : (
                              member.profile?.display_name?.[0]?.toUpperCase() || "U"
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium truncate">
                                {member.profile?.display_name || member.profile?.handle || "User"}
                                {member.user_id === currentUserId && " (You)"}
                              </p>
                              {member.role === "admin" && (
                                <Badge variant="secondary" className="text-[9px] px-1 py-0">Admin</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {member.profile?.handle ? `@${member.profile.handle}` : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shared Media — visible for both DMs and groups */}
                <ChatMediaPanel roomId={selectedRoom.id} />
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Forward Message Dialog */}
      <Dialog open={showForwardDialog} onOpenChange={setShowForwardDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Forward Message</DialogTitle>
            <DialogDescription>Select a conversation to forward this message to</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[350px]">
            {rooms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No conversations available</div>
            ) : (
              <div className="space-y-1">
                {rooms
                  .filter((r) => selectedRoom && r.id !== selectedRoom.id)
                  .map((room) => (
                    <button
                      key={room.id}
                      onClick={() => forwardMessageToRoom(room.id)}
                      className="w-full p-3 rounded-xl hover:bg-muted transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-bronze/10 flex items-center justify-center text-sm font-semibold overflow-hidden">
                          {getRoomAvatar(room) ? (
                            <img src={getRoomAvatar(room)!} alt="" className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            getRoomInitial(room)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{getRoomDisplayName(room)}</p>
                          {room.is_group && (
                            <p className="text-xs text-muted-foreground">{room.members?.length} members</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default CreviaChat;
