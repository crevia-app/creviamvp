import { useState, useEffect } from "react";

export function useVisualViewport() {
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [vpHeight, setVpHeight] = useState<number | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const check = () => {
      const h = vv.height;
      setKeyboardOpen(window.innerHeight - h > 150);
      setVpHeight(h);
      // CSS variable consumed by chat scroll containers for precise
      // keyboard-aware height on iOS Safari / Chrome for iOS.
      document.documentElement.style.setProperty("--vp-height", `${h}px`);
    };

    // Initialise immediately so containers have the correct height before
    // any keyboard event fires.
    check();

    vv.addEventListener("resize", check);
    vv.addEventListener("scroll", check);
    return () => {
      vv.removeEventListener("resize", check);
      vv.removeEventListener("scroll", check);
    };
  }, []);

  return { keyboardOpen, vpHeight };
}
