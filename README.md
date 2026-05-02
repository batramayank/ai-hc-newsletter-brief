# Healthcare AI Weekly — Public Archive

Editorial-style web archive for the weekly newsletter, powered by Supabase + Next.js, deployed on Vercel.

## Architecture

```
n8n workflow ──POST──▶ Supabase (issues table) ◀──read──── Next.js (Vercel)
                                                            │
                                                            ▼
                                                       Custom domain
```

- **Supabase** stores every issue (already done — your `issues` table).
- **n8n** inserts a new row each time the workflow runs (via the included HTTP node).
- **Next.js** reads from Supabase, statically generates a page per issue, revalidates every 60s.

---

## Part 1 — Wire up n8n → Supabase

### 1.1 Get your Supabase keys

In your Supabase dashboard:

1. Go to **Settings → API**
2. Copy the **Project URL** (looks like `https://abcdef.supabase.co`)
3. Copy two keys:
   - **`anon` `public`** — used by the website (safe to expose)
   - **`service_role` `secret`** — used by n8n only (NEVER put in the website)

The service_role key bypasses RLS, which is what lets n8n insert. Treat it like a database password.

### 1.2 Import the HTTP node into n8n

1. Open your healthcare-ai-newsletter workflow in n8n
2. **Import from File** → select `save-to-supabase-node.json`
3. Open the imported node and replace:
   - `YOUR_PROJECT_REF.supabase.co` → your Supabase URL
   - Both occurrences of `YOUR_SUPABASE_SERVICE_ROLE_KEY` → your service_role key
4. **Wire it up**: connect `Build HTML` → `Save to Supabase` → `Send via Gmail`

The node uses these expressions, all of which should already exist in your workflow's output:
- `$json.html` — the rendered HTML body
- `$json.intro` — the AI-generated intro (optional)
- `$json.categories` — array of category names (optional)
- `$json.articleCount` — count of articles (optional)
- Date is generated server-side via `$now`

If any of those field names differ in your workflow, just edit the JSON body in the node.

### 1.3 Test it

Run the workflow once manually. In Supabase **Table Editor → issues**, you should see a new row. If not, click into the Save to Supabase node and check the response — Supabase returns descriptive errors (`23505` = duplicate slug, `42501` = RLS blocked, etc.).

---

## Part 2 — Run the website locally

### 2.1 Prerequisites

- Node.js 18.17+ (`node --version` to check)
- A Supabase project with the `issues` table

### 2.2 Install and configure

```bash
cd healthcare-ai-archive
npm install
cp .env.local.example .env.local
```

Open `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your `anon` `public` key (NOT the service_role key)

### 2.3 Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If your Supabase table has issues, they'll appear. If not, you'll see a "presses are warm" placeholder until n8n inserts the first one.

---

## Part 3 — Deploy to Vercel with custom domain

### 3.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create healthcare-ai-archive --private --source=. --push
```

(Or create the repo in the GitHub UI and push manually.)

### 3.2 Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new), import the repo
2. **Framework**: Next.js (auto-detected)
3. **Environment Variables** — add both:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your final domain, for OG tags)
4. Click **Deploy**

First deploy takes ~90 seconds. You'll get a `something.vercel.app` URL.

### 3.3 Connect your custom domain

In the Vercel project: **Settings → Domains → Add**

Enter your domain (e.g., `healthcare-ai.youngsoft.com`). Vercel shows the DNS records to add:

- For a **subdomain** (like `healthcare-ai.youngsoft.com`): add a CNAME record at your DNS provider pointing to `cname.vercel-dns.com`
- For an **apex domain** (like `healthcareaiweekly.com`): add an A record to `76.76.21.21`

DNS propagation usually takes 1–10 minutes. Vercel auto-issues an SSL cert once DNS is verified.

### 3.4 Update the SITE_URL

After the domain is live, update `NEXT_PUBLIC_SITE_URL` in Vercel's env vars to your production domain and trigger a redeploy. This gives proper OG tags for LinkedIn shares.

---

## Part 4 — Customizations to make before launch

The scaffold has placeholders you'll want to update:

1. **Subscribe links** — search for `your-publication.beehiiv.com/subscribe` across the codebase and replace with your actual Beehiiv subscribe URL. Three locations:
   - `components/Header.tsx`
   - `components/Footer.tsx`
   - `app/issues/[slug]/page.tsx`

2. **Branding copy** — `components/Header.tsx` and `components/Footer.tsx` have masthead text ("Curated by Youngsoft", taglines, etc.). Tweak to match your voice.

3. **Volume number** — header shows "Vol. 1". Bump it manually each year if you want. Or remove it.

4. **OG image** — for prettier link previews on LinkedIn/Twitter, drop a `public/og-image.png` (1200×630) and reference it in `app/layout.tsx` metadata.

---

## How the design renders inline-styled email HTML

Your n8n workflow generates email-friendly HTML with inline `style="font-family:Inter..."` etc. Email styles look terrible in a website context. The site neutralizes them with CSS in `app/globals.css` under `.issue-body`:

```css
.issue-body * {
  font-family: inherit !important;
  max-width: none !important;
}
```

Then it applies its own typography (Fraunces for headings, IBM Plex Sans for body) and styles `<h2>`, `<h3>`, `<em>` (used for "Why it matters") to fit the editorial aesthetic. If you change the email template structure later, peek at `globals.css` to update selectors accordingly.

---

## Schema reminder

Your Supabase table:

```sql
create table issues (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  intro text,
  html_body text not null,
  categories jsonb default '[]'::jsonb,
  article_count int default 0,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index issues_published_at_idx on issues (published_at desc);

alter table issues enable row level security;

create policy "Public read access"
  on issues for select using (true);
```

The frontend works with this exact schema. If you add columns later (author, audio version, summary, etc.), update `lib/supabase.ts` `Issue` type and the corresponding components.

---

## Cost

- **Supabase free tier**: 500MB database, 5GB egress — covers years of weekly issues
- **Vercel hobby tier**: 100GB bandwidth, unlimited deploys — free
- **Domain**: ~$12/year if you buy fresh, $0 for a Youngsoft subdomain
- **Total**: $0–12/year

---

## What's not included (good v2 ideas)

- Search across past issues (add via Supabase full-text search on `html_body`)
- Filter archive by category (filter `flattenCategories` on the homepage)
- RSS feed (add `app/feed.xml/route.ts` that queries issues and returns RSS XML)
- Email-to-post API (let n8n trigger a deploy webhook for instant updates instead of waiting for ISR revalidation)
- Per-author bylines (add `author` column to `issues`)
