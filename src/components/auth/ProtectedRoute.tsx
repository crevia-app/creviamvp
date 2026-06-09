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
      <div className="min-h-dvh bg-black flex items-center justify-center">
        <div className="text-white/60 font-poppins">Loading...</div>
      </div>
    );
  }

  if (status === "unauth") return <Navigate to="/auth" replace />;
  if (status === "mfa")   return <Navigate to="/mfa-verify" replace />;

  // Authenticated but flag missing — silently accept and move on.
  // Existing users should never be blocked by a missing localStorage entry.
  if (!termsAccepted) {
    localStorage.setItem("crevia_terms_v1", "1");
    supabase.auth.updateUser({ data: { terms_accepted: true } }).catch(() => {});
    setTermsAccepted(true);
  }

  return <>{children}</>;
};

export default ProtectedRoute;
