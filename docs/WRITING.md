# Writing guide

Everything is edited at **`/admin`** (works on phone, tablet and desktop).

## The basics

- **Drafts save automatically** every couple of seconds. Nothing is public until you press
  **Publish**.
- **Schedule** by setting *Publish date* in the future and publishing — the post appears
  on its own when the time arrives (pages refresh hourly).
- **Preview** with the 👁 button, or **Live Preview** (split screen, phone/tablet/desktop
  sizes) to watch the real page update as you type.
- **Versions**: every save is kept — open *Versions* to compare or restore an older one.
- **Visibility** (right sidebar):
  - 🌍 *Public* — everywhere (lists, feeds, search, sitemap)
  - 🔗 *Unlisted* — only people with the link
  - 🔒 *Private* — only you, in author mode. Diary entries are private by default.
- **Author mode** (admin sidebar → *View as author*, or the dashboard button): browse the
  real site with drafts, scheduled and private items visible, each with an ✎ Edit link.
  *Exit* in the floating bar returns to the public view.

## What to write where

| | Use for | Extras |
| --- | --- | --- |
| **Blog posts** | Essays, long notes | Subtitle, cover, category, tags, series + part, featured ⭐, table of contents, comments, large type, canonical URL, SEO tab |
| **Journal & diary** | Short dated entries | Type (journal/diary), mood, weather, location, listening/reading/watching, “good things” list, cover |
| **Portfolio** | Projects, case studies | Role, client, year, status, disciplines, tools, links, results (big numbers), testimonial, gallery, related posts |
| **Pages** | About, Now, Uses, Contact, Home, anything | Hero style + any mix of sections (below) |

## The editor

Type **`/`** on an empty line for the block menu, select text for the formatting bar, or
use the fixed toolbar at the top. Markdown shortcuts work: `## ` heading, `- ` list,
`1. ` numbered, `[] ` checklist, `> ` quote, `---` divider, `**bold**`, `_italic_`, `` `code` ``.

**Text**: bold, italic, underline, strikethrough, sub/superscript, inline code, alignment,
indent, links (to any URL or to your own posts/projects/pages), headings H2–H4 (they build
the table of contents), bullet / numbered / check lists, quotes, dividers.

**Aa menu** (colours & styles): ember, rust, moss, sea, plum, muted; highlighter in four
colours; small caps; handwritten; spoiler (hidden until hovered).

**Media**: drop in images (caption, *text width / wide / full bleed / floated*, click-to-zoom),
or link a card to another post/project/entry.

**Tables**: insert from the `/` menu; add rows/columns from the cell menu.

**Blocks** (`/` menu):

| Block | What it does |
| --- | --- |
| Code | Syntax-highlighted code in 28 languages, copy button |
| Callout | Note / tip / important / warning / danger / success / aside box |
| Gallery | Grid, masonry, swipeable carousel or side-by-side, with lightbox |
| Embed | Paste a YouTube, Vimeo, Spotify, SoundCloud, CodePen, CodeSandbox, Figma, Loom, Google Maps or Bandcamp link |
| Link card | A bookmark with title/description/image fetched automatically |
| Pull quote | Big quote, or giant display type |
| Poem / verse | Keeps your line breaks exactly |
| Equation | LaTeX maths (KaTeX), with caption |
| Toggle | Collapsible details |
| Button | Call-to-action link |
| Audio / video | Upload a file or paste a direct URL |

**Inline blocks** (sit inside a sentence): **footnote** (numbered automatically, listed at
the end, preview on hover), **inline equation**, **keyboard keys** (`Cmd+Shift+P`).

## Writing check (spelling, grammar, readability)

Under every main editor there's a **✍️ Writing check** panel:

- **Check spelling & grammar** checks the title, subtitle, excerpt and text together
  (powered by LanguageTool). Each suggestion shows the sentence it's in; click a
  suggestion to apply it, **Show** to jump to it in the editor, **Ignore**, or
  **Add to dictionary** for names and words you use on purpose (your personal
  dictionary is on your author profile and can be edited there).
- **Picky** also flags style: wordiness, clichés, weak phrasing.
- **Language**: English (UK, US, Canada, Australia, NZ, South Africa) or automatic.
- **Readability** (instant, on your device): readability score, grade level, words,
  reading time, average sentence length, plus lists of long sentences, passive voice,
  adverbs, filler words and repeated words.
- Your browser also underlines misspellings as you type (in the chosen language).

Text you check is sent to LanguageTool's servers. To keep it fully private, run your
own LanguageTool server and set `LANGUAGETOOL_URL`.

## Building pages

A page has a **hero** (giant title, split with image, minimal or none — use `|` in the
heading for a line break) and **sections**, in any order:

Rich text · Giant text · Image/video · Gallery · Call to action · Posts list (latest,
featured, by category/tag/series, or hand-picked; list, grid, compact or feature cards) ·
Projects grid · Journal/diary feed · Timeline / CV · Stats (live counts or your own) ·
Quote · Accordion / FAQ · Link list · Embed · Columns · Contact form · Tag cloud · Spacer.

The page with slug **`home`** is the home page. Any page with slug `x` lives at `/x`;
tick *List in the big menu* to add it to the ☰ menu.

## Site settings

*Settings → Site settings*: name, header wordmark, tagline, description, avatar, default
share image, menu items (and which show in the header), social links, the “Currently…”
status line, an announcement bar, footer note, posts per page, and comments (Giscus).

## SEO & the installable app

*Settings → Site settings → SEO & app*: site language, your X/Twitter handle (credited
on share cards), Google/Bing/Yandex verification codes, an option to ask AI crawlers
not to use the site, and the name shown when the site is installed as an app.

Every post, entry, project and page also has an **SEO & sharing** tab (custom title,
description, share image, or hide from search engines). Everything else is automatic:
canonical URLs, Open Graph and Twitter cards, structured data (articles, breadcrumbs,
site search, your profile), sitemap with images, RSS, robots.txt, and generated share
images when a page has none.

**Offline & install**: readers can install the site (phone home screen or desktop),
read recently visited pages offline, and use **Save for offline** on any post, entry or
project.

## Inbox

Messages from contact forms land in **Inbox** — mark them read, replied or archived.

## Tips

- Leave *Excerpt* empty and the first lines are used automatically.
- Leave the slug empty and it is made from the title (or the date, for entries).
- Reading time and word count update on every save.
- Changed a URL? Add a **Redirect** (Settings → Redirects) so old links keep working.
