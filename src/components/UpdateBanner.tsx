import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Silent SW updater — Option B pattern (used by Notion, Linear, Vercel).
 *
 * No banner is shown. When a new service worker is waiting:
 *  1. We store a reference to it.
 *  2. On the user's NEXT route navigation we post SKIP_WAITING.
 *  3. The browser fires 'controllerchange' → we reload once, transparently.
 *
 * The user never has to manually refresh. The update lands on their next
 * natural page-to-page transition, which feels instant.
 */
export function UpdateBanner() {
  const location = useLocation();
  const waitingSWRef = useRef<ServiceWorker | null>(null);
  const reloadingRef = useRef(false);
  // Skip the first render so we don't reload immediately on load
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Reload once the new SW takes controller — only if we triggered it
    const onControllerChange = () => {
      if (reloadingRef.current) return;
      reloadingRef.current = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const storeWaiting = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting) waitingSWRef.current = reg.waiting;
    };

    const onUpdateFound = (reg: ServiceWorkerRegistration) => {
      const installing = reg.installing;
      if (!installing) return;
      installing.addEventListener("statechange", () => {
        if (installing.state === "installed" && reg.waiting) {
          waitingSWRef.current = reg.waiting;
        }
      });
    };

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      storeWaiting(reg);
      reg.addEventListener("updatefound", () => onUpdateFound(reg));
    });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  // On every route change after mount, activate waiting SW if one exists
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (waitingSWRef.current) {
      waitingSWRef.current.postMessage({ type: "SKIP_WAITING" });
    }
  }, [location.pathname]);

  return null;
}
