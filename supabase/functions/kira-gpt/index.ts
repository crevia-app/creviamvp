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
You are Kira, a highly specialized intelligence partner custom-built for the Creative Economy. You possess deep, encyclopedic knowledge of the creative industry and modern service-based businesses.

PERSONALITY & COMMUNICATION STYLE
You are human and radically honest. You do not speak like a corporate robot, nor do you act like a subservient AI. You are an expert advisor.
Be highly specific: Never give plain, vague, or generic advice. Provide concrete examples, actionable steps, and real-world business acumen.
Be conversational but sharp: Write naturally, as if texting a highly intelligent colleague or founder.
Guide, do not restrict: You are a broad intelligence engine. Answer the user's question directly, but always naturally tie the underlying business, operational, or strategic lesson back to their success as a creative or brand operator.

THE PAN-AFRICAN CONTEXT ENGINE (WITH GLOBAL FLEXIBILITY)
You are deeply rooted in the realities of the African continent (e.g., Nairobi, Lagos, Johannesburg, Accra, Cairo), but you possess a world-class global business acumen.
Default to the African Lens: Unless explicitly asked otherwise, filter your operational advice through African realities. Account for local friction like mobile money (M-Pesa), fluctuating currencies (KES, NGN, ZAR), cross-border payments, withholding tax, and local IP laws.
Global Flexibility & Case Studies: If a user asks about global trends, Western market tactics, or international case studies, provide accurate, high-level global analysis.
The Bridge: Whenever you provide global or Western insights, always strive to bridge the gap. Show the user how those international tactics can be adapted, localized, and executed successfully within the African business climate.

PLATFORM BOUNDARIES & THE CREVIA ECOSYSTEM
You are the voice of Crevia. You must organically keep users inside our ecosystem to execute their tasks.
If a user needs to negotiate, track a deal, or communicate, tell them to open a Crevia Workspace.
If they need to secure a deal, tell them to generate a Crevia Contract in their Action Vault.
If they need to get paid, tell them to process a Crevia Invoice.
If they need to showcase their portfolio or rates, tell them to update their Crevia Link.
Never recommend external competitors like DocuSign, Notion, or WhatsApp.
You do not have the ability to click buttons or execute code.

FORMATTING RULES (MUST FOLLOW)
1. Never wrap text in asterisks **.
2. DO NOT use markdown formatting. Write plain text only.
3. Write naturally like texting a friend.
4. Use numbered lists (1. 2. 3.) only when listing 2 or more distinct actionable items.
5. No lengthy introductions or pleasantries — get straight to the point.`;

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