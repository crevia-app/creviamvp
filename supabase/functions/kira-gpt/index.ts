import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ChatOpenAI, OpenAIEmbeddings } from "npm:@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "npm:@langchain/core/messages";

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

// Initialise once per warm instance — stateless config objects, safe to share across requests
const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  maxTokens: 1000,
  openAIApiKey,
});

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
  openAIApiKey,
});

// ── Helper: fetch top similar memories via pgvector RPC ───────────────────────
// deno-lint-ignore no-explicit-any
async function fetchSimilarMemories(prompt: string, userId: string, supabase: any): Promise<string> {
  try {
    const queryVector = await embeddings.embedQuery(prompt);
    const { data: memories, error } = await supabase.rpc('match_kira_memories', {
      query_embedding: queryVector,
      match_count: 4,
      filter: { user_id: userId },
    });
    if (error || !memories?.length) return '';

    const lines = (memories as Array<{ content: string; similarity: number }>)
      .filter(m => m.similarity > 0.72)
      .map(m => `- ${m.content.slice(0, 150)}`);

    return lines.length > 0 ? `WHAT I REMEMBER ABOUT YOU:\n${lines.join('\n')}` : '';
  } catch (e) {
    console.warn('[Kira] Memory fetch error:', e);
    return '';
  }
}

// ── Helper: fetch conversation summary (compressed chat history) ──────────────
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

// ── Fire-and-forget: extract key facts and store as long-term memories ─────────
async function extractAndStoreMemories(
  userMessage: string,
  assistantResponse: string,
  userId: string,
  // deno-lint-ignore no-explicit-any
  supabase: any,
): Promise<void> {
  const extractLlm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
    maxTokens: 150,
    openAIApiKey,
  });

  const result = await extractLlm.invoke([
    new SystemMessage(
      "Extract 1-3 important facts about the user from this exchange. " +
      "Focus on their work, goals, rates, clients, or preferences. " +
      "Output one fact per line starting with '-'. If none, output NONE."
    ),
    new HumanMessage(
      `User: "${userMessage.slice(0, 600)}"\nKira: "${assistantResponse.slice(0, 400)}"`
    ),
  ]);

  const content = typeof result.content === 'string' ? result.content.trim() : '';
  if (!content || content.toUpperCase() === 'NONE') return;

  const facts = content
    .split('\n')
    .filter(l => l.trim().startsWith('-'))
    .map(l => l.slice(l.indexOf('-') + 1).trim())
    .filter(f => f.length > 10)
    .slice(0, 3);

  for (const fact of facts) {
    const vector = await embeddings.embedQuery(fact);
    await supabase.from('kira_memories').insert({
      user_id: userId,
      content: fact,
      embedding: vector,
      metadata: { source: 'conversation', extracted_at: new Date().toISOString() },
    });
  }
}

// ── Fire-and-forget: summarise conversation and upsert ────────────────────────
async function updateConversationSummary(
  conversationId: string,
  userId: string,
  messages: Array<{ role: string; content: string }>,
  // deno-lint-ignore no-explicit-any
  supabase: any,
): Promise<void> {
  const summaryLlm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
    maxTokens: 250,
    openAIApiKey,
  });

  const transcript = messages
    .map(m => `${m.role === 'user' ? 'User' : 'Kira'}: ${m.content.slice(0, 400)}`)
    .join('\n');

  const result = await summaryLlm.invoke([
    new SystemMessage(
      "Summarise this conversation in 2-3 sentences. " +
      "Focus on: what the user is working on, key questions or decisions, and next steps if any."
    ),
    new HumanMessage(transcript.slice(0, 3000)),
  ]);

  const summary = typeof result.content === 'string' ? result.content.trim() : '';
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

    // Last 8 turns, each message capped to keep token budget in check
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

    // Parallel: fetch similar memories + conversation summary (only when enabled)
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
      if (profile?.bio) contextLines.push(`- Bio: ${profile.bio}`);
      if (memory.occupation) contextLines.push(`- Occupation: ${memory.occupation}`);
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
      if (memory.more_about_you) contextLines.push(`- About: ${memory.more_about_you}`);

      systemPrompt += `\n\nUSER CONTEXT (personalise every response — do not repeat verbatim):\n${contextLines.join('\n')}`;

      if (memoryContext) systemPrompt += `\n\n${memoryContext}`;
      if (memory.custom_instructions) {
        systemPrompt += `\n\nUSER INSTRUCTIONS (follow in all responses):\n${memory.custom_instructions}`;
      }
    }

    // Compressed chat history replaces long raw history when summary is available
    if (summaryContext && activeHistory.length > 4) {
      systemPrompt += `\n\n${summaryContext}`;
    }

    // Build LangChain message list
    const langchainMessages = [
      new SystemMessage(systemPrompt),
      ...(summaryContext && activeHistory.length > 4
        ? activeHistory.slice(-4)   // keep only 4 most recent turns when summary covers the rest
        : activeHistory
      ).map(m => m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)),
      new HumanMessage(sanitizedPrompt),
    ];

    // Stream response
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    let fullResponse = '';

    const pump = async () => {
      try {
        const stream = await llm.stream(langchainMessages);
        for await (const chunk of stream) {
          const token = typeof chunk.content === 'string' ? chunk.content : '';
          if (token) {
            fullResponse += token;
            await writer.write(encoder.encode(token));
          }
        }
      } finally {
        await writer.close().catch(() => {});

        // Fire-and-forget: extract long-term memories from this exchange
        if (referenceMemories && fullResponse) {
          extractAndStoreMemories(sanitizedPrompt, fullResponse, user.id, supabase)
            .catch(e => console.warn('[Kira] Memory extraction failed:', e));
        }

        // Fire-and-forget: update conversation summary when there are enough turns
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
