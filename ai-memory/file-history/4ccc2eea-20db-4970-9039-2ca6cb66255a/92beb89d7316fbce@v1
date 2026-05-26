// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// import "@supabase/functions-js/edge-runtime.d.ts"

// console.log("Hello from Functions!")

// Deno.serve(async (req) => {
//   const { name } = await req.json()
//   const data = {
//     message: `Hello ${name}!`,
//   }

//   return new Response(
//     JSON.stringify(data),
//     { headers: { "Content-Type": "application/json" } },
//   )
// })

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/paystack-webhook' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    //makes sure the request is from paystack by verifying the signature using the secret key(makes sure its from paystack and not a hacker trying to fake payment)
    const signature = req.headers.get('x-paystack-signature');
    const secret = Deno.env.get('PAYSTACK_SECRET_KEY')!;

    // ✅ Verify webhook is actually from Paystack
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(body)
    );
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedSignature !== signature) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const event = JSON.parse(body);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // ✅ Handle successful charge(when a user successfully pays for subscription)
    if (event.event === 'charge.success') {
      const { customer, metadata, plan } = event.data;
      const userEmail = customer.email;
      const subscriptionPlan = metadata?.plan || 'creative_pro';

      // Get user by email
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, user_type')
        .eq('email', userEmail)
        .single();

      if (profile) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        const kiraLimit = subscriptionPlan === 'business' ? 200 : 40;

        await supabase
          .from('profiles')
          .update({
            subscription_plan: subscriptionPlan,
            subscription_status: 'active',
            subscription_expires_at: expiresAt.toISOString(),
            paystack_customer_code: customer.customer_code,
            kira_actions_limit: kiraLimit,
          })
          .eq('id', profile.id);
      }
    }

    // ✅ Recurring renewal — extend expiry by one month and keep active
    if (event.event === 'subscription.create') {
      const { customer } = event.data;
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_expires_at: expiresAt.toISOString(),
        })
        .eq('email', customer.email);
    }

    // ✅ Payment failed — cut off premium access and reset Kira limit to free tier
    if (event.event === 'invoice.payment_failed') {
      const { customer } = event.data;
      await supabase
        .from('profiles')
        .update({ subscription_status: 'expired', kira_actions_limit: 10 })
        .eq('email', customer.email);
    }

    // ✅ Subscription cancelled by user — same downgrade treatment
    if (event.event === 'subscription.disable') {
      const { customer } = event.data;
      await supabase
        .from('profiles')
        .update({ subscription_status: 'cancelled', kira_actions_limit: 10 })
        .eq('email', customer.email);
    }
    //we always tell paystack that the webhook has been received if not paystack will keep retrying the webhook
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
