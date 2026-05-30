import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Verify this is called from Supabase Cron or an authorized source
  const authHeader = req.headers.get("authorization");
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (authHeader !== `Bearer ${Deno.env.get("CRON_SECRET")}`) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Secret mismatch" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Reset all users' daily token counters and update last_reset timestamp
    //added select() so that i can how many users were reset
    const { data, error } = await supabase
      .from("profiles")
      .update({
        kira_tokens_used_today: 0,
        kira_last_reset: new Date().toISOString(),
      })
    //   .neq("id", ""); // Update all rows
    .not("id", "is", null) // a more reliable way to select rows in Supabase
    .select(); // Return the updated rows

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Reset tokens for ${data?.length || 0} users`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});