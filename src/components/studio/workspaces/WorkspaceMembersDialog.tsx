import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Search, UserPlus, X, Loader2, Crown, Link2, Copy, Check, Lock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const getSeatLimit = (plan: string | null): number => {
  if (plan === "enterprise") return 100;
  return 8; // free, pro, creative_pro, business, brand_workspace
};

interface Member {
  user_id: string;
  role: string;
  profile: {
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
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
  createdBy: string;
  currentUserId: string;
}

const WorkspaceMembersDialog = ({ open, onOpenChange, roomId, createdBy, currentUserId }: Props) => {
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
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCreator = currentUserId === createdBy;

  const seatLimit = getSeatLimit(creatorPlan);
  const atSeatLimit = members.length >= seatLimit;

  useEffect(() => {
    if (open) {
      fetchMembers();
      fetchCreatorPlan();
      setSearch("");
      setSearchResults([]);
    }
  }, [open, roomId]);

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
      .select("id, display_name, email, avatar_url")
      .in("id", profileIds);

    const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
    setMembers(
      data.map((m) => ({
        user_id: m.user_id,
        role: m.role,
        profile: profileMap[m.user_id] || { display_name: null, email: null, avatar_url: null },
      }))
    );
    setLoadingMembers(false);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!value.trim()) { setSearchResults([]); return; }

    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      const excludeIds = [currentUserId, ...members.map((m) => m.user_id)];
      let query = supabase
        .from("profiles")
        .select("id, display_name, email, avatar_url")
        .or(`email.ilike.%${value}%,display_name.ilike.%${value}%`)
        .limit(6);

      if (excludeIds.length > 0) {
        query = query.not("id", "in", `(${excludeIds.join(",")})`);
      }

