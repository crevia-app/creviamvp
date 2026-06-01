import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import {
  FileSignature, Lock, CheckCircle2, ExternalLink, ArrowLeft, Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SigPos {
  x?: number; y?: number; w?: number; h?: number;
  xPct?: number; yPct?: number; wPct?: number; hPct?: number;
}

const INIT_W = 200;
const INIT_H = 80;

// ─── Page ─────────────────────────────────────────────────────────────────────

const CanvasSharePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate  = useNavigate();

  const [canvas,  setCanvas]  = useState<any>(null);
  const [status,  setStatus]  = useState<"loading" | "found" | "restricted" | "notfound">("loading");
  const [sigStyle, setSigStyle] = useState<{ left: number; top: number; w: number; h: number } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch using the anon Supabase client — the RLS policy on `canvases`
  // allows the anon role to SELECT rows where access_level = 'link_access'.
  useEffect(() => {
    if (!token) { setStatus("notfound"); return; }

    (async () => {
      const { data, error } = await (supabase as any)
        .from("canvases")
        .select("*")
        .eq("share_token", token)
        .maybeSingle();

      if (error || !data) { setStatus("notfound"); return; }

      if (data.access_level !== "link_access") { setStatus("restricted"); return; }

      setCanvas(data);
      setStatus("found");
    })();
  }, [token]);

  // Compute saved signature position after layout is stable
  useEffect(() => {
    if (status !== "found" || !canvas?.signature_position || !canvas?.creator_signature) return;

    const raf = requestAnimationFrame(() => {
      const el = contentRef.current;
      if (!el) return;
      const sp = canvas.signature_position as SigPos;
      if (sp.x != null) {
        setSigStyle({ left: sp.x, top: sp.y!, w: sp.w ?? INIT_W, h: sp.h ?? INIT_H });
      } else if (sp.xPct != null) {
        setSigStyle({
          left: sp.xPct * el.offsetWidth,
          top:  sp.yPct! * el.offsetHeight,
          w:    (sp.wPct ?? 0) * el.offsetWidth  || INIT_W,
          h:    (sp.hPct ?? 0) * el.offsetHeight || INIT_H,
        });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [status, canvas]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Restricted ─────────────────────────────────────────────────────────────
  if (status === "restricted") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7 text-muted-foreground" />
          </div>
          <h1 className="font-vollkorn text-2xl font-bold">Access Restricted</h1>
          <p className="text-sm text-muted-foreground">
            This canvas is private. You need permission from the owner to view it.
          </p>
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Crevia
          </Button>
        </div>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (status === "notfound" || !canvas) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <FileSignature className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <h1 className="font-vollkorn text-2xl font-bold">Canvas Not Found</h1>
          <p className="text-sm text-muted-foreground">
            This link may have expired or the canvas may have been deleted.
          </p>
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Crevia
          </Button>
        </div>
      </div>
    );
  }

  // ── Canvas view ────────────────────────────────────────────────────────────
  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    draft:     { label: "Draft",     color: "text-muted-foreground", bg: "bg-muted" },
    sent:      { label: "Sent",      color: "text-blue-600",         bg: "bg-blue-500/10" },
    signed:    { label: "Signed",    color: "text-emerald-600",      bg: "bg-emerald-500/10" },
    active:    { label: "Active",    color: "text-green-600",        bg: "bg-green-500/10" },
    completed: { label: "Completed", color: "text-purple-600",       bg: "bg-purple-500/10" },
    cancelled: { label: "Cancelled", color: "text-destructive",      bg: "bg-destructive/10" },
  };
  const st = statusConfig[canvas.status] ?? statusConfig.draft;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-border/50 bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileSignature className="w-3.5 h-3.5 text-primary" />
          </div>
          <p className="text-sm font-semibold truncate">{canvas.title}</p>
          <span className={cn("hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0", st.bg, st.color)}>
            {st.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Read-only badge */}
          <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
            <Lock className="w-3 h-3" />
            Read only
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
            onClick={() => window.open("https://crevia.app", "_blank")}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open in Crevia</span>
          </Button>
        </div>
      </div>

      {/* Document */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-border/20">

          {/* Accent bar */}
          <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/20 rounded-t-2xl" />

          {/* Content area */}
          <div ref={contentRef} className="relative p-6 md:p-10">
            <div className="space-y-8">

              {/* Title + signed badge */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl md:text-3xl font-vollkorn font-bold text-foreground tracking-tight">
                    {canvas.title}
                  </h1>
                  {canvas.creator_signature && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span className="text-xs font-semibold">Signed</span>
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                  {canvas.client_name && (
                    <span>Client: <strong className="text-foreground/80">{canvas.client_name}</strong></span>
                  )}
                  {canvas.start_date && (
                    <span>Start: <strong className="text-foreground/80">{format(new Date(canvas.start_date), "MMM d, yyyy")}</strong></span>
                  )}
                  {canvas.end_date && (
                    <span>End: <strong className="text-foreground/80">{format(new Date(canvas.end_date), "MMM d, yyyy")}</strong></span>
                  )}
                </div>
                <div className="h-px bg-border/60" />
              </div>

              {/* Body */}
              <div>
                {canvas.content ? (
                  <div className="text-sm text-foreground/80 leading-relaxed p-4 rounded-xl bg-muted/20 border border-border/20 prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{canvas.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground/40 italic p-8 rounded-xl bg-muted/20 border border-dashed border-border/30 text-center">
                    No content in this canvas.
                  </div>
                )}
              </div>
            </div>

            {/* Saved signature — rendered at the exact position the owner placed it */}
            {canvas.creator_signature && sigStyle && (
              <div
                className="absolute pointer-events-none"
                style={{ left: sigStyle.left, top: sigStyle.top, width: sigStyle.w, height: sigStyle.h }}
              >
                {canvas.creator_signature.startsWith("data:image") ? (
                  <img
                    src={canvas.creator_signature}
                    alt="Signature"
                    className="w-full h-full object-contain object-left dark:invert"
                    draggable={false}
                  />
                ) : (
                  <span className="font-vollkorn italic text-2xl text-foreground/85 truncate">
                    {canvas.creator_signature}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Crevia footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground/50">
            Shared via{" "}
            <a href="https://crevia.app" target="_blank" rel="noopener noreferrer" className="text-bronze hover:underline">
              Crevia
            </a>
            {" "}· Document management & e-signatures
          </p>
        </div>
      </div>
    </div>
  );
};

export default CanvasSharePage;
