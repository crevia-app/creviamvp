import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [status, setStatus] = useState<"loading" | "auth" | "mfa" | "unauth">("loading");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setStatus("unauth");
        return;
      }
      // If a fresh login flagged MFA as pending, block until it's completed.
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

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/60 font-poppins">Loading...</div>
      </div>
    );
  }

  if (status === "unauth") return <Navigate to="/auth" replace />;
  if (status === "mfa")   return <Navigate to="/mfa-verify" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
