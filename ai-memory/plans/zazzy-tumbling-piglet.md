# Fix Vercel Build — Stray CSS Brace in index.css

## Context
After adding `card-bronze-glow` and the `@media (prefers-reduced-motion: reduce)` block to `src/index.css`, a stray closing `}` was introduced at line 356 that has no matching open brace. PostCSS (run by Vite/Tailwind during the Vercel build) is stricter than browser CSS parsers and throws on this, failing the entire deployment. Production is still live on the previous commit.

## What's broken

**File:** `src/index.css`

The `@layer utilities` block closes legitimately at line 332 (after `@keyframes blur-in`). The edit that inserted `card-bronze-glow` added an extra `}` at line 356, leaving this structure:

```
L331-332  }  }         @keyframes blur-in closes, then @layer utilities closes  ✓
L334-342  .card-hover  floating outside @layer utilities (valid CSS, unintended)
L344-355  .card-bronze-glow  also floating outside
L356      }            ← STRAY BRACE — nothing to close, PostCSS errors here
L358-371  @media (prefers-reduced-motion: reduce)  ← fine
L373-388  .stagger-children + @keyframes stagger-fade  ← floating outside layer
```

## Fix (one file, surgical)

**`src/index.css`** — restructure the tail of the file so every rule is in the right place:

1. Remove the stray `}` at line 356.
2. Move `.card-hover`, `.card-bronze-glow` INSIDE `@layer utilities` — before the `}` that closes it (currently line 332). Concretely: delete the standalone blocks at lines 334-355 and re-insert them inside the layer before its closing brace.
3. Keep `@media (prefers-reduced-motion: reduce)` OUTSIDE `@layer utilities` (correct — media queries wrapping non-layered resets should be top-level).
4. `.stagger-children` and `@keyframes stagger-fade` should also be INSIDE `@layer utilities` — move them back inside the layer closing brace.

Final tail structure:
```css
@layer utilities {
  ...
  /* blur-in */
  .blur-in { ... }
  @keyframes blur-in { ... }

  /* card hover */
  .card-hover { ... }
  .card-hover:hover { ... }

  /* bronze glow */
  .card-bronze-glow { ... }
  .card-bronze-glow:hover { ... }

  /* stagger children */
  .stagger-children > * { ... }
  @keyframes stagger-fade { ... }
}   ← single clean close of @layer utilities

/* reduced motion — correctly outside the layer */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { ... }
  .animate-scroll-left { animation: none; }
}
```

## Verification
1. `npx tsc --noEmit` — should pass (already does)
2. `npx vite build` — must complete without PostCSS/CSS errors
3. Push to main — Vercel deployment should go green
