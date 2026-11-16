/**
 * Fills a fresh database with sample content that shows off every feature.
 *
 *   pnpm seed                 → only runs on an empty database
 *   SEED_RESET=1 pnpm seed    → deletes existing content first (careful!)
 *
 * Creates an admin user from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
 * (a random password is printed if none is given).
 */
import { randomBytes } from 'crypto';
import { readFile } from 'fs/promises';
import path from 'path';
import { getPayload } from 'payload';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

import config from '../payload.config';
import {
  block,
  checklist,
  doc,
  docLink,
  FMT,
  fromText,
  h,
  hr,
  inline,
  link,
  ol,
  p,
  quote,
  relationship,
  t,
  table,
  ul,
  upload,
} from './lexical-builders';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const ctx = { disableRevalidate: true };
const daysAgo = (n: number, hour = 10) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
};

/* ---------- generated artwork in the site palette ---------- */
const PALETTE = {
  plum: '#433b45',
  night: '#090805',
  bone: '#d5d0ca',
  sand: '#d0cbc5',
  ember: '#d32d08',
  rust: '#903900',
  moss: '#5a5e57',
};

function art(kind: number, label: string): string {
  const W = 1600;
  const H = 1000;
  const dots = Array.from(
    { length: Math.ceil(W / 40) * Math.ceil(H / 40) },
    (_, i) => {
      const x = (i % Math.ceil(W / 40)) * 40 + 20;
      const y = Math.floor(i / Math.ceil(W / 40)) * 40 + 20;
      return `<circle cx="${x}" cy="${y}" r="1.6" fill="currentColor" opacity="0.25"/>`;
    },
  ).join('');
  const themes = [
    { bg: PALETTE.night, fg: PALETTE.bone, accent: PALETTE.ember },
    { bg: PALETTE.ember, fg: PALETTE.night, accent: PALETTE.bone },
    { bg: PALETTE.sand, fg: PALETTE.night, accent: PALETTE.rust },
    { bg: PALETTE.plum, fg: PALETTE.bone, accent: PALETTE.ember },
    { bg: PALETTE.rust, fg: PALETTE.bone, accent: PALETTE.night },
    { bg: PALETTE.moss, fg: PALETTE.bone, accent: PALETTE.sand },
  ];
  const th = themes[kind % themes.length];
  const shapes = [
    `<circle cx="1150" cy="480" r="330" fill="${th.accent}"/><circle cx="1150" cy="480" r="200" fill="${th.bg}"/>`,
    `<rect x="900" y="140" width="520" height="720" rx="260" fill="${th.accent}"/>`,
    `<path d="M820 860 L1180 140 L1520 860 Z" fill="${th.accent}"/>`,
    `<g stroke="${th.accent}" stroke-width="26" fill="none"><path d="M880 220 h520 L880 780 h520"/></g>`,
    `<g fill="${th.accent}">${Array.from({ length: 6 }, (_, i) => `<rect x="${900 + i * 90}" y="${200 + (i % 2) * 120}" width="54" height="${560 - (i % 3) * 90}" rx="27"/>`).join('')}</g>`,
    `<g fill="none" stroke="${th.accent}" stroke-width="18">${Array.from({ length: 7 }, (_, i) => `<circle cx="1180" cy="500" r="${60 + i * 52}"/>`).join('')}</g>`,
  ][kind % 6];
  const words = label.toUpperCase().split(' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" color="${th.fg}">
  <rect width="100%" height="100%" fill="${th.bg}"/>${dots}${shapes}
  <g font-family="Helvetica, Arial, sans-serif" font-weight="700" fill="${th.fg}" letter-spacing="-8">
  ${words
    .slice(0, 3)
    .map(
      (w, i) =>
        `<text x="90" y="${H - 120 - (Math.min(words.length, 3) - 1 - i) * 150}" font-size="160">${w}</text>`,
    )
    .join('')}
  </g></svg>`;
}

async function main() {
  const payload = await getPayload({ config });
  const existing = await payload.count({
    collection: 'posts',
    overrideAccess: true,
  });

  if (existing.totalDocs > 0 && !process.env.SEED_RESET) {
    payload.logger.warn(
      'Database already has content — skipping. Run with SEED_RESET=1 to wipe and reseed.',
    );
    process.exit(0);
  }

  if (process.env.SEED_RESET) {
    payload.logger.warn('SEED_RESET=1 → deleting existing content…');
    for (const collection of [
      'posts',
      'journal',
      'projects',
      'pages',
      'series',
      'categories',
      'tags',
      'messages',
      'redirects',
      'media',
    ] as const) {
      await payload.delete({
        collection,
        where: { id: { exists: true } },
        overrideAccess: true,
        context: ctx,
      });
    }
  }

  /* ---------- author ---------- */
  const email = process.env.SEED_ADMIN_EMAIL || 'author@example.com';
  const password =
    process.env.SEED_ADMIN_PASSWORD || randomBytes(9).toString('base64url');
  const users = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  });
  let user = users.docs[0];
  if (!user) {
    user = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        name: 'Zykson',
        role: 'admin',
        bio: 'Writer, builder, collector of small good things.',
      },
      overrideAccess: true,
    });
    payload.logger.info(
      `Created admin ${email} / ${process.env.SEED_ADMIN_PASSWORD ? '(password from SEED_ADMIN_PASSWORD)' : password}`,
    );
  }

  /* ---------- media ---------- */
  const mk = async (
    kind: number,
    label: string,
    alt: string,
    caption?: string,
  ) => {
    const data = await sharp(Buffer.from(art(kind, label)))
      .png()
      .toBuffer();
    return payload.create({
      collection: 'media',
      data: { alt, caption },
      file: {
        data,
        mimetype: 'image/png',
        name: `${label.toLowerCase().replace(/\W+/g, '-')}.png`,
        size: data.length,
      },
      overrideAccess: true,
      context: ctx,
    });
  };
  const avatarFile = await readFile(path.resolve(dirname, '../public/me.jpg'));
  const avatar = await payload.create({
    collection: 'media',
    data: { alt: 'Portrait of Zykson' },
    file: {
      data: avatarFile,
      mimetype: 'image/jpeg',
      name: 'zykson-avatar.jpg',
      size: avatarFile.length,
    },
    overrideAccess: true,
    context: ctx,
  });
  await payload.update({
    collection: 'users',
    id: user.id,
    data: { avatar: avatar.id },
    overrideAccess: true,
  });

  const img = {
    welcome: await mk(
      0,
      'New site',
      'Black poster with “New site” and a red ring',
    ),
    toolkit: await mk(1, 'Toolkit', 'Red poster with the word Toolkit'),
    zero: await mk(2, 'Zero cost', 'Sand-coloured poster reading Zero cost'),
    type: await mk(3, 'Giant type', 'Plum poster with a giant Z'),
    g1: await mk(
      4,
      'Studio',
      'Rust-coloured abstract bars',
      'Studio, morning light',
    ),
    g2: await mk(5, 'Circles', 'Moss-green concentric circles', 'Concentric'),
    g3: await mk(0, 'Night', 'Black poster with a red ring', 'Night shift'),
    p1: await mk(3, 'Atlas', 'Plum poster for the Atlas project'),
    p2: await mk(1, 'Fieldnotes', 'Red poster for Fieldnotes'),
    p3: await mk(2, 'Signal', 'Sand poster for Signal'),
    journal: await mk(5, 'Saturday', 'Green circles poster'),
  };

  /* ---------- taxonomy ---------- */
  const cat = async (title: string, description: string) =>
    payload.create({
      collection: 'categories',
      data: { title, description },
      overrideAccess: true,
      context: ctx,
    });
  const essays = await cat('Essays', 'Longer pieces, worked out slowly.');
  const notes = await cat('Notes', 'Shorter thoughts and how-tos.');
  const design = await cat('Design', 'Type, layout, colour and craft.');
  await cat('Technology', 'Software, the web and tools.');

  const tag = async (title: string) =>
    payload.create({
      collection: 'tags',
      data: { title },
      overrideAccess: true,
      context: ctx,
    });
  const tags = {
    writing: await tag('Writing'),
    design: await tag('Design'),
    web: await tag('Web'),
    life: await tag('Life'),
    music: await tag('Music'),
    tools: await tag('Tools'),
    typography: await tag('Typography'),
    travel: await tag('Travel'),
  };
  const series = await payload.create({
    collection: 'series',
    data: {
      title: 'Building Zykson',
      description: 'How this site was designed and built, step by step.',
    },
    overrideAccess: true,
    context: ctx,
  });

  const createPost = (
    data: Record<string, unknown>,
    status: 'published' | 'draft' = 'published',
  ) =>
    payload.create({
      collection: 'posts',
      data: {
        authors: [user.id],
        visibility: 'public',
        ...data,
        _status: status,
      } as never,
      overrideAccess: true,
      context: ctx,
      draft: status === 'draft',
    });

  /* ---------- posts ---------- */
  const zero = await createPost({
    title: 'How this site is built — and why it costs nothing',
    subtitle:
      'A tour of the stack: Next.js, Payload CMS, SQLite and free tiers.',
    coverImage: img.zero.id,
    category: notes.id,
    series: series.id,
    seriesOrder: 1,
    tags: [tags.web.id, tags.tools.id],
    publishedAt: daysAgo(30),
    content: doc(
      p(
        'Everything here — the writing, the journal, the diary, the portfolio — lives in one small app. The editor you use to write is part of the same codebase, at ',
        t('/admin', FMT.code),
        '.',
      ),
      h(2, 'The pieces'),
      table([
        ['Layer', 'Choice', 'Monthly cost'],
        ['Framework', 'Next.js 16', '$0'],
        ['CMS', 'Payload 3 (self-hosted, in the same app)', '$0'],
        ['Database', 'SQLite locally, Turso in production', '$0'],
        ['Images', 'Vercel Blob or Cloudflare R2', '$0'],
        ['Hosting', 'Vercel Hobby', '$0'],
      ]),
      h(2, 'Why a CMS inside the app?'),
      p(
        'Because the content is mine. It sits in a database I own, exports cleanly, and there is no vendor quota to grow out of. ',
        t('Drafts', FMT.b),
        ', ',
        t('version history', FMT.b),
        ', ',
        t('scheduled publishing', FMT.b),
        ' and ',
        t('live preview', FMT.b),
        ' all come built in.',
      ),
      h(3, 'Static by default'),
      p(
        'Pages are generated once and served from the edge. When I publish, the site quietly regenerates what changed — no rebuild, no waiting.',
      ),
      block('callout', {
        variant: 'tip',
        title: 'Scheduling',
        content: doc(
          p(
            'Set a publish date in the future and the post appears on its own when the time comes.',
          ),
        ),
      }),
      h(2, 'What it means day to day'),
      ol(
        'Open /admin on any device.',
        'Write — drafts save as you type.',
        'Hit publish (or schedule).',
      ),
    ),
  });

  const type = await createPost({
    title: 'Designing with giant type',
    subtitle:
      'Why the titles on this site are so loud, and how they stay readable.',
    coverImage: img.type.id,
    category: design.id,
    series: series.id,
    seriesOrder: 2,
    tags: [tags.design.id, tags.typography.id],
    publishedAt: daysAgo(18),
    content: doc(
      p(
        'The look started with one decision: let the type be the image. Whyte Inktrap has those little notches — ink traps — that make it feel engineered at small sizes and wild at huge ones.',
      ),
      block('pullQuote', {
        text: 'Let the type be the image.',
        style: 'giant',
      }),
      h(2, 'Rules I keep'),
      ul(
        'Uppercase only for display sizes.',
        'Tight tracking (−4.5%) and tighter leading (0.84).',
        'Body text stays calm: 18px, generous line height.',
      ),
      h(2, 'Colour'),
      p(
        'Warm greys, an ember red ',
        t('#d32d08', FMT.code),
        ' for accents, and plum for the frame in dark mode. In the editor you can ',
        t('colour text', 0, { color: 'ember' }),
        ' or ',
        t('highlight it', 0, { highlight: 'marker' }),
        ' from the toolbar.',
      ),
      block('gallery', {
        images: [img.g1.id, img.g2.id, img.g3.id],
        layout: 'grid',
        columns: '3',
        width: 'wide',
        caption: 'Explorations for the palette',
      }),
    ),
  });

  const toolkit = await createPost({
    title: 'The writing toolkit: every block in one post',
    subtitle:
      'A living style guide — headings, lists, code, maths, galleries, embeds, footnotes and more.',
    coverImage: img.toolkit.id,
    category: notes.id,
    tags: [tags.writing.id, tags.tools.id],
    publishedAt: daysAgo(9),
    showToc: true,
    content: doc(
      p(
        'This post exists to show what the editor can do. Open it in the admin to see how each piece is made — then delete it whenever you like.',
      ),
      h(2, 'Text formatting'),
      p(
        'You can write in ',
        t('bold', FMT.b),
        ', ',
        t('italic', FMT.i),
        ', ',
        t('underline', FMT.u),
        ', ',
        t('strikethrough', FMT.s),
        ', ',
        t('inline code', FMT.code),
        ', H',
        t('2', FMT.sub),
        'O and E = mc',
        t('2', FMT.sup),
        '. Text can be ',
        t('ember', 0, { color: 'ember' }),
        ', ',
        t('moss', 0, { color: 'moss' }),
        ' or ',
        t('sea', 0, { color: 'sea' }),
        ', ',
        t('highlighted', 0, { highlight: 'marker' }),
        ', set in ',
        t('small caps', 0, { style: 'small-caps' }),
        ', or hidden as a ',
        t('spoiler (hover me)', 0, { style: 'spoiler' }),
        '. Links go ',
        link('https://payloadcms.com', 'anywhere on the web'),
        ' or ',
        docLink('posts', zero.id, 'to another post'),
        '. Press ',
        inline('kbd', { keys: 'Cmd+K' }),
        ' to search the site.',
      ),
      p(
        'Footnotes are inline blocks',
        inline('footnote', {
          note: 'Like this one. They are numbered automatically and collected at the end, with a link back. https://en.wikipedia.org/wiki/Note_(typography)',
        }),
        ' — hover the number to preview, click to jump.',
        inline('footnote', {
          note: 'A second note, to prove numbering works.',
        }),
      ),
      h(2, 'Headings & structure'),
      h(3, 'A third-level heading'),
      p(
        'Headings H2–H4 build the table of contents on the left automatically.',
      ),
      h(4, 'A fourth-level heading'),
      quote('A blockquote, for when someone else said it better.'),
      hr(),
      h(2, 'Lists'),
      ul('Bullets with ember dots', 'Second item', [
        'A ',
        t('formatted', FMT.b),
        ' item',
      ]),
      ol('Numbered', 'Steps', 'In order'),
      checklist([
        ['Write the first draft', true],
        ['Add images', true],
        ['Publish', false],
      ]),
      h(2, 'Callouts'),
      block('callout', {
        variant: 'note',
        title: 'Note',
        content: doc(p('Neutral information.')),
      }),
      block('callout', {
        variant: 'tip',
        title: 'Tip',
        content: doc(
          p('Something helpful, with ', t('formatting', FMT.b), '.'),
        ),
      }),
      block('callout', {
        variant: 'warning',
        content: doc(p('A warning without a title.')),
      }),
      block('callout', {
        variant: 'danger',
        title: 'Careful',
        content: doc(p('Something that can go wrong.')),
      }),
      h(2, 'Code'),
      block('code', {
        language: 'typescript',
        code: "export function greet(name: string) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet('world'));",
      }),
      block('code', {
        language: 'shell',
        code: 'pnpm install\npnpm dev   # http://localhost:3000',
      }),
      h(2, 'Maths'),
      p(
        'Inline maths like ',
        inline('inlineMath', { latex: 'e^{i\\pi} + 1 = 0' }),
        ' sits in a sentence; display maths gets its own line:',
      ),
      block('math', {
        latex: '\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}',
        caption: 'The Gaussian integral',
      }),
      h(2, 'Images & galleries'),
      upload(img.g2.id, {
        caption: 'A single image with a caption — click to zoom.',
        size: 'wide',
        zoom: true,
      }),
      block('gallery', {
        images: [img.g1.id, img.g3.id, img.welcome.id, img.zero.id],
        layout: 'carousel',
        width: 'wide',
        caption: 'A swipeable carousel',
      }),
      h(2, 'Tables'),
      table([
        ['Block', 'Where', 'Notes'],
        ['Callout', 'Rich text', '7 styles'],
        ['Gallery', 'Rich text + pages', 'Grid, masonry, carousel, row'],
        ['Embed', 'Rich text + pages', 'YouTube, Spotify, Figma…'],
      ]),
      h(2, 'Embeds & links'),
      block('embed', {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        aspect: 'auto',
        caption: 'Any YouTube link becomes a privacy-friendly player',
      }),
      block('bookmark', {
        url: 'https://payloadcms.com/docs',
        title: 'Payload documentation',
        description: 'Everything about the CMS behind this site.',
        siteName: 'payloadcms.com',
      }),
      relationship('posts', type.id),
      h(2, 'Quotes, poems & toggles'),
      block('pullQuote', {
        text: 'Write it down. Then write it better.',
        attribution: 'Advice to self',
      }),
      block('verse', {
        title: 'Haiku for a deploy',
        text: 'green checks on the screen\nthe cache forgets what it knew\nnew pages bloom fast',
        align: 'center',
      }),
      block('details', {
        summary: 'Click to expand a toggle',
        content: doc(
          p('Hidden content — great for spoilers, extra detail or FAQs.'),
        ),
      }),
      block('button', {
        label: 'Read the next post',
        url: `/blog/${zero.slug}`,
        style: 'primary',
      }),
    ),
  });

  const welcome = await createPost({
    title: 'Welcome to the new Zykson',
    subtitle:
      'A blog, a journal, a diary, an archive and a portfolio — all in one place.',
    coverImage: img.welcome.id,
    category: essays.id,
    tags: [tags.writing.id, tags.life.id],
    publishedAt: daysAgo(2),
    featured: true,
    content: doc(
      p(
        'Hello — and welcome. This site is where I keep everything: long writing in the ',
        link('/blog', 'blog'),
        ', quick notes in the ',
        link('/journal', 'journal'),
        ', personal days in the ',
        link('/diary', 'diary'),
        ', and things I make under ',
        link('/work', 'work'),
        '.',
      ),
      h(2, 'Where to start'),
      ul(
        [
          'The ',
          link('/archive', 'archive'),
          ' has every single thing, by date.',
        ],
        [
          'Press ',
          inline('kbd', { keys: 'Cmd+K' }),
          ' (or ',
          inline('kbd', { keys: '/' }),
          ') to search.',
        ],
        ['Follow along with ', link('/feed.xml', 'RSS'), '.'],
      ),
      p(
        'The toolkit post shows what the editor can do: ',
        docLink('posts', toolkit.id, 'every block in one post'),
        '.',
      ),
    ),
  });

  await createPost(
    {
      title: 'A draft that nobody can see yet',
      content: fromText(
        'Drafts are only visible to you, in author mode. Readers never see them.',
      ),
      category: notes.id,
    },
    'draft',
  );
  await createPost({
    title: 'A post from the future',
    subtitle:
      'Scheduled — it appears on the site by itself when the date arrives.',
    content: fromText(
      'If you can read this on the public site, the scheduled date has passed.',
    ),
    category: notes.id,
    publishedAt: daysAgo(-7),
  });
  await createPost({
    title: 'Unlisted: a post only people with the link can find',
    content: fromText(
      'Unlisted posts are hidden from lists, feeds, search and the sitemap, but the link works.',
    ),
    category: notes.id,
    visibility: 'unlisted',
    publishedAt: daysAgo(5),
  });

  /* ---------- journal & diary ---------- */
  const entry = (data: Record<string, unknown>) =>
    payload.create({
      collection: 'journal',
      data: { _status: 'published', ...data } as never,
      overrideAccess: true,
      context: ctx,
    });

  await entry({
    type: 'journal',
    visibility: 'public',
    title: 'Shipping the new site',
    publishedAt: daysAgo(1, 21),
    mood: 'inspired',
    weather: 'rain',
    location: 'Lagos',
    listeningTo: 'Bonobo — Migration',
    tags: [tags.web.id],
    content: doc(
      p(
        'Finally moved everything into one place. The journal feels like a notebook that happens to be public — no pressure to make it an essay.',
      ),
      p('Next: write more, polish less.'),
    ),
    highlights: [
      { text: 'Rain on the window while deploying' },
      { text: 'First comment from a friend' },
    ],
  });
  await entry({
    type: 'journal',
    visibility: 'public',
    publishedAt: daysAgo(4, 9),
    mood: 'calm',
    weather: 'sunny',
    reading: 'The Creative Act — Rick Rubin',
    tags: [tags.writing.id],
    content: doc(
      p(
        'Small idea for the morning: write the thing badly first. The editor is for later.',
      ),
    ),
  });
  await entry({
    type: 'journal',
    visibility: 'public',
    title: 'Notes from a long walk',
    publishedAt: daysAgo(12, 17),
    mood: 'content',
    weather: 'windy',
    location: 'Lekki',
    coverImage: img.journal.id,
    tags: [tags.life.id, tags.travel.id],
    content: doc(
      p('Walked for two hours without headphones. Things I noticed:'),
      ul(
        'How loud the city is at 5pm',
        'A man selling only red umbrellas',
        'The sea smells different when it is about to rain',
      ),
    ),
  });
  await entry({
    type: 'journal',
    visibility: 'public',
    title: 'A year ago today',
    publishedAt: (() => {
      const d = new Date();
      d.setUTCFullYear(d.getUTCFullYear() - 1);
      d.setUTCHours(12, 0, 0, 0);
      return d.toISOString();
    })(),
    mood: 'grateful',
    content: doc(
      p(
        'This entry exists to show the “On this day” memories on the journal page.',
      ),
    ),
  });
  await entry({
    type: 'diary',
    visibility: 'public',
    title: 'A good Saturday',
    publishedAt: daysAgo(3, 20),
    mood: 'happy',
    weather: 'partly-cloudy',
    watching: 'Past Lives',
    content: doc(
      p(
        'Slow breakfast, long call with mum, cooked jollof for friends. Shared this one because days like this deserve remembering out loud.',
      ),
    ),
    highlights: [
      { text: 'Jollof came out perfect' },
      { text: 'Laughed until it hurt' },
    ],
  });
  await entry({
    type: 'diary',
    visibility: 'private',
    title: 'Private: just for me',
    publishedAt: daysAgo(1, 23),
    mood: 'anxious',
    content: doc(
      p(
        'Private diary entries never appear on the public site, in feeds, search or the API — only to you in author mode.',
      ),
    ),
  });
  await entry({
    type: 'diary',
    visibility: 'private',
    publishedAt: daysAgo(6, 22),
    mood: 'tired',
    content: doc(p('Another private one. Long day.')),
  });
  for (let i = 0; i < 18; i++) {
    // a scattering of short public entries so the heatmap has something to show
    await entry({
      type: i % 3 === 0 ? 'diary' : 'journal',
      visibility: 'public',
      publishedAt: daysAgo(14 + i * 9, 8 + (i % 10)),
      mood: ['happy', 'calm', 'meh', 'inspired', 'tired', 'content'][i % 6],
      content: doc(
        p(
          [
            'Quiet day. Wrote a little.',
            'Tried a new coffee place.',
            'Fixed a stubborn bug.',
            'Read on the balcony.',
            'Rainy evening, early night.',
            'Sketched some layouts.',
          ][i % 6],
        ),
      ),
    });
  }

  /* ---------- projects ---------- */
  const project = (data: Record<string, unknown>) =>
    payload.create({
      collection: 'projects',
      data: { _status: 'published', visibility: 'public', ...data } as never,
      overrideAccess: true,
      context: ctx,
    });

  await project({
    title: 'Atlas',
    summary:
      'A field guide to the city’s forgotten buildings — mapped, photographed and written up.',
    coverImage: img.p1.id,
    role: 'Design, development & writing',
    client: 'Personal project',
    year: '2025',
    status: 'shipped',
    disciplines: ['design', 'development', 'writing'],
    stack: ['Next.js', 'Mapbox', 'Figma'],
    links: [
      { label: 'Visit site', url: 'https://example.com' },
      { label: 'Source', url: 'https://github.com' },
    ],
    featured: true,
    sortOrder: 1,
    publishedAt: daysAgo(60),
    tags: [tags.design.id, tags.web.id],
    metrics: [
      { value: '140', label: 'buildings mapped' },
      { value: '12k', label: 'monthly readers' },
      { value: '3', label: 'press mentions' },
      { value: '0', label: 'ads' },
    ],
    testimonial: {
      quote: 'The most thoughtful city guide I have used.',
      author: 'A happy reader',
      authorRole: 'Architect',
    },
    gallery: [img.g1.id, img.g2.id, img.g3.id],
    relatedPosts: [type.id],
    content: doc(
      h(2, 'The problem'),
      p('Beautiful old buildings disappear quietly. Nobody writes them down.'),
      h(2, 'What I made'),
      p(
        'A map-first site with short essays for each building, built to load fast on cheap phones.',
      ),
      block('callout', {
        variant: 'success',
        title: 'Outcome',
        content: doc(
          p('Two buildings were listed for preservation after features ran.'),
        ),
      }),
    ),
  });
  await project({
    title: 'Fieldnotes',
    summary:
      'A tiny writing app for capturing thoughts on the go, synced to Markdown.',
    coverImage: img.p2.id,
    role: 'Product & engineering',
    year: '2024',
    status: 'ongoing',
    disciplines: ['product', 'development'],
    stack: ['React Native', 'SQLite'],
    featured: true,
    sortOrder: 2,
    publishedAt: daysAgo(120),
    tags: [tags.tools.id, tags.writing.id],
    content: doc(p('Notes that open instantly and never ask you to log in.')),
  });
  await project({
    title: 'Signal',
    summary: 'Brand identity and type system for an independent radio station.',
    coverImage: img.p3.id,
    role: 'Brand designer',
    client: 'Signal FM',
    year: '2023',
    status: 'shipped',
    disciplines: ['branding', 'design', 'music'],
    stack: ['Figma', 'Glyphs'],
    sortOrder: 3,
    publishedAt: daysAgo(400),
    tags: [tags.design.id, tags.music.id],
    content: doc(
      p('A loud, flexible identity built around a custom wordmark.'),
    ),
  });

  /* ---------- pages ---------- */
  const page = (data: Record<string, unknown>) =>
    payload.create({
      collection: 'pages',
      data: { _status: 'published', visibility: 'public', ...data } as never,
      overrideAccess: true,
      context: ctx,
    });

  await page({
    title: 'Home',
    slug: 'home',
    hero: {
      style: 'giant',
      kicker: 'Writing · Journal · Diary · Work',
      heading: "Hello,|I'm Zykson",
      intro:
        'I write about design, the web and the small things that make a day. This is my notebook, my archive and my portfolio.',
    },
    layout: [
      {
        blockType: 'postsFeed',
        source: 'featured',
        layout: 'feature',
        limit: 1,
        showViewAll: false,
      },
      {
        blockType: 'postsFeed',
        heading: 'Latest writing',
        source: 'latest',
        layout: 'list',
        limit: 5,
        showViewAll: true,
        skipFeatured: true,
      },
      {
        blockType: 'projectsGrid',
        heading: 'Selected work',
        source: 'featured',
        limit: 4,
      },
      {
        blockType: 'journalFeed',
        heading: 'From the journal',
        entryType: 'all',
        limit: 4,
      },
      {
        blockType: 'bigText',
        lines: [{ text: 'Write it' }, { text: 'down.' }],
        tone: 'muted',
        align: 'left',
      },
      { blockType: 'stats', heading: 'By the numbers', auto: true },
      {
        blockType: 'cta',
        heading: 'Say hello',
        body: 'Questions, ideas, or just a nice note — my inbox is open.',
        links: [
          { label: 'Contact', url: '/contact', style: 'primary' },
          { label: 'Subscribe via RSS', url: '/feed.xml', style: 'outline' },
        ],
      },
    ],
  });

  await page({
    title: 'About',
    slug: 'about',
    showInMenu: false,
    hero: {
      style: 'split',
      kicker: 'About',
      heading: 'Designer,|writer,|builder',
      intro:
        'I make websites, write things down and collect small good things. Based in Lagos.',
      media: avatar.id,
    },
    layout: [
      {
        blockType: 'content',
        width: 'narrow',
        content: doc(
          p(
            'I have been keeping notes in one form or another for years — notebooks, a blog, voice memos. This site finally puts them all in one place.',
          ),
          p(
            'I care about type, clear writing and software that respects people.',
          ),
        ),
      },
      {
        blockType: 'timeline',
        heading: 'Experience',
        items: [
          {
            period: '2023 — now',
            title: 'Independent designer & developer',
            org: 'Self-employed',
            description: 'Websites, identities and small products.',
          },
          {
            period: '2020 — 2023',
            title: 'Product designer',
            org: 'A startup',
            description: 'Led design for web and mobile.',
          },
          {
            period: '2018 — 2020',
            title: 'Frontend developer',
            org: 'An agency',
          },
        ],
      },
      {
        blockType: 'linkList',
        heading: 'Elsewhere',
        layout: 'grid',
        links: [
          {
            label: 'GitHub',
            url: 'https://github.com/zykson',
            description: 'Code and experiments',
          },
          {
            label: 'X / Twitter',
            url: 'https://x.com/zykson',
            description: 'Short thoughts',
          },
          {
            label: 'YouTube',
            url: 'https://youtube.com/@zykson',
            description: 'Videos',
          },
          {
            label: 'RSS',
            url: '/feed.xml',
            description: 'Everything I publish',
          },
        ],
      },
    ],
  });

  await page({
    title: 'Now',
    slug: 'now',
    showInMenu: true,
    hero: {
      style: 'giant',
      kicker: 'Updated this month',
      heading: 'Now',
      intro: 'What I am focused on at the moment (a “now page”).',
    },
    layout: [
      {
        blockType: 'content',
        width: 'narrow',
        content: doc(
          h(2, 'Working on'),
          ul('This website', 'A long essay about cities'),
          h(2, 'Reading'),
          ul('The Creative Act — Rick Rubin'),
          h(2, 'Listening'),
          ul('Bonobo, Tems, a lot of highlife'),
        ),
      },
    ],
  });

  await page({
    title: 'Uses',
    slug: 'uses',
    showInMenu: true,
    hero: {
      style: 'minimal',
      kicker: 'Uses',
      heading: 'Tools I use every day',
      intro: 'Hardware, software and small things that make work nicer.',
    },
    layout: [
      {
        blockType: 'columns',
        heading: 'Setup',
        columns: [
          {
            content: doc(
              h(3, 'Hardware'),
              ul('Laptop', 'A good chair', 'Mechanical keyboard'),
            ),
          },
          {
            content: doc(h(3, 'Software'), ul('VS Code', 'Figma', 'This CMS')),
          },
          {
            content: doc(
              h(3, 'Writing'),
              ul('Paper notebook', 'The journal on this site'),
            ),
          },
        ],
      },
      {
        blockType: 'accordion',
        heading: 'FAQ',
        items: [
          {
            title: 'What font is this?',
            content: doc(p('Whyte Inktrap by Dinamo.')),
          },
          {
            title: 'Is the site open source?',
            content: doc(p('The code is in my repository.')),
          },
        ],
      },
    ],
  });

  await page({
    title: 'Contact',
    slug: 'contact',
    showInMenu: true,
    hero: { style: 'giant', kicker: 'Contact', heading: 'Say|hello' },
    layout: [
      {
        blockType: 'contact',
        heading: 'Write to me',
        intro: 'I read everything. Replies usually within a few days.',
        successMessage:
          'Thanks — your message is in. I’ll get back to you soon.',
      },
    ],
  });

  /* ---------- settings ---------- */
  await payload.updateGlobal({
    slug: 'settings',
    data: {
      siteName: 'Zykson',
      wordmark: 'Zykson.com',
      authorName: 'Zykson',
      tagline: 'Writing, journal, diary & work',
      description:
        'The personal site of Zykson — a blog, journal, diary, archive and portfolio.',
      avatar: avatar.id,
      location: 'Lagos, Nigeria',
      now: {
        emoji: '📖',
        text: 'Reading The Creative Act and rebuilding this site.',
      },
      footerNote: 'Written and built by hand.',
      navItems: [
        { label: 'Blog', url: '/blog', inHeader: true },
        { label: 'Journal', url: '/journal', inHeader: true },
        { label: 'Diary', url: '/diary', inHeader: false },
        { label: 'Work', url: '/work', inHeader: true },
        { label: 'Archive', url: '/archive', inHeader: true },
        { label: 'About', url: '/about', inHeader: false },
      ],
      socials: [
        { platform: 'github', url: 'https://github.com/zykson' },
        { platform: 'x', url: 'https://x.com/zykson' },
        { platform: 'youtube', url: 'https://youtube.com/@zykson' },
        { platform: 'rss', url: '/feed.xml' },
      ],
      postsPerPage: 12,
      entriesPerPage: 20,
    },
    overrideAccess: true,
    context: ctx,
  });

  payload.logger.info(`✓ Seed complete — log in at /admin as ${email}`);
  void welcome;
  process.exit(0);
}

// top-level await: `payload run` exits as soon as the module finishes loading
await main().catch((err) => {
  console.error(err);
  process.exit(1);
});
