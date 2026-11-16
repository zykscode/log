# Zykson — blog, journal, diary, archive & portfolio

A personal site with its own CMS built in. Write at **`/admin`**, publish to the site.

- **Next.js 16** (App Router, Turbopack), **React 19**, **Tailwind CSS 4**, **Motion**
- **Payload CMS 3** running inside the same app — drafts, autosave, version history,
  scheduling, live preview, a rich editor with 15+ block types
- **SQLite** locally, **Turso** (libSQL) in production — your content, in a database you own
- Static pages that regenerate when you publish → fast and nearly free to host

Writing guide (all editor features): **[docs/WRITING.md](docs/WRITING.md)** ·
Architecture & decisions: **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**

---

## Run it locally

```bash
pnpm install
cp .env.example .env.local      # then set PAYLOAD_SECRET (any long random string)
pnpm dev                         # http://localhost:3000  ·  admin: /admin
```

The first visit to `/admin` asks you to create your account. Or load sample content
(posts using every block, journal & diary entries, projects, pages):

```bash
pnpm seed                        # only on an empty database
SEED_RESET=1 pnpm seed           # wipe content and reseed (careful)
```

## Sections

| URL | What | Managed in |
| --- | --- | --- |
| `/` | Home (built from sections) | Pages → slug `home` |
| `/blog`, `/blog/[slug]` | Long-form posts, categories, series, related posts, comments | Blog posts |
| `/journal`, `/diary` | Dated entries with mood, weather, place; calendar heatmap; “on this day” | Journal & diary |
| `/work`, `/work/[slug]` | Portfolio & case studies | Portfolio |
| `/archive` | Everything by year → month, filterable | automatic |
| `/tags`, `/tags/[slug]`, `/series/[slug]` | Topics & series | Tags, Series |
| `/search` + ⌘K anywhere | Full-text search | automatic |
| `/about`, `/now`, `/uses`, `/contact`, … | Any page you create | Pages |
| `/feed.xml`, `/blog/feed.xml`, `/journal/feed.xml` | RSS (full text) | automatic |
| `/sitemap.xml`, `/robots.txt`, share images | SEO | automatic |

**Visibility** on every post/entry/project: *Public*, *Unlisted* (link only — hidden from
lists, feeds, search, sitemap) or *Private* (only you). **Author mode** (admin sidebar →
“View as author”) shows drafts, scheduled and private items on the real site, with edit links.

## Deploy for $0

1. **Database — Turso** (free): `turso db create zykson`, then copy the URL and a token into
   `DATABASE_URL` / `DATABASE_AUTH_TOKEN`.
2. **Media — Vercel Blob** (Vercel → Storage → Blob → connect) *or* **Cloudflare R2**
   (10 GB free, no egress) via the `S3_*` variables.
3. **Hosting — Vercel Hobby**: import the repo, set the variables from `.env.example`
   (`PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL`, database, storage). Vercel runs the
   `vercel-build` script: production builds apply database migrations first; preview
   builds skip them so an unmerged branch can never change the live schema.
4. Open `https://your-domain/admin` and create your account.

Optional: comments via [Giscus](https://giscus.app) (free, GitHub Discussions) — paste
its IDs into *Site settings → Reading*.

## Changing the content model

Collections live in `payload/collections`, blocks in `payload/blocks`, editor features in
`payload/editor`. After changing them:

```bash
pnpm generate:types              # refresh payload-types.ts
pnpm generate:importmap          # if you added admin components
pnpm migrate:create my-change    # creates a migration for production
```

Locally the SQLite schema updates itself; production applies `migrations/` on deploy.

## Scripts

| Command | |
| --- | --- |
| `pnpm dev` / `build` / `start` | Next.js |
| `pnpm seed` | Sample content (+ local admin from `SEED_ADMIN_*`) |
| `pnpm import:hygraph` | One-off import of posts from the old Hygraph CMS |
| `pnpm generate:types` | Regenerate `payload-types.ts` |
| `pnpm migrate`, `migrate:create` | Database migrations |
| `pnpm lint`, `check-types`, `format` | Quality |
