import { useEffect } from 'react';

/**
 * Keeps a flex chat container visible above the iOS virtual keyboard.
 * Listens to visualViewport resize events and sets the container's inline
 * height so it fills exactly from its top edge to the visual viewport bottom.
 * No-ops on desktop (>= 768px) and on Android where the layout already reflows.
 */
export function useIOSKeyboardFit(ref: { current: HTMLElement | null }) {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv || !ref.current) return;
    const top = ref.current.getBoundingClientRect().top;
    const update = () => {
      if (!ref.current || window.innerWidth >= 768) return;
      ref.current.style.height = `${Math.max(50, vv.height - top)}px`;
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
