# Crevia MVP — Full Progress Summary (as of 2026-05-08)

---

## KIRA AI — WHAT'S BEEN BUILT

### Core Engine
- GPT-4o-mini backend via Supabase Edge Function (`supabase/functions/kira-gpt/index.ts`)
- Pan-African context engine (Nairobi, Lagos, Johannesburg focus) with global flexibility
- Radically honest, conversational personality — not corporate, not subservient
- Platform ecosystem lock-in (Crevia Contracts, Invoices, Workspace, Link)
- No external competitors recommended (DocuSign, Notion, WhatsApp blocked)
- Prompt abuse detection and jailbreak protection
- Formatting rules enforced (plain text, no markdown, no asterisks)

### Conversation Management
- Persistent chat history saved to `kira_conversations` + `kira_messages` tables
- Conversation history trimmed to last 10 messages, each capped at 1,500 chars
- Daily action limit gating — 10/day free, 40/day Pro
- Server-side atomic `consume_kira_action` RPC (cannot be bypassed from client)
- Retry without edit, edit + resend, copy message — hover action buttons on messages

### Personalization
- Role-aware greetings — 5 creator greetings, 5 brand greetings, rotate daily
- Profile context injected into every call: name, user type, bio, niche, goals, business type
- **Kira Memory** (`kira_memory` JSONB on `profiles`) — stores:
  - Standard rate (e.g. "KES 20,000 per shoot")
  - Preferred currency (KES, USD, GBP, NGN, ZAR, EUR)
  - Regular clients (comma-separated)
  - Payment terms
  - Free-text notes
- KiraMemoryPanel drawer (`src/components/kira/KiraMemoryPanel.tsx`) — Brain icon in header

### Chat Management (Gemini-style)
- **Pin / Unpin** — pinned chats float to a dedicated "Pinned" section above recent chats
- **Rename** — inline rename on desktop (click Rename in menu → title becomes input → Enter saves)
- **Delete** — with confirmation AlertDialog
- Desktop: always-visible `⋮` (MoreVertical) button on each chat row → dropdown (Pin, Rename, Delete)
- Mobile: always-visible `⋮` button + long-press (500ms) → bottom Sheet with same 3 actions
- Database: `pinned boolean NOT NULL DEFAULT false` on `kira_conversations`

### Projects
- Create projects (custom name, description, instructions)
- Project-scoped chats — conversations linked to a project via `project_id`
- Projects view (`ProjectsView.tsx`) — list all projects
- Project detail sheet (`ProjectDetailSheet.tsx`) — view, edit, delete project
- Delete project with confirmation

### Voice
- Voice chat dialog (`VoiceChatDialog.tsx`) — talk to Kira

### Approval Workflows
- `ApproveActionDialog.tsx` — approve/update contracts and invoices from Kira

---

## TODAY'S WORK (2026-05-08) — KIRA

| Feature | Files Changed |
|---|---|
| Cross-session persistent memory (KiraMemoryPanel, edge function profile fetch) | `KiraMemoryPanel.tsx` (new), `kira-gpt/index.ts`, `Kira.tsx`, `types.ts`, migration `20260508000000` |
| Pin / Rename / Delete chat actions with desktop 3-dot menu and mobile bottom sheet | `Kira.tsx` (+384 lines), `types.ts`, migration `20260508100000` |
| Always-visible ⋮ button on desktop and mobile sidebar chat rows | `Kira.tsx` |

---

## TODAY'S WORK (2026-05-08) — NON-KIRA

| Change | File |
|---|---|
| Force light mode (`forcedTheme="light"`) so phone/old-device localStorage dark preference is overridden | `src/App.tsx` |

---

## RECENT NON-KIRA WORK (pre-today)

| Date | Change |
|---|---|
| 2026-05-07 | Contracts: removed preset templates — keep only custom build-from-scratch |
| 2026-05-07 | Increased font sizes across the authenticated app |
| 2026-05-07 | Removed integrations section from mobile More menu |

---

## PENDING — NOT YET IMPLEMENTED

### Blockers
1. **SMTP** — Email/password signup returns 500. Supabase free tier rate-limits email confirmation (3/hour). Fix: configure Resend SMTP (`smtp.resend.com`, port 465) in Supabase Auth → SMTP settings, or temporarily disable email confirmation for testing.

### Product Features Not Started
2. **Lead → Contract workflow** — Convert a Kira-identified lead directly into a Crevia Contract (high-value Kira ↔ Contracts integration)
3. **USD bank integration** — Payment rail for USD currency
4. **E2EE recovery password E2E test** — Blocked by SMTP fix; requires a real new-device signup flow to verify full recovery password set + restore cycle

### Database Migrations (need to be applied to production Supabase)
- `kira_memory` JSONB column on `profiles` → run: `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kira_memory JSONB DEFAULT '{}';`
- `pinned` boolean on `kira_conversations` → run: `ALTER TABLE public.kira_conversations ADD COLUMN IF NOT EXISTS pinned boolean NOT NULL DEFAULT false;`
