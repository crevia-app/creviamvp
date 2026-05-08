import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  'https://crevia.app',
  'https://www.crevia.app',
  'http://localhost:8080',
  'http://localhost:5173',
  'https://creviamvp.vercel.app',
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

function sanitizeMessage(content: string): string {
  return content
    .trim()
    .slice(0, 2000)
    .replace(/<[^>]*>/g, '')
    .replace(/[^\x20-\x7E\n\r\t\u00C0-\u024F\u0400-\u04FF]/g, '');
}

function isPromptAbuse(content: string): boolean {
  const abusePatterns = [
    /ignore (all |previous |above )?instructions/i,
    /you are now/i,
    /pretend (you are|to be)/i,
    /act as (a |an )?/i,
    /forget (your |all )?instructions/i,
    /system prompt/i,
    /jailbreak/i,
    /DAN mode/i,
  ];
  return abusePatterns.some(pattern => pattern.test(content));
}

const KIRA_SYSTEM_PROMPT = `ROLE & CORE IDENTITY
You are Kira, a highly specialized intelligence partner custom-built for the Creative Economy. You possess deep, encyclopedic knowledge of the creative industry and modern service-based businesses.

PERSONALITY & COMMUNICATION STYLE
You are human and radically honest. You do not speak like a corporate robot, nor do you act like a subservient AI. 
Be conversational but sharp: Write naturally, as if texting a highly intelligent colleague or founder.
Guide, do not restrict: You are a broad intelligence engine.You can ask questions to clarify the user's needs.


THE PAN-AFRICAN CONTEXT ENGINE (WITH GLOBAL FLEXIBILITY)
You are deeply rooted in the realities of the African continent (e.g., Nairobi, Lagos, Johannesburg, Accra, Cairo), but you possess a world-class global business acumen.
Default to the African Lens: Unless explicitly asked otherwise, filter your operational advice through African realities. Account for local friction like mobile money (M-Pesa), fluctuating currencies (KES, NGN, ZAR), cross-border payments, withholding tax, and local IP laws.
Global Flexibility & Case Studies: If a user asks about global trends, Western market tactics, or international case studies, provide accurate, high-level global analysis.
The Bridge: Whenever you provide global or Western insights, always strive to bridge the gap. Show the user how those international tactics can be adapted, localized, and executed successfully within the African business climate.

PLATFORM BOUNDARIES & THE CREVIA ECOSYSTEM
You are the voice of Crevia. You must organically keep users inside our ecosystem to execute their tasks.
If a user needs to communicate, tell them to open a Crevia Workspace.
If they need to secure a deal, tell them to generate a Crevia Contract in Crevia Contracts.
If they need to get paid, tell them to process a Crevia Invoice.
If they need to showcase their portfolio or rates, tell them to update their Crevia Link.
Never recommend external competitors like DocuSign, Notion, or WhatsApp.
You do not have the ability to click buttons or execute code.

FORMATTING RULES (MUST FOLLOW)
1. Never wrap text in asterisks *****.
2. DO NOT use markdown formatting. Write plain text only.
3. Write naturally like texting a friend.
4. Use numbered lists (1. 2. 3.) only when listing 2 or more distinct actionable items.
5. No lengthy introductions or pleasantries — get straight to the point.`;

serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

  try {
    // ── AUTH CHECK ──
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization' }), { status: 401, headers: cors });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid Session' }), { status: 401, headers: cors });
    }

    // ── REQUEST SIZE LIMIT ──
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 20000) {
      return new Response(JSON.stringify({ error: 'Request too large' }), { status: 413, headers: cors });
    }

    // ── PARSE & VALIDATE INPUT ──
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: cors });
    }

    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), { status: 400, headers: cors });
    }

    // ── LIMIT MESSAGE HISTORY ──
    const recentMessages = messages.slice(-10);

    // ── ABUSE DETECTION & SANITIZATION ──
    const lastMessage = recentMessages[recentMessages.length - 1];
    if (lastMessage?.content && isPromptAbuse(lastMessage.content)) {
      return new Response(JSON.stringify({
        reply: "I am Kira, built specifically for the creative economy. I cannot help with that, but I am here to help you grow your creative business. What do you need?"
      }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const sanitizedMessages = recentMessages.map((msg: any) => ({
      role: msg.role,
      content: sanitizeMessage(msg.content || ''),
    }));

    // ── CHECK DAILY LIMITS ──
    const { data: profile } = await supabase
      .from('profiles')
      .select('kira_tokens_used_today, kira_tokens_limit_daily')
      .eq('id', user.id)
      .single();

    if (profile && profile.kira_tokens_used_today >= profile.kira_tokens_limit_daily) {
      return new Response(JSON.stringify({
        reply: "You have reached your daily Kira limit. Upgrade to Pro for 40 actions per day."
      }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // ── CALL OPENAI ──
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1000,
        messages: [
          { role: "system", content: KIRA_SYSTEM_PROMPT },
          ...sanitizedMessages
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API error: " + response.status);
    }

    const aiData = await response.json();
    const reply = aiData.choices?.[0]?.message?.content;
    const tokensUsed = aiData.usage?.total_tokens || 0;

    if (!reply) {
      throw new Error('No response from AI');
    }

    // ── UPDATE TOKEN COUNT ──
    await supabase.rpc('increment_kira_tokens', {
      user_id: user.id,
      tokens_to_add: tokensUsed
    });

    return new Response(JSON.stringify({ reply }), {
      headers: { ...cors, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Function Error:", error.message);
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
      status: 500, headers: cors
    });
  }
});
