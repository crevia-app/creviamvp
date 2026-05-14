import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const CONSENT_KEY = "crevia_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="mx-auto max-w-3xl bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl shadow-black/10 overflow-hidden">
        {/* Bronze top accent line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-bronze to-transparent" />

        <div className="px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          {/* Text */}
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground font-poppins">
              We value your privacy
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Crevia uses cookies to keep you securely signed in, remember your preferences, and
              process payments. We do not use advertising or tracking cookies — your data stays
              yours.{" "}
              <Link
                to="/privacy-policy"
                className="text-bronze hover:underline underline-offset-2 transition-colors font-medium"
              >
                Learn more
              </Link>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={accept}
              className="px-5 py-2 rounded-xl bg-bronze hover:bg-bronze/90 active:scale-95 text-white text-sm font-semibold font-poppins transition-all duration-150 shadow-sm whitespace-nowrap"
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
