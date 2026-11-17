import 'server-only';

import type {
  Category,
  Journal,
  Media,
  Page,
  Post,
  Project,
  Setting,
  Tag,
  User,
} from '@/payload-types';

import { fallbackExcerpt } from './queries';
import { absoluteUrl, docPath, siteUrl } from './urls';

/* eslint-disable @typescript-eslint/no-explicit-any */
type LD = Record<string, any>;

/** Renders schema.org JSON-LD safely (escapes "<" so content can't break out of the tag). */
export function JsonLd({ data }: { data: LD | LD[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}

const img = (m?: Media | number | null) =>
  m && typeof m === 'object' && m.url
    ? {
        '@type': 'ImageObject',
        url: absoluteUrl(m.sizes?.og?.url || m.url),
        width: m.sizes?.og?.width || m.width || undefined,
        height: m.sizes?.og?.height || m.height || undefined,
        caption: m.alt || undefined,
      }
    : undefined;

const minutes = (n?: number | null) =>
  n ? `PT${Math.max(1, Math.round(n))}M` : undefined;
const tagNames = (tags?: (number | Tag)[] | null) =>
  (tags ?? [])
    .filter((t): t is Tag => typeof t === 'object' && t !== null)
    .map((t) => t.title);

export const personId = () => `${siteUrl()}/#person`;
export const websiteId = () => `${siteUrl()}/#website`;

export function personLd(s: Setting): LD {
  return {
    '@type': 'Person',
    '@id': personId(),
    name: s.authorName || s.siteName,
    url: siteUrl(),
    image: img(s.avatar as Media),
    description: s.description || undefined,
    homeLocation: s.location
      ? { '@type': 'Place', name: s.location }
      : undefined,
    sameAs: (s.socials ?? [])
      .map((x) => x.url)
      .filter((u) => /^https?:\/\//.test(u)),
  };
}

export function websiteLd(s: Setting): LD {
  return {
    '@type': 'WebSite',
    '@id': websiteId(),
    name: s.siteName || 'Zykson',
    alternateName: s.wordmark || undefined,
    url: siteUrl(),
    description: s.description || undefined,
    inLanguage: s.language || 'en-GB',
    publisher: { '@id': personId() },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl()}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** WebSite + Person graph — on the home page. */
export function siteGraph(s: Setting): LD {
  return {
    '@context': 'https://schema.org',
    '@graph': [websiteLd(s), personLd(s)],
  };
}

export function breadcrumbsLd(items: { name: string; path: string }[]): LD {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...items].map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

function article(
  type: 'BlogPosting' | 'Article',
  doc: Post | Journal,
  path: string,
  s: Setting,
  extra: LD = {},
): LD {
  const authors = ('authors' in doc ? (doc.authors ?? []) : []).filter(
    (a): a is User => typeof a === 'object' && a !== null,
  );
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${absoluteUrl(path)}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(path) },
    url: absoluteUrl(path),
    headline: (doc.title ?? '').slice(0, 110),
    description: fallbackExcerpt(doc as never) || undefined,
    image: img(doc.coverImage as Media) ?? img(s.ogImage as Media),
    datePublished: doc.publishedAt || doc.createdAt,
    dateModified: doc.updatedAt,
    author: authors.length
      ? authors.map((a) => ({
          '@type': 'Person',
          name: a.name,
          url: siteUrl(),
        }))
      : { '@id': personId() },
    publisher: { '@id': personId() },
    isPartOf: { '@id': websiteId() },
    inLanguage: s.language || 'en-GB',
    keywords: tagNames(doc.tags).join(', ') || undefined,
    wordCount: doc.wordCount || undefined,
    timeRequired: minutes(doc.readingTime),
    ...extra,
  };
}

export function postLd(post: Post, s: Setting): LD {
  const category =
    typeof post.category === 'object'
      ? (post.category as Category | null)
      : null;
  return article('BlogPosting', post, docPath('posts', post), s, {
    articleSection: category?.title,
    alternativeHeadline: post.subtitle || undefined,
  });
}

export function entryLd(entry: Journal, s: Setting): LD {
  return article('BlogPosting', entry, docPath('journal', entry), s, {
    articleSection: entry.type === 'diary' ? 'Diary' : 'Journal',
    contentLocation: entry.location
      ? { '@type': 'Place', name: entry.location }
      : undefined,
  });
}

export function projectLd(p: Project, s: Setting): LD {
  const path = docPath('projects', p);
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${absoluteUrl(path)}#work`,
    name: p.title,
    url: absoluteUrl(path),
    description: p.summary || undefined,
    image: img(p.coverImage as Media) ?? img(s.ogImage as Media),
    creator: { '@id': personId() },
    dateCreated: p.publishedAt || p.createdAt,
    dateModified: p.updatedAt,
    keywords: [...(p.stack ?? []), ...tagNames(p.tags)].join(', ') || undefined,
    genre: p.disciplines?.join(', ') || undefined,
    sameAs: (p.links ?? [])
      .map((l) => l.url)
      .filter((u) => /^https?:\/\//.test(u)),
    inLanguage: s.language || 'en-GB',
  };
}

export function pageLd(page: Page, s: Setting): LD {
  const path = docPath('pages', page);
  const type =
    page.slug === 'about'
      ? 'AboutPage'
      : page.slug === 'contact'
        ? 'ContactPage'
        : 'WebPage';
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': absoluteUrl(path),
    url: absoluteUrl(path),
    name: page.meta?.title || page.title,
    description: page.meta?.description || page.hero?.intro || undefined,
    isPartOf: { '@id': websiteId() },
    about: page.slug === 'about' ? { '@id': personId() } : undefined,
    inLanguage: s.language || 'en-GB',
  };
}

/** Listing pages (blog, journal, tags…): CollectionPage with an ItemList of what's shown. */
export function collectionLd(
  name: string,
  path: string,
  items: { name: string; path: string }[],
  description?: string | null,
): LD {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url: absoluteUrl(path),
    description: description || undefined,
    isPartOf: { '@id': websiteId() },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.slice(0, 50).map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl(it.path),
        name: it.name,
      })),
    },
  };
}
