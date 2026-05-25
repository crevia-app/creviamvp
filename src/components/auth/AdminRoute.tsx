import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShieldOff } from "lucide-react";

type Status = "loading" | "allowed" | "denied" | "unauth";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setStatus("unauth"); return; }

      if (sessionStorage.getItem("mfa_pending") === "1") { setStatus("unauth"); return; }

      const { data: prof } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();

      setStatus((prof as any)?.is_admin ? "allowed" : "denied");
    })();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauth") return <Navigate to="/auth" replace />;

  if (status === "denied") {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <ShieldOff className="w-6 h-6 text-red-400" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-white font-vollkorn text-xl font-semibold">Access Denied</p>
          <p className="text-white/40 text-sm">You don't have permission to view this page.</p>
        </div>
        <a href="/" className="mt-2 text-xs text-white/30 hover:text-white/60 transition-colors">
          Go back home
        </a>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
