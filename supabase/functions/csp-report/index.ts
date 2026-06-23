import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CSP violation reports are POSTed by the browser directly — no user auth involved.
// We write to security_events using the service role key so no RLS applies.

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(null, { status: 405 });
  }

  try {
    const body = await req.json();
    const report = body?.["csp-report"];

    if (!report) {
      return new Response(null, { status: 204 });
    }

    const blockedUri       = String(report["blocked-uri"] ?? "unknown").slice(0, 500);
    const violatedDir      = String(report["violated-directive"] ?? "unknown").slice(0, 200);
    const documentUri      = String(report["document-uri"] ?? "").slice(0, 500);
    const sourceFile       = String(report["source-file"] ?? "").slice(0, 500);
    const lineNumber       = report["line-number"] ?? null;

    const detail = JSON.stringify({
      blocked_uri:         blockedUri,
      violated_directive:  violatedDir,
      document_uri:        documentUri,
      source_file:         sourceFile,
      line_number:         lineNumber,
    });

    const ip =
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    await supabase.rpc("log_security_event", {
      p_event_type: "csp_violation",
      p_user_id:    null,
      p_ip_address: ip,
      p_endpoint:   violatedDir,
      p_detail:     detail,
    });
  } catch {
    // Never error back to the browser — a 4xx/5xx causes some browsers to retry endlessly
  }

  return new Response(null, { status: 204 });
});
