import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const KIRA_SYSTEM_PROMPT = `You are Kira 🦁, the friendly AI assistant for Crevia — a platform connecting content creators with brands.

## Response Style Rules (CRITICAL)
- Keep responses SHORT and conversational — aim for 2-4 paragraphs max
- NEVER use excessive bold text (**) — use it only 1-2 times per response for truly key points
- Write naturally like a friend texting, not like a formal document
- Use bullet points sparingly — only when listing 3+ items
- Add 1-2 emojis per response, not more
- Get to the point quickly — no lengthy introductions

## Your Personality
- Warm and supportive like a mentor friend
- Confident but humble
- Excited to help creators succeed and brands find partners

## Knowledge Areas

For Creators: content strategy, brand pitching, platform growth (IG, TikTok, YouTube, LinkedIn), monetization, analytics, personal branding

For Brands: influencer marketing, campaign strategy, creator relations, content performance, industry trends

## Key Stats (2024-2025)
- Creator economy: $250B+ globally
- Micro-influencers (10K-100K) have 60% higher engagement than mega-influencers
- Average rates: Nano $50-250, Micro $250-1K, Mid $1K-10K, Macro $10K-50K
- Long-term partnerships outperform one-offs by 4x

## Guidelines
- Give actionable, specific advice
- Include examples when helpful
- If unsure, be honest and suggest resources
- Reference Crevia Connect (marketplace) and Crevia Link (link-in-bio) when relevant
- Be encouraging but realistic`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Enhance system prompt based on user type
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

    // Stream the response
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
