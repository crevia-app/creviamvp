import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ArrowRight } from "lucide-react";

export function UpdateBanner() {
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Only reload when the update was user-initiated
    let userTriggered = false;
    const onControllerChange = () => {
      if (userTriggered) window.location.reload();
    };
    // Expose setter so handleUpdate can arm it
    (window as any).__swUserTriggered = (v: boolean) => { userTriggered = v; };
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

  const handleUpdate = () => {
    if (!waitingSW) return;
    setUpdating(true);
    (window as any).__swUserTriggered?.(true);
    waitingSW.postMessage({ type: "SKIP_WAITING" });
  };

  return (
    <AnimatePresence>
      {waitingSW && !dismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 36 }}
          className="fixed z-[200] bottom-[calc(72px+env(safe-area-inset-bottom,0px))] md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[360px]"
        >
          {/* Outer glow */}
          <div className="absolute -inset-px rounded-[20px] bg-gradient-to-br from-bronze/40 via-bronze/10 to-transparent blur-sm pointer-events-none" />

          <div className="relative rounded-[18px] border border-bronze/20 bg-background/95 backdrop-blur-2xl shadow-2xl shadow-black/25 overflow-hidden">
            {/* Subtle top shimmer line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bronze/50 to-transparent" />

            <div className="flex items-center gap-3.5 px-4 py-3.5">
              {/* Icon */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-bronze/20 to-bronze/5 border border-bronze/20 flex items-center justify-center">
                  <Sparkles className="h-4.5 w-4.5 text-bronze" strokeWidth={1.8} />
                </div>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-bronze border-2 border-background" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="font-poppins text-sm font-semibold text-foreground leading-tight">
                  New version available
                </p>
                <p className="font-poppins text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  Refresh to get the latest Crevia experience
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl bg-bronze hover:bg-bronze/90 active:scale-95 text-white text-xs font-semibold font-poppins transition-all duration-150 shadow-lg shadow-bronze/25 disabled:opacity-70"
                >
                  {updating ? (
                    <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="h-3 w-3" />
                  )}
                  {updating ? "Updating…" : "Update"}
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

            {/* Bottom shimmer line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
