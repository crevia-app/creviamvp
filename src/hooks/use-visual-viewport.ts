import { useState, useEffect } from "react";

export function useVisualViewport() {
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    // iOS fires both "resize" (keyboard height change) and "scroll"
    // (page offset shift when input is focused). Listen to both so
    // keyboardOpen stays accurate through the full focus lifecycle.
    const check = () => {
      setKeyboardOpen(window.innerHeight - vv.height > 150);
    };

    vv.addEventListener("resize", check);
    vv.addEventListener("scroll", check);
    return () => {
      vv.removeEventListener("resize", check);
      vv.removeEventListener("scroll", check);
    };
  }, []);

  return { keyboardOpen };
}
