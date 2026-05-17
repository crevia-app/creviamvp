import React from "react";

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[Crevia] Unhandled error:", error, info.componentStack);

    // Stale deployment: browser has old JS chunk URLs that no longer exist on
    // Vercel after a new deploy. Auto-reload once to pick up the new index.html.
    const isChunkError =
      error.message.includes("Failed to fetch dynamically imported module") ||
      error.message.includes("Importing a module script failed") ||
      error.message.includes("Unable to preload CSS");

    if (isChunkError) {
      const reloadKey = "crevia_chunk_reload";
      const last = sessionStorage.getItem(reloadKey);
      const now = Date.now();
      if (!last || now - Number(last) > 10_000) {
        sessionStorage.setItem(reloadKey, String(now));
        // Unregister stale service workers and wipe all caches before reloading
        // so the browser fetches fresh assets from the CDN rather than the old SW cache.
        const cleanup = async () => {
          if ("serviceWorker" in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map((r) => r.unregister()));
          }
          if ("caches" in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          }
          window.location.reload();
        };
        cleanup().catch(() => window.location.reload());
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-white font-bold text-xl mb-2">Something went wrong</h1>
          <p className="text-white/50 text-sm mb-6 max-w-xs">
            An unexpected error occurred. Refreshing the page usually fixes this.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#C9A84C] text-black font-semibold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
          >
            Refresh page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
