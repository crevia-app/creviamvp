import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Link2, Check, Globe, Lock, ChevronDown, UserPlus, X, FileSignature } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "Viewer" | "Editor";
type AccessMode = "restricted" | "anyone";

interface AccessUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isOwner?: boolean;
}

interface ManageAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentTitle?: string;
  shareUrl?: string;
}

// ─── Mock seed data (replace with real DB query when wiring up) ───────────────

const SEED_USERS: AccessUser[] = [
  { id: "owner", name: "You", email: "you@crevia.app", role: "Editor", isOwner: true },
];

// ─── Avatar bubble ────────────────────────────────────────────────────────────

const Avatar = ({ name }: { name: string }) => (
  <div className="h-8 w-8 rounded-full bg-bronze/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-bronze select-none">
    {name.charAt(0).toUpperCase()}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

export function ManageAccessModal({
  open,
  onOpenChange,
  documentTitle = "Untitled Document",
  shareUrl = `${window.location.origin}/canvas/view/preview-link`,
}: ManageAccessModalProps) {
  const [inviteEmail, setInviteEmail]   = useState("");
  const [inviteRole, setInviteRole]     = useState<Role>("Viewer");
  const [accessMode, setAccessMode]     = useState<AccessMode>("restricted");
  const [users, setUsers]               = useState<AccessUser[]>(SEED_USERS);
  const [copied, setCopied]             = useState(false);
  const [emailError, setEmailError]     = useState(false);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const handleInvite = () => {
    if (!isValidEmail(inviteEmail)) { setEmailError(true); return; }
    setEmailError(false);
    const name = inviteEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    setUsers(prev => [
      ...prev,
      { id: `${Date.now()}`, name, email: inviteEmail.trim(), role: inviteRole },
    ]);
    setInviteEmail("");
  };

  const updateRole = (id: string, role: Role) =>
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));

  const removeUser = (id: string) =>
    setUsers(prev => prev.filter(u => u.id !== id));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[92vw] rounded-2xl border border-border/60 bg-card p-0 overflow-hidden shadow-2xl [&>button:last-child]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Manage Access</DialogTitle>
        </DialogHeader>

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border/40">
          <div className="h-9 w-9 rounded-xl bg-bronze/10 flex items-center justify-center flex-shrink-0">
            <FileSignature className="h-4 w-4 text-bronze" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm leading-tight">Share document</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{documentTitle}</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex-shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">

          {/* ── Invite row ── */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Invite people</p>
            <div className="flex gap-2">
              <div className="flex-1 min-w-0 space-y-1">
                <Input
                  placeholder="Email address"
                  value={inviteEmail}
                  onChange={e => { setInviteEmail(e.target.value); setEmailError(false); }}
                  onKeyDown={e => e.key === "Enter" && handleInvite()}
                  className={cn(
                    "h-10 rounded-xl text-sm",
                    emailError && "border-red-500 focus-visible:ring-red-500/30"
                  )}
                />
                {emailError && (
                  <p className="text-[11px] text-red-500 pl-1">Enter a valid email address</p>
                )}
              </div>
              <Select value={inviteRole} onValueChange={v => setInviteRole(v as Role)}>
                <SelectTrigger className="w-28 h-10 rounded-xl text-xs flex-shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleInvite}
              className="w-full h-9 rounded-xl bg-bronze hover:bg-bronze/90 text-background text-sm font-semibold gap-2"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Send Invite
            </Button>
          </div>

          {/* ── People with access ── */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              People with access · {users.length}
            </p>
            <div className="space-y-0.5 max-h-48 overflow-y-auto pr-0.5">
              {users.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-muted/40 transition-colors group"
                >
                  <Avatar name={user.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate leading-tight">
                      {user.name}
                      {user.isOwner && (
                        <span className="ml-1.5 text-[10px] text-muted-foreground font-normal">(you)</span>
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  {user.isOwner ? (
                    <span className="text-xs text-muted-foreground flex-shrink-0 pr-1">Owner</span>
                  ) : (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Select value={user.role} onValueChange={v => updateRole(user.id, v as Role)}>
                        <SelectTrigger className="h-7 w-24 rounded-lg text-xs border-border/50 bg-transparent">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Viewer">Viewer</SelectItem>
                          <SelectItem value="Editor">Editor</SelectItem>
                        </SelectContent>
                      </Select>
                      <button
                        onClick={() => removeUser(user.id)}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove access"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── General access toggle ── */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">General access</p>
            <button
              type="button"
              onClick={() => setAccessMode(m => m === "restricted" ? "anyone" : "restricted")}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-150",
                accessMode === "anyone"
                  ? "border-bronze/60 bg-bronze/5 dark:bg-bronze/10"
                  : "border-border/60 hover:border-border bg-card"
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                accessMode === "anyone" ? "bg-bronze/15 text-bronze" : "bg-muted text-muted-foreground"
              )}>
                {accessMode === "anyone" ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">
                  {accessMode === "anyone" ? "Anyone with the link" : "Restricted"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {accessMode === "anyone"
                    ? "Anyone with the link can view — no sign-in required"
                    : "Only invited people can access this document"}
                </p>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200",
                accessMode === "anyone" && "rotate-180"
              )} />
            </button>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-5 pb-5 flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 h-9 px-3 rounded-xl border border-border/60 text-sm hover:bg-muted/40 transition-colors flex-1 min-w-0"
          >
            {copied
              ? <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
              : <Link2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
            <span className={cn("font-medium truncate", copied ? "text-emerald-600" : "text-muted-foreground")}>
              {copied ? "Link copied!" : "Copy link"}
            </span>
          </button>
          <Button
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-xl bg-bronze hover:bg-bronze/90 text-background font-semibold text-sm flex-shrink-0"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
