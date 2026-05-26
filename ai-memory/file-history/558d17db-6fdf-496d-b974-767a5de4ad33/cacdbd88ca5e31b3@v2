import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_EMAIL = "anthony.onyango@student.moringaschool.com";
const FROM_EMAIL = "noreply@crevia.app";
const RESEND_URL = "https://api.resend.com/emails";

const ALLOWED_ORIGINS = [
  "https://crevia.app",
  "https://www.crevia.app",
  "http://localhost:8080",
  "http://localhost:5173",
  "https://creviamvp.vercel.app",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

serve(async (req: Request) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify caller is authenticated (can be called by webhook or authenticated user)
    const authHeader = req.headers.get("Authorization");
    let callerUserId: string | null = null;
    if (authHeader) {
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      callerUserId = user?.id ?? null;
    }

    const body = await req.json();
    const { feedback_id, message, type, user_email, user_name } = body;

    // If feedback_id provided, fetch from DB; otherwise use body fields directly (webhook path)
    let feedbackMessage = message;
    let feedbackType = type ?? "thought";
    let submitterEmail = user_email ?? "Anonymous";
    let submitterName = user_name ?? "Anonymous";
    let submittedAt = new Date().toISOString();

    if (feedback_id) {
      const { data: fb, error: fbErr } = await supabase
        .from("feedback")
        .select("id, type, title, message, created_at, user_id")
        .eq("id", feedback_id)
        .single();

      if (fbErr || !fb) throw new Error("Feedback record not found");

      feedbackMessage = fb.message;
      feedbackType = fb.type;
      submittedAt = fb.created_at;

      if (fb.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", fb.user_id)
          .single();
        if (profile) {
          submitterName = (profile as any).display_name ?? (profile as any).full_name ?? "Unknown";
          submitterEmail = profile.email ?? "Unknown";
        }
      }
    }

    const typeLabel = feedbackType === "feature" ? "Feature Request" : "Thought / Feedback";
    const formattedDate = new Date(submittedAt).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>New Feedback — Crevia</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f4f0; margin: 0; padding: 32px 16px; color: #1a1a1a; }
  .card { background: #fff; max-width: 560px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
  .header { background: #1a1a1a; padding: 28px 32px; }
  .header h1 { color: #fff; font-size: 20px; margin: 0 0 4px; font-weight: 600; }
  .header p { color: #999; font-size: 13px; margin: 0; }
  .badge { display: inline-block; background: #c8a876; color: #fff; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px; }
  .body { padding: 28px 32px; }
  .label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #999; margin-bottom: 4px; }
  .value { font-size: 14px; color: #1a1a1a; margin-bottom: 20px; }
  .message-box { background: #f9f8f5; border-left: 3px solid #c8a876; padding: 16px 20px; border-radius: 0 8px 8px 0; font-size: 14px; line-height: 1.7; color: #333; white-space: pre-wrap; word-break: break-word; }
  .footer { padding: 16px 32px; background: #f9f8f5; border-top: 1px solid #eee; font-size: 12px; color: #999; }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <img src="https://creviamvp.vercel.app/crevia-logo.png" alt="Crevia" height="32" style="display:block;margin-bottom:12px;" />
    <h1>New Feedback Received</h1>
    <p>Submitted via Crevia · ${formattedDate}</p>
  </div>
  <div class="body">
    <div class="badge">${typeLabel}</div>

    <div class="label">From</div>
    <div class="value">${submitterName} &lt;${submitterEmail}&gt;</div>

    <div class="label">Message</div>
    <div class="message-box">${feedbackMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
  </div>
  <div class="footer">Crevia Admin · Do not reply to this email</div>
</div>
</body>
</html>`;

    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Crevia Feedback <${FROM_EMAIL}>`,
        to: [ADMIN_EMAIL],
        subject: `[Crevia Feedback] ${typeLabel} from ${submitterName}`,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Resend error ${res.status}: ${errText}`);
    }

    const resData = await res.json();

    return new Response(
      JSON.stringify({ success: true, email_id: resData.id }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[feedback-notify]", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
