import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * AutoUpdate — zero-UI service worker auto-updater.
 *
 * Strategy:
 *   1. When a new SW takes control (controllerchange), set a flag.
 *   2. Reload on the NEXT route navigation (user already leaving current page).
 *   3. Also reload when the user returns to the tab (visibilitychange → visible)
 *      so a background update takes effect the next time they switch back in.
 *
 * Both triggers feel completely natural — no banner, no user action required.
 * The reload never fires mid-stream or mid-chat; it always waits for a safe
 * transition boundary.
 */
export function AutoUpdate() {
  const location = useLocation();
  const needsReloadRef = useRef(false);
  const firstMountRef  = useRef(true);

  // Detect when a new SW has taken control of the page
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleControllerChange = () => {
      // Only flag if there actually was a previous controller (not first install)
      if (navigator.serviceWorker.controller) {
        needsReloadRef.current = true;
      }
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  // Trigger 1 — reload on the user's next route navigation
  useEffect(() => {
    if (firstMountRef.current) {
      firstMountRef.current = false;
      return;
    }
    if (needsReloadRef.current) {
      window.location.reload();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Trigger 2 — reload when the user returns to the tab after switching away
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && needsReloadRef.current) {
        window.location.reload();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return null;
}
