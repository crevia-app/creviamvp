import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "verifying" | "success" | "error";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Check for errors in the URL before anything else (hash or query string)
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);

    const hashError = hash.includes("error=")
      ? new URLSearchParams(hash.replace("#", "?")).get("error_description")
      : null;
    const queryError = searchParams.has("error")
      ? searchParams.get("error_description")
      : null;
    const rawError = hashError || queryError;

    if (rawError) {
      setErrorMsg(decodeURIComponent(rawError.replace(/\+/g, " ")));
      setStatus("error");
      return;
    }

    // If session already exists (link clicked twice, or page refreshed after success)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus("success");
        navigate("/dira", { replace: true });
      }
    });

    // Supabase SDK automatically exchanges the token/code in the URL.
    // Listen for the resulting session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setStatus("success");
          navigate("/dira", { replace: true });
        }
      }
    );

    // Safety net: if nothing resolves in 8 seconds, show a helpful error
    // instead of leaving the user stuck on "Verifying…" forever (e.g. page refresh).
    const timeout = setTimeout(() => {
      setStatus((prev) => {
        if (prev === "verifying") {
          setErrorMsg("This link has expired or has already been used. Please sign in again.");
          return "error";
        }
        return prev;
      });
    }, 8000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-dvh bg-[#0d0d0d] flex items-center justify-center p-6">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #B07D3A 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <img src="/crevia-logo.png" alt="Crevia" className="w-9 h-9 rounded-full ring-1 ring-white/10" />
          <span className="font-vollkorn text-2xl font-bold text-white">Crevia</span>
        </div>

        {/* Verifying / success — silent spinner, no text */}
        {(status === "verifying" || status === "success") && (
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-bronze animate-spin" />
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <div className="space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mx-auto">
              <XCircle className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <h1 className="font-vollkorn text-2xl font-bold text-white mb-2">
                Link expired
              </h1>
              <p className="text-sm text-white/50 font-poppins leading-relaxed max-w-xs mx-auto">
                {errorMsg || "This confirmation link has expired or already been used."}
              </p>
            </div>
            <Button
              onClick={() => navigate("/auth?mode=signup")}
              className="bg-bronze hover:bg-bronze-dark text-white font-poppins font-semibold w-full h-11"
            >
              Back to sign up
            </Button>
          </div>
        )}

        {/* Crevia footer */}
        <p className="absolute bottom-8 left-0 right-0 text-center text-xs text-white/20 font-poppins">
          © {new Date().getFullYear()} Crevia. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
