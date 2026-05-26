---
name: project-kira-langchain-fix
description: "LangChain npm: imports crash kira-gpt edge function on startup, blocking CORS and breaking Kira — needs fix"
metadata: 
  node_type: memory
  type: project
  originSessionId: d8b100ac-5708-4187-885e-9da4729eb0fc
---

The `kira-gpt` Supabase Edge Function was rewritten to use LangChain (`npm:@langchain/openai`, `npm:@langchain/core/messages`) but it crashes on startup in Supabase's Deno runtime because LangChain has internal Node.js-specific dependencies (`node:fs`, `node:path`, `node:crypto`) that are not fully supported in the Supabase Edge Functions Deno environment. Initialising `new ChatOpenAI()` and `new OpenAIEmbeddings()` at module level makes this a hard crash before any request is handled.

**Symptom:** CORS preflight (OPTIONS) returns 500 → browser blocks all POST requests → Kira shows no response.

**Why:** `npm:` specifiers for LangChain don't work reliably in Supabase's restricted Deno runtime. The function crashes before `serve()` runs.

**Status: RESOLVED** — Fixed by the user (Anthony) directly.

All LangChain imports removed. `index.ts` now uses raw `fetch()` for all OpenAI calls (embeddings, memory extraction, streaming). `deno.json` reverted to only `@supabase/functions-js`. Full memory architecture (vector memories, conversation summaries, fire-and-forget extraction) is intact.

**Why:** Supabase Deno runtime doesn't support LangChain npm packages reliably.
**How to apply:** This issue is closed — no further action needed.
