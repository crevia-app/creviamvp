import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the calling user
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) throw new Error("Unauthorized");

    // Rate limit: 3 requests per day per user
    const { data: rlAllowed } = await supabase.rpc("check_rate_limit", {
      p_user_id: user.id,
      p_endpoint: "cancel-subscription",
      p_limit: 3,
      p_window_secs: 86400,
    });
    if (!rlAllowed) {
      supabase.rpc("log_security_event", { p_event_type: "rate_limit", p_user_id: user.id, p_endpoint: "cancel-subscription", p_detail: "Daily limit exceeded" }).catch(() => {});
      console.warn(`[security] rate_limit endpoint=cancel-subscription user=${user.id}`);
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch subscription identifiers
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("subscription_code, subscription_email_token, subscription_plan, subscription_status")
      .eq("id", user.id)
      .single();

    if (profErr || !profile) throw new Error("Profile not found");

    const { subscription_code, subscription_email_token, subscription_plan, subscription_status } = profile as any;

    if (!subscription_code || !subscription_email_token) {
      throw new Error("No active subscription found to cancel");
    }

    if (subscription_status === "cancelled") {
      throw new Error("Subscription is already cancelled");
    }

    // Call Paystack to disable the subscription
    const paystackRes = await fetch("https://api.paystack.co/subscription/disable", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code:  subscription_code,
        token: subscription_email_token,
      }),
    });

    const paystackData = await paystackRes.json();
    if (!paystackRes.ok || !paystackData.status) {
      throw new Error(paystackData.message ?? "Paystack cancellation failed");
    }

    // Mark as cancelled locally — access continues until subscription_expires_at
    await supabase
      .from("profiles")
      .update({ subscription_status: "cancelled" })
      .eq("id", user.id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
