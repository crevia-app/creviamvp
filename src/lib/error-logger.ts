import { supabase } from "@/integrations/supabase/client";

export type ErrorSource = "window_error" | "unhandled_promise" | "react_boundary" | "manual";

const APP_VERSION = (import.meta as any).env?.VITE_APP_VERSION ?? "unknown";

// Chunk-load errors are expected after deploys — skip logging them
const SKIP_PATTERNS = [
  "Failed to fetch dynamically imported module",
  "Importing a module script failed",
  "Unable to preload CSS",
  "Loading chunk",
  "ChunkLoadError",
  "ResizeObserver loop",
];

function shouldSkip(message: string): boolean {
  return SKIP_PATTERNS.some((p) => message.includes(p));
}

async function getUserContext() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return { user_id: session?.user?.id ?? null };
  } catch {
    return { user_id: null };
  }
}

export async function logError(
  message: string,
  stack: string | null | undefined,
  source: ErrorSource,
  context?: Record<string, unknown>,
) {
  if (!message || shouldSkip(message)) return;
  try {
    const { user_id } = await getUserContext();
    await supabase.from("error_logs" as any).insert({
      user_id,
      message: String(message).slice(0, 1000),
      stack: stack ? String(stack).slice(0, 5000) : null,
      source,
      url: window.location.href,
      user_agent: navigator.userAgent.slice(0, 500),
      app_version: APP_VERSION,
      context: context ?? null,
    });
  } catch {
    // Never throw from error logger — would cause infinite loop
  }
}

export function initGlobalErrorHandlers() {
  window.onerror = (_msg, src, lineno, colno, error) => {
    const message = error?.message ?? String(_msg);
    const stack   = error?.stack ?? `${src}:${lineno}:${colno}`;
    logError(message, stack, "window_error");
    return false;
  };

  window.onunhandledrejection = (event) => {
    const err = event.reason;
    const message = err?.message ?? String(err) ?? "Unhandled Promise Rejection";
    logError(message, err?.stack ?? null, "unhandled_promise");
  };
}
