# Architecture & decisions

## Goals

A personal site that is a blog, journal, online diary, archive and portfolio; very
flexible to edit with rich text; room to grow; and as close to $0/month as possible —
while keeping the original Zykson look (Whyte Inktrap, giant uppercase type, warm greys,
ember red, plum frame, dotted black panel with the animated ZYK trails, roman-numeral menu).

## CMS choice: Payload 3, inside the app

| Option | Why not (for this site) |
| --- | --- |
| Hygraph (previous) | SaaS quotas, limited rich text, content lives with a vendor |
| Sanity | Excellent editor, but hosted content lake + account/quotas; private diary needs a private dataset |
| Notion as CMS | Great editor, but API rate limits, expiring image URLs, fragile rendering |
| Git/Markdown (Keystatic, Tina, Decap) | Free, but every save is a commit + redeploy; private entries would sit in the repo; weaker rich text |
| **Payload 3** ✅ | Open source, runs inside this Next.js app, owned database, Lexical editor with custom blocks, drafts/versions/autosave/live preview, real access control (private diary), auth, uploads, migrations — no per-seat or per-request pricing |

## How it fits together

```
app/
  (frontend)/        public site (root layout = Shell: header, dotted panel, menu, footer)
  (payload)/         Payload admin (/admin) + REST API (/api)
  global-not-found   404 for URLs no route matches
payload.config.ts    collections, globals, plugins, storage, database
payload/             schema: collections, blocks (rich + layout), editor configs, hooks, access
lib/queries.ts       every read the site does (visibility rules live here)
lib/viewer.ts        author mode = Next draft mode + valid Payload session
components/          site chrome, cards, rich-text renderer, page-builder sections
```

- **Rendering**: pages are statically generated (ISR, 1 h fallback). Publishing,
  unpublishing or deleting runs a Payload hook that calls `revalidatePath('/', 'layout')`,
  so the next visit to any page regenerates it. Scheduled posts appear within the hour.
- **Visibility**: enforced twice — in Payload access control (REST API never returns drafts,
  private or not-yet-published docs to anonymous users) and in `lib/queries.ts` (lists hide
  unlisted items; direct links allow them).
- **Author mode**: `/next/author` (and the admin Preview / Live Preview) verifies the Payload
  login, then enables Next.js draft mode; pages then read drafts and private docs.
- **Rich text**: Lexical JSON rendered on the server with custom converters
  (`components/rich-text`). Code is highlighted with Shiki and maths with KaTeX at render
  time — no client JS for either. Headings get anchors for the TOC; footnotes are collected.
- **Images**: Payload generates WebP sizes (480/960/1600/2400 + a 1200×630 share crop) and a
  blur placeholder on upload; `MediaImage` serves them with `srcset` — no paid image
  optimisation needed.
- **Search**: a plain-text copy of each document is stored on save (`searchText`) and
  queried with SQL `LIKE`, ranked by title matches — fine for thousands of entries.
- **Feeds/SEO**: RSS with full HTML content, sitemap, robots, canonical URLs, JSON-LD,
  generated Open Graph images (`/next/og`) when a page has no image.

## Cost

| Piece | Service | Free tier |
| --- | --- | --- |
| Hosting | Vercel Hobby | personal, non-commercial use |
| Database | Turso (libSQL) | several GB, generous reads |
| Media | Vercel Blob or Cloudflare R2 | R2: 10 GB, zero egress |
| Comments | Giscus | free (GitHub Discussions) |
| Analytics | Vercel Analytics | Hobby allowance |

Only a domain name costs money (optional).

## Extending

- **New content type** (bookshelf, photos, links…): add a collection in
  `payload/collections`, register it in `payload.config.ts`, add queries + a route.
- **New page section**: add a block to `payload/blocks/layout.ts` and a case in
  `components/blocks/RenderBlocks.tsx` — then it is available on every page.
- **New rich-text block**: add it to `payload/blocks/rich.ts`, list it in
  `payload/editor/full.ts`, render it in `components/rich-text/RichText.tsx`
  (and give it an HTML fallback in `lib/feed.ts` for RSS).
- Then `pnpm generate:types` and `pnpm migrate:create <name>`.

Possible next steps: newsletter (Buttondown/Resend free tiers), view counts, photo
collection with EXIF, bookshelf, multilingual (Payload localization), email notifications
for contact messages.
