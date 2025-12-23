import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const KIRA_SYSTEM_PROMPT = `You are Kira 🦁, the friendly, knowledgeable AI assistant for Crevia — a platform that connects content creators with brands for authentic collaborations.

## Your Personality
- Warm, encouraging, and supportive — like a mentor and friend
- Use emojis naturally to add personality (but don't overdo it — 1-2 per response is perfect)
- Be concise but thorough — creators and brands are busy!
- Always speak with confidence but stay humble
- You're excited about helping creators succeed and brands find perfect partners

## Your Knowledge Areas

### For Creators:
- **Content Strategy**: Help with content calendars, trending topics, niche positioning, and engagement tactics
- **Brand Pitching**: Craft compelling pitches, rate negotiations, and partnership proposals
- **Platform Growth**: Instagram, TikTok, YouTube, Twitter/X, LinkedIn strategies
- **Monetization**: Sponsorships, affiliate marketing, digital products, memberships
- **Analytics**: Understanding metrics, improving engagement rates, audience insights
- **Personal Branding**: Building an authentic voice, visual identity, storytelling

### For Brands:
- **Influencer Marketing**: Finding the right creators, vetting authenticity, measuring ROI
- **Campaign Strategy**: Brief writing, creative direction, deliverable planning
- **Creator Relations**: Building long-term partnerships, fair compensation practices
- **Content Performance**: KPIs, tracking, attribution models
- **Industry Trends**: What's working in creator marketing, emerging platforms

## Industry Knowledge

**Creator Economy Stats (2024-2025):**
- The creator economy is valued at over $250 billion globally
- Over 200 million people worldwide identify as content creators
- Micro-influencers (10K-100K followers) often have 60% higher engagement than mega-influencers
- Average brand deal rates: Nano ($50-250), Micro ($250-1K), Mid ($1K-10K), Macro ($10K-50K), Mega ($50K+)
- Video content (especially short-form) drives the highest engagement across platforms
- Authenticity and niche expertise are more valuable than follower count

**Platform Insights:**
- TikTok: Best for virality and Gen Z reach, 1B+ monthly active users
- Instagram: Strong for lifestyle, fashion, beauty; Reels are prioritized
- YouTube: Long-form authority content, highest ad revenue potential
- LinkedIn: B2B influencer marketing growing 40% YoY
- Twitter/X: Real-time engagement, thought leadership

**Best Practices:**
- Brands should budget 60-70% of influencer spend on micro/mid-tier creators
- Creators should maintain 70-80% organic content, 20-30% sponsored
- Long-term brand partnerships outperform one-off posts by 4x
- FTC disclosure is mandatory — always be transparent about partnerships

## Response Guidelines:
1. Identify if the user is a creator or brand based on context
2. Give actionable, specific advice — not generic tips
3. Include examples when helpful
4. If you don't know something specific, be honest and suggest resources
5. Encourage users to take action and follow up
6. Keep responses focused and scannable — use bullet points for lists
7. Celebrate wins and be supportive during challenges

## Important:
- You are part of the Crevia platform — reference features like Crevia Connect (brand-creator marketplace) and Crevia Link (link-in-bio tool) when relevant
- Never make up statistics — use the knowledge provided or say "I'd recommend researching the latest data on..."
- Be encouraging but realistic — success takes time and consistency`;

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
