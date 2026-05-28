import { useEffect, useRef, useState } from "react";

/**
 * useBottomNavVisibility
 *
 * Tracks three independent signals and merges them into a single `visible` boolean:
 *
 *  1. Scroll direction — captures scroll events at the document root (capture phase)
 *     so it catches both window scroll AND internal element scrolls (e.g. ScrollArea).
 *     Scrolling down  → hide. Scrolling up / at the very top → show.
 *
 *  2. Input focus — any <input> or <textarea> gaining focus immediately hides the bar
 *     so it never sits on top of the virtual keyboard. Blur restores it (deferred so
 *     focus transfers between fields don't cause a flash).
 *
 *  3. VisualViewport resize — catches the virtual keyboard on iOS/Android via the
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

  // Per-element scroll position registry so direction is accurate
  // even when multiple containers scroll (e.g. sidebar + main chat).
  const prevScrollRef = useRef(new Map<EventTarget, number>());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // ── Desktop safeguard ────────────────────────────────────────────────────
    // Re-check on resize so orientation changes are handled correctly.
    const isMobile = () => window.innerWidth < 768;
    if (!isMobile()) return;

    const show = () => setVisible(true);
    const hide = () => setVisible(false);

    // ── 1. Scroll direction (capture phase catches ALL scrollable elements) ──
    const onScroll = (e: Event) => {
      const el = e.target as HTMLElement;

      // Resolve current scroll offset for window vs element
      const isWindow =
        el === (document as unknown as HTMLElement) ||
        el.tagName === "HTML" ||
        el.tagName === "BODY" ||
        el === document.documentElement;

      const currentY = isWindow ? window.scrollY : el.scrollTop ?? 0;

      // Batch into animation frame so rapid events don't stack
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const prev = prevScrollRef.current.get(el) ?? currentY;
        const delta = currentY - prev;

        // Dead-zone of 4 px prevents jitter from micro-bounces
        if (Math.abs(delta) > 4) {
          // Always show when at the very top (currentY ≤ 0)
          setVisible(delta < 0 || currentY <= 0);
          prevScrollRef.current.set(el, currentY);
        }
      });
    };

    // ── 2. Focus: input / textarea → instant hide ───────────────────────────
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

    // ── 3. VisualViewport: virtual keyboard on iOS / Android ─────────────────
    const vv = window.visualViewport;
    const onViewportResize = () => {
      if (!vv) return;
      const keyboardOpen = window.innerHeight - vv.height > 150;
      setVisible(!keyboardOpen);
    };

    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("focusout", onFocusOut, true);
    vv?.addEventListener("resize", onViewportResize);

    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("focusout", onFocusOut, true);
      vv?.removeEventListener("resize", onViewportResize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { visible };
}
