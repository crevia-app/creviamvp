---
name: feedback-mobile-patterns
description: "Proven mobile responsive patterns accepted by the user for Crevia Studio tabs, invoice/contract dialogs, and list cards"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: d2d56260-bb3a-4119-bba1-5b81246a8075
---

For mobile UI work, use these patterns — all validated and accepted by the user:

**Invoice/Contract dialogs:**
- `w-[calc(100vw-16px)] sm:max-w-2xl lg:max-w-3xl` for dialog width on mobile
- `[&>button:last-child]:hidden` to suppress shadcn's auto-close X button when using a custom toolbar
- Add explicit X close button in the toolbar; hide print/fullscreen on mobile (`hidden sm:flex`)
- Invoice items: card-list on mobile (description + total on row 1, qty×rate on row 2), table on desktop (`hidden sm:block`)
- Totals section: `w-full sm:w-64` instead of fixed `w-72`
- Invoice header: `flex-col sm:flex-row` so INVOICE block and business info stack vertically on mobile

**Stats grids:**
- Always use `grid-cols-2 gap-3` (not `grid-cols-1`) for stat cards on mobile
- Icon size: `p-2 rounded-xl` + `h-4 w-4` icon (not p-2.5 / h-5 w-5) in 2-col grids
- Number size: `text-xl md:text-2xl` (not text-2xl/3xl) in 2-col stat cards

**Revenue/financial summary cards:**
- Mobile: list layout — label+icon left, amount right (`justify-between`) with `divide-y`
- Desktop: 3-col grid with `divide-x` (`sm:hidden` / `hidden sm:grid`)
- This prevents KES currency strings from overflowing narrow columns

**Filter/sort rows:**
- Search: full width on its own row
- Filter + Sort: side-by-side `flex gap-2` below search, each `flex-1`

**Crevia Link sub-tabs (mobile):**
- 2-row segmented control: rows wrapped in `flex gap-1 p-1 bg-muted/60 rounded-xl`
- Active tab: `bg-background text-foreground shadow-sm`; inactive: `text-muted-foreground`
- Text size: `text-[11px]` — fits "Appearance" in a 3-col row on 375px screen
- Row 1: first 3 sections; Row 2: last 2 sections

**Why:** User explicitly said no horizontal scrolling, all details visible on any phone. Patterns match iOS segmented control / Material 3 chips / Stripe mobile dashboard conventions.
**How to apply:** Any new dialog, card list, or stats section should follow these patterns by default.
