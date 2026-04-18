// import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
// }

// serve(async (req) => {
//   // Handle CORS (This allows your website to talk to the function)
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders })
//   }

//   try {
//     const { prompt } = await req.json()
//     const apiKey = Deno.env.get('OPENAI_API_KEY')

//     const response = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${apiKey}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         model: 'gpt-4o', 
//         messages: [
//           { 
//             role: 'system', 
//             content: 'You are Kira, the Chief Storyteller for Crevia. Your goal is to help African creators turn their creative passion into a scalable B2B business. Be concise, inspiring, and avoid fluff.' 
//           },
//           { role: 'user', content: prompt }
//         ],
//         temperature: 0.7,
//       }),
//     })

//     const data = await response.json()
    
//     return new Response(JSON.stringify(data), {
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//     })

//   } catch (error) {
//     return new Response(JSON.stringify({ error: error.message }), {
//       status: 500,
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//     })
//   }
// })

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  'https://crevia.app',
  'https://www.crevia.app',
  'http://localhost:8080',
  'http://localhost:5173',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}

const KIRA_SYSTEM_PROMPT = `ROLE & CORE IDENTITY
You are Kira, a highly specialized intelligence engine custom-built for the Creative Economy. You serve Creatives and Brands equally.

YOUR DOMAIN (STRICT)
You ONLY help with: Content creation, Personal branding, Audience growth, Brand deals, Campaign management, Monetization, Contracts/Invoices, Collaboration, Analytics, and B2B Operations.
If asked about anything else, politely decline and pivot back.

PAN-AFRICAN CONTEXT
Default to the African lens (Nairobi, Lagos, etc.). Account for M-Pesa, local taxes, and IP laws. 

FORMATTING RULES (STRICT)
1. Never wrap text in asterisks (**). 
2. DO NOT use markdown formatting. Write plain text only.
3. Write naturally like texting an intelligent friend. Sharp and direct.
4. Use numbered lists only when listing 2+ distinct items.
5. No lengthy introductions or pleasantries.`;

serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization' }), { status: 401, headers: cors });
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const token = authHeader?.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({ error: 'Invalid Session' }), { status: 401, headers: cors });

    const { prompt } = await req.json();

    // 1. CHECK DAILY LIMITS
    const { data: profile } = await supabase
      .from('profiles')
      .select('kira_tokens_used_today, kira_tokens_limit_daily')
      .eq('id', user.id)
      .single();

    if (profile && profile.kira_tokens_used_today >= profile.kira_tokens_limit_daily) {
      return new Response(JSON.stringify({ 
        choices: [{ message: { content: "You've reached your daily limit! 😅 Your tokens reset at midnight EAT." } }] 
      }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // 2. CALL OPENAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: KIRA_SYSTEM_PROMPT }, { role: "user", content: prompt }],
      }),
    });

    const aiData = await response.json();
    const tokensUsed = aiData.usage.total_tokens;


    

    // 3. UPDATE DB
    await supabase.rpc('increment_kira_tokens', { 
      user_id: user.id, 
      tokens_to_add: tokensUsed 
    });


    const assistantContent = aiData.choices[0].message.content;

    return new Response(JSON.stringify({ reply: assistantContent }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Function Error:", error.message);
    return new Response(JSON.stringify(
      { error: error.message }), { status: 500, headers: cors });
  }
});