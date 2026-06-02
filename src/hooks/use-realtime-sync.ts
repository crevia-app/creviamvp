import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type PostgresEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

interface UseRealtimeSyncOptions<T> {
  /** Supabase table to subscribe to */
  table: string;
  /** Unique channel name — must be stable (no dynamic values that change each render) */
  channelId: string;
  /** Postgres filter string, e.g. "user_id=eq.abc123". Omit for unfiltered. */
  filter?: string;
  /** Async function that fetches the initial full dataset */
  query: () => Promise<T[]>;
  /** Which events to listen for. Defaults to all three. */
  events?: PostgresEvent[];
  /**
   * Optional merge strategy for INSERT.
   * Default: prepend new row to the front of the list.
   * Override for sorted or paginated datasets.
   */
  onInsert?: (prev: T[], row: T) => T[];
  /**
   * Optional merge strategy for UPDATE.
   * Default: replace the matching row by id.
   */
  onUpdate?: (prev: T[], row: T) => T[];
  /**
   * Optional merge strategy for DELETE.
   * Default: filter out by id.
   */
  onDelete?: (prev: T[], row: Partial<T>) => T[];
  /** Only start subscribing when true. Useful for auth-gated hooks. */
  enabled?: boolean;
}

interface UseRealtimeSyncResult<T> {
  data: T[];
  loading: boolean;
  /** Force a manual full refetch */
  refresh: () => Promise<void>;
  /** Optimistically replace a single item (for local mutations before server confirm) */
  optimisticUpdate: (id: string, partial: Partial<T>) => void;
  /** Optimistically prepend a new item (for local mutations before server confirm) */
  optimisticInsert: (row: T) => void;
  /** Optimistically remove an item (for local mutations before server confirm) */
  optimisticDelete: (id: string) => void;
}

// ─── Default merge helpers ─────────────────────────────────────────────────────

function defaultInsert<T>(prev: T[], row: T): T[] {
  return [row, ...prev];
}

function defaultUpdate<T extends { id?: string }>(prev: T[], row: T): T[] {
  const exists = prev.some((r) => (r as any).id === (row as any).id);
  if (exists) return prev.map((r) => ((r as any).id === (row as any).id ? { ...r, ...row } : r));
  return [row, ...prev]; // row appeared via update but wasn't in local state — prepend
}

function defaultDelete<T>(prev: T[], row: Partial<T>): T[] {
  return prev.filter((r) => (r as any).id !== (row as any).id);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useRealtimeSync
 *
 * A generic, reusable Supabase Realtime hook that keeps a local array in sync
 * with a Postgres table. Handles INSERT / UPDATE / DELETE events and provides
 * optimistic mutation helpers for instant UI feedback.
 *
 * Usage:
 *   const { data: canvases, loading } = useRealtimeSync({
 *     table: "canvases",
 *     channelId: `canvases:${userId}`,
 *     filter: `user_id=eq.${userId}`,
 *     query: () => supabase.from("canvases").select("*").eq("user_id", userId).then(r => r.data ?? []),
 *     enabled: !!userId,
 *   });
 */
export function useRealtimeSync<T extends Record<string, any>>({
  table,
  channelId,
  filter,
  query,
  events = ["INSERT", "UPDATE", "DELETE"],
  onInsert = defaultInsert,
  onUpdate = defaultUpdate,
  onDelete = defaultDelete,
  enabled = true,
}: UseRealtimeSyncOptions<T>): UseRealtimeSyncResult<T> {
  const [data, setData]       = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  // Keep callbacks in refs so the channel subscription closure never goes stale
  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);
  useEffect(() => { onInsertRef.current = onInsert; }, [onInsert]);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);
  useEffect(() => { onDeleteRef.current = onDelete; }, [onDelete]);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const rows = await query();
      setData(rows ?? []);
    } catch (err) {
      console.error(`[useRealtimeSync:${table}] Initial fetch failed:`, err);
    } finally {
      setLoading(false);
    }
  }, [enabled, table]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!enabled) return;

    refresh();

    const channelConfig: any = {
      event: events.length === 1 ? events[0] : "*",
      schema: "public",
      table,
      ...(filter ? { filter } : {}),
    };

    const channel = supabase
      .channel(channelId)
      .on("postgres_changes", { ...channelConfig, event: "INSERT" }, (payload) => {
        if (!events.includes("INSERT") && !events.includes("*")) return;
        setData((prev) => onInsertRef.current(prev, payload.new as T));
      })
      .on("postgres_changes", { ...channelConfig, event: "UPDATE" }, (payload) => {
        if (!events.includes("UPDATE") && !events.includes("*")) return;
        setData((prev) => onUpdateRef.current(prev, payload.new as T));
      })
      .on("postgres_changes", { ...channelConfig, event: "DELETE" }, (payload) => {
        if (!events.includes("DELETE") && !events.includes("*")) return;
        setData((prev) => onDeleteRef.current(prev, payload.old as Partial<T>));
      })
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error(`[useRealtimeSync:${table}] Channel error — will retry on next mount`);
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [enabled, channelId, table, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Optimistic mutation helpers ──────────────────────────────────────────────

  const optimisticUpdate = useCallback((id: string, partial: Partial<T>) => {
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, ...partial } : r)));
  }, []);

  const optimisticInsert = useCallback((row: T) => {
    setData((prev) => onInsertRef.current(prev, row));
  }, []);

  const optimisticDelete = useCallback((id: string) => {
    setData((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { data, loading, refresh, optimisticUpdate, optimisticInsert, optimisticDelete };
}
