import { useEffect } from "react";

// When a new service worker is waiting, activate it immediately and reload.
// Users always get the latest version automatically — no banner, no action needed.
export function UpdateBanner() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const activate = (sw: ServiceWorker) => sw.postMessage({ type: "SKIP_WAITING" });

    const onControllerChange = () => window.location.reload();
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const onUpdateFound = async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg?.installing) return;
      reg.installing.addEventListener("statechange", async (e) => {
        if ((e.target as ServiceWorker).state === "installed") {
          const freshReg = await navigator.serviceWorker.getRegistration();
          if (freshReg?.waiting) activate(freshReg.waiting);
        }
      });
    };

    // Handle SW already waiting on mount (e.g. user kept tab open across deploy)
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      if (reg.waiting) activate(reg.waiting);
      reg.addEventListener("updatefound", onUpdateFound);
    });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  return null;
}
