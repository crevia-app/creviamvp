# Plan: Fix Login Error + Email Branding

## Context

`anthonyonyango635@gmail.com` was created via Google OAuth (confirmed by DB query — provider = "google"). Supabase stores no password for OAuth accounts, so every email/password login attempt returns 400 "Invalid login credentials." The current error toast says "Incorrect email or password" which gives no hint that this account requires Google sign-in. The user also wants company logo in auth emails and emails to not land in spam.

---

## Root Cause — No Code Bug

The sign-in code is correct. The problem is that Supabase returns the same 400 error for:
- Wrong password
- Account that has no password (Google OAuth account)

These are indistinguishable from the API. The fix is a better error message.

---

## Immediate Recovery (user action, no code needed)

Use the **Google button** to log in with `anthonyonyango635@gmail.com`. That account has no password.

To also enable email/password login for that same account: click **"Forgot password?"** → enter the email → Supabase sends a recovery link → click it → set a new password. After that both Google and email/password work.

---

## Code Change

### `src/pages/Auth.tsx` — Better error hint

**File:** [src/pages/Auth.tsx](src/pages/Auth.tsx), the `msg.includes("invalid login")` branch (~line 247)

Change the toast description from:
```
"Please check your details and try again."
```
To:
```
"Please check your details and try again. If you signed up with Google, tap the Google button above."
```

---

## Dashboard Actions (not code — user must do)

### Company logo in auth emails

**Supabase Dashboard → Authentication → Email Templates**

For each template (Confirm signup, Reset password, Magic link):
1. Click the template
2. At the top of the HTML body add:
```html
<div style="text-align:center;margin-bottom:16px;">
  <img src="https://creviamvp.vercel.app/crevia-logo.png" alt="Crevia" width="40" />
  <p style="font-weight:bold;margin-top:8px;">Crevia</p>
</div>
```
3. Change **Sender name** to `Crevia`
4. Save

### Stop emails going to spam

**Supabase Dashboard → Project Settings → Auth → SMTP Settings**

Confirm Resend is saved correctly:
- Host: `smtp.resend.com`
- Port: `465`
- Username: `resend`
- Password: Resend API key
- Sender email: `noreply@crevia.app`

**Resend Dashboard → Domains:** confirm `crevia.app` domain has its SPF and DKIM DNS records verified (green checkmark). Without this Gmail marks emails as spam regardless of SMTP.

---

## Verification

1. Log in with Google button using `anthonyonyango635@gmail.com` → works
2. Try email/password with wrong creds → new toast shows Google hint
3. "Forgot password?" → receive email in inbox (not spam) → set password → email/password login now works
4. New confirmation email shows Crevia logo and sender name "Crevia"
