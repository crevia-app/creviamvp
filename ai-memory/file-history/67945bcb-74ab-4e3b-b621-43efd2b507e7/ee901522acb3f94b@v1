import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, X } from "lucide-react";

export function UpdateBanner() {
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // When the new SW takes control, reload to serve fresh assets
    const onControllerChange = () => window.location.reload();
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const markWaiting = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting) setWaitingSW(reg.waiting);
    };

    const onUpdateFound = async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg?.installing) return;
      reg.installing.addEventListener("statechange", async (e) => {
        if ((e.target as ServiceWorker).state === "installed") {
          const fresh = await navigator.serviceWorker.getRegistration();
          if (fresh?.waiting) setWaitingSW(fresh.waiting);
        }
      });
    };

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      markWaiting(reg);
      reg.addEventListener("updatefound", onUpdateFound);
    });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  // User-initiated update — SW activates, controllerchange fires, page reloads
  const handleUpdate = () => {
    if (!waitingSW) return;
    waitingSW.postMessage({ type: "SKIP_WAITING" });
  };

  return (
    <AnimatePresence>
      {waitingSW && !dismissed && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 340, damping: 32 }}
          className="fixed z-[200] bottom-[calc(72px+env(safe-area-inset-bottom,0px))] md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[340px]"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/95 backdrop-blur-xl p-3.5 shadow-2xl shadow-black/15">
            {/* Logo */}
            <img
              src="/crevia-logo.png"
              alt="Crevia"
              className="h-9 w-9 rounded-xl flex-shrink-0 ring-1 ring-border object-cover"
            />

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="font-poppins text-sm font-semibold text-foreground leading-tight">
                Update available
              </p>
              <p className="font-poppins text-[11px] text-muted-foreground mt-0.5 leading-tight">
                A new version of Crevia is ready
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handleUpdate}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-bronze hover:bg-bronze/90 active:scale-95 text-white text-xs font-semibold font-poppins transition-all duration-150"
              >
                <RefreshCw className="h-3 w-3" />
                Update
              </button>
              <button
                onClick={() => setDismissed(true)}
                aria-label="Dismiss"
                className="h-8 w-8 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
