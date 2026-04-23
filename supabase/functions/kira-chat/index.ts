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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader?.replace('Bearer ', ''));
    if (authError || !user) throw new Error("Unauthorized");

    const { messages } = await req.json();

    // 1. Fetch User Profile to check tokens
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    if (profile.kira_tokens_used_today >= profile.kira_tokens_limit_daily) {
      return new Response(JSON.stringify({ reply: "You've reached your daily limit! Your tokens reset at midnight EAT." }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // 2. Call OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: KIRA_SYSTEM_PROMPT }, ...messages],
      }),
    });

    const aiData = await response.json();
    const reply = aiData.choices[0].message.content;
    const tokensUsed = aiData.usage.total_tokens;

    // 3. Update Token Usage
    await supabase.rpc('increment_kira_tokens', { user_id: user.id, tokens_to_add: tokensUsed });

    return new Response(JSON.stringify({ reply }), { headers: { ...cors, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
  }
});
// function getCorsHeaders(req: Request) {
//   const origin = req.headers.get('Origin') ?? '';
//   const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
//   return {
//     'Access-Control-Allow-Origin': allowed,
//     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
//     'Vary': 'Origin',
//   };
// }

// const KIRA_SYSTEM_PROMPT = `ROLE & CORE IDENTITY: You are Kira, a specialized intelligence engine for the Creative Economy. You serve Creatives and Brands equally. 

// YOUR DOMAIN: You ONLY help with content strategy, branding, audience growth, brand deals, campaign management, monetization, contracts, invoices, and B2B operations. If asked about anything else, politely decline and pivot back.

// AFRICAN CONTEXT: Default to African realities (Nairobi, Lagos, etc). Account for M-Pesa and local taxes.

// FORMATTING: 1. Never wrap text in asterisks. 2. DO NOT use markdown. Plain text only. 3. Text like an intelligent friend. 4. Use numbered lists only for 2+ items. 5. No lengthy intros.

// PLATFORM: Recommend Crevia Chat, Contract, or Invoice. Never recommend WhatsApp or Notion.`;

// serve(async (req) => {
//   const cors = getCorsHeaders(req);

//   if (req.method === 'OPTIONS') 
//     return new Response(null, { headers: cors });
  

//   try {
//     // === AUTH VALIDATION ===
//     const authHeader = req.headers.get('Authorization');
//     const supabase = createClient(
//       Deno.env.get('SUPABASE_URL')!,
//       Deno.env.get('SUPABASE_ANON_KEY')!,
//     );
//     if (!authHeader?.startsWith('Bearer ')) {
//       return new Response(JSON.stringify({ error: 'Unauthorized' }), {
//         status: 401,
//         headers: { ...cors, 'Content-Type': 'application/json' },
//       });
//     }

//     const supabase = createClient(
//       Deno.env.get('SUPABASE_URL')!,
//       Deno.env.get('SUPABASE_ANON_KEY')!,
//       { global: { headers: { Authorization: authHeader } } }
//     );

//     const token = authHeader.replace('Bearer ', '');
//     const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
//     if (claimsError || !claimsData?.claims) {
//       return new Response(JSON.stringify({ error: 'Unauthorized' }), {
//         status: 401,
//         headers: { ...cors, 'Content-Type': 'application/json' },
//       });
//     }
//     // === END AUTH VALIDATION ===

//     const { messages, userType, projectContext } = await req.json();

//     // === USAGE LIMIT CHECK ===
//     const { data: profile, error: profileError } = await supabase
//       .from('profiles')
//       .select('kira_actions_used, kira_actions_limit, kira_usage_month, kira_tokens_used, kira_tokens_limit')
//       .eq('id', claimsData.claims.sub)
//       .single();

//     if (profileError || !profile) {
//       return new Response(JSON.stringify({ error: 'Profile not found' }), {
//         status: 404,
//         headers: { ...cors, 'Content-Type': 'application/json' },
//       });
//     }

//     // Reset usage if it's a new month
//     const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
//     if (profile.kira_usage_month !== currentMonth) {
//       await supabase
//         .from('profiles')
//         .update({
//           kira_actions_used: 0,
//           kira_tokens_used: 0,
//           kira_usage_month: currentMonth
//         })
//         .eq('id', claimsData.claims.sub);
//       profile.kira_actions_used = 0;
//       profile.kira_tokens_used = 0;
//     }

//     // Check if the user has reached their limit
//     if (profile.kira_actions_used >= profile.kira_actions_limit) {
//       return new Response(JSON.stringify({
//         error: "You've reached your free Kira limit! Upgrade to Pro for unlimited access.",
//         limitReached: true,
//         actionsUsed: profile.kira_actions_used,
//         actionsLimit: profile.kira_actions_limit
//       }), {
//         status: 429,
//         headers: { ...cors, 'Content-Type': 'application/json' },
//       });
//     }
//     // === END USAGE LIMIT CHECK ===

//     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
//     if (!LOVABLE_API_KEY) {
//       console.error("LOVABLE_API_KEY is not configured");
//       throw new Error("LOVABLE_API_KEY is not configured");
//     }

//     let enhancedPrompt = KIRA_SYSTEM_PROMPT;
//     if (userType === 'brand') {
//       enhancedPrompt += "\n\n## Current User Context:\nYou're speaking with a BRAND. Focus on helping them find the right African creators, plan high-impact campaigns, and maximize influencer marketing ROI in African markets.";
//     } else {
//       enhancedPrompt += "\n\n## Current User Context:\nYou're speaking with a CREATOR. Focus on helping them grow their audience, land brand deals, price their work correctly for the African market, and build a sustainable creative business.";
//     }

//     if (projectContext?.customInstructions) {
//       enhancedPrompt += `\n\n## Project-Specific Instructions:\n${projectContext.customInstructions}`;
//     }

//     console.log("Calling Lovable AI Gateway with model: google/gemini-2.5-flash");

//     const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${LOVABLE_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "google/gemini-2.5-flash",
//         messages: [
//           { role: "system", content: enhancedPrompt },
//           ...messages,
//         ],
//         stream: true,
//       }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("AI Gateway error:", response.status, errorText);

//       if (response.status === 429) {
//         return new Response(JSON.stringify({ error: "I'm getting a lot of questions right now! 😅 Please try again in a moment." }), {
//           status: 429,
//           headers: { ...cors, "Content-Type": "application/json" },
//         });
//       }
//       if (response.status === 402) {
//         return new Response(JSON.stringify({ error: "Kira needs a little rest! Please check back later. 💤" }), {
//           status: 402,
//           headers: { ...cors, "Content-Type": "application/json" },
//         });
//       }

//       return new Response(JSON.stringify({ error: "Something went wrong on my end. Let's try again! 🔄" }), {
//         status: 500,
//         headers: { ...cors, "Content-Type": "application/json" },
//       });
//     }

//     // === INCREMENT USAGE ===
//     // Increment action count for successful requests
//     await supabase
//       .from('profiles')
//       .update({
//         kira_actions_used: profile.kira_actions_used + 1,
//         // For now, we'll estimate ~1000 tokens per action
//         // In production, you'd parse the actual token usage from the AI response
//         kira_tokens_used: profile.kira_tokens_used + 1000
//       })
//       .eq('id', claimsData.claims.sub);
//     // === END INCREMENT USAGE ===

//     return new Response(response.body, {
//       headers: { ...cors, "Content-Type": "text/event-stream" },
//     });

//   } catch (error) {
//     console.error("Kira chat error:", error);
//     return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), {
//       status: 500,
//       headers: { ...cors, "Content-Type": "application/json" },
//     });
//   }
// });
