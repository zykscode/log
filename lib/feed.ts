import 'server-only';

import {
  convertLexicalToHTML,
  type HTMLConvertersFunction,
  LinkHTMLConverter,
} from '@payloadcms/richtext-lexical/html';

import { getPayloadClient } from './payload';
import { getSettings } from './queries';
import { absoluteUrl, docPath, siteUrl } from './urls';

/* eslint-disable @typescript-eslint/no-explicit-any */
const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Rich text → plain HTML for feed readers (custom blocks get simple fallbacks). */
const htmlConverters: HTMLConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkHTMLConverter({
    internalDocToHref: ({ linkNode }: any) => {
      const d = linkNode?.fields?.doc;
      return d && typeof d.value === 'object'
        ? absoluteUrl(docPath(d.relationTo, d.value))
        : '#';
    },
  }),
  blocks: {
    code: ({ node }: any) =>
      `<pre><code>${esc(node.fields.code ?? '')}</code></pre>`,
    callout: ({ node }: any) =>
      `<blockquote>${node.fields.title ? `<strong>${esc(node.fields.title)}</strong><br/>` : ''}${node.fields.content ? convertLexicalToHTML({ data: node.fields.content, disableContainer: true }) : ''}</blockquote>`,
    gallery: ({ node }: any) =>
      (node.fields.images ?? [])
        .filter((m: any) => typeof m === 'object')
        .map(
          (m: any) =>
            `<p><img src="${m.sizes?.feature?.url || m.url}" alt="${esc(m.alt ?? '')}"/></p>`,
        )
        .join(''),
    embed: ({ node }: any) =>
      `<p><a href="${esc(node.fields.url)}">${esc(node.fields.caption || node.fields.url)}</a></p>`,
    bookmark: ({ node }: any) =>
      `<p><a href="${esc(node.fields.url)}">${esc(node.fields.title || node.fields.url)}</a></p>`,
    pullQuote: ({ node }: any) =>
      `<blockquote><p>${esc(node.fields.text ?? '')}</p></blockquote>`,
    verse: ({ node }: any) => `<pre>${esc(node.fields.text ?? '')}</pre>`,
    math: ({ node }: any) => `<pre>${esc(node.fields.latex ?? '')}</pre>`,
    details: ({ node }: any) =>
      `<details><summary>${esc(node.fields.summary ?? '')}</summary>${node.fields.content ? convertLexicalToHTML({ data: node.fields.content, disableContainer: true }) : ''}</details>`,
    button: ({ node }: any) =>
      `<p><a href="${esc(node.fields.url)}">${esc(node.fields.label)}</a></p>`,
    mediaPlayer: ({ node }: any) => {
      const src =
        (typeof node.fields.file === 'object' && node.fields.file?.url) ||
        node.fields.url;
      return src
        ? `<p><a href="${esc(src)}">${esc(node.fields.caption || 'Media')}</a></p>`
        : '';
    },
  },
  inlineBlocks: {
    footnote: ({ node }: any) =>
      ` <small>(${esc(node.fields.note ?? '')})</small>`,
    inlineMath: ({ node }: any) =>
      `<code>${esc(node.fields.latex ?? '')}</code>`,
    kbd: ({ node }: any) => `<kbd>${esc(node.fields.keys ?? '')}</kbd>`,
  },
});

function toHTML(data: unknown): string {
  if (!data || typeof data !== 'object') return '';
  try {
    const html = convertLexicalToHTML({
      data: data as never,
      converters: htmlConverters,
      disableContainer: true,
    });
    // make root-relative links/images absolute for feed readers
    return html.replace(/(src|href)="\//g, `$1="${siteUrl()}/`);
  } catch {
    return '';
  }
}

type Source = 'posts' | 'journal' | 'all';

export async function buildRss(
  source: Source,
  path: string,
): Promise<Response> {
  const payload = await getPayloadClient();
  const settings = await getSettings();
  const now = new Date().toISOString();
  const where = {
    and: [
      { _status: { equals: 'published' } },
      { visibility: { equals: 'public' } },
      { publishedAt: { less_than_equal: now } },
    ],
  } as const;

  const collections: ('posts' | 'journal' | 'projects')[] =
    source === 'posts'
      ? ['posts']
      : source === 'journal'
        ? ['journal']
        : ['posts', 'journal', 'projects'];
  const lists = await Promise.all(
    collections.map((collection) =>
      payload
        .find({
          collection,
          where: where as never,
          sort: '-publishedAt',
          limit: 30,
          depth: 2,
        })
        .then((r) => r.docs.map((doc) => ({ collection, doc: doc as any }))),
    ),
  );
  const items = lists
    .flat()
    .sort((a, b) =>
      String(b.doc.publishedAt).localeCompare(String(a.doc.publishedAt)),
    )
    .slice(0, 40);

  const title = `${settings.siteName || 'Zykson'}${source === 'posts' ? ' — Blog' : source === 'journal' ? ' — Journal & diary' : ''}`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
<title>${esc(title)}</title>
<link>${siteUrl()}</link>
<description>${esc(settings.description || '')}</description>
<language>en</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
<atom:link href="${absoluteUrl(path)}" rel="self" type="application/rss+xml"/>
${items
  .map(({ collection, doc }) => {
    const link = absoluteUrl(docPath(collection, doc));
    const summary = doc.excerpt || doc.summary || doc.autoExcerpt || '';
    const category =
      collection === 'journal'
        ? doc.type === 'diary'
          ? 'Diary'
          : 'Journal'
        : collection === 'projects'
          ? 'Work'
          : doc.category?.title;
    return `<item>
<title>${esc(doc.title || '')}</title>
<link>${link}</link>
<guid isPermaLink="true">${link}</guid>
<pubDate>${new Date(doc.publishedAt).toUTCString()}</pubDate>
${category ? `<category>${esc(category)}</category>` : ''}
<description>${esc(summary)}</description>
<content:encoded><![CDATA[${toHTML(doc.content).replace(/]]>/g, ']]]]><![CDATA[>')}]]></content:encoded>
</item>`;
  })
  .join('\n')}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
