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
import { Users, Search, UserPlus, X, Loader2, Crown } from "lucide-react";

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
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCreator = currentUserId === createdBy;

  useEffect(() => {
    if (open) {
      fetchMembers();
      setSearch("");
      setSearchResults([]);
    }
  }, [open, roomId]);

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

  const getInitial = (profile: SearchResult | Member["profile"]) =>
    profile.display_name?.charAt(0) || profile.email?.charAt(0) || "?";

  const getName = (profile: SearchResult | Member["profile"]) =>
    profile.display_name || profile.email || "Unknown";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-4 h-4 text-bronze" />
            Workspace Members
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search to add */}
          {isCreator && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by email or name to add..."
                className="pl-9 pr-4"
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
                    className="h-7 gap-1.5 bg-bronze hover:bg-bronze/90 text-background flex-shrink-0"
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
            <p className="text-xs text-muted-foreground text-center py-2">No users found</p>
          )}

          {/* Current members */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Members · {members.length}
            </p>
            {loadingMembers ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-muted/50 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {members.map((m) => (
                  <div key={m.user_id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/30 transition-colors">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={m.profile.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-bronze/20 text-bronze">
                        {getInitial(m.profile)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate">{getName(m.profile)}</p>
                        {m.user_id === createdBy && (
                          <Crown className="w-3 h-3 text-bronze flex-shrink-0" />
                        )}
                      </div>
                      {m.profile.display_name && (
                        <p className="text-xs text-muted-foreground truncate">{m.profile.email}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize flex-shrink-0">
                      {m.user_id === createdBy ? "owner" : m.role}
                    </Badge>
                    {isCreator && m.user_id !== createdBy && (
                      <button
                        onClick={() => removeMember(m.user_id)}
                        disabled={removingId === m.user_id}
                        className="text-muted-foreground hover:text-destructive transition-colors ml-1 flex-shrink-0"
                        aria-label="Remove member"
                      >
                        {removingId === m.user_id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <X className="w-3.5 h-3.5" />}
                      </button>
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
