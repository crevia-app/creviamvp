import { useEffect, useRef, useState } from "react";

/**
 * useBottomNavVisibility
 *
 * Tracks three independent signals and merges them into a single `visible` boolean:
 *
 *  1. Touch direction — touchstart/touchmove events detect scroll direction for
 *     ANY scrollable element (window, Radix ScrollArea, custom divs).
 *     Touch events bubble normally — no capture-phase tricks required, no
 *     browser-compat surprises with non-bubbling scroll events.
 *     Finger moves UP   (content scrolls down) → hide.
 *     Finger moves DOWN (content scrolls up)   → show.
 *     6 px dead-zone prevents jitter from micro-swipes.
 *
 *  2. Window scroll fallback — catches mouse-wheel, trackpad, and Chrome DevTools
 *     mobile simulation where touchmove isn't fired. Scrolling down → hide;
 *     scrolling up / at the very top → show.
 *
 *  3. Input focus — any <input> or <textarea> gaining focus immediately hides the
 *     bar so it never sits on top of the virtual keyboard. Blur restores it
 *     (150 ms defer so focus-transfers between fields don't cause a flash).
 *
 *  4. VisualViewport resize — catches the virtual keyboard on iOS/Android via the
 *     VisualViewport API. Height shrink > 150 px = keyboard open = hide.
 *
 * Desktop safeguard: the effect bails out early on viewports ≥ 768 px, leaving
 * desktop sidebars and navigation completely unaffected.
 *
 * Animation contract: this hook only returns `visible`. The caller applies
 * Tailwind `translate-y-0` / `translate-y-[150%]` — NO conditional rendering.
 */
export function useBottomNavVisibility() {
  const [visible, setVisible] = useState(true);

  // Touch tracking — reset to null on touchend so a new gesture starts fresh
  const lastTouchY   = useRef<number | null>(null);
  // Window scroll tracking
  const lastScrollY  = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // ── Desktop safeguard ────────────────────────────────────────────────────
    if (window.innerWidth >= 768) return;

    const show = () => setVisible(true);
    const hide = () => setVisible(false);

    // ── 1. Touch direction — covers ALL scrollable elements ──────────────────
    //
    // Why touchmove instead of scroll:
    //   The DOM `scroll` event does NOT bubble. Listening with `capture:true` on
    //   `document` is supposed to catch it on the way DOWN the tree, but iOS
    //   Safari and some Android WebViews are inconsistent, particularly for
    //   scroll containers inside Radix UI / shadcn ScrollArea components.
    //   `touchmove` DOES bubble reliably across all mobile browsers and fires
    //   for any element the finger is touching — no capture tricks needed.
    //
    const onTouchStart = (e: TouchEvent) => {
      lastTouchY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (lastTouchY.current === null) return;

      const currentY = e.touches[0].clientY;
      // Positive delta → finger moved UP → content scrolling DOWN → hide
      // Negative delta → finger moved DOWN → content scrolling UP  → show
      const delta = lastTouchY.current - currentY;

      if (Math.abs(delta) > 6) {
        delta > 0 ? hide() : show();
        // Update baseline so continuous scroll keeps triggering correctly
        lastTouchY.current = currentY;
      }
    };

    const onTouchEnd = () => {
      lastTouchY.current = null;
    };

    // ── 2. Window scroll — fallback for mouse / DevTools simulation ──────────
    lastScrollY.current = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      const delta    = currentY - lastScrollY.current;

      // 4 px dead-zone prevents micro-bounce jitter
      if (Math.abs(delta) > 4) {
        // Always show when snapped to the very top
        setVisible(delta < 0 || currentY <= 0);
        lastScrollY.current = currentY;
      }
    };

    // ── 3. Focus: input / textarea → instant hide ───────────────────────────
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
      // 150 ms defer: lets focus settle before checking if another field got it
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

    // ── 4. VisualViewport: virtual keyboard on iOS / Android ─────────────────
    const vv = window.visualViewport;
    const onViewportResize = () => {
      if (!vv) return;
      setVisible(!(window.innerHeight - vv.height > 150));
    };

    document.addEventListener("touchstart",  onTouchStart,      { passive: true });
    document.addEventListener("touchmove",   onTouchMove,       { passive: true });
    document.addEventListener("touchend",    onTouchEnd,        { passive: true });
    window.addEventListener(  "scroll",      onScroll,          { passive: true });
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
