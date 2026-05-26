import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [status, setStatus] = useState<"loading" | "auth" | "unauth">("loading");

  useEffect(() => {
    // getSession() is the single authoritative initial check.
    // It handles token refresh internally and returns the true current state.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus(session ? "auth" : "unauth");
    });

    // onAuthStateChange handles live transitions only.
    // INITIAL_SESSION is intentionally ignored to avoid racing with getSession().
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setStatus("auth");
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

  if (status === "unauth") {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
