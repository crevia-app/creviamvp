import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, CheckCircle, XCircle, Clock, Users, MessageSquare, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

const Admin = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, verifications: 0, feedback: 0 });
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/kira"); return; }

      const { data: prof } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();

      if (!prof?.is_admin) { navigate("/kira"); return; }

      setIsAdmin(true);
      await Promise.all([loadRequests(), loadFeedback(), loadStats()]);
      setLoading(false);
    };
    init();
  }, []);

  const loadRequests = async () => {
    const { data } = await supabase
      .from("verification_requests" as any)
      .select(`
        *,
        profiles:user_id (
          display_name,
          handle,
          avatar_url,
          email
        )
      `)
      .order("created_at", { ascending: false });
    if (data) setRequests(data);
  };

  const loadFeedback = async () => {
    const { data } = await supabase
      .from("feedback" as any)
      .select(`
        *,
        profiles:user_id (
          display_name,
          handle
        )
      `)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setFeedback(data);
  };

  const loadStats = async () => {
    const [{ count: users }, { count: verifications }, { count: fb }] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("verification_requests" as any).select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("feedback" as any).select("id", { count: "exact", head: true }),
    ]);
    setStats({ users: users ?? 0, verifications: verifications ?? 0, feedback: fb ?? 0 });
  };

  const handleApprove = async (requestId: string) => {
    const { error } = await supabase.rpc("approve_verification" as any, {
      p_request_id: requestId,
      p_notes: reviewNotes[requestId] || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Verification approved");
    await loadRequests();
    await loadStats();
  };

  const handleReject = async (requestId: string) => {
    const { error } = await supabase.rpc("reject_verification" as any, {
      p_request_id: requestId,
      p_notes: reviewNotes[requestId] || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Request rejected");
    await loadRequests();
    await loadStats();
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      pending:  { label: "Pending",  className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
      approved: { label: "Approved", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
    };
    const cfg = map[status] || map.pending;
    return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.className}`}>{cfg.label}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-bronze border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/30">
        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-500" />
            </div>
            <h1 className="font-vollkorn text-3xl font-bold">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground text-sm">Crevia internal dashboard</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: <Users className="h-5 w-5 text-blue-500" />, label: "Total Users", value: stats.users },
            { icon: <BadgeCheck className="h-5 w-5 text-amber-500" />, label: "Pending Verifications", value: stats.verifications },
            { icon: <MessageSquare className="h-5 w-5 text-emerald-500" />, label: "Feedback Items", value: stats.feedback },
          ].map((s) => (
            <Card key={s.label} className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="verifications">
          <TabsList className="h-10">
            <TabsTrigger value="verifications" className="gap-1.5">
              <BadgeCheck className="h-4 w-4" />
              Verifications
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Feedback
            </TabsTrigger>
          </TabsList>

          {/* Verification requests */}
          <TabsContent value="verifications" className="mt-4 space-y-4">
            {requests.length === 0 && (
              <Card className="p-8 text-center text-muted-foreground text-sm">No verification requests yet.</Card>
            )}
            {requests.map((req) => (
              <Card key={req.id} className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {req.profiles?.avatar_url && (
                      <img src={req.profiles.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="" />
                    )}
                    <div>
                      <p className="font-semibold text-sm">{req.profiles?.display_name || req.profiles?.handle || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{req.profiles?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {statusBadge(req.status)}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(req.created_at), "dd MMM yyyy")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {req.instagram_handle && (
                    <div><p className="text-muted-foreground mb-0.5">Instagram</p><p className="font-medium">{req.instagram_handle}</p></div>
                  )}
                  {req.tiktok_handle && (
                    <div><p className="text-muted-foreground mb-0.5">TikTok</p><p className="font-medium">{req.tiktok_handle}</p></div>
                  )}
                  {req.youtube_handle && (
                    <div><p className="text-muted-foreground mb-0.5">YouTube</p><p className="font-medium">{req.youtube_handle}</p></div>
                  )}
                  {req.twitter_handle && (
                    <div><p className="text-muted-foreground mb-0.5">X / Twitter</p><p className="font-medium">{req.twitter_handle}</p></div>
                  )}
                  {req.follower_count && (
                    <div><p className="text-muted-foreground mb-0.5">Followers</p><p className="font-medium">{req.follower_count.toLocaleString()}</p></div>
                  )}
                </div>

                <div className="bg-muted/30 rounded-lg p-3 text-sm">
                  <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">Reason</p>
                  <p className="whitespace-pre-wrap">{req.reason}</p>
                </div>

                {req.status === "pending" && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Reviewer notes (optional — shown to user if rejected)"
                      rows={2}
                      className="rounded-xl text-sm resize-none"
                      value={reviewNotes[req.id] ?? ""}
                      onChange={(e) => setReviewNotes((prev) => ({ ...prev, [req.id]: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(req.id)}
                        className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(req.id)}
                        className="gap-1.5 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {req.status !== "pending" && req.reviewer_notes && (
                  <p className="text-xs text-muted-foreground italic">Notes: {req.reviewer_notes}</p>
                )}
              </Card>
            ))}
          </TabsContent>

          {/* Feedback */}
          <TabsContent value="feedback" className="mt-4 space-y-3">
            {feedback.length === 0 && (
              <Card className="p-8 text-center text-muted-foreground text-sm">No feedback yet.</Card>
            )}
            {feedback.map((fb) => (
              <Card key={fb.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-medium">{fb.profiles?.display_name || fb.profiles?.handle || "Anonymous"}</p>
                    {fb.title && <p className="text-xs text-muted-foreground">{fb.title}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${fb.type === "feature" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"}`}>
                      {fb.type === "feature" ? "Feature" : "Thought"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(fb.created_at), "dd MMM yyyy")}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{fb.message}</p>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
