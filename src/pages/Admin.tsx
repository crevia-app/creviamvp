import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  LayoutDashboard, Users, CreditCard, FileText, MessageSquare, Settings,
  Shield, CheckCircle, XCircle, Search, Receipt, FileCheck,
  Menu, LogOut, Loader2, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type Section = "overview" | "users" | "billing" | "documents" | "support" | "settings";

const NAV: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "overview",  label: "Overview",  icon: LayoutDashboard },
  { id: "users",     label: "Users",     icon: Users },
  { id: "billing",   label: "Billing",   icon: CreditCard },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "support",   label: "Support",   icon: MessageSquare },
  { id: "settings",  label: "Settings",  icon: Settings },
];

const KES = (n: number) => "KES " + Math.round(n).toLocaleString();

const planChip = (plan: string | null) => cn(
  "text-[10px] font-semibold px-2 py-0.5 rounded-full",
  plan === "pro"        ? "bg-emerald-500/20 text-emerald-400"
  : plan === "enterprise" ? "bg-purple-500/20 text-purple-400"
  : "bg-white/[0.08] text-white/30"
);

const statusChip = (s: string) => cn(
  "text-[10px] font-semibold px-2 py-0.5 rounded-full",
  s === "paid" || s === "signed" || s === "completed" || s === "success" ? "bg-emerald-500/20 text-emerald-400"
  : s === "overdue" || s === "cancelled" || s === "failed"               ? "bg-red-500/20 text-red-400"
  : s === "sent"                                                          ? "bg-blue-500/20 text-blue-400"
  : "bg-amber-500/20 text-amber-400"
);

const Avatar = ({ url, name }: { url?: string | null; name?: string | null }) => (
  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60 flex-shrink-0 overflow-hidden">
    {url
      ? <img src={url} alt="" className="w-full h-full object-cover" />
      : <span>{(name?.[0] || "?").toUpperCase()}</span>}
  </div>
);

const SectionLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="w-5 h-5 text-bronze animate-spin" />
  </div>
);

