import { useState, useEffect } from "react";

export function useVisualViewport() {
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const check = () => {
      setKeyboardOpen(window.innerHeight - vv.height > 150);
    };

    vv.addEventListener("resize", check);
    return () => vv.removeEventListener("resize", check);
  }, []);

  return { keyboardOpen };
}
