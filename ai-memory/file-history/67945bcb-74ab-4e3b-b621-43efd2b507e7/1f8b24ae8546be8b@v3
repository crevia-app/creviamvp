import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── CORS ──────────────────────────────────────────────────────────────────────

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

// ── Input sanitisation ────────────────────────────────────────────────────────

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
  return abusePatterns.some(p => p.test(prompt));
}

// ── System prompt ─────────────────────────────────────────────────────────────

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
5. No lengthy intros or pleasantries — get straight to the point.

TOOLS
You have access to tools that read the user's live Crevia data. Use a tool only when the user's question requires live data — e.g. asking about their invoices, revenue, clients, canvases, link profile, or account details. For general advice, strategy, pricing guidance, or creative questions, answer directly without calling any tool. Never call a tool just to appear thorough.`;

const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;

// ── Types ─────────────────────────────────────────────────────────────────────

type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

interface ToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

interface OAIMsg {
  role: string;
  content: string | ContentPart[] | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

// ── OpenAI helpers ────────────────────────────────────────────────────────────

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
      model: "gpt-5.4-mini",
      messages,
      max_completion_tokens: maxTokens,
      temperature: 0,
    }),
  });
  if (!res.ok) throw new Error(`Chat API error: ${res.status}`);
  const data = await res.json();
  return data.choices[0]?.message?.content?.trim() ?? '';
}

// deno-lint-ignore no-explicit-any
async function callOpenAIWithTools(messages: OAIMsg[], tools: any[], toolChoice: string | object = "auto"): Promise<any> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-5.4-mini",
      messages,
      tools,
      tool_choice: toolChoice,
      max_completion_tokens: 1000,
      temperature: 0,
    }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`OpenAI tool call error: ${res.status} - ${errBody}`);
  }
  return await res.json();
}

// ── Memory helpers ────────────────────────────────────────────────────────────

// deno-lint-ignore no-explicit-any
async function fetchSimilarMemories(prompt: string, userId: string, supabase: any): Promise<string> {
  try {
    const queryVector = await embedText(prompt);
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

// deno-lint-ignore no-explicit-any
async function storeSingleMemory(fact: string, userId: string, supabase: any, source = 'conversation'): Promise<void> {
  const vector = await embedText(fact);
  const { data: existing } = await supabase.rpc('match_kira_memories', {
    query_embedding: vector,
    match_count: 1,
    filter: { user_id: userId },
  });
  if ((existing as Array<{ similarity: number }>)?.[0]?.similarity > 0.92) return;
  await supabase.from('kira_memories').insert({
    user_id: userId,
    content: fact,
    embedding: vector,
    metadata: { source, extracted_at: new Date().toISOString() },
  });
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
    await storeSingleMemory(fact, userId, supabase).catch(() => {});
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

// ── Tool Definitions ──────────────────────────────────────────────────────────

const KIRA_TOOLS = [
  {
    type: "function",
    function: {
      name: "get_invoices",
      description: "Get the user's invoices. Use when asked about invoices, billing, clients, or revenue.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["draft", "sent", "paid", "overdue", "cancelled"],
            description: "Filter by status",
          },
          limit: { type: "number", description: "Max invoices to return (default 10, max 20)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_invoice_detail",
      description: "Get full details of a specific invoice including all line items.",
      parameters: {
        type: "object",
        properties: {
          invoice_id: { type: "string", description: "UUID of the invoice" },
        },
        required: ["invoice_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_revenue_summary",
      description: "Get a revenue summary: total paid, pending, overdue amounts, and invoice counts by status.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_canvases",
      description: "Get the user's canvases (contracts/agreements). Use when asked about contracts, deals, or canvases.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["draft", "sent", "signed", "active", "completed", "cancelled"],
            description: "Filter by status",
          },
          limit: { type: "number", description: "Max canvases to return (default 10, max 20)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_canvas_detail",
      description: "Get full details of a specific canvas/contract.",
      parameters: {
        type: "object",
        properties: {
          canvas_id: { type: "string", description: "UUID of the canvas" },
        },
        required: ["canvas_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_business_settings",
      description: "Get the user's business settings: name, email, bank details, tax info, default currency.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_link_profile",
      description: "Get the user's Crevia Link profile, theme, and their link buttons with click counts.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_saved_clients",
      description: "Get the user's saved client address book.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_profile",
      description: "Get the user's Crevia profile: display name, bio, user type, goals, and niche.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "save_client",
      description: "Save or update a client in the user's address book.",
      parameters: {
        type: "object",
        properties: {
          client_name: { type: "string", description: "Client's full name or business name" },
          client_email: { type: "string", description: "Client's email address" },
          client_phone: { type: "string", description: "Client's phone number" },
          billing_address: { type: "string", description: "Client's billing address" },
        },
        required: ["client_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "save_memory",
      description: "Permanently save a specific fact about the user for future conversations. Use when the user explicitly asks Kira to remember something, or when a key fact (rate, preference, client detail) surfaces that is worth keeping.",
      parameters: {
        type: "object",
        properties: {
          fact: {
            type: "string",
            description: "The fact to save, stated clearly (e.g. 'User charges KES 50,000 for sponsored reels')",
          },
        },
        required: ["fact"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_notifications",
      description: "Get the user's recent notifications.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Number of notifications (default 5, max 10)" },
        },
        required: [],
      },
    },
  },
];

// ── Tool Handlers ─────────────────────────────────────────────────────────────

// deno-lint-ignore no-explicit-any
async function toolGetInvoices(args: any, userId: string, supabase: any): Promise<unknown> {
  const limit = Math.min(Number(args.limit) || 10, 20);
  let query = supabase
    .from('invoices')
    .select('id, invoice_number, client_name, client_email, status, subtotal, tax_amount, discount_amount, total, currency, issue_date, due_date')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (args.status) query = query.eq('status', args.status);
  const { data, error } = await query;
  if (error) return { error: error.message };
  return { count: (data || []).length, invoices: data || [] };
}

// deno-lint-ignore no-explicit-any
async function toolGetInvoiceDetail(args: any, userId: string, supabase: any): Promise<unknown> {
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', args.invoice_id)
    .eq('user_id', userId)
    .single();
  if (error || !invoice) return { error: 'Invoice not found' };
  const { data: items } = await supabase
    .from('invoice_items')
    .select('description, quantity, unit_price, total')
    .eq('invoice_id', args.invoice_id);
  return { ...invoice, items: items || [] };
}

// deno-lint-ignore no-explicit-any
async function toolGetRevenueSummary(_args: unknown, userId: string, supabase: any): Promise<unknown> {
  const { data, error } = await supabase
    .from('invoices')
    .select('status, total, currency')
    .eq('user_id', userId);
  if (error) return { error: error.message };
  const invoices = (data || []) as Array<{ status: string; total: number; currency: string }>;
  const byStatus: Record<string, { count: number; total: number }> = {};
  for (const inv of invoices) {
    if (!byStatus[inv.status]) byStatus[inv.status] = { count: 0, total: 0 };
    byStatus[inv.status].count++;
    byStatus[inv.status].total += Number(inv.total) || 0;
  }
  return {
    total_invoices: invoices.length,
    by_status: byStatus,
    total_paid: byStatus['paid']?.total || 0,
    total_pending: byStatus['sent']?.total || 0,
    total_overdue: byStatus['overdue']?.total || 0,
    currency: invoices[0]?.currency || 'KES',
  };
}

// deno-lint-ignore no-explicit-any
async function toolGetCanvases(args: any, userId: string, supabase: any): Promise<unknown> {
  const limit = Math.min(Number(args.limit) || 10, 20);
  let query = supabase
    .from('canvases')
    .select('id, title, client_name, client_email, contract_type, status, value, currency, start_date, end_date, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (args.status) query = query.eq('status', args.status);
  const { data, error } = await query;
  if (error) return { error: error.message };
  return { count: (data || []).length, canvases: data || [] };
}

// deno-lint-ignore no-explicit-any
async function toolGetCanvasDetail(args: any, userId: string, supabase: any): Promise<unknown> {
  const { data, error } = await supabase
    .from('canvases')
    .select('*')
    .eq('id', args.canvas_id)
    .eq('user_id', userId)
    .single();
  if (error || !data) return { error: 'Canvas not found' };
  return data;
}

// deno-lint-ignore no-explicit-any
async function toolGetBusinessSettings(_args: unknown, userId: string, supabase: any): Promise<unknown> {
  const { data, error } = await supabase
    .from('business_settings')
    .select('business_name, business_email, business_phone, business_address, logo_url, tax_id, default_currency, default_tax_rate, default_payment_terms, bank_name, bank_account_name, bank_account_number, mpesa_till_number')
    .eq('user_id', userId)
    .single();
  if (error || !data) return { message: 'No business settings configured yet.' };
  return data;
}

// deno-lint-ignore no-explicit-any
async function toolGetLinkProfile(_args: unknown, userId: string, supabase: any): Promise<unknown> {
  const { data: profile, error } = await supabase
    .from('link_profiles')
    .select('id, username, display_name, bio, theme, total_visits')
    .eq('user_id', userId)
    .single();
  if (error || !profile) return { message: 'No Crevia Link profile set up yet.' };
  const { data: buttons } = await supabase
    .from('link_buttons')
    .select('title, url, clicks, visible')
    .eq('profile_id', profile.id)
    .eq('visible', true)
    .order('order_index');
  return { ...profile, buttons: buttons || [] };
}

// deno-lint-ignore no-explicit-any
async function toolGetSavedClients(_args: unknown, userId: string, supabase: any): Promise<unknown> {
  const { data, error } = await supabase
    .from('saved_clients')
    .select('client_name, client_email, client_phone, billing_address')
    .eq('user_id', userId)
    .order('client_name');
  if (error) return { error: error.message };
  return { count: (data || []).length, clients: data || [] };
}

// deno-lint-ignore no-explicit-any
async function toolGetProfile(_args: unknown, userId: string, supabase: any): Promise<unknown> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      display_name, handle, bio, user_type, is_verified, avatar_url,
      creator_profiles (creator_types, goals, follower_count, engagement_rate),
      brand_profiles (business_type, company_description, website_url)
    `)
    .eq('id', userId)
    .single();
  if (error || !data) return { error: 'Profile not found' };
  return data;
}

