import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, string> | null;
  read: boolean;
  created_at: string;
}

const LIMIT = 40;

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("id, type, title, body, data, read, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(LIMIT);
    setNotifications((data as AppNotification[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    refresh();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => refresh()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, refresh]);

  const markRead = useCallback(async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, loading, markRead, markAllRead, refresh };
}