      const { data } = await query;
      setSearchResults(data || []);
      setSearching(false);
    }, 300);
  };

  const addMember = async (user: SearchResult) => {
    if (members.length >= seatLimit) {
      const planLabel = creatorPlan === "business" || creatorPlan === "brand_workspace" ? "Business" : "Pro";
      toast.error(`Seat limit reached (${seatLimit}/${seatLimit})`, {
        description: creatorPlan === "enterprise"
          ? "Contact support to increase your seat limit."
          : `Upgrade to ${planLabel === "Pro" ? "Business" : "Enterprise"} to add more seats.`,
      });
      return;
    }
    setAddingId(user.id);
    const { error } = await supabase
      .from("chat_room_members")
      .insert({ room_id: roomId, user_id: user.id, role: "member" });

    if (error) {
      toast.error("Failed to add member");
    } else {
      toast.success(`${user.display_name || user.email} added to workspace`);
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

  const WORKSPACE_ROLES = ["admin", "editor", "viewer"] as const;
  type WorkspaceRole = typeof WORKSPACE_ROLES[number];

  const isBusinessPlan = creatorPlan === "business" || creatorPlan === "brand_workspace" || creatorPlan === "enterprise";

  const setRole = async (userId: string, newRole: WorkspaceRole) => {
    if (!isBusinessPlan) {
      toast.error("Business feature", { description: "Upgrade to Business to assign member roles." });
      return;
    }
    setPromotingId(userId);
    const { error } = await supabase
      .from("chat_room_members")
      .update({ role: newRole })
      .eq("room_id", roomId)
      .eq("user_id", userId);
    if (error) {
      toast.error("Failed to update role");
    } else {
      setMembers((prev) => prev.map((m) => m.user_id === userId ? { ...m, role: newRole } : m));
      toast.success(`Role set to ${newRole}`);
    }
    setPromotingId(null);
  };

  const generateInviteLink = async () => {
    if (members.length >= seatLimit) {
      toast.error(`Seat limit reached (${seatLimit}/${seatLimit})`, {
        description: "Remove a member or upgrade your plan to invite more people.",
      });
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
      toast.success("Invite link copied to clipboard");
    } catch {
      toast.error("Failed to generate invite link");
    } finally {
      setGeneratingLink(false);
    }
  };

  const getInitial = (profile: SearchResult | Member["profile"]) =>
    profile.display_name?.charAt(0) || profile.email?.charAt(0) || "?";

  const getName = (profile: SearchResult | Member["profile"]) =>
    profile.display_name || profile.email || "Unknown";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-3 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-4 h-4 text-bronze" />
            Workspace Members
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Invite link — creator only */}
          {isCreator && (
            <button
              onClick={generateInviteLink}
              disabled={generatingLink || atSeatLimit}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-dashed transition-all text-left group ${
                atSeatLimit
                  ? "border-muted-foreground/20 bg-muted/30 cursor-not-allowed opacity-60"
                  : "border-bronze/30 bg-bronze/5 hover:bg-bronze/10 hover:border-bronze/50"
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${atSeatLimit ? "bg-muted" : "bg-bronze/15"}`}>
                {atSeatLimit
                  ? <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  : <Link2 className="w-3.5 h-3.5 text-bronze" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">Share Invite Link</p>
                <p className="text-[10px] text-muted-foreground">
                  {atSeatLimit ? "Seat limit reached — upgrade to add more" : "Anyone with the link can join"}
                </p>
              </div>
              {generatingLink
                ? <Loader2 className="w-3.5 h-3.5 animate-spin text-bronze flex-shrink-0" />
                : copiedLink
                ? <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                : <Copy className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${atSeatLimit ? "text-muted-foreground/30" : "text-bronze/60 group-hover:text-bronze"}`} />
              }
            </button>
          )}

          {/* Search to add */}
          {isCreator && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by email or name to add..."
                className="pl-9 pr-4 h-11 text-base"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
              )}
            </div>
          )}

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
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
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addMember(user)}
                    disabled={addingId === user.id}
                    className="h-9 gap-1.5 bg-bronze hover:bg-bronze/90 text-background flex-shrink-0"
                  >
                    {addingId === user.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <UserPlus className="w-3.5 h-3.5" />}
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}

          {search && !searching && searchResults.length === 0 && (
            <div className="border border-border/50 rounded-xl p-3 space-y-2 bg-muted/20">
              <p className="text-xs text-muted-foreground text-center">No Crevia users found for "{search}"</p>
              {/* If it looks like an email, offer an invite link as fallback */}
              {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(search.trim()) && isCreator && !atSeatLimit && (
                <button
                  onClick={generateInviteLink}
                  disabled={generatingLink}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-bronze/10 hover:bg-bronze/20 border border-bronze/30 transition-colors"
                >
                  <Link2 className="w-3.5 h-3.5 text-bronze flex-shrink-0" />
                  <span className="text-xs font-medium text-bronze flex-1 text-left">
                    Send invite link to {search.trim()}
                  </span>
                  {generatingLink
                    ? <Loader2 className="w-3 h-3 animate-spin text-bronze flex-shrink-0" />
                    : copiedLink
                    ? <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    : <Copy className="w-3 h-3 text-bronze/60 flex-shrink-0" />}
                </button>
              )}
            </div>
          )}

          {/* Current members */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Members · {members.length}
              </p>
              {seatLimit < 100 && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  atSeatLimit
                    ? "bg-red-500/10 text-red-400"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {members.length} / {seatLimit} seats
                </span>
              )}
            </div>
            {loadingMembers ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-muted/50 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {members.map((m) => (
                  <div key={m.user_id} className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-muted/30 transition-colors">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={m.profile.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-bronze/20 text-bronze">
                        {getInitial(m.profile)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-medium truncate">{getName(m.profile)}</p>
                        {m.user_id === createdBy && (
                          <Crown className="w-3 h-3 text-bronze flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                        {m.user_id === createdBy ? "owner" : m.role}
                        {m.profile.display_name ? ` · ${m.profile.email}` : ""}
                      </p>
                    </div>
                    {isCreator && m.user_id !== createdBy && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {promotingId === m.user_id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                        ) : isBusinessPlan ? (
                          <Select
                            value={m.role as WorkspaceRole}
                            onValueChange={(v) => setRole(m.user_id, v as WorkspaceRole)}
                          >
                            <SelectTrigger className="h-7 text-[11px] w-[72px] px-2 border-border/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                              <SelectItem value="editor" className="text-xs">Editor</SelectItem>
                              <SelectItem value="viewer" className="text-xs">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/60 border border-border/40 rounded px-1.5 py-0.5">{m.role}</span>
                        )}
                        <button
                          onClick={() => removeMember(m.user_id)}
                          disabled={removingId === m.user_id}
                          className="p-1.5 h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          aria-label="Remove member"
                        >
                          {removingId === m.user_id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <X className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceMembersDialog;
