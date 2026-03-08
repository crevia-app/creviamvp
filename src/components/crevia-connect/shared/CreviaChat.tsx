import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useE2EEncryption } from "@/hooks/use-e2e-encryption";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import VoiceRecorder from "./VoiceRecorder";
import VoiceNotePlayer from "./VoiceNotePlayer";
import MessageContextMenu from "./MessageContextMenu";
import EmojiReactionPicker from "./EmojiReactionPicker";
import MessageReactions from "./MessageReactions";
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
  sender?: {
    display_name: string | null;
    handle: string;
    avatar_url: string | null;
  };
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

const CreviaChat = () => {
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
  const [showAttachMenu, setShowAttachMenu] = useState(false);
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { e2eReady, initEncryption, setupRoomEncryption, encrypt, decrypt, decryptMessages } = useE2EEncryption(currentUserId);

  // Initialize
  useEffect(() => {
    initChat();
  }, []);

  // Subscribe to new messages
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("chat-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          // If in current room, add message and decrypt
          if (selectedRoom && newMsg.room_id === selectedRoom.id) {
            (async () => {
              const msgWithProfile = await loadSenderProfile(newMsg);
              // Decrypt content if encrypted
              if (msgWithProfile.is_encrypted && msgWithProfile.content) {
                msgWithProfile.content = await decrypt(msgWithProfile.content, msgWithProfile.room_id);
              }
              setMessages((prev) => [...prev, msgWithProfile]);
            })();
            updateReadReceipt(newMsg.room_id);
          }
          // Update room list
          fetchRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, selectedRoom, decrypt]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadSenderProfile = async (msg: ChatMessage): Promise<ChatMessage> => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, handle, avatar_url")
      .eq("id", msg.sender_id)
      .single();
    return { ...msg, sender: data || undefined };
  };

  const initChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);
    await fetchRooms();
  };

  // Initialize E2EE after user ID is set
  useEffect(() => {
    if (currentUserId) {
      initEncryption();
    }
  }, [currentUserId, initEncryption]);

  const fetchRooms = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get rooms the user is a member of
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

    // For each room, get members and last message
    const enrichedRooms: ChatRoom[] = await Promise.all(
      roomsData.map(async (room) => {
        // Get members with profiles
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

        // Get last message
        const { data: lastMsgs } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("room_id", room.id)
          .order("created_at", { ascending: false })
          .limit(1);

        // Get unread count
        const { data: receipt } = await supabase
          .from("chat_read_receipts")
          .select("last_read_at")
          .eq("room_id", room.id)
          .eq("user_id", user.id)
          .single();

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

        // Decrypt last message for preview
        let lastMessage = lastMsgs?.[0] || null;
        if (lastMessage && lastMessage.is_encrypted && lastMessage.content) {
          try {
            const decryptedContent = await decrypt(lastMessage.content, room.id);
            lastMessage = { ...lastMessage, content: decryptedContent || lastMessage.content };
          } catch {
            // If decryption fails, show fallback
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

    // Enrich with sender profiles
    const enriched = await Promise.all(data.map(loadSenderProfile));
    
    // Decrypt messages
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
    
    // Ensure room has encryption keys, setup if missing
    if (currentUserId && room.members && room.members.length > 0) {
      const { data: existingKey } = await supabase
        .from("room_encrypted_keys" as any)
        .select("id")
        .eq("room_id", room.id)
        .eq("user_id", currentUserId)
        .single() as any;
      
      if (!existingKey) {
        const memberIds = room.members.map(m => m.user_id);
        await setupRoomEncryption(room.id, memberIds);
      }
    }
    
    fetchMessages(room.id);
  };

  // Get or create 1:1 room
  const startDirectChat = async (otherUserId: string) => {
    if (!currentUserId) return;

    // Check if a 1:1 room already exists
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
        // Check for non-group room
        const { data: existingRooms } = await supabase
          .from("chat_rooms")
          .select("*")
          .in("id", commonRoomIds)
          .eq("is_group", false);

        if (existingRooms && existingRooms.length > 0) {
          // Use existing room
          const room = existingRooms[0];
          setShowNewChat(false);
          await fetchRooms();
          const enriched = rooms.find((r) => r.id === room.id);
          if (enriched) {
            selectRoom(enriched);
          } else {
            // Fetch fresh
            await fetchRooms();
            selectRoom({ ...room, members: [], lastMessage: null, unreadCount: 0 });
            fetchMessages(room.id);
          }
          return;
        }
      }
    }

    // Create new room
    const { data: newRoom, error } = await supabase
      .from("chat_rooms")
      .insert({ created_by: currentUserId, is_group: false })
      .select()
      .single();

    if (error || !newRoom) {
      toast.error("Failed to create conversation");
      return;
    }

    // Add both members
    await supabase.from("chat_room_members").insert([
      { room_id: newRoom.id, user_id: currentUserId, role: "member" },
      { room_id: newRoom.id, user_id: otherUserId, role: "member" },
    ]);

    // Setup E2EE for this room
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

    // Setup E2EE for group
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
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("chat-files")
          .upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
        fileData = { url: fileName, name: selectedFile.name, type: selectedFile.type, size: selectedFile.size };
      }

      // Encrypt the message content
      const plainContent = newMessage || (fileData ? `Sent a file: ${fileData.name}` : "");
      const encryptedContent = await encrypt(plainContent, selectedRoom.id);

      await supabase.from("chat_messages").insert({
        room_id: selectedRoom.id,
        sender_id: currentUserId,
        content: encryptedContent || plainContent,
        message_type: fileData ? "file" : "text",
        file_url: fileData?.url,
        file_name: fileData?.name,
        file_type: fileData?.type,
        file_size: fileData?.size,
        is_encrypted: !!encryptedContent,
      });

      // Update room timestamp
      await supabase
        .from("chat_rooms")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", selectedRoom.id);

      setNewMessage("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Send error:", error);
      toast.error("Failed to send message");
    } finally {
      setUploadingFile(false);
    }
  };

  const sendInvoiceAttachment = async (invoice: AttachableInvoice) => {
    if (!selectedRoom || !currentUserId) return;

    const plainContent = `📄 Invoice ${invoice.invoice_number} — ${new Intl.NumberFormat("en-KE", { style: "currency", currency: invoice.currency }).format(Number(invoice.total))} (${invoice.status})`;
    const encryptedContent = await encrypt(plainContent, selectedRoom.id);

    await supabase.from("chat_messages").insert({
      room_id: selectedRoom.id,
      sender_id: currentUserId,
      content: encryptedContent || plainContent,
      message_type: "invoice",
      invoice_id: invoice.id,
      is_encrypted: !!encryptedContent,
    });

    await supabase.from("chat_rooms").update({ updated_at: new Date().toISOString() }).eq("id", selectedRoom.id);
    setShowInvoicePicker(false);
    toast.success("Invoice attached!");
  };

  const sendContractAttachment = async (contract: AttachableContract) => {
    if (!selectedRoom || !currentUserId) return;

    const plainContent = `📋 Contract: ${contract.title} — ${contract.client_name} (${contract.status})`;
    const encryptedContent = await encrypt(plainContent, selectedRoom.id);

    await supabase.from("chat_messages").insert({
      room_id: selectedRoom.id,
      sender_id: currentUserId,
      content: encryptedContent || plainContent,
      message_type: "contract",
      contract_id: contract.id,
      is_encrypted: !!encryptedContent,
    });

    await supabase.from("chat_rooms").update({ updated_at: new Date().toISOString() }).eq("id", selectedRoom.id);
    setShowContractPicker(false);
    toast.success("Contract attached!");
  };

  const sendVoiceNote = async (blob: Blob, duration: number) => {
    if (!selectedRoom || !currentUserId) return;
    setUploadingVoice(true);
    try {
      const ext = blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : "webm";
      const fileName = `${currentUserId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("voice-notes")
        .upload(fileName, blob, { contentType: blob.type || "audio/webm" });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("voice-notes")
        .getPublicUrl(fileName);

      const plainContent = `🎤 Voice note (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")})`;
      const encryptedContent = await encrypt(plainContent, selectedRoom.id);

      await supabase.from("chat_messages").insert({
        room_id: selectedRoom.id,
        sender_id: currentUserId,
        content: encryptedContent || plainContent,
        message_type: "voice",
        file_url: urlData.publicUrl,
        file_name: `voice-${Date.now()}.${ext}`,
        file_type: blob.type || "audio/webm",
        file_size: blob.size,
        is_encrypted: !!encryptedContent,
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
      .from("contracts")
      .select("id, title, client_name, status, value, currency")
      .order("created_at", { ascending: false })
      .limit(20);
    setContracts((data as AttachableContract[]) || []);
  };

  const downloadFile = async (fileUrl: string, fileName: string) => {
    const { data, error } = await supabase.storage.from("chat-files").download(fileUrl);
    if (error) {
      toast.error("Download failed");
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Max file size is 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

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

  // Fetch reactions, pins, favorites, deletions when messages change
  const fetchMessageMeta = useCallback(async () => {
    if (!currentUserId || messages.length === 0) return;
    const msgIds = messages.map((m) => m.id);

    // Fetch reactions
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

    // Fetch pins for this room
    if (selectedRoom) {
      const { data: pinData } = await supabase
        .from("pinned_messages")
        .select("message_id")
        .eq("room_id", selectedRoom.id);
      setPinnedMessageIds(new Set(pinData?.map((p) => p.message_id) || []));
    }

    // Fetch favorites
    const { data: favData } = await supabase
      .from("favorite_messages")
      .select("message_id")
      .eq("user_id", currentUserId)
      .in("message_id", msgIds);
    setFavoritedMessageIds(new Set(favData?.map((f) => f.message_id) || []));

    // Fetch deleted for me
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

  // Subscribe to reaction changes
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
    const encryptedContent = await encrypt(forwardContent, targetRoomId);

    await supabase.from("chat_messages").insert({
      room_id: targetRoomId,
      sender_id: currentUserId,
      content: encryptedContent || forwardContent,
      message_type: msg.message_type,
      file_url: msg.file_url,
      file_name: msg.file_name,
      file_type: msg.file_type,
      file_size: msg.file_size,
      is_encrypted: !!encryptedContent,
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

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] md:h-[calc(100vh-180px)] bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b bg-background/95 backdrop-blur flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="font-vollkorn text-lg md:text-xl font-bold">Messages</h2>
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
            className="gap-1.5 hidden sm:flex"
          >
            <Users className="h-3.5 w-3.5" />
            Group
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setShowNewChat(true);
              fetchAllUsers();
            }}
            className="gap-1.5 bg-bronze hover:bg-bronze/90"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Sidebar / Room List */}
        <div
          className={`${selectedRoom ? "hidden md:flex" : "flex"} md:w-80 lg:w-96 border-b md:border-b-0 md:border-r flex-col bg-muted/20 flex-shrink-0`}
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
                      className={`w-full text-left p-3 rounded-xl cursor-pointer transition-all ${
                        selectedRoom?.id === room.id
                          ? "bg-bronze/10 border border-bronze/20"
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() => selectRoom(room)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="h-11 w-11 rounded-full bg-bronze/20 flex items-center justify-center text-sm font-semibold text-bronze overflow-hidden">
                            {room.is_group ? (
                              <Users className="h-5 w-5" />
                            ) : avatar ? (
                              <img src={avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
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
        <div className={`${selectedRoom ? "flex" : "hidden md:flex"} flex-1 flex-col bg-background min-h-0`}>
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-3 md:p-4 border-b bg-background/95 backdrop-blur flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRoom(null)}
                      className="md:hidden -ml-2 h-8 w-8 p-0"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="h-9 w-9 rounded-full bg-bronze/20 flex items-center justify-center text-sm font-semibold text-bronze overflow-hidden flex-shrink-0">
                      {selectedRoom.is_group ? (
                        <Users className="h-4 w-4" />
                      ) : getRoomAvatar(selectedRoom) ? (
                        <img src={getRoomAvatar(selectedRoom)!} alt="" className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        getRoomInitial(selectedRoom)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-poppins font-semibold text-sm truncate">
                        {getRoomDisplayName(selectedRoom)}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <Lock className="h-2.5 w-2.5 text-emerald-500" />
                        <span className="text-[10px] text-emerald-500 font-medium">End-to-end encrypted</span>
                        {selectedRoom.is_group && selectedRoom.members && (
                          <span className="text-[10px] text-muted-foreground">
                            • {selectedRoom.members.length} members
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
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

              {/* Messages */}
              <ScrollArea className="flex-1 p-3 md:p-4">
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

                      {group.messages.map((msg) => {
                        const isMine = msg.sender_id === currentUserId;
                        const isInvoice = msg.message_type === "invoice";
                        const isContract = msg.message_type === "contract";
                        const isFile = msg.message_type === "file";
                        const isVoice = msg.message_type === "voice";
                        const isDeletedForEveryone = (msg as any).deleted_for_everyone;
                        const isDeletedForMe = deletedForMeIds.has(msg.id);
                        const isPinned = pinnedMessageIds.has(msg.id);
                        const isFavorited = favoritedMessageIds.has(msg.id);
                        const msgReactions = reactions[msg.id] || [];

                        // Skip deleted messages
                        if (isDeletedForMe) return null;

                        return (
                          <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2 group`}>
                            {/* Show avatar for group chats */}
                            {!isMine && selectedRoom.is_group && (
                              <div className="w-7 h-7 rounded-full bg-bronze/20 flex items-center justify-center text-[10px] font-semibold text-bronze mr-2 mt-1 flex-shrink-0 overflow-hidden">
                                {msg.sender?.avatar_url ? (
                                  <img src={msg.sender.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                                ) : (
                                  msg.sender?.display_name?.[0]?.toUpperCase() || "U"
                                )}
                              </div>
                            )}

                            {/* Action buttons - before message for own messages */}
                            {isMine && !isDeletedForEveryone && (
                              <div className="flex items-center gap-0.5 mr-1 self-center">
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
                              {/* Sender name in groups */}
                              {!isMine && selectedRoom.is_group && (
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
                              ) : (
                                <>
                                  <div
                                    className={`rounded-2xl px-3 md:px-4 py-2.5 ${
                                      isMine
                                        ? "bg-bronze text-background rounded-br-md"
                                        : "bg-muted rounded-bl-md"
                                    } ${(isInvoice || isContract) ? "border-2 " + (isMine ? "border-background/20" : "border-bronze/20") : ""}`}
                                  >
                                    {/* Invoice attachment */}
                                    {isInvoice && (
                                      <div className="flex items-center gap-2 mb-1">
                                        <Receipt className={`h-4 w-4 ${isMine ? "text-background/70" : "text-bronze"}`} />
                                        <span className={`text-xs font-semibold ${isMine ? "text-background/80" : "text-bronze"}`}>
                                          Invoice Attached
                                        </span>
                                      </div>
                                    )}

                                    {/* Contract attachment */}
                                    {isContract && (
                                      <div className="flex items-center gap-2 mb-1">
                                        <FileSignature className={`h-4 w-4 ${isMine ? "text-background/70" : "text-bronze"}`} />
                                        <span className={`text-xs font-semibold ${isMine ? "text-background/80" : "text-bronze"}`}>
                                          Contract Attached
                                        </span>
                                      </div>
                                    )}

                                    {/* File attachment */}
                                    {isFile && msg.file_url && (
                                      <div className="mb-2">
                                        {/* Image preview */}
                                        {msg.file_type?.startsWith("image/") ? (
                                          <div className="mb-1">
                                            <img
                                              src={getFilePublicUrl(msg.file_url)}
                                              alt={msg.file_name || "Image"}
                                              className="max-w-full rounded-lg cursor-pointer max-h-[280px] object-cover"
                                              onClick={() => window.open(getFilePublicUrl(msg.file_url!), "_blank")}
                                              loading="lazy"
                                            />
                                            <div className="flex items-center justify-between mt-1">
                                              <p className="text-[10px] opacity-60 truncate">{msg.file_name}</p>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => downloadFile(msg.file_url!, msg.file_name || "file")}
                                                className="h-6 w-6 p-0 hover:bg-background/20"
                                              >
                                                <Download className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="p-2 rounded-lg bg-background/10 flex items-center gap-2">
                                            <File className="h-4 w-4 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                              <p className="text-xs font-medium truncate">{msg.file_name}</p>
                                              <p className="text-[10px] opacity-70">{formatFileSize(msg.file_size)}</p>
                                            </div>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => downloadFile(msg.file_url!, msg.file_name || "file")}
                                              className="h-7 w-7 p-0 hover:bg-background/20"
                                            >
                                              <Download className="h-3.5 w-3.5" />
                                            </Button>
                                          </div>
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

                                    {msg.content && !isVoice && (
                                      <p className="text-xs md:text-sm whitespace-pre-wrap break-words">
                                        {renderMessageContent(msg.content)}
                                      </p>
                                    )}

                                    <div className="flex items-center gap-1 mt-1">
                                      <p className="text-[10px] opacity-60">
                                        {format(new Date(msg.created_at), "h:mm a")}
                                      </p>
                                      {isMine && (
                                        <CheckCheck className="h-3 w-3 opacity-60 ml-0.5" />
                                      )}
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
                              <div className="flex items-center gap-0.5 ml-1 self-center">
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
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-3 md:p-4 border-t bg-background/95 backdrop-blur flex-shrink-0">
                <div className="max-w-3xl mx-auto">
                  {selectedFile && !isRecordingVoice && (
                    <div className="mb-2 p-2 bg-muted rounded-lg flex items-center gap-2">
                      <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
                    <div className="flex gap-2">
                      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />

                      {/* Attach Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="flex-shrink-0 h-10 w-10">
                            <Plus className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-52">
                          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                            <Paperclip className="h-4 w-4 mr-2" />
                            Attach File
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { fileInputRef.current?.click(); }}>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Send Image
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              fetchInvoices();
                              setShowInvoicePicker(true);
                            }}
                          >
                            <Receipt className="h-4 w-4 mr-2" />
                            Attach Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              fetchContracts();
                              setShowContractPicker(true);
                            }}
                          >
                            <FileSignature className="h-4 w-4 mr-2" />
                            Attach Contract
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Textarea
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        className="flex-1 min-h-[2.5rem] max-h-[100px] resize-none text-sm py-2.5"
                        disabled={uploadingFile}
                      />

                      {/* Show mic button when no text, send button when text */}
                      {newMessage.trim() || selectedFile ? (
                        <Button
                          onClick={sendMessage}
                          disabled={uploadingFile || (!newMessage.trim() && !selectedFile)}
                          className="self-end bg-bronze hover:bg-bronze/90 text-background flex-shrink-0 h-10 w-10 p-0"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setIsRecordingVoice(true)}
                          variant="outline"
                          className="self-end flex-shrink-0 h-10 w-10 p-0 border-bronze/30 text-bronze hover:bg-bronze/10 hover:text-bronze"
                        >
                          <Mic className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
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
                <p className="text-lg font-semibold mb-1">Crevia Chat</p>
                <p className="text-sm opacity-70 mb-1">End-to-end encrypted messaging</p>
                <p className="text-xs opacity-50">Chat with brands, creators, or create groups</p>
              </div>
            </div>
          )}
        </div>
      </div>

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
                      className="w-full p-3 rounded-xl hover:bg-accent transition-colors text-left"
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
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1 py-0 capitalize ${
                                user.user_type === "brand"
                                  ? "border-blue-300 text-blue-600"
                                  : "border-purple-300 text-purple-600"
                              }`}
                            >
                              {user.user_type}
                            </Badge>
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
                        isSelected ? "bg-bronze/10 border border-bronze/20" : "hover:bg-accent"
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
                        <Badge variant="outline" className="text-[9px] capitalize">
                          {user.user_type}
                        </Badge>
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
                    className="w-full p-4 rounded-xl border hover:border-bronze/30 hover:bg-accent/50 transition-all text-left"
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
              Attach Contract
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[350px]">
            {contracts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No contracts found</div>
            ) : (
              <div className="space-y-2">
                {contracts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => sendContractAttachment(c)}
                    className="w-full p-4 rounded-xl border hover:border-bronze/30 hover:bg-accent/50 transition-all text-left"
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
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              {selectedRoom?.is_group ? "Group Info" : "Contact Info"}
            </DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-bronze/20 flex items-center justify-center text-xl font-bold text-bronze">
                  {selectedRoom.is_group ? (
                    <Users className="h-8 w-8" />
                  ) : (
                    getRoomInitial(selectedRoom)
                  )}
                </div>
                <div>
                  <p className="font-bold text-lg">{getRoomDisplayName(selectedRoom)}</p>
                  {selectedRoom.is_group && (
                    <p className="text-sm text-muted-foreground">
                      {selectedRoom.members?.length} members
                    </p>
                  )}
                </div>
              </div>


              {selectedRoom.members && selectedRoom.members.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Members
                  </p>
                  <div className="space-y-2">
                    {selectedRoom.members.map((member) => (
                      <div key={member.user_id} className="flex items-center gap-3 p-2 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-bronze/10 flex items-center justify-center text-xs font-semibold overflow-hidden">
                          {member.profile?.avatar_url ? (
                            <img src={member.profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
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
                              <Badge variant="secondary" className="text-[9px] px-1 py-0">
                                Admin
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">
                            {member.profile?.user_type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media, Docs & Links Panel */}
              <ChatMediaPanel roomId={selectedRoom.id} />
            </div>
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
                      className="w-full p-3 rounded-xl hover:bg-accent transition-colors text-left"
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
