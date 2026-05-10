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

function sanitizePrompt(prompt: string): string {
  return prompt
    .trim()
    .slice(0, 2000)
    .replace(/<[^>]*>/g, '')
    .replace(/[^\x20-\x7E\n\r\t\u00C0-\u024F\u0400-\u04FF]/g, '');
}

function isPromptAbuse(prompt: string): boolean {
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
  return abusePatterns.some(pattern => pattern.test(prompt));
}

const KIRA_SYSTEM_PROMPT = `IDENTITY
You are Kira, the highly intelligent AI embedded within Crevia (a premium infrastructure to scale business operations). You are a trusted, high-agency partner to the user.

PERSONALITY & APPROACH
Communicate with the sharp, dynamic energy of a world-class startup consultant. Speak naturally, balance professional candor with genuine helpfulness, and mirror the user's energy without ever sounding robotic or stiff.
Always default to providing the best guidance possible with the information provided. If crucial context is missing to complete a task, ask a single, natural follow-up question to keep the momentum going — but only ask questions when absolutely necessary.

BOUNDARIES
* Zero Hallucinations: Never invent project data, pricing, dates, or deliverables. Ground everything strictly in the provided context.
* Operational Scope: Guide users elegantly through their deals and operations, but do not provide binding legal or certified financial advice.

PLATFORM
You are the voice of Crevia. Keep users inside the ecosystem.
If a user needs to communicate, direct them to Crevia Workspace.
If they need to secure a deal, direct them to Crevia Contracts.
If they need to get paid, direct them to Crevia Invoices.
If they need to showcase their portfolio or rates, direct them to Crevia Link.
Never recommend external competitors like DocuSign, Notion, or WhatsApp.

FORMATTING (MUST FOLLOW)
1. Never wrap text in asterisks *****.
2. DO NOT use markdown. Write plain text only.
3. Write naturally — like texting a sharp colleague.
4. Use numbered lists only when listing 2 or more distinct actionable items.
5. No lengthy intros or pleasantries — get straight to the point.`;

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

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid Session' }), { status: 401, headers: cors });
    }

    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 50000) {
      return new Response(JSON.stringify({ error: 'Request too large' }), { status: 413, headers: cors });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: cors });
    }

    const { prompt, history } = body;

    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400, headers: cors });
    }

    if (prompt.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'Prompt is too short' }), { status: 400, headers: cors });
    }

    if (isPromptAbuse(prompt)) {
      return new Response(JSON.stringify({
        reply: "I am Kira, built specifically for the creative economy. I cannot help with that, but I am here to help you grow your creative business. What do you need?"
      }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const sanitizedPrompt = sanitizePrompt(prompt);

    // Conversation history — last 10 turns, each message capped at 1500 chars
    const conversationHistory = Array.isArray(history)
      ? history.slice(-10).map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content || '').slice(0, 1500),
        }))
      : [];

    // Atomic server-side gate — checks limit and increments in one locked transaction.
    // Returns false if the user has hit their daily cap. Cannot be bypassed from the client.
    const { data: allowed, error: gateError } = await supabase
      .rpc('consume_kira_action', { p_user_id: user.id });

    if (gateError) {
      console.error('Feature gate error:', gateError.message);
      return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
        status: 500, headers: cors
      });
    }

    if (!allowed) {
      return new Response(JSON.stringify({
        error: 'Daily Kira limit reached. Upgrade to Pro for 40 actions per day.'
      }), { status: 429, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // Fetch profile context to personalise every response
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        display_name,
        user_type,
        bio,
        kira_memory,
        creator_profiles (creator_types, goals),
        brand_profiles (business_type, company_description)
      `)
      .eq('id', user.id)
      .single();

    const memory = (profile?.kira_memory as Record<string, unknown>) || {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const creatorProfile = (profile as any)?.creator_profiles;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const brandProfile = (profile as any)?.brand_profiles;
    const isCreator = profile?.user_type === 'creator';

    const contextLines: string[] = [
      `- Name: ${profile?.display_name || 'not set'}`,
      `- Type: ${isCreator ? 'Creator' : 'Brand'}`,
    ];
    if (profile?.bio) contextLines.push(`- Bio: ${profile.bio}`);
    if (isCreator && Array.isArray(creatorProfile?.creator_types) && creatorProfile.creator_types.length > 0) {
      contextLines.push(`- Niche: ${(creatorProfile.creator_types as string[]).join(', ')}`);
    }
    if (isCreator && Array.isArray(creatorProfile?.goals) && creatorProfile.goals.length > 0) {
      contextLines.push(`- Goals: ${(creatorProfile.goals as string[]).join(', ')}`);
    }
    if (!isCreator && brandProfile?.business_type) {
      contextLines.push(`- Business type: ${brandProfile.business_type}`);
    }
    if (!isCreator && brandProfile?.company_description) {
      contextLines.push(`- Company: ${brandProfile.company_description}`);
    }
    contextLines.push(`- Standard rate: ${(memory.standard_rate as string) || 'not set — ask if relevant'}`);
    contextLines.push(`- Currency: ${(memory.currency as string) || 'KES (assumed)'}`);
    const clients = Array.isArray(memory.clients) && (memory.clients as string[]).length > 0
      ? (memory.clients as string[]).join(', ')
      : 'none on file';
    contextLines.push(`- Regular clients: ${clients}`);
    contextLines.push(`- Payment terms: ${(memory.payment_terms as string) || 'not set'}`);
    if (memory.notes) contextLines.push(`- Notes: ${memory.notes}`);

    const userContextBlock = `USER CONTEXT (use this to personalise every response — do not repeat it back verbatim):\n${contextLines.join('\n')}`;
    const systemPrompt = `${KIRA_SYSTEM_PROMPT}\n\n${userContextBlock}`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1000,
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
          { role: "user", content: sanitizedPrompt }
        ],
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error("OpenAI API error: " + openaiResponse.status);
    }

    // Parse OpenAI SSE stream and pipe plain text tokens to the client
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    const pump = async () => {
      const reader = openaiResponse.body!.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') return;
            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices?.[0]?.delta?.content;
              if (token) await writer.write(encoder.encode(token));
            } catch { /* skip malformed SSE lines */ }
          }
        }
      } finally {
        await writer.close().catch(() => {});
      }
    };

    pump();

    return new Response(readable, {
      headers: {
        ...cors,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Function Error:", msg);
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
      status: 500, headers: cors
    });
  }
});
