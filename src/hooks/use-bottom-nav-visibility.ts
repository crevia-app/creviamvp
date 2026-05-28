import { useEffect, useRef, useState } from "react";

/**
 * useBottomNavVisibility — Smart Auto-Hide for the mobile bottom nav.
 *
 * Uses THREE independent scroll signals merged into a single `visible` boolean:
 *
 *  1. touchmove (hysteresis)
 *     Primary signal for iOS and most Android scenarios.
 *     HIDE : accumulated downward movement ≥ 30 px in one gesture.
 *     SHOW : upward reversal ≥ 8 px.
 *     Counter resets on direction change — one gesture can both hide and show.
 *
 *  2. scroll capture (document, capture-phase)
 *     Critical Android Chrome fallback. Chrome routes scroll to the compositor
 *     thread for elements with overflow:auto, which can throttle touchmove
 *     delivery to JS. But `scroll` events are ALWAYS dispatched from the
 *     compositor back to the main thread. capture:true catches ALL scrollable
 *     elements (inner divs, window, etc.) without needing event bubbling.
 *
 *  3. Input focus
 *     Any INPUT/TEXTAREA gaining focus → instant hide (keyboard about to open).
 *     150 ms debounced blur → show (avoids flash when tabbing between fields).
 *
 *  4. VisualViewport — keyboard ONLY, NEVER address-bar
 *     CRITICAL Android fix: when the user scrolls, Chrome collapses its address
 *     bar, firing visualViewport.resize with a height increase of ~56 px.
 *     The old code called show() on ANY shrink < 150px, which immediately
 *     cancelled a touchmove-triggered hide — causing the "still appears" bug.
 *     Fix: only hide() for shrinks > 200 px (real keyboard, never address bar).
 *          Never call show() here; focusout handles keyboard-close restoration.
 *
 * Desktop safeguard: bails immediately on viewports ≥ 768 px.
 *
 * Animation contract: returns `visible` only.
 * Caller uses translate-y-0 / translate-y-[150%] — NO conditional rendering.
 */
export function useBottomNavVisibility() {
  const [visible, setVisible]  = useState(true);
  // Mirror state in a ref so handlers never carry stale closures and we can
  // skip redundant setVisible calls (React bails out automatically, but the
  // ref check avoids even enqueuing the update).
  const visibleRef = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 768) return;

    const show = () => {
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }
    };
    const hide = () => {
      if (visibleRef.current) {
        visibleRef.current = false;
        setVisible(false);
      }
    };

    // ── 1. touchmove — hysteresis ────────────────────────────────────────────
    let lastTouchY  = 0;
    let touchDir: "up" | "down" | null = null;
    let touchAcc    = 0;

    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0].clientY;
      touchDir   = null;
      touchAcc   = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      const y     = e.touches[0].clientY;
      const delta = lastTouchY - y;   // + = finger up = content scrolls DOWN
      lastTouchY  = y;

      if (Math.abs(delta) < 0.5) return;

      const d = delta > 0 ? "down" : "up";
      if (d !== touchDir) { touchDir = d; touchAcc = 0; }
      touchAcc += Math.abs(delta);

      if (d === "down" && touchAcc >= 30) { hide(); touchAcc = 0; }
      else if (d === "up" && touchAcc >= 8) { show(); touchAcc = 0; }
    };

    const onTouchEnd = () => { touchDir = null; touchAcc = 0; };

    // ── 2. scroll capture — Android compositor-thread fallback ──────────────
    // Maps each scrollable element to its last known scroll position.
    // Initialized on first event so we never compare against a stale baseline.
    const scrollPrev = new Map<EventTarget, number>();

    const onScrollCapture = (e: Event) => {
      const el    = e.target as HTMLElement;
      const isDoc = el === document ||
                    el === document.documentElement ||
                    el.tagName === "BODY";
      const currentY = isDoc ? window.scrollY : el.scrollTop;

      const prev = scrollPrev.get(el);
      if (prev === undefined) {
        scrollPrev.set(el, currentY); // first event: initialise, no comparison
        return;
      }

      const delta = currentY - prev;
      if (Math.abs(delta) > 8) {
        if (delta > 0)                    hide();
        else if (delta < 0 || currentY <= 0) show();
        scrollPrev.set(el, currentY);
      }
    };

    // ── 3. Input focus ───────────────────────────────────────────────────────
    const onFocusIn = (e: FocusEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        hide();
      }
    };

    const onFocusOut = () => {
      setTimeout(() => {
        const active = document.activeElement as HTMLElement | null;
        if (
          active?.tagName !== "INPUT" &&
          active?.tagName !== "TEXTAREA" &&
          !active?.isContentEditable
        ) {
          show();
        }
      }, 150);
    };

    // ── 4. VisualViewport — keyboard only, address-bar changes ignored ───────
    const vv = window.visualViewport;
    const onViewportResize = () => {
      if (!vv) return;
      const shrink = window.innerHeight - vv.height;
      // Keyboards shrink the viewport by ~250-350 px on any phone.
      // Address-bar collapse/expand on Android is ~50-80 px max.
      // Using > 200 px threshold correctly triggers ONLY for keyboard.
      // We never call show() here — the address-bar expand would trigger
      // this with shrink ≈ 0-80 px and would undo our scroll-triggered hide.
      if (shrink > 200) hide();
    };

    document.addEventListener("touchstart",  onTouchStart,    { passive: true });
    document.addEventListener("touchmove",   onTouchMove,     { passive: true });
    document.addEventListener("touchend",    onTouchEnd,      { passive: true });
    document.addEventListener("scroll",      onScrollCapture, { capture: true, passive: true });
    document.addEventListener("focusin",     onFocusIn,  true);
    document.addEventListener("focusout",    onFocusOut, true);
    vv?.addEventListener(     "resize",      onViewportResize);

    return () => {
      document.removeEventListener("touchstart",  onTouchStart);
      document.removeEventListener("touchmove",   onTouchMove);
      document.removeEventListener("touchend",    onTouchEnd);
      document.removeEventListener("scroll",      onScrollCapture, { capture: true });
      document.removeEventListener("focusin",     onFocusIn,  true);
      document.removeEventListener("focusout",    onFocusOut, true);
      vv?.removeEventListener(    "resize",       onViewportResize);
    };
  }, []);

  return { visible };
}
