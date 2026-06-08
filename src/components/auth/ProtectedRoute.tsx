import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [status, setStatus] = useState<"loading" | "auth" | "mfa" | "unauth">("loading");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [acceptingTerms, setAcceptingTerms] = useState(false);

  useEffect(() => {
    setTermsAccepted(!!localStorage.getItem("crevia_terms_v1"));

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setStatus("unauth");
        return;
      }
      if (sessionStorage.getItem("mfa_pending") === "1") {
        setStatus("mfa");
        return;
      }
      setStatus("auth");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (sessionStorage.getItem("mfa_pending") === "1") {
          setStatus("mfa");
        } else {
          setStatus("auth");
        }
      } else if (event === "SIGNED_OUT") {
        setStatus("unauth");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAcceptTerms = async () => {
    setAcceptingTerms(true);
    localStorage.setItem("crevia_terms_v1", "1");
    // Persist to auth user metadata — no schema change required
    await supabase.auth.updateUser({ data: { terms_accepted: true } }).catch(() => {});
    setTermsAccepted(true);
    setAcceptingTerms(false);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/60 font-poppins">Loading...</div>
      </div>
    );
  }

  if (status === "unauth") return <Navigate to="/auth" replace />;
  if (status === "mfa")   return <Navigate to="/mfa-verify" replace />;

  // Authenticated but terms not yet accepted (e.g. OAuth user on new device)
  // Block with an inline intercept instead of redirecting to /signup
  if (!termsAccepted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card border border-border/50 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-bronze/10 flex items-center justify-center mx-auto mb-4">
            <img src="/crevia-logo.png" alt="Crevia" className="w-8 h-8 rounded-full" />
          </div>
          <h2 className="font-vollkorn text-xl font-bold mb-2">One last step</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Please accept our Terms of Use and Privacy Policy to continue using Crevia.
          </p>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            By clicking "I Agree", you agree to our{" "}
            <Link to="/terms-of-service" className="text-bronze hover:underline" target="_blank" rel="noopener noreferrer">
              Terms of Use
            </Link>
            {" "}and{" "}
            <Link to="/privacy-policy" className="text-bronze hover:underline" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </Link>.
          </p>
          <Button
            onClick={handleAcceptTerms}
            disabled={acceptingTerms}
            className="w-full bg-bronze hover:bg-bronze/90 text-background font-semibold h-11"
          >
            {acceptingTerms ? "Saving…" : "I Agree — Continue"}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