// ─── Overview ─────────────────────────────────────────────────────────────────
const OverviewSection = () => {
  const [stats, setStats] = useState({ total: 0, free: 0, pro: 0, enterprise: 0, invoices: 0, contracts: 0 });
  const [mrr, setMrr] = useState(0);
  const [chart, setChart] = useState<{ month: string; users: number }[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [{ data: profiles }, { count: inv }, { count: con }] = await Promise.all([
      supabase.from("profiles").select("id, display_name, handle, subscription_plan, created_at, avatar_url").order("created_at", { ascending: false }),
      supabase.from("invoices").select("id", { count: "exact", head: true }),
      supabase.from("contracts").select("id", { count: "exact", head: true }),
    ]);

    const p = profiles ?? [];
    const pro  = p.filter(u => u.subscription_plan === "pro").length;
    const ent  = p.filter(u => u.subscription_plan === "enterprise").length;
    const free = p.length - pro - ent;

    setStats({ total: p.length, free, pro, enterprise: ent, invoices: inv ?? 0, contracts: con ?? 0 });
    setMrr(pro * 1500 + ent * 5000);
    setRecent(p.slice(0, 8));
    setChart(
      Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(new Date(), 5 - i);
        const s = startOfMonth(d).toISOString();
        const e = endOfMonth(d).toISOString();
        return { month: format(d, "MMM"), users: p.filter(u => u.created_at && u.created_at >= s && u.created_at <= e).length };
      })
    );
    setLoading(false);
  };

  if (loading) return <SectionLoader />;

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Users",  value: String(stats.total),   sub: `${stats.free} free · ${stats.pro} pro · ${stats.enterprise} ent`,  color: "text-white" },
          { label: "MRR",          value: KES(mrr),              sub: `ARR ${KES(mrr * 12)}`,                                              color: "text-bronze" },
          { label: "Invoices",     value: String(stats.invoices), sub: "total generated",                                                  color: "text-blue-400" },
          { label: "Contracts",    value: String(stats.contracts), sub: "total generated",                                                 color: "text-violet-400" },
        ].map(c => (
          <div key={c.label} className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
            <p className="text-xs text-white/40 mb-1">{c.label}</p>
            <p className={`text-2xl font-bold font-poppins ${c.color}`}>{c.value}</p>
            <p className="text-xs text-white/25 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-4">
        <p className="text-sm font-semibold text-white/60 mb-4">User Growth — Last 6 Months</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "#222", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: 12 }} />
            <Line type="monotone" dataKey="users" stroke="#c47d2a" strokeWidth={2.5} dot={{ fill: "#c47d2a", r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent signups */}
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-4">
        <p className="text-sm font-semibold text-white/60 mb-3">Recent Signups</p>
        <div className="space-y-3">
          {recent.map(u => (
            <div key={u.id} className="flex items-center gap-3">
              <Avatar url={u.avatar_url} name={u.display_name || u.handle} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 truncate">{u.display_name || u.handle}</p>
                <p className="text-xs text-white/30 truncate">@{u.handle}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={planChip(u.subscription_plan)}>{u.subscription_plan || "free"}</span>
                {u.created_at && <span className="text-[10px] text-white/20">{format(new Date(u.created_at), "dd MMM")}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Users ────────────────────────────────────────────────────────────────────
const UsersSection = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "pro" | "enterprise">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, handle, email, avatar_url, subscription_plan, subscription_status, created_at, is_verified, user_type")
      .order("created_at", { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const match = !q || u.display_name?.toLowerCase().includes(q) || u.handle?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const plan = u.subscription_plan || "free";
    return match && (filter === "all" || plan === filter);
  });

  if (loading) return <SectionLoader />;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Search by name, handle or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/30 rounded-xl"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as any)}
          className="bg-[#1a1a1a] border border-white/10 text-white/70 text-sm rounded-xl px-3 py-2 outline-none cursor-pointer"
        >
          <option value="all">All plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      <p className="text-xs text-white/30">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</p>

      <div className="space-y-2">
        {filtered.map(u => (
          <div key={u.id} className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
            <Avatar url={u.avatar_url} name={u.display_name || u.handle} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 font-medium truncate">{u.display_name || u.handle}</p>
              <p className="text-xs text-white/30 truncate">{u.email || `@${u.handle}`}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
              {u.is_verified && (
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-semibold">Verified</span>
              )}
              <span className={planChip(u.subscription_plan)}>{u.subscription_plan || "free"}</span>
              <span className="text-[10px] text-white/20">{u.user_type}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/30 text-sm">No users found</div>
        )}
      </div>
    </div>
  );
};

// ─── Billing ──────────────────────────────────────────────────────────────────
const BillingSection = () => {
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase
      .from("payment_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(150);
    setTxns(data ?? []);
    setLoading(false);
  };

  const total     = txns.reduce((s, t) => s + (t.amount ?? 0), 0);
  const completed = txns.filter(t => t.status === "completed" || t.status === "success").length;
  const failed    = txns.filter(t => t.status === "failed").length;

  if (loading) return <SectionLoader />;

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Volume", value: KES(total),        color: "text-bronze" },
          { label: "Completed",    value: String(completed), color: "text-emerald-400" },
          { label: "Failed",       value: String(failed),    color: "text-red-400" },
        ].map(c => (
          <div key={c.label} className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
            <p className="text-xs text-white/40 mb-1">{c.label}</p>
            <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-sm font-semibold text-white/60">Transactions</p>
        </div>
        <div className="divide-y divide-white/5">
          {txns.length === 0 && (
            <p className="text-center py-12 text-white/30 text-sm">No transactions yet</p>
          )}
          {txns.map(t => (
            <div key={t.id} className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/70 truncate font-mono text-xs">{t.transaction_reference || t.id.slice(0, 16)}</p>
                <p className="text-xs text-white/30">{t.payment_method || t.transaction_type} · {format(new Date(t.created_at), "dd MMM yyyy")}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={statusChip(t.status || "pending")}>{t.status || "pending"}</span>
                <p className="text-sm font-bold text-white/80">KES {(t.amount ?? 0).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Documents ────────────────────────────────────────────────────────────────
const DocumentsSection = () => {
  const [tab, setTab] = useState<"invoices" | "contracts">("invoices");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [{ data: inv }, { data: con }] = await Promise.all([
      supabase.from("invoices").select("id, invoice_number, client_name, total, status, currency, created_at").order("created_at", { ascending: false }).limit(200),
      supabase.from("contracts").select("id, title, client_name, value, status, currency, created_at, contract_type").order("created_at", { ascending: false }).limit(200),
    ]);
    setInvoices(inv ?? []);
    setContracts(con ?? []);
    setLoading(false);
  };

  const docs = (tab === "invoices" ? invoices : contracts).filter(d => {
    const q = search.toLowerCase();
    return !q
      || d.client_name?.toLowerCase().includes(q)
      || (tab === "invoices" ? d.invoice_number?.toLowerCase().includes(q) : d.title?.toLowerCase().includes(q));
  });

  if (loading) return <SectionLoader />;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex gap-1 p-1 bg-[#1a1a1a] rounded-xl border border-white/5 w-fit">
        {(["invoices", "contracts"] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setSearch(""); }}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
              tab === t ? "bg-bronze text-white" : "text-white/40 hover:text-white/70"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <Input
          placeholder={`Search ${tab}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-[#1a1a1a] border-white/10 text-white placeholder:text-white/30 rounded-xl"
        />
      </div>

      <p className="text-xs text-white/30">{docs.length} {tab}</p>

      <div className="space-y-2">
        {docs.map(d => (
          <div key={d.id} className="bg-[#1a1a1a] border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 font-medium truncate">
                {tab === "invoices" ? `#${d.invoice_number} · ${d.client_name}` : d.title}
              </p>
              <p className="text-xs text-white/30 truncate">
                {tab === "contracts" ? `${d.client_name} · ${d.contract_type} · ` : ""}{format(new Date(d.created_at), "dd MMM yyyy")}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={statusChip(d.status)}>{d.status}</span>
              <p className="text-sm font-bold text-white/70">
                {d.currency || "KES"} {((d.total ?? d.value) || 0).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        {docs.length === 0 && (
          <div className="text-center py-16 text-white/30 text-sm">No {tab} found</div>
        )}
      </div>
    </div>
  );
};

// ─── Support ──────────────────────────────────────────────────────────────────
const SupportSection = () => {
  const [tab, setTab] = useState<"verifications" | "feedback">("verifications");
  const [requests, setRequests] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [{ data: reqs }, { data: fb }] = await Promise.all([
      supabase.from("verification_requests" as any)
        .select("*, profiles:user_id(display_name, handle, avatar_url, email)")
        .order("created_at", { ascending: false }),
      supabase.from("feedback" as any)
        .select("*, profiles:user_id(display_name, handle)")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    setRequests(reqs ?? []);
    setFeedback(fb ?? []);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase.rpc("approve_verification" as any, { p_request_id: id, p_notes: notes[id] || null });
    if (error) { toast.error(error.message); return; }
    toast.success("Approved");
    load();
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.rpc("reject_verification" as any, { p_request_id: id, p_notes: notes[id] || null });
    if (error) { toast.error(error.message); return; }
    toast.success("Rejected");
    load();
  };

  const verificationStatusChip = (s: string) => cn(
    "text-[10px] font-semibold px-2 py-0.5 rounded-full",
    s === "approved" ? "bg-emerald-500/20 text-emerald-400"
    : s === "rejected" ? "bg-red-500/20 text-red-400"
    : "bg-amber-500/20 text-amber-400"
  );

  if (loading) return <SectionLoader />;

  const pending = requests.filter(r => r.status === "pending").length;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex gap-1 p-1 bg-[#1a1a1a] rounded-xl border border-white/5 w-fit">
        {(["verifications", "feedback"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize flex items-center gap-2",
              tab === t ? "bg-bronze text-white" : "text-white/40 hover:text-white/70"
            )}
          >
            {t}
            {t === "verifications" && pending > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{pending}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "verifications" && (
        <div className="space-y-3">
          {requests.length === 0 && <div className="text-center py-16 text-white/30 text-sm">No verification requests</div>}
          {requests.map(r => (
            <div key={r.id} className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar url={r.profiles?.avatar_url} name={r.profiles?.display_name || r.profiles?.handle} />
                  <div>
                    <p className="text-sm font-medium text-white/80">{r.profiles?.display_name || r.profiles?.handle}</p>
                    <p className="text-xs text-white/30">{r.profiles?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={verificationStatusChip(r.status)}>{r.status}</span>
                  <span className="text-xs text-white/20">{format(new Date(r.created_at), "dd MMM yyyy")}</span>
                </div>
              </div>

              {/* Social handles */}
              <div className="flex flex-wrap gap-2">
                {r.instagram_handle && <span className="text-[11px] bg-white/5 text-white/50 px-2 py-1 rounded-lg">IG: {r.instagram_handle}</span>}
                {r.tiktok_handle    && <span className="text-[11px] bg-white/5 text-white/50 px-2 py-1 rounded-lg">TT: {r.tiktok_handle}</span>}
                {r.youtube_handle   && <span className="text-[11px] bg-white/5 text-white/50 px-2 py-1 rounded-lg">YT: {r.youtube_handle}</span>}
                {r.twitter_handle   && <span className="text-[11px] bg-white/5 text-white/50 px-2 py-1 rounded-lg">X: {r.twitter_handle}</span>}
                {r.follower_count   && <span className="text-[11px] bg-white/5 text-white/50 px-2 py-1 rounded-lg">{Number(r.follower_count).toLocaleString()} followers</span>}
              </div>

              {r.reason && (
                <p className="text-sm text-white/50 bg-white/5 rounded-xl p-3 whitespace-pre-wrap">{r.reason}</p>
              )}

              {r.status === "pending" && (
                <div className="space-y-2">
                  <Textarea
                    rows={2}
                    placeholder="Reviewer notes (optional — shown to user if rejected)"
                    value={notes[r.id] ?? ""}
                    onChange={e => setNotes(p => ({ ...p, [r.id]: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none rounded-xl text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(r.id)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(r.id)} className="gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg">
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                </div>
              )}
              {r.status !== "pending" && r.reviewer_notes && (
                <p className="text-xs text-white/30 italic">Notes: {r.reviewer_notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "feedback" && (
        <div className="space-y-3">
          {feedback.length === 0 && <div className="text-center py-16 text-white/30 text-sm">No feedback yet</div>}
          {feedback.map(fb => (
            <div key={fb.id} className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-sm font-medium text-white/70">{fb.profiles?.display_name || fb.profiles?.handle || "Anonymous"}</p>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                    fb.type === "feature" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
                  )}>
                    {fb.type === "feature" ? "Feature" : "Thought"}
                  </span>
                  <span className="text-xs text-white/20">{format(new Date(fb.created_at), "dd MMM yyyy")}</span>
                </div>
              </div>
              {fb.title && <p className="text-xs text-white/40 mb-1 font-medium">{fb.title}</p>}
              <p className="text-sm text-white/50 whitespace-pre-wrap">{fb.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Settings ─────────────────────────────────────────────────────────────────
const SettingsSection = () => {
  const [stats, setStats] = useState({ users: 0, invoices: 0, contracts: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("invoices").select("id", { count: "exact", head: true }),
      supabase.from("contracts").select("id", { count: "exact", head: true }),
    ]).then(([{ count: u }, { count: i }, { count: c }]) => {
      setStats({ users: u ?? 0, invoices: i ?? 0, contracts: c ?? 0 });
    });
  }, []);

  const rows = [
    { label: "App",              value: "Crevia MVP" },
    { label: "Stack",            value: "React · Supabase · Tailwind" },
    { label: "Auth",             value: "Supabase Auth + MFA" },
    { label: "Total Users",      value: String(stats.users) },
    { label: "Total Invoices",   value: String(stats.invoices) },
    { label: "Total Contracts",  value: String(stats.contracts) },
    { label: "Admin access",     value: "is_admin = true on profiles" },
  ];

  const links = [
    { label: "Supabase Studio",  hint: "DB · Auth · Storage · Edge Functions" },
    { label: "Resend Dashboard", hint: "Transactional email / SMTP" },
    { label: "Paystack",         hint: "Payments & subscriptions" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-5">
        <p className="text-sm font-semibold text-white/60 mb-4">App Info</p>
        <div className="space-y-0 divide-y divide-white/5">
          {rows.map(r => (
            <div key={r.label} className="flex items-center justify-between py-3">
              <span className="text-sm text-white/40">{r.label}</span>
              <span className="text-sm text-white/70 font-medium">{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-5">
        <p className="text-sm font-semibold text-white/60 mb-4">External Dashboards</p>
        <div className="space-y-0 divide-y divide-white/5">
          {links.map(l => (
            <div key={l.label} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-white/70">{l.label}</p>
                <p className="text-xs text-white/30">{l.hint}</p>
              </div>
              <span className="text-[10px] text-white/20 bg-white/5 px-2 py-1 rounded-lg">External</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
        <p className="text-sm font-semibold text-red-400 mb-1">Admin Access</p>
        <p className="text-xs text-white/40 leading-relaxed">
          Only accounts with <code className="bg-white/10 px-1 rounded text-white/60">is_admin = true</code> in the{" "}
          <code className="bg-white/10 px-1 rounded text-white/60">profiles</code> table can access this dashboard.
          Non-admin users are redirected silently.
        </p>
      </div>
    </div>
  );
};

// ─── Root Admin Component ─────────────────────────────────────────────────────
const Admin = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [booting, setBooting] = useState(true);
  const [section, setSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/"); return; }
      const { data: prof } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();
      if (!(prof as any)?.is_admin) { navigate("/"); return; }
      setAuthed(true);
      setBooting(false);
    })();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (booting) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-bronze animate-spin" />
    </div>
  );

  if (!authed) return null;

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-56 bg-[#141414] border-r border-white/5 z-30 flex flex-col transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/5">
          <img src="/crevia-logo.png" alt="Crevia" className="w-8 h-8 rounded-full ring-1 ring-white/10 flex-shrink-0" />
          <div>
            <p className="font-vollkorn text-white font-bold text-sm leading-tight">Crevia</p>
            <p className="text-[9px] text-white/30 font-poppins uppercase tracking-widest">Admin Dashboard</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setSection(id); setSidebarOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                section === id
                  ? "bg-bronze/15 text-bronze"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-2 pb-4 pt-2 border-t border-white/5">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 lg:ml-56 min-h-screen flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-[#0f0f0f]/95 backdrop-blur border-b border-white/5 px-4 md:px-6 h-14 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-white font-semibold text-sm">{NAV.find(n => n.id === section)?.label}</h1>
              <p className="text-[10px] text-white/30 hidden sm:block">Crevia Admin · Internal only</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-bronze" />
            <span className="text-xs text-white/30">Admin</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {section === "overview"  && <OverviewSection />}
          {section === "users"     && <UsersSection />}
          {section === "billing"   && <BillingSection />}
          {section === "documents" && <DocumentsSection />}
          {section === "support"   && <SupportSection />}
          {section === "settings"  && <SettingsSection />}
        </main>
      </div>
    </div>
  );
};

export default Admin;
