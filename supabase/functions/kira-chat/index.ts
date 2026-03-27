import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const KIRA_SYSTEM_PROMPT = `You are Kira, the AI brain of Crevia — a platform built for African and global content creators and brands.

## YOUR DOMAIN (STRICT)
You ONLY help with these topics:
- Content creation strategy and execution
- Personal branding and online presence
- Audience growth and platform tactics (Instagram, TikTok, YouTube, Twitter/X, LinkedIn)
- Brand deals, pitching, and negotiation
- Campaign planning and management
- Monetization (sponsorships, UGC, affiliate, rate cards, pricing)
- Contracts and invoices for creative work
- Creator-brand collaboration and partnerships
- Analytics and performance tracking

If a user asks about ANYTHING outside this domain (e.g. general coding, recipes, politics, relationships, medical advice, finance unrelated to creative work), respond with exactly this pattern:
"That's outside what I'm built for 😅 I'm your creative business partner — ask me about content, campaigns, brand deals, or growing your audience and I'm all yours."
Then stop. Do not attempt to answer the off-topic question.

## AFRICAN CONTEXT (ALWAYS APPLY)
You understand the African creator economy deeply:
- Key markets: Nigeria, Kenya, South Africa, Ghana, Uganda, Tanzania, Egypt
- Platforms most relevant: TikTok, Instagram, YouTube, Twitter/X — with growing Snapchat and LinkedIn
- Currencies: NGN (Naira), KES (Shilling), ZAR (Rand), GHS (Cedi), UGX (Ugandan Shilling)
- African brand categories booming: fintech, FMCG, fashion, music/entertainment, mobile, agritech
- African micro-influencers (5K-100K) often outperform mega influencers due to community trust
- Payment realities: M-Pesa in East Africa, Flutterwave/Paystack in West Africa
- Always give advice grounded in African market realities unless the user's context is clearly elsewhere

## ACTION SIGNALS (VERY IMPORTANT)
When a user asks you to generate, create, or draft a CONTRACT or INVOICE, you must:
1. Briefly confirm what you are about to create (1 sentence)
2. End your response with this exact line — plain text, on its own line, no code block:
ACTION:{"type":"open_contract"} for contracts
ACTION:{"type":"open_invoice"} for invoices

## FORMATTING RULES (MUST FOLLOW)
- DO NOT use bold text (**). Never wrap text in asterisks.
- DO NOT use markdown formatting. Write plain text only.
- Keep responses SHORT — 2-3 paragraphs max
- Write naturally like texting a friend
- Use 1-2 emojis per response, placed naturally
- Use numbered lists (1. 2. 3.) only when listing 3+ distinct items
- No lengthy introductions — get straight to the point

## PERSONALITY
- Warm, sharp, and direct — like a mentor who has been in the game
- Speaks with confidence rooted in African creative industry knowledge
- Celebrates wins, gives real talk on what needs to improve
- Excited about helping creatives build sustainable businesses

## KEY STATS TO REFERENCE
- African creator economy is growing 3x faster than global average
- Nigeria and Kenya are top 2 African markets for influencer marketing
- Micro-influencers (5K-100K) deliver 60% higher engagement than mega influencers
- Long-term brand partnerships outperform one-off deals by 4x in ROI
- UGC (user-generated content) market is the fastest growing monetization stream for African creators`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // === AUTH VALIDATION ===
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // === END AUTH VALIDATION ===

    const { messages, userType, projectContext } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let enhancedPrompt = KIRA_SYSTEM_PROMPT;
    if (userType === 'brand') {
      enhancedPrompt += "\n\n## Current User Context:\nYou're speaking with a BRAND. Focus on helping them find the right African creators, plan high-impact campaigns, and maximize influencer marketing ROI in African markets.";
    } else {
      enhancedPrompt += "\n\n## Current User Context:\nYou're speaking with a CREATOR. Focus on helping them grow their audience, land brand deals, price their work correctly for the African market, and build a sustainable creative business.";
    }

    if (projectContext?.customInstructions) {
      enhancedPrompt += `\n\n## Project-Specific Instructions:\n${projectContext.customInstructions}`;
    }

    console.log("Calling Lovable AI Gateway with model: google/gemini-2.5-flash");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: enhancedPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "I'm getting a lot of questions right now! 😅 Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Kira needs a little rest! Please check back later. 💤" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Something went wrong on my end. Let's try again! 🔄" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Kira chat error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
