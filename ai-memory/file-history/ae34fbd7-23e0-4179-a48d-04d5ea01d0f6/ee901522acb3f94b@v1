import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

// Detects when a new service worker is waiting and shows a one-tap reload prompt.
// This prevents the chunk-URL mismatch error that occurs when a deploy changes
// asset hashes while a user's tab is still open with the old SW.
export function UpdateBanner() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const checkForWaiting = async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.waiting) setWaiting(reg.waiting);
    };

    // Check immediately (covers hard-refresh landing on a stale tab)
    checkForWaiting();

    // Listen for future SW state changes
    const onControllerChange = () => window.location.reload();

    const onUpdateFound = async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg?.installing) return;
      reg.installing.addEventListener("statechange", async (e) => {
        if ((e.target as ServiceWorker).state === "installed") {
          const freshReg = await navigator.serviceWorker.getRegistration();
          if (freshReg?.waiting) setWaiting(freshReg.waiting);
        }
      });
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      reg.addEventListener("updatefound", onUpdateFound);
    });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  if (!waiting) return null;

  const handleUpdate = () => {
    // Tell the waiting SW to activate now, then reload for fresh chunks.
    waiting.postMessage({ type: "SKIP_WAITING" });
  };

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-4 py-3 rounded-2xl bg-foreground text-background shadow-xl border border-border/10 text-sm font-medium animate-in slide-in-from-bottom-4 duration-300">
      <RefreshCw className="w-4 h-4 flex-shrink-0 text-bronze" />
      <span>New version available</span>
      <button
        onClick={handleUpdate}
        className="ml-1 px-3 py-1 rounded-xl bg-bronze text-black text-xs font-semibold hover:opacity-90 transition-opacity"
      >
        Update
      </button>
    </div>
  );
}
