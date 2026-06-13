import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import ChatMediaPanel from "@/components/crevia-connect/shared/ChatMediaPanel";
import {
  Users,
  Search,
  UserPlus,
  X,
  Loader2,
  Crown,
  Link2,
  Copy,
  Check,
  ShieldCheck,
  ShieldOff,
  Pencil,
  Image as ImageIcon,
  Sparkles,
  Camera,
} from "lucide-react";

const getSeatLimit = (_plan: string | null): number => {
  return 8;
};

const avatarHue = (seed: string): React.CSSProperties => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return { background: `hsl(${hue},55%,65%)`, color: `hsl(${hue},55%,22%)` };
};

interface Member {
  user_id: string;
  role: string;
  profile: {
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
    handle: string | null;
  };
}

interface SearchResult {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  roomName: string | null;
  createdBy: string;
  currentUserId: string;
  initialTab?: Tab;
}

type Tab = "members" | "media";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "members", label: "Members", icon: Users },
  { id: "media",   label: "Media",   icon: ImageIcon },
];

const WorkspaceInfoSheet = ({
  open,
  onOpenChange,
  roomId,
  roomName,
  createdBy,
  currentUserId,
  initialTab = "members",
}: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [creatorPlan, setCreatorPlan] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(roomName ?? "");
  const [savingName, setSavingName] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const isCreator = currentUserId === createdBy;
  // Admins can manage members (but only creator can delete/demote other admins)
  const currentUserRole = members.find(m => m.user_id === currentUserId)?.role ?? "member";
  const isAdminOrCreator = isCreator || currentUserRole === "admin";
  const seatLimit = getSeatLimit(creatorPlan);
  const atSeatLimit = members.length >= seatLimit;

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
      fetchMembers();
      fetchCreatorPlan();
      fetchRoomAvatar();
      setSearch("");
      setSearchResults([]);
      setShowSearch(false);
      setEditingName(false);
      setNameValue(roomName ?? "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, roomId]);

  const fetchRoomAvatar = async () => {
    const { data } = await supabase
      .from("chat_rooms")
      .select("avatar_url")
      .eq("id", roomId)
      .single();
    if (data) setAvatarUrl(data.avatar_url);
  };

  const fetchCreatorPlan = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("subscription_plan")
      .eq("id", createdBy)
      .single();
    setCreatorPlan(data?.subscription_plan ?? "free");
  };

  const fetchMembers = async () => {
    setLoadingMembers(true);
    const { data } = await supabase
      .from("chat_room_members")
      .select("user_id, role")
      .eq("room_id", roomId);
    if (!data) { setLoadingMembers(false); return; }
    const profileIds = data.map((m) => m.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, email, avatar_url, handle")
      .in("id", profileIds);
    const map = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
    setMembers(
      data.map((m) => ({
        user_id: m.user_id,
        role: m.role,
        profile: map[m.user_id] || { display_name: null, email: null, avatar_url: null, handle: null },
      }))
    );
    setLoadingMembers(false);
  };

  // ── Avatar upload ──────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 30 * 1024 * 1024) {
      toast.error("Image too large — max 30 MB");
      return;
    }
    setUploadingAvatar(true);
    // Optimistic UI — show the new image immediately without waiting for the DB round-trip
    const prevUrl = avatarUrl;
    const localPreview = URL.createObjectURL(file);
    setAvatarUrl(localPreview);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      // file.type can be empty on some Android/iOS browsers — fall back to a safe MIME
      const mimeType = file.type || `image/${ext === "jpg" ? "jpeg" : ext}`;
      const path = `${roomId}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("workspace-avatars")
        .upload(path, file, { upsert: true, contentType: mimeType });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("workspace-avatars").getPublicUrl(path);
      const publicUrl = urlData.publicUrl;
      const { error: dbErr } = await supabase
        .from("chat_rooms")
        .update({ avatar_url: publicUrl })
        .eq("id", roomId);
      if (dbErr) throw dbErr;
      // Replace the local blob URL with the durable CDN URL
      URL.revokeObjectURL(localPreview);
      setAvatarUrl(publicUrl);
      toast.success("Workspace photo updated");
    } catch (err) {
      console.error("Workspace avatar upload failed:", err);
      // Roll back optimistic update to the previous URL
      URL.revokeObjectURL(localPreview);
      setAvatarUrl(prevUrl);
      toast.error("Failed to upload image — please try again");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  // ── Member management ──────────────────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!value.trim()) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      const excludeIds = [currentUserId, ...members.map((m) => m.user_id)];
      let q = supabase
        .from("profiles")
        .select("id, display_name, email, avatar_url")
        .or(`email.ilike.%${value}%,display_name.ilike.%${value}%`)
        .limit(6);
      if (excludeIds.length > 0) q = q.not("id", "in", `(${excludeIds.join(",")})`);
      const { data } = await q;
      setSearchResults(data || []);
      setSearching(false);
    }, 300);
  };

  const addMember = async (user: SearchResult) => {
    if (members.length >= seatLimit) {
      toast.error(`Seat limit reached (${seatLimit}/${seatLimit})`);
      return;
    }
    setAddingId(user.id);
    const { error } = await supabase
      .from("chat_room_members")
      .insert({ room_id: roomId, user_id: user.id, role: "member" });
    if (error) {
      toast.error("Failed to add member");
    } else {
      toast.success(`${user.display_name || user.email} added`);
      setSearchResults((prev) => prev.filter((r) => r.id !== user.id));
      setSearch("");
      fetchMembers();
    }
    setAddingId(null);
  };

  const removeMember = async (userId: string) => {
    setRemovingId(userId);
    const { error } = await supabase
      .from("chat_room_members")
      .delete()
      .eq("room_id", roomId)
      .eq("user_id", userId);
    if (error) {
      toast.error("Failed to remove member");
    } else {
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
      toast.success("Member removed");
    }
    setRemovingId(null);
  };

  const toggleRole = async (userId: string, targetCurrentRole: string) => {
    // Admins can promote members → admin.
    // Only the creator/owner can demote admins → member.
    if (targetCurrentRole === "admin" && !isCreator) {
      toast.error("Only the workspace owner can demote admins.");
      return;
    }
    setPromotingId(userId);
    const newRole = targetCurrentRole === "admin" ? "member" : "admin";
    const { error } = await supabase
      .from("chat_room_members")
      .update({ role: newRole })
      .eq("room_id", roomId)
      .eq("user_id", userId);
    if (!error) {
      setMembers((prev) => prev.map((m) => m.user_id === userId ? { ...m, role: newRole } : m));
      toast.success(newRole === "admin" ? "Promoted to admin" : "Demoted to member");
    } else {
      toast.error("Failed to update role");
    }
    setPromotingId(null);
  };

  const generateInviteLink = async () => {
    if (members.length >= seatLimit) {
      toast.error("Seat limit reached — remove a member or upgrade.");
      return;
    }
    setGeneratingLink(true);
    try {
      const { data, error } = await supabase
        .from("workspace_invites" as any)
        .insert({ room_id: roomId, invited_by: currentUserId })
        .select("token")
        .single();
      if (error) throw error;
      const link = `${window.location.origin}/invite/${(data as any).token}`;
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      toast.success("Invite link copied — valid for 7 days");
    } catch {
      toast.error("Failed to generate invite link");
    } finally {
      setGeneratingLink(false);
    }
  };

  const saveName = async () => {
    if (!nameValue.trim() || nameValue.trim() === roomName) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    const { error } = await supabase
      .from("chat_rooms")
      .update({ name: nameValue.trim() })
      .eq("id", roomId);
    if (error) {
      toast.error("Failed to rename workspace");
    } else {
      toast.success("Workspace renamed");
      setEditingName(false);
    }
    setSavingName(false);
  };

  const getInitial = (p: { display_name: string | null; email: string | null }) =>
    p.display_name?.[0]?.toUpperCase() || p.email?.[0]?.toUpperCase() || "?";

  const getName = (p: { display_name: string | null; email: string | null; handle?: string | null }) =>
    p.display_name || p.email || "Unknown";

  const groupAvatar: React.CSSProperties = { background: "hsl(36,60%,65%)", color: "hsl(36,60%,22%)" };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col gap-0 overflow-hidden [&>button:first-child]:hidden"
      >
        {/* ── Header ── */}
        <div className="flex flex-col items-center pb-4 px-5 border-b border-border/50 flex-shrink-0 gap-3 bg-card/30 [padding-top:max(calc(env(safe-area-inset-top)+16px),32px)]">
          <SheetTitle className="sr-only">Workspace Info</SheetTitle>

          {/* Close button — always visible, below status bar on every device */}
          <div className="w-full flex justify-end">
            <SheetClose asChild>
              <button
                aria-label="Close"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all duration-150 touch-manipulation"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
            </SheetClose>
          </div>

          {/* Group avatar — owner and admins can change by clicking/tapping */}
          <div
            className={`relative group/avatar${isAdminOrCreator ? " cursor-pointer" : ""}`}
            onClick={isAdminOrCreator && !uploadingAvatar ? () => avatarInputRef.current?.click() : undefined}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-sm flex-shrink-0 overflow-hidden"
              style={avatarUrl ? {} : groupAvatar}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Workspace"
                  className="w-20 h-20 object-cover"
                  onError={() => setAvatarUrl(null)}
                />
              ) : (
                <Sparkles className="w-9 h-9" />
              )}
            </div>

            {/* Camera overlay — desktop hover */}
            {isAdminOrCreator && (
              <>
                <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 pointer-events-none">
                  {uploadingAvatar
                    ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                    : <Camera className="w-6 h-6 text-white drop-shadow-md" />
                  }
                </div>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarChange}
                />
              </>
            )}
          </div>

          {/* Name — editable by creator */}
          <div className="text-center w-full max-w-[280px]">
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  ref={nameInputRef}
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className="h-9 text-center text-sm font-semibold"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveName();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  autoFocus
                />
                <Button size="sm" onClick={saveName} disabled={savingName} className="h-9 w-9 p-0 bg-bronze hover:bg-bronze/90 text-background flex-shrink-0">
                  {savingName ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingName(false)} className="h-9 w-9 p-0 flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => isCreator && setEditingName(true)}
                className={`flex items-center gap-1.5 mx-auto ${isCreator ? "group cursor-pointer hover:opacity-75" : "cursor-default"}`}
              >
                <span className="text-base font-bold truncate">{roomName ?? "Workspace"}</span>
                {isCreator && (
                  <Pencil className="w-3 h-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                )}
              </button>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Quick actions row — always rendered so the close button is always visible */}
          <div className="flex items-center gap-2 w-full max-w-[280px]">
            {isAdminOrCreator && (
              <>
                <Button
                  size="sm"
                  onClick={() => { setActiveTab("members"); setShowSearch(true); }}
                  className="flex-1 h-9 gap-1.5 bg-bronze hover:bg-bronze/90 text-background text-xs font-semibold"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add Member
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generateInviteLink}
                  disabled={generatingLink || atSeatLimit}
                  className="flex-1 h-9 gap-1.5 border-bronze/30 hover:bg-bronze/10 text-xs font-semibold"
                >
                  {generatingLink ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : copiedLink ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Link2 className="w-3.5 h-3.5" />
                  )}
                  {copiedLink ? "Copied!" : "Invite Link"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ── Tab bar — Members + Media only ── */}
        <div className="flex border-b border-border/50 flex-shrink-0 bg-background/50">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold tracking-wide uppercase transition-colors relative ${
                  activeTab === tab.id ? "text-bronze" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-bronze rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab content ── */}
        <div className="flex-1 min-h-0 overflow-hidden">

          {/* Members Tab */}
          {activeTab === "members" && (
            <ScrollArea className="h-full">
              <div className="px-4 py-3 space-y-3">

                {/* Seat usage bar */}
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Members · {members.length}
                  </p>
                  {seatLimit < 100 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((members.length / seatLimit) * 100, 100)}%`,
                            background: atSeatLimit ? "hsl(0,72%,51%)" : "hsl(36,60%,65%)",
                          }}
                        />
                      </div>
                      <span className={`text-[10px] font-semibold ${atSeatLimit ? "text-red-400" : "text-muted-foreground"}`}>
                        {members.length}/{seatLimit}
                      </span>
                    </div>
                  )}
                </div>

                {/* Search to add — visible to creator AND admins */}
                <AnimatePresence>
                  {isAdminOrCreator && showSearch && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                          value={search}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          placeholder="Search by name or email..."
                          className="pl-9 h-10 text-sm"
                          autoFocus
                        />
                        {searching && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-muted-foreground" />
                        )}
                      </div>

                      {searchResults.length > 0 && (
                        <div className="border border-border rounded-xl overflow-hidden divide-y divide-border mb-2">
                          {searchResults.map((user) => (
                            <div key={user.id} className="flex items-center gap-3 px-3 py-2.5 bg-muted/20">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={user.avatar_url || undefined} />
                                <AvatarFallback className="text-xs bg-bronze/20 text-bronze">
                                  {getInitial(user)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{getName(user)}</p>
                                {user.display_name && (
                                  <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                onClick={() => addMember(user)}
                                disabled={addingId === user.id || atSeatLimit}
                                className="h-8 gap-1 bg-bronze hover:bg-bronze/90 text-background flex-shrink-0 text-xs"
                              >
                                {addingId === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                                Add
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {search && !searching && searchResults.length === 0 && (
                        <div className="text-center py-3 text-xs text-muted-foreground border border-border/50 rounded-xl mb-2">
                          No Crevia users found for "{search}"
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {isAdminOrCreator && !showSearch && (
                  <button
                    onClick={() => setShowSearch(true)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-border hover:border-bronze/40 hover:bg-bronze/5 transition-all text-left"
                  >
                    <Search className="w-3.5 h-3.5 text-muted-foreground/50" />
                    <span className="text-xs text-muted-foreground">Search people to add…</span>
                  </button>
                )}

                {/* Member list */}
                {loadingMembers ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-14 rounded-xl bg-muted/40 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {members.map((m) => {
                      const isOwner = m.user_id === createdBy;
                      const isMe = m.user_id === currentUserId;
                      const targetIsAdmin = m.role === "admin";
                      // Admins can add admins; only creator can demote admins
                      const canToggleRole = isAdminOrCreator && !isOwner && !isMe &&
                        (!targetIsAdmin || isCreator);
                      // Only creator/admin can remove; cannot remove owner or self
                      const canRemove = isAdminOrCreator && !isOwner && !isMe;

                      return (
                        <motion.div
                          key={m.user_id}
                          layout
                          className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-muted/30 transition-colors"
                        >
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden"
                              style={avatarHue(m.user_id)}
                            >
                              {m.profile.avatar_url ? (
                                <img
                                  src={m.profile.avatar_url}
                                  alt=""
                                  className="w-9 h-9 rounded-full object-cover"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                />
                              ) : (
                                getInitial(m.profile)
                              )}
                            </div>
                          </div>

                          {/* Name + role */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold truncate">
                                {getName(m.profile)}{isMe ? " (You)" : ""}
                              </p>
                              {isOwner && <Crown className="w-3 h-3 text-bronze flex-shrink-0" />}
                              {!isOwner && m.role === "admin" && (
                                <ShieldCheck className="w-3 h-3 text-blue-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {isOwner ? "Owner" : m.role === "admin" ? "Admin" : "Member"}
                              {m.profile.email && ` · ${m.profile.email}`}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            {/* Promote / demote */}
                            {canToggleRole && (
                              <button
                                onClick={() => toggleRole(m.user_id, m.role)}
                                disabled={promotingId === m.user_id}
                                title={targetIsAdmin ? "Demote to member" : "Promote to admin"}
                                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10"
                              >
                                {promotingId === m.user_id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : targetIsAdmin ? (
                                  <ShieldOff className="w-3.5 h-3.5" />
                                ) : (
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                            {/* Remove */}
                            {canRemove && (
                              <button
                                onClick={() => removeMember(m.user_id)}
                                disabled={removingId === m.user_id}
                                title="Remove member"
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                {removingId === m.user_id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <X className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {/* Media tab — ChatMediaPanel has its own Media / Docs / Links tabs internally */}
          {activeTab === "media" && (
            <ScrollArea className="h-full">
              <div className="px-4 py-3">
                <ChatMediaPanel roomId={roomId} defaultTab="media" />
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WorkspaceInfoSheet;
