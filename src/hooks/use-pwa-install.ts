import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const detectIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as any).standalone === true;

export function usePWAInstall() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const ios = typeof navigator !== "undefined" && detectIOS();

  useEffect(() => {
    if (isStandalone()) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (ios) {
      setShowIOSGuide(true);
      return;
    }
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setPrompt(null);
    }
  };

  // Show the button when: Android/Chrome has a prompt, OR on iOS (not yet installed)
  const canInstall = !isInstalled && (!!prompt || ios);

  return { canInstall, isInstalled, isIOS: ios, install, showIOSGuide, setShowIOSGuide };
}
