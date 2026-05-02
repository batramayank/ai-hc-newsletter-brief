# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build (also type-checks)
npm run lint     # ESLint via next lint
npm run start    # serve the production build locally
```

No test suite is configured. Type errors surface during `npm run build`.

## Environment

Copy `.env.local.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key (safe to expose)
- `NEXT_PUBLIC_SITE_URL` — production domain (used in sitemaps, OG tags, JSON-LD)

The site reads from Supabase with the anon key (RLS enforced). Writes happen only via n8n using the service_role key externally — there is no write path in this Next.js app.

## Architecture

```
n8n workflow ──POST──▶ Supabase (issues table) ◀──read── Next.js app (Vercel)
```

Content pipeline: n8n generates the newsletter HTML and inserts a row into Supabase via service_role key. The Next.js app reads rows with the anon key and renders them. No CMS, no admin UI.

**Rendering strategy**: all pages use `revalidate = 60` (ISR). `generateStaticParams` pre-renders known issue slugs; unknown slugs fall through to SSR (`dynamicParams` defaults to `true`).

## Data layer — `lib/supabase.ts`

Single Supabase client. Key functions:
- `getAllIssues()` — homepage list, excludes `html_body` for payload size
- `getIssueBySlug(slug)` — full issue including `html_body`, used by `[slug]` page
- `getAllSlugs()` — used by `generateStaticParams`
- `flattenCategories(raw)` — normalises the `categories` JSONB column (can be `string[]` or `Record<string, unknown>`)

## Supabase schema

```sql
issues (
  id uuid PK,
  slug text UNIQUE,
  title text,
  intro text,
  html_body text,          -- full email HTML from n8n
  categories jsonb,        -- string[] or object; use flattenCategories()
  article_count int,
  published_at timestamptz,
  created_at timestamptz
)
```

RLS is enabled with a public SELECT policy. n8n inserts bypass RLS via service_role.

## Rendering email HTML

`html_body` is email-formatted HTML with inline styles from n8n. The `.issue-body` class in `globals.css` neutralises those inline styles (`font-family: inherit !important`, etc.) and re-applies site typography. Before render, `lib/sanitize.ts → sanitizeNewsletterHtml()` strips `<script>`, `on*` event handlers, `javascript:` URIs, `<object>`, and `<embed>` tags.

Key `.issue-body` selectors to know:
- `h3 a` — article title links (dark ink, teal on hover with gradient underline)
- `a` — all other links rendered blue (`#2563EB`)
- `em` — "Why it matters:" label; styled as italic teal block text

## Styling system

- **Tailwind CSS** with custom tokens in `tailwind.config.ts`
- Key colours: `accent` = `#0D9488` (teal), `ink` = `#111827`, `rule` = `#E5E7EB`, `paper` = `#FFFFFF`
- **Fonts**: Inter (display + sans via `--font-inter`), JetBrains Mono (mono via `--font-jetbrains`)
- Custom classes in `globals.css`: `.eyebrow`, `.category-pill`, `.link-underline`, `.issue-body`, `.animate-rise`, `.animate-fade`
- Category pill colours are assigned dynamically via `lib/utils.ts → getCategoryColor(category)` — full Tailwind class names must appear as literals in that file for JIT to include them. `lib/` is in Tailwind's `content` array for this reason.

## SEO / AEO

- `app/sitemap.ts` — dynamic, pulls all issues, revalidates hourly
- `app/robots.ts` — explicitly allows major AI crawlers (GPTBot, PerplexityBot, Claude-Web, etc.)
- `app/llms.txt/route.ts` — AEO endpoint per llmstxt.org spec; lists every issue with URL and date
- `components/JsonLd.tsx` — injects JSON-LD; used in layout (Organization + WebSite), homepage (ItemList), issue pages (NewsArticle + BreadcrumbList)

## Next.js params (v15+)

Route params are async in Next.js 15+. Always `await params` before accessing properties:

```ts
export default async function IssuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
```

## Subscription verification workflow

Custom double-opt-in flow — no SendGrid iframe.

```
POST /api/subscribe
  encryptEmail(email) → token          # lib/crypto.ts, AES-256-GCM, no expiry
  SendGrid PUT /v3/marketing/contacts  # adds to Unverified list, stores token
                                       # in custom field SENDGRID_CUSTOM_FIELD_ID

SendGrid automation email
  link: /thank-you?token={{email_encrypted}}

GET /thank-you?token=<token>           # app/thank-you/page.tsx (Server Component)
  decryptEmail(token) → email
  SendGrid search → contact_id
  DELETE from Unverified list
  PUT to Verified list
```

Key files: `lib/crypto.ts`, `app/api/subscribe/route.ts`, `app/subscribe/page.tsx`, `app/thank-you/page.tsx`.

Server-side env vars (no `NEXT_PUBLIC_` prefix): `SENDGRID_API_KEY`, `SENDGRID_UNVERIFIED_LIST_ID`, `SENDGRID_VERIFIED_LIST_ID`, `SENDGRID_CUSTOM_FIELD_ID` (the short field ID like `e1_T`, not the name), `ENCRYPTION_SECRET` (64-char hex, generate with `openssl rand -hex 32`).

The `/subscribe` page is a Client Component (`'use client'`) because it manages form state. The `/thank-you` page is a Server Component — it makes the SendGrid API calls directly on the server.

## Security headers

All security headers (CSP, `X-Frame-Options`, `X-Content-Type-Options`, etc.) are configured in `next.config.js` via the `headers()` function. The CSP `frame-src` is restricted to `https://cdn.forms-content-1.sg-form.com` (SendGrid subscribe form). Update it there if the iframe source changes.
