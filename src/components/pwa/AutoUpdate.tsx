import { useEffect } from "react";

/**
 * AutoUpdate — production-grade silent PWA updater.
 *
 * Handles iOS homescreen, Android homescreen, Safari, Chrome, Firefox.
 *
 * ─── Why the previous approach broke on iOS ───────────────────────────────
 *
 * 1. iOS loads the PWA shell from WebKit's native cache, not the SW cache.
 *    The SW never gets a chance to intercept the initial load, so the user
 *    sees a stale version no matter what the SW does.
 *
 * 2. iOS does NOT call reg.update() on its own schedule the way Chrome does.
 *    We must call it explicitly to get iOS to fetch sw.js and check for changes.
 *
 * 3. The old guard  `if (navigator.serviceWorker.controller)` ran AFTER
 *    controllerchange fired — at that point the NEW SW is already the controller,
 *    so the guard was always true and fired on first-install too.
 *
 * ─── How this works ───────────────────────────────────────────────────────
 *
 * Step 1 — On every app open/focus/return-from-background, call reg.update().
 *           This forces the browser to fetch sw.js over the network and compare
 *           it to the installed version.
 *
 * Step 2 — If sw.js changed, the browser fires "updatefound" and starts
 *           installing the new SW. We set newSWInstalledThisSession = true.
 *
 * Step 3 — The new SW calls self.skipWaiting() (Workbox config: skipWaiting:true),
 *           then clients.claim() (clientsClaim:true). The page receives a
 *           "controllerchange" event.
 *
 * Step 4 — In the controllerchange handler we check:
 *           • newSWInstalledThisSession = true  → a real update happened
 *           • hadPreviousController = true      → not a first-install
 *           Both true → reload. This prevents false reloads from clientsClaim
 *           on first install or iOS cache-load with no update.
 *
 * ─── User experience ──────────────────────────────────────────────────────
 *
 * • No banner, no prompt, zero user action required.
 * • After a new deploy, users get the new version within seconds of opening the
 *   app or returning from background — all platforms, including iOS homescreen.
 * • The reload is fast (SW cache warm) and feels like a normal app launch.
 */

const HAD_CONTROLLER_KEY = "pwa_had_controller";
const CHECK_INTERVAL_MS  = 10 * 60 * 1000; // check every 10 min in long sessions
const DEBOUNCE_MS        = 20_000;          // no more than once per 20 s

export function AutoUpdate() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // ── Was there a SW controller on a PREVIOUS page load? ─────────────────
    // We combine:
    //   a) navigator.serviceWorker.controller — covers Chrome/Android/desktop
    //      where the SW controls the page from the very first navigation.
    //   b) localStorage flag — covers iOS, where the WebKit cache serves the
    //      app shell without SW involvement, so controller is null even though
    //      we had a SW from a previous session.
    const hadPreviousController =
      !!navigator.serviceWorker.controller ||
      localStorage.getItem(HAD_CONTROLLER_KEY) === "1";

    // Persist the current state for the NEXT page load
    if (navigator.serviceWorker.controller) {
      localStorage.setItem(HAD_CONTROLLER_KEY, "1");
    }

    // ── Did a NEW SW install during THIS session? ──────────────────────────
    let newSWInstalledThisSession = false;

    const trackSW = (sw: ServiceWorker) => {
      sw.addEventListener("statechange", () => {
        if (sw.state === "installed") {
          // The new SW finished installing and is either waiting or has already
          // been promoted to active via skipWaiting.
          newSWInstalledThisSession = true;
        }
      });
    };

    // Watch any SW that is already installing when we mount
    navigator.serviceWorker.getRegistration("/").then((reg) => {
      if (!reg) return;
      if (reg.installing) trackSW(reg.installing);
      // Watch future SW installations
      reg.addEventListener("updatefound", () => {
        if (reg.installing) trackSW(reg.installing);
      });
    });

    // ── React to the SW controller changing ───────────────────────────────
    let reloading = false;
    const safeReload = () => {
      if (reloading) return;
      reloading = true;
      // Small delay so the new SW finishes claiming all clients before reload
      setTimeout(() => window.location.reload(), 250);
    };

    const onControllerChange = () => {
      // Mark that a controller exists now (for future page loads)
      localStorage.setItem(HAD_CONTROLLER_KEY, "1");

      if (newSWInstalledThisSession && hadPreviousController) {
        // A genuinely new SW took over on a page that was previously controlled.
        // This is an app update — reload to run new code.
        safeReload();
      }
      // else: either first install (hadPreviousController=false) or iOS's
      // clientsClaim on an existing SW with no new version (newSWInstalled=false).
      // Either way, no reload needed.
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    // ── Force the browser to check for a new sw.js ────────────────────────
    let lastCheck = 0;
    const checkForUpdate = async () => {
      const now = Date.now();
      if (now - lastCheck < DEBOUNCE_MS) return; // debounce rapid calls
      lastCheck = now;
      try {
        const reg = await navigator.serviceWorker.getRegistration("/");
        if (!reg) return;
        // reg.update() fetches sw.js from the server.
        // If the file differs from the cached version, the browser installs
        // the new SW automatically, which fires "updatefound" above.
        await reg.update();
      } catch {
        // Network unavailable — silently skip. The check will run again on
        // the next focus/visibility event once connectivity returns.
      }
    };

    // Trigger 1: On mount — covers every app open on iOS / Android homescreen
    checkForUpdate();

    // Trigger 2: When the user returns from background (all platforms)
    const onVisibility = () => {
      if (document.visibilityState === "visible") checkForUpdate();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Trigger 3: Window focus — covers desktop users switching tabs
    window.addEventListener("focus", checkForUpdate);

    // Trigger 4: Periodic — for sessions left open for hours (e.g. on a desk)
    const interval = setInterval(checkForUpdate, CHECK_INTERVAL_MS);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", checkForUpdate);
      clearInterval(interval);
    };
  }, []);

  return null;
}
