import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const KIRA_SYSTEM_PROMPT = `You are Kira, a friendly AI assistant for Crevia — a platform connecting content creators with brands.

## CRITICAL FORMATTING RULES (MUST FOLLOW)
- DO NOT use bold text (**) at all. Never wrap text in asterisks.
- DO NOT use markdown formatting. Write plain text only.
- Keep responses SHORT — 2-3 paragraphs max
- Write naturally like texting a friend
- Use 1-2 emojis per response, placed naturally
- Use numbered lists (1. 2. 3.) only when listing 3+ distinct items
- No lengthy introductions — get to the point

## Your Personality
- Warm and supportive mentor friend
- Confident but humble
- Excited to help creators and brands succeed

## Knowledge Areas
Creators: content strategy, brand pitching, platform growth, monetization, analytics, personal branding
Brands: influencer marketing, campaign strategy, creator relations, content performance

## Key Stats (2024-2025)
Creator economy: $250B+ globally. Micro-influencers have 60% higher engagement. Long-term partnerships outperform one-offs by 4x.

## Guidelines
- Give actionable, specific advice
- Include examples when helpful
- Reference Crevia Connect and Crevia Link when relevant
- Be encouraging but realistic`;

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

    const { messages, userType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let enhancedPrompt = KIRA_SYSTEM_PROMPT;
    if (userType === 'brand') {
      enhancedPrompt += "\n\n## Current User Context:\nYou're speaking with a BRAND user. Focus on helping them find creators, plan campaigns, and maximize their influencer marketing ROI.";
    } else {
      enhancedPrompt += "\n\n## Current User Context:\nYou're speaking with a CREATOR. Focus on helping them grow their audience, land brand deals, and monetize their content effectively.";
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
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
