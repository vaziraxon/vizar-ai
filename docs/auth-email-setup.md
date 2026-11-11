# Auth emails: settings to check in Supabase

The code is ready for both link styles. These are dashboard settings — nothing
here changes the database or users.

## 1. URL Configuration (Authentication → URL Configuration)

- **Site URL:** `https://vizarai.com`
- **Redirect URLs:**
  - `https://vizarai.com/auth/callback`
  - `https://vizarai.com/auth/confirm`
  - `http://localhost:3000/auth/callback` (local development only)

## 2. Vercel

`NEXT_PUBLIC_SITE_URL=https://vizarai.com` (Production). It is baked in at
build time, so it takes effect with the next production build. Without it the
code now falls back to Vercel's production domain, never to localhost.

## 3. Email templates (Authentication → Emails) — recommended

The default templates use `{{ .ConfirmationURL }}`. That works, but with the
PKCE flow the link only signs the user in **in the same browser** that asked
for it. The token-hash form below works on any device (route: `/auth/confirm`).

**Confirm signup**

```html
<h2>VIZAR AI — emailingizni tasdiqlang</h2>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard">Emailni tasdiqlash</a></p>
```

**Reset password**

```html
<h2>VIZAR AI — parolni tiklash</h2>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Yangi parol o‘rnatish</a></p>
<p>Agar siz so‘ramagan bo‘lsangiz, bu xatni e’tiborsiz qoldiring.</p>
```

A recovery link always opens Sozlamalar → “Yangi parol o‘rnatish”.

**Change email address**

```html
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change&next=/settings">Yangi emailni tasdiqlash</a></p>
```

## 4. Password security (Authentication → Policies / Password security)

Turn on **Leaked password protection** (HaveIBeenPwned check).
