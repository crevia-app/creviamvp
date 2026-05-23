import { useEffect } from 'react';

/**
 * Pins the chat container to the visual viewport when the mobile keyboard opens.
 * Uses position:fixed + vv.height so iOS page-scroll on input focus has no effect.
 * No-ops entirely on desktop (>= 768 px) so the desktop layout is never touched.
 *
 * @param ref        - The outermost chat container element
 * @param onKeyboardOpen - Optional callback fired once when keyboard opens (e.g. scroll to bottom)
 */
export function useIOSKeyboardFit(
  ref: { current: HTMLElement | null },
  onKeyboardOpen?: () => void
) {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    type SavedStyles = {
      height: string; position: string;
      top: string; left: string; right: string; width: string; zIndex: string;
    };
    let saved: SavedStyles | null = null;

    const update = () => {
      if (!ref.current || window.innerWidth >= 768) return;
      const kbH = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);

      if (kbH > 50) {
        // Keyboard open — fix container to visual viewport so iOS scroll can't displace it
        if (!saved) {
          saved = {
            height:   ref.current.style.height,
            position: ref.current.style.position,
            top:      ref.current.style.top,
            left:     ref.current.style.left,
            right:    ref.current.style.right,
            width:    ref.current.style.width,
            zIndex:   ref.current.style.zIndex,
          };
          onKeyboardOpen?.();
        }
        ref.current.style.position = 'fixed';
        ref.current.style.top      = `${vv.offsetTop}px`;
        ref.current.style.left     = '0';
        ref.current.style.right    = '0';
        ref.current.style.width    = '100%';
        ref.current.style.height   = `${vv.height}px`;
        ref.current.style.zIndex   = '50';
      } else if (saved) {
        // Keyboard closed — restore every saved property
        ref.current.style.height   = saved.height;
        ref.current.style.position = saved.position;
        ref.current.style.top      = saved.top;
        ref.current.style.left     = saved.left;
        ref.current.style.right    = saved.right;
        ref.current.style.width    = saved.width;
        ref.current.style.zIndex   = saved.zIndex;
        saved = null;
      }
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
