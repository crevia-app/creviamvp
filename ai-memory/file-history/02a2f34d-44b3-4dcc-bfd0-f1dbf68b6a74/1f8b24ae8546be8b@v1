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
    .replace(/[^\x20-\x7E\n\r\tÀ-ɏЀ-ӿ]/g, '');
}

function hasInjectionPattern(text: string): boolean {
  const patterns = [
    /ignore (all |previous |above )?instructions/i,
    /output (your |the )?(system|full) prompt/i,
    /reveal (your|the) (system|internal) prompt/i,
    /you are now/i,
    /forget (your |all )?instructions/i,
    /pretend (you are|to be)/i,
  ];
  return patterns.some(p => p.test(text));
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

FORMATTING (MUST FOLLOW)
1. Never wrap text in asterisks *****.
2. DO NOT use markdown. Write plain text only.
3. Write naturally — like texting a sharp colleague.
4. Use numbered lists only when listing 2 or more distinct actionable items.
5. No lengthy intros or pleasantries — get straight to the point.`;

const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;

// ── Raw OpenAI helpers ────────────────────────────────────────────────────────

async function embedText(text: string): Promise<number[]> {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
  });
  if (!res.ok) throw new Error(`Embeddings API error: ${res.status}`);
  const data = await res.json();
  return data.data[0].embedding;
}

async function chatComplete(
  messages: Array<{ role: string; content: string }>,
  maxTokens: number,
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: maxTokens,
      temperature: 0,
    }),
  });
  if (!res.ok) throw new Error(`Chat API error: ${res.status}`);
  const data = await res.json();
  return data.choices[0]?.message?.content?.trim() ?? '';
}

// ── Memory helpers ────────────────────────────────────────────────────────────

// deno-lint-ignore no-explicit-any
async function fetchSimilarMemories(prompt: string, userId: string, supabase: any): Promise<string> {
  try {
    const queryVector = await embedText(prompt);

    // Parallel: semantic search + 2 most-recent memories as fallback for low-similarity facts (e.g. name)
    const [{ data: similar }, { data: recent }] = await Promise.all([
      supabase.rpc('match_kira_memories', {
        query_embedding: queryVector,
        match_count: 4,
        filter: { user_id: userId },
      }),
      supabase
        .from('kira_memories')
        .select('content')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(2),
    ]);

    const topSimilar = ((similar as Array<{ content: string; similarity: number }>) || [])
      .filter(m => m.similarity > 0.68)
      .map(m => m.content.slice(0, 150));

    // Merge recent facts deduped against similarity results
    const seen = new Set(topSimilar);
    const all = [...topSimilar];
    for (const m of ((recent as Array<{ content: string }>) || [])) {
      const c = m.content.slice(0, 100);
      if (!seen.has(c)) { seen.add(c); all.push(c); }
    }

    return all.length > 0 ? `WHAT I REMEMBER ABOUT YOU:\n${all.map(c => `- ${c}`).join('\n')}` : '';
  } catch (e) {
    console.warn('[Kira] Memory fetch error:', e);
    return '';
  }
}

// deno-lint-ignore no-explicit-any
async function fetchConversationSummary(conversationId: string, supabase: any): Promise<string> {
  try {
    const { data } = await supabase
      .from('conversation_summaries')
      .select('summary')
      .eq('conversation_id', conversationId)
      .single();
    return data?.summary ? `CONVERSATION SO FAR:\n${data.summary.slice(0, 500)}` : '';
  } catch {
    return '';
  }
}

async function extractAndStoreMemories(
  userMessage: string,
  assistantResponse: string,
  userId: string,
  // deno-lint-ignore no-explicit-any
  supabase: any,
): Promise<void> {
  const content = await chatComplete([
    {
      role: 'system',
      content:
        "Extract 1-3 key facts about this user from the exchange. " +
        "Prioritise: their name, work, goals, rates, clients, or strong preferences. " +
        "One fact per line starting with '-'. If none, output NONE.",
    },
    {
      role: 'user',
      content: `User: "${userMessage.slice(0, 600)}"\nKira: "${assistantResponse.slice(0, 400)}"`,
    },
  ], 150);

  if (!content || content.toUpperCase() === 'NONE') return;

  const facts = content
    .split('\n')
    .filter(l => l.trim().startsWith('-'))
    .map(l => l.slice(l.indexOf('-') + 1).trim())
    .filter(f => f.length > 10)
    .slice(0, 3);

  for (const fact of facts) {
    const vector = await embedText(fact);
    await supabase.from('kira_memories').insert({
      user_id: userId,
      content: fact,
      embedding: vector,
      metadata: { source: 'conversation', extracted_at: new Date().toISOString() },
    });
  }
}

async function updateConversationSummary(
  conversationId: string,
  userId: string,
  messages: Array<{ role: string; content: string }>,
  // deno-lint-ignore no-explicit-any
  supabase: any,
): Promise<void> {
  const transcript = messages
    .map(m => `${m.role === 'user' ? 'User' : 'Kira'}: ${m.content.slice(0, 400)}`)
    .join('\n');

  const summary = await chatComplete([
    {
      role: 'system',
      content:
        "Summarise this conversation in 2-3 sentences. " +
        "Focus on: what the user is working on, key questions or decisions, and next steps if any.",
    },
    { role: 'user', content: transcript.slice(0, 3000) },
  ], 250);

  if (!summary) return;

  await supabase.from('conversation_summaries').upsert({
    conversation_id: conversationId,
    user_id: userId,
    summary,
    message_count: messages.length,
    updated_at: new Date().toISOString(),
  });
}

// ── Main handler ──────────────────────────────────────────────────────────────
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

    const { prompt, history, conversationId } = body;

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

    const conversationHistory = Array.isArray(history)
      ? history.slice(-8).map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content || '').slice(0, 1200),
        }))
      : [];

    // Atomic rate-limit gate
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

    // Fetch profile
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

    const memory = (profile?.kira_memory as Record<string, unknown>) ?? {};
    // deno-lint-ignore no-explicit-any
    const creatorProfile = (profile as any)?.creator_profiles;
    // deno-lint-ignore no-explicit-any
    const brandProfile = (profile as any)?.brand_profiles;
    const isCreator = profile?.user_type === 'creator';

    const referenceMemories = memory.reference_saved_memories !== false;
    const referenceChatHistory = memory.reference_chat_history !== false;
    const activeHistory = referenceChatHistory ? conversationHistory : [];

    const [memoryContext, summaryContext] = await Promise.all([
      referenceMemories
        ? fetchSimilarMemories(sanitizedPrompt, user.id, supabase)
        : Promise.resolve(''),
      referenceChatHistory && conversationId
        ? fetchConversationSummary(conversationId, supabase)
        : Promise.resolve(''),
    ]);

    // Build system prompt
    let systemPrompt = KIRA_SYSTEM_PROMPT;

    if (referenceMemories) {
      const contextLines: string[] = [
        `- Name: ${(memory.nickname as string) || profile?.display_name || 'not set'}`,
        `- Type: ${isCreator ? 'Creator' : 'Brand'}`,
      ];
      if (profile?.bio && !hasInjectionPattern(profile.bio)) contextLines.push(`- Bio: ${profile.bio}`);
      if (memory.occupation && !hasInjectionPattern(String(memory.occupation))) contextLines.push(`- Occupation: ${memory.occupation}`);
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
      if (memory.more_about_you && !hasInjectionPattern(String(memory.more_about_you))) contextLines.push(`- About: ${memory.more_about_you}`);
      if (memory.standard_rate) {
        const rate = `${memory.standard_rate}${memory.currency ? ` (${memory.currency})` : ''}`;
        contextLines.push(`- Standard rate: ${rate}`);
      }
      if (Array.isArray(memory.clients) && (memory.clients as string[]).length > 0) {
        contextLines.push(`- Regular clients: ${(memory.clients as string[]).slice(0, 5).join(', ')}`);
      }
      if (memory.payment_terms) contextLines.push(`- Payment terms: ${memory.payment_terms}`);
      if (memory.notes) contextLines.push(`- Notes: ${String(memory.notes).slice(0, 150)}`);

      systemPrompt += `\n\nUSER CONTEXT (personalise every response — do not repeat verbatim):\n${contextLines.join('\n')}`;

      if (memoryContext) systemPrompt += `\n\n${memoryContext}`;
      if (memory.custom_instructions && !hasInjectionPattern(String(memory.custom_instructions))) {
        systemPrompt += `\n\nUSER INSTRUCTIONS (follow in all responses):\n${memory.custom_instructions}`;
      }
    }

    if (summaryContext && activeHistory.length > 4) {
      systemPrompt += `\n\n${summaryContext}`;
    }

    // Build OpenAI messages array
    const openaiMessages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...(summaryContext && activeHistory.length > 4
        ? activeHistory.slice(-4)
        : activeHistory
      ),
      { role: 'user', content: sanitizedPrompt },
    ];

    // Stream response via raw OpenAI SSE
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    let fullResponse = '';

    const pump = async () => {
      try {
        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: openaiMessages,
            max_tokens: 1000,
            stream: true,
          }),
        });

        if (!openaiRes.ok || !openaiRes.body) {
          throw new Error(`OpenAI API error: ${openaiRes.status}`);
        }

        const reader = openaiRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === '[DONE]') continue;
            try {
              const parsed = JSON.parse(payload);
              const token = parsed.choices?.[0]?.delta?.content ?? '';
              if (token) {
                fullResponse += token;
                await writer.write(encoder.encode(token));
              }
            } catch {
              // skip malformed SSE lines
            }
          }
        }
      } finally {
        await writer.close().catch(() => {});

        if (referenceMemories && fullResponse) {
          extractAndStoreMemories(sanitizedPrompt, fullResponse, user.id, supabase)
            .catch(e => console.warn('[Kira] Memory extraction failed:', e));
        }

        if (conversationId && fullResponse && activeHistory.length >= 4) {
          updateConversationSummary(
            conversationId,
            user.id,
            [
              ...activeHistory,
              { role: 'user', content: sanitizedPrompt },
              { role: 'assistant', content: fullResponse },
            ],
            supabase
          ).catch(e => console.warn('[Kira] Summary update failed:', e));
        }
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
