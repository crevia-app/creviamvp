import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, MessageSquare, FileSignature, Receipt, Sparkles, CreditCard, CheckCheck, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/hooks/use-notifications";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface NotificationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  userId?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; nav: string }> = {
  message:  { icon: MessageSquare,  color: "text-blue-500",   nav: "/crevia-studio?tab=chat" },
  contract: { icon: FileSignature,  color: "text-bronze",     nav: "/crevia-studio?tab=contracts" },
  invoice:  { icon: Receipt,        color: "text-green-500",  nav: "/crevia-studio?tab=invoices" },
  campaign: { icon: Sparkles,       color: "text-purple-500", nav: "/crevia-studio" },
  billing:  { icon: CreditCard,     color: "text-orange-500", nav: "/profile/payments-billing" },
  system:   { icon: Bell,           color: "text-muted-foreground", nav: "" },
};

export default function NotificationSheet({
  open,
  onOpenChange,
  notifications,
  unreadCount,
  loading,
  onMarkRead,
  onMarkAllRead,
  userId = "",
}: NotificationSheetProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleClearChats = async () => {
    setClearing(true);
    try {
      const { error } = await supabase
        .from("chat_rooms")
        .delete()
        .eq("created_by", userId);
      if (error) throw error;
      toast({ title: "Chats cleared", description: "All your recent chats have been deleted." });
      setClearDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Failed to clear chats", description: err.message, variant: "destructive" });
    } finally {
      setClearing(false);
    }
  };

  const handleClick = (n: AppNotification) => {
    if (!n.read) onMarkRead(n.id);
    const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
    let nav = cfg.nav;
    if (n.type === "message" && n.data?.room_id) {
      nav = `/crevia-studio?tab=chat&roomId=${n.data.room_id}`;
    }
    if (nav) {
      navigate(nav);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[380px] p-0 flex flex-col bg-background border-border">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-vollkorn text-lg">Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-bronze hover:text-bronze/80 gap-1.5"
                onClick={onMarkAllRead}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="font-poppins text-sm font-medium text-foreground mb-1">All caught up</p>
              <p className="text-xs text-muted-foreground">New messages and updates will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
                const Icon = cfg.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50",
                      !n.read && "bg-bronze/5"
                    )}
                  >
                    <div className={cn("mt-0.5 p-2 rounded-lg flex-shrink-0", !n.read ? "bg-bronze/10" : "bg-muted")}>
                      <Icon className={cn("w-3.5 h-3.5", !n.read ? cfg.color : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm leading-snug", !n.read ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="mt-1 w-2 h-2 rounded-full bg-bronze flex-shrink-0" />
                        )}
                      </div>
                      {n.body && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {n.body === "🔒 Encrypted message" ? "Tap to open conversation" : n.body}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="px-4 py-3 border-t border-border flex-shrink-0 space-y-1">
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => { navigate("/profile/notifications"); onOpenChange(false); }}
            >
              Notification settings
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
            onClick={() => setClearDialogOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Recent Chats
          </Button>
        </div>
      </SheetContent>

      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Clear Recent Chats?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete all workspaces you created, including every message and member inside them. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setClearDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearChats} disabled={clearing}>
              {clearing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {clearing ? "Clearing..." : "Yes, clear everything"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