// deno-lint-ignore no-explicit-any
async function toolSaveClient(args: any, userId: string, supabase: any): Promise<unknown> {
  if (!args.client_name || typeof args.client_name !== 'string') {
    return { error: 'client_name is required' };
  }
  const { error } = await supabase
    .from('saved_clients')
    .upsert(
      {
        user_id: userId,
        client_name: String(args.client_name).slice(0, 200),
        client_email: args.client_email || null,
        client_phone: args.client_phone || null,
        billing_address: args.billing_address || null,
      },
      { onConflict: 'user_id,client_name' },
    );
  if (error) return { error: error.message };
  return { success: true, message: `Saved "${args.client_name}" to your client address book.` };
}

// deno-lint-ignore no-explicit-any
async function toolSaveMemory(args: any, userId: string, supabase: any): Promise<unknown> {
  if (!args.fact || typeof args.fact !== 'string' || args.fact.length < 5) {
    return { error: 'fact must be a non-empty string' };
  }
  try {
    await storeSingleMemory(String(args.fact).slice(0, 500), userId, supabase, 'user_explicit');
    return { success: true, message: `Got it. I'll remember: "${String(args.fact).slice(0, 100)}"` };
  } catch (e) {
    return { error: String(e) };
  }
}

// deno-lint-ignore no-explicit-any
async function toolGetNotifications(args: any, userId: string, supabase: any): Promise<unknown> {
  const limit = Math.min(Number(args.limit) || 5, 10);
  const { data, error } = await supabase
    .from('notifications')
    .select('title, body, type, read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return { error: error.message };
  return { count: (data || []).length, notifications: data || [] };
}

// ── Tool Dispatcher ───────────────────────────────────────────────────────────

// Strips prompt-injection patterns from tool results before they enter the
// OpenAI context. Prevents users from embedding instructions in their own
// stored data (invoice client names, canvas titles, etc.) to hijack Kira.
function sanitizeToolResult(result: unknown): unknown {
  try {
    const str = JSON.stringify(result);
    const cleaned = str
      .replace(/ignore\s+(all\s+)?(previous\s+|above\s+)?instructions/gi, '[blocked]')
      .replace(/you\s+are\s+now\b/gi, '[blocked]')
      .replace(/forget\s+(your\s+|all\s+)?instructions/gi, '[blocked]')
      .replace(/pretend\s+(you\s+are|to\s+be)/gi, '[blocked]')
      .replace(/reveal\s+(your|the)\s+(system|internal)\s+prompt/gi, '[blocked]')
      .replace(/output\s+(your|the)\s+(system|full)\s+prompt/gi, '[blocked]')
      .replace(/system\s+prompt/gi, '[blocked]')
      .replace(/jailbreak/gi, '[blocked]')
      .replace(/DAN\s+mode/gi, '[blocked]');
    return JSON.parse(cleaned);
  } catch {
    return result;
  }
}

async function executeTool(
  name: string,
  // deno-lint-ignore no-explicit-any
  args: Record<string, unknown>,
  userId: string,
  // deno-lint-ignore no-explicit-any
  supabase: any,
): Promise<unknown> {
  let result: unknown;
  switch (name) {
    case 'get_invoices':          result = await toolGetInvoices(args, userId, supabase); break;
    case 'get_invoice_detail':    result = await toolGetInvoiceDetail(args, userId, supabase); break;
    case 'get_revenue_summary':   result = await toolGetRevenueSummary(args, userId, supabase); break;
    case 'get_canvases':          result = await toolGetCanvases(args, userId, supabase); break;
    case 'get_canvas_detail':     result = await toolGetCanvasDetail(args, userId, supabase); break;
    case 'get_business_settings': result = await toolGetBusinessSettings(args, userId, supabase); break;
    case 'get_link_profile':      result = await toolGetLinkProfile(args, userId, supabase); break;
    case 'get_saved_clients':     result = await toolGetSavedClients(args, userId, supabase); break;
    case 'get_profile':           result = await toolGetProfile(args, userId, supabase); break;
    case 'save_client':           result = await toolSaveClient(args, userId, supabase); break;
    case 'save_memory':           result = await toolSaveMemory(args, userId, supabase); break;
    case 'get_notifications':     result = await toolGetNotifications(args, userId, supabase); break;
    default:
      return { error: `Unknown tool: ${name}` };
  }
  return sanitizeToolResult(result);
}

// ── Agent Loop ────────────────────────────────────────────────────────────────
// ReAct pattern: think → call tool(s) → observe → repeat (max 3 iterations)
// Returns the final messages array ready for the streaming response call.

async function runAgentLoop(
  initialMessages: OAIMsg[],
  userId: string,
  // deno-lint-ignore no-explicit-any
  supabase: any,
): Promise<OAIMsg[]> {
  const messages = [...initialMessages];
  const MAX_ITER = 3;

  for (let i = 0; i < MAX_ITER; i++) {
    // Force no more tool calls on the last iteration to prevent an infinite loop
    const toolChoice = i === MAX_ITER - 1 ? "none" : "auto";

    let response;
    try {
      response = await callOpenAIWithTools(messages, KIRA_TOOLS, toolChoice);
    } catch (e) {
      console.warn('[Kira] Agent loop call failed:', e);
      break;
    }

    const msg = response.choices[0].message;

    // No tool calls — messages are ready for the streaming call
    if (!msg.tool_calls || msg.tool_calls.length === 0) break;

    // Append assistant message with tool_calls
    messages.push({
      role: 'assistant',
      content: msg.content ?? null,
      tool_calls: msg.tool_calls,
    });

    // Execute all tool calls in parallel
    const toolResults = await Promise.all(
      (msg.tool_calls as ToolCall[]).map(async (tc) => {
        let args: Record<string, unknown> = {};
        try { args = JSON.parse(tc.function.arguments); } catch { /* use empty args */ }
        const result = await executeTool(tc.function.name, args, userId, supabase);
        console.log(`[Kira tool] ${tc.function.name} → ${JSON.stringify(result).slice(0, 120)}`);
        return { tool_call_id: tc.id, result };
      }),
    );

    // Append tool result messages
    for (const { tool_call_id, result } of toolResults) {
      messages.push({
        role: 'tool',
        content: JSON.stringify(result),
        tool_call_id,
      });
    }
  }

  return messages;
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      supabase.rpc("log_security_event", { p_event_type: "auth_failure", p_endpoint: "kira-gpt", p_detail: "Token validation failed" }).catch(() => {});
      console.warn("[security] auth_failure endpoint=kira-gpt");
      return new Response(JSON.stringify({ error: 'Invalid Session' }), { status: 401, headers: cors });
    }

    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1200000) {
      return new Response(JSON.stringify({ error: 'Request too large' }), { status: 413, headers: cors });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: cors });
    }

    const { prompt, history, conversationId, fileContent, fileType, projectContext } = body;

    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400, headers: cors });
    }
    if (prompt.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'Prompt is too short' }), { status: 400, headers: cors });
    }

    const safeFileType: 'image' | 'text' | null =
      fileType === 'image' || fileType === 'text' ? fileType : null;
    let safeFileContent: string | null = null;
    if (safeFileType === 'image' && typeof fileContent === 'string') {
      if (!fileContent.startsWith('data:image/')) {
        return new Response(JSON.stringify({ error: 'Invalid image data' }), { status: 400, headers: cors });
      }
      if (fileContent.length > 1000000) {
        return new Response(JSON.stringify({ error: 'Image too large. Please use a smaller image.' }), { status: 413, headers: cors });
      }
      safeFileContent = fileContent;
    } else if (safeFileType === 'text' && typeof fileContent === 'string') {
      safeFileContent = fileContent.slice(0, 6000);
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
        status: 500, headers: cors,
      });
    }
    if (!allowed) {
      supabase.rpc("log_security_event", { p_event_type: "rate_limit", p_user_id: user.id, p_endpoint: "kira-gpt", p_detail: "Daily action limit reached" }).catch(() => {});
      console.warn(`[security] rate_limit endpoint=kira-gpt user=${user.id}`);
      return new Response(JSON.stringify({
        error: 'Daily Kira limit reached. Upgrade to Pro for 40 actions per day.'
      }), { status: 429, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // Fetch profile for personalisation
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

    // Build system prompt with user context
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
      if (!isCreator && brandProfile?.business_type) contextLines.push(`- Business type: ${brandProfile.business_type}`);
      if (!isCreator && brandProfile?.company_description) contextLines.push(`- Company: ${brandProfile.company_description}`);
      if (memory.more_about_you && !hasInjectionPattern(String(memory.more_about_you))) contextLines.push(`- About: ${memory.more_about_you}`);

      systemPrompt += `\n\nUSER CONTEXT (personalise every response — do not repeat verbatim):\n${contextLines.join('\n')}`;

      if (memoryContext) systemPrompt += `\n\n${memoryContext}`;
      if (memory.custom_instructions && !hasInjectionPattern(String(memory.custom_instructions))) {
        systemPrompt += `\n\nUSER INSTRUCTIONS (follow in all responses):\n${memory.custom_instructions}`;
      }
    }

    if (projectContext && typeof projectContext === 'object') {
      const pc = projectContext as Record<string, unknown>;
      if (pc.name && !hasInjectionPattern(String(pc.name))) {
        const projectLines: string[] = [`- Project: ${String(pc.name).slice(0, 100)}`];
        if (pc.description && !hasInjectionPattern(String(pc.description))) {
          projectLines.push(`- Description: ${String(pc.description).slice(0, 300)}`);
        }
        if (pc.custom_instructions && !hasInjectionPattern(String(pc.custom_instructions))) {
          projectLines.push(`- Project instructions: ${String(pc.custom_instructions).slice(0, 400)}`);
        }
        systemPrompt += `\n\nACTIVE PROJECT:\n${projectLines.join('\n')}`;
      }
    }

    if (summaryContext && activeHistory.length > 4) {
      systemPrompt += `\n\n${summaryContext}`;
    }

    // Build user content (handles image/text file attachments)
    const userContent: string | ContentPart[] =
      safeFileType === 'image' && safeFileContent
        ? [
            { type: 'text', text: sanitizedPrompt || 'Describe what you see and how it relates to my work.' },
            { type: 'image_url', image_url: { url: safeFileContent } },
          ]
        : safeFileType === 'text' && safeFileContent
          ? `[Attached file — use as context]\n\n${safeFileContent}\n\n${sanitizedPrompt}`
          : sanitizedPrompt;

    const initialMessages: OAIMsg[] = [
      { role: 'system', content: systemPrompt },
      ...(summaryContext && activeHistory.length > 4
        ? activeHistory.slice(-4)
        : activeHistory),
      { role: 'user', content: userContent },
    ];

    // Run agent loop: resolves any tool calls before streaming the final answer
    const agentMessages = await runAgentLoop(initialMessages, user.id, supabase);

    // Stream final answer — no tools passed here, this is pure text output
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
            model: "gpt-5.4-mini",
            messages: agentMessages,
            max_completion_tokens: 1000,
            stream: true,
          }),
        });

        if (!openaiRes.ok || !openaiRes.body) {
          const errBody = await openaiRes.text();
          throw new Error(`OpenAI API error: ${openaiRes.status} - ${errBody}`);
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
            supabase,
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
      status: 500, headers: cors,
    });
  }
});
