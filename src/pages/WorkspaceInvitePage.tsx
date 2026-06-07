import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, CheckCircle2, AlertTriangle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";

type State =
  | { status: "loading" }
  | { status: "needs_auth" }
  | { status: "ready" }
  | { status: "accepting" }
  | { status: "success"; roomId: string; roomName: string }
  | { status: "error"; message: string };

export default function WorkspaceInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { canJoinWorkspace } = useSubscription();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (!token) { setState({ status: "error", message: "Invalid invite link." }); return; }
    checkAuth();
  }, [token]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setState({ status: "needs_auth" });
      return;
    }
    if (!canJoinWorkspace) {
      setState({ status: "error", message: "Workspaces are a Pro feature. Upgrade your plan to join this workspace." });
      return;
    }
    setState({ status: "ready" });
  };

  const acceptInvite = async () => {
    setState({ status: "accepting" });
    try {
      const { data: roomId, error } = await supabase.rpc("accept_workspace_invite", {
        p_token: token!,
      } as any);

      if (error) {
        const msg = error.message?.includes("invalid_or_expired_invite")
          ? "This invite link has expired or is no longer valid."
          : error.message ?? "Failed to accept invite.";
        setState({ status: "error", message: msg });
        return;
      }

      // Fetch room name for the success screen
      const { data: room } = await supabase
        .from("chat_rooms")
        .select("name")
        .eq("id", roomId as string)
        .single();

      setState({
        status: "success",
        roomId: roomId as string,
        roomName: room?.name ?? "Workspace",
      });

      // Auto-navigate after 1.5 s
      setTimeout(() => {
        navigate(`/crevia-studio?tab=chat&roomId=${roomId}`);
      }, 1500);
    } catch (err: any) {
      setState({ status: "error", message: err.message ?? "Something went wrong." });
    }
  };

  const goToAuth = () => {
    navigate(`/auth?redirect=/invite/${token}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-xl bg-bronze/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-bronze" />
          </div>
          <span className="font-vollkorn text-xl font-bold">Crevia</span>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm text-center">
          {state.status === "loading" && (
            <>
              <Loader2 className="w-8 h-8 text-bronze animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Checking invite…</p>
            </>
          )}

          {state.status === "needs_auth" && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-bronze/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-bronze" />
              </div>
              <h2 className="font-vollkorn text-xl font-bold mb-2">You've been invited</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Sign in to your Crevia account to accept this workspace invite.
              </p>
              <Button
                onClick={goToAuth}
                className="w-full bg-bronze hover:bg-bronze/90 text-background font-semibold gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign in to accept
              </Button>
            </>
          )}

          {state.status === "ready" && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-bronze/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-bronze" />
              </div>
              <h2 className="font-vollkorn text-xl font-bold mb-2">You've been invited</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Accept this invite to join the workspace and start collaborating.
              </p>
              <Button
                onClick={acceptInvite}
                className="w-full bg-bronze hover:bg-bronze/90 text-background font-semibold gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Accept Invite
              </Button>
            </>
          )}

          {state.status === "accepting" && (
            <>
              <Loader2 className="w-8 h-8 text-bronze animate-spin mx-auto mb-4" />
              <h2 className="font-vollkorn text-xl font-bold mb-2">Joining workspace…</h2>
              <p className="text-sm text-muted-foreground">Setting up your access.</p>
            </>
          )}

          {state.status === "success" && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h2 className="font-vollkorn text-xl font-bold mb-2">You're in!</h2>
              <p className="text-sm text-muted-foreground mb-1">
                Joined <strong>{state.roomName}</strong>
              </p>
              <p className="text-xs text-muted-foreground/60 mb-6">Redirecting you now…</p>
              <Button
                onClick={() => navigate(`/crevia-studio?tab=chat&roomId=${state.roomId}`)}
                className="w-full bg-bronze hover:bg-bronze/90 text-background font-semibold"
              >
                Open Workspace
              </Button>
            </>
          )}

          {state.status === "error" && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-destructive" />
              </div>
              <h2 className="font-vollkorn text-xl font-bold mb-2">Invite invalid</h2>
              <p className="text-sm text-muted-foreground mb-6">{state.message}</p>
              <Button
                variant="outline"
                onClick={() => navigate("/crevia-studio?tab=chat")}
                className="w-full"
              >
                Go to Studio
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
