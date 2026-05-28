import { useEffect, useState } from "react";

/**
 * useBottomNavVisibility
 *
 * Returns a single `visible` boolean that collapses four signals:
 *
 *  1. Touch direction (hysteresis) — uses touchstart/touchmove on the document.
 *     Touch events bubble reliably on iOS and Android; scroll events on inner
 *     containers (Radix ScrollArea etc.) do NOT reliably bubble, so we own
 *     the gesture here.
 *
 *     Hysteresis thresholds prevent micro-bounce flicker:
 *       HIDE  — user must scroll DOWN  ≥ 30 px continuously in one gesture
 *       SHOW  — any upward reversal    ≥  8 px (feels instant, like Instagram)
 *
 *     The "cumulative since last direction change" counter resets whenever the
 *     finger changes direction, so a single gesture can both hide and show.
 *
 *  2. Window scroll fallback — for mouse-wheel / Chrome DevTools simulation.
 *     Conservative 10 px dead-zone; only updates when window itself scrolls
 *     (inner-element scrolls are handled by touchmove above).
 *
 *  3. Input focus — INPUT / TEXTAREA gaining focus → instant hide.
 *     150 ms debounced blur → show (avoids flash when tabbing between fields).
 *
 *  4. VisualViewport resize — keyboard open (shrink > 150 px) → hide.
 *
 * Desktop safeguard: bails immediately on viewports ≥ 768 px.
 */
export function useBottomNavVisibility() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 768) return; // desktop: nav is always visible

    // Inline show/hide helpers — React bails out automatically if state unchanged
    const show = () => setVisible(true);
    const hide = () => setVisible(false);

    // ── 1. Touch direction with hysteresis ───────────────────────────────────
    let lastY      = 0;
    let direction: "up" | "down" | null = null;
    let accumulated = 0;

    const onTouchStart = (e: TouchEvent) => {
      lastY       = e.touches[0].clientY;
      direction   = null;
      accumulated = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      const currentY  = e.touches[0].clientY;
      const delta     = lastY - currentY; // + = finger up = content scrolling DOWN
      lastY           = currentY;

      if (Math.abs(delta) < 0.5) return; // ignore sub-pixel noise

      const newDir = delta > 0 ? "down" : "up";

      if (newDir !== direction) {
        // Direction change — reset accumulator so each reversal is judged fresh
        direction   = newDir;
        accumulated = 0;
      }

      accumulated += Math.abs(delta);

      if (newDir === "down" && accumulated >= 30) {
        hide();
        accumulated = 0; // reset so next 30 px triggers again, but no rapid-fire
      } else if (newDir === "up" && accumulated >= 8) {
        show();
        accumulated = 0; // reset so continued upward scroll keeps nav visible
      }
    };

    const onTouchEnd = () => {
      direction   = null;
      accumulated = 0;
    };

    // ── 2. Window scroll (mouse / DevTools fallback) ─────────────────────────
    // Only handles window-level scroll; touch-driven inner-element scrolls
    // are covered by touchmove above.
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      const delta    = currentY - lastScrollY;
      if (Math.abs(delta) > 10) {
        setVisible(delta < 0 || currentY <= 0);
        lastScrollY = currentY;
      }
    };

    // ── 3. Input focus → instant hide ───────────────────────────────────────
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

    // ── 4. VisualViewport — virtual keyboard on iOS / Android ────────────────
    const vv = window.visualViewport;
    const onViewportResize = () => {
      if (!vv) return;
      setVisible(!(window.innerHeight - vv.height > 150));
    };

    document.addEventListener("touchstart",  onTouchStart,     { passive: true });
    document.addEventListener("touchmove",   onTouchMove,      { passive: true });
    document.addEventListener("touchend",    onTouchEnd,       { passive: true });
    window.addEventListener(  "scroll",      onScroll,         { passive: true });
    document.addEventListener("focusin",     onFocusIn,  true);
    document.addEventListener("focusout",    onFocusOut, true);
    vv?.addEventListener(     "resize",      onViewportResize);

    return () => {
      document.removeEventListener("touchstart",  onTouchStart);
      document.removeEventListener("touchmove",   onTouchMove);
      document.removeEventListener("touchend",    onTouchEnd);
      window.removeEventListener(  "scroll",      onScroll);
      document.removeEventListener("focusin",     onFocusIn,  true);
      document.removeEventListener("focusout",    onFocusOut, true);
      vv?.removeEventListener(    "resize",       onViewportResize);
    };
  }, []);

  return { visible };
}
