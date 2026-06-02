import { useCallback, useRef } from "react";

interface UseLongPressOptions {
  /** How long the pointer must be held before the callback fires (ms). Default 500. */
  delay?: number;
}

/**
 * useLongPress
 *
 * Returns pointer event handlers to spread onto any element.
 * Fires `callback` after the pointer is held for `delay` ms without moving or lifting.
 * Cancels cleanly on pointerup, pointerleave, and pointercancel.
 *
 * Usage:
 *   const longPress = useLongPress(() => openMenu(), { delay: 500 });
 *   <div {...longPress}>...</div>
 */
export function useLongPress(callback: () => void, { delay = 500 }: UseLongPressOptions = {}) {
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef  = useRef(false);

  const start = useCallback((e: React.PointerEvent) => {
    // Only activate on touch — mouse users get hover; touch users need long-press.
    if (e.pointerType === "mouse") return;
    firedRef.current = false;
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      callback();
    }, delay);
  }, [callback, delay]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    onPointerDown:   start,
    onPointerUp:     cancel,
    onPointerLeave:  cancel,
    onPointerCancel: cancel,
  };
}
