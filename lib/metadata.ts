import 'server-only';

import type { Metadata } from 'next';

import type { Media, Setting } from '@/payload-types';

import { getSettings } from './queries';
import { absoluteUrl, siteUrl } from './urls';

type Meta =
  | {
      title?: string | null;
      description?: string | null;
      image?: number | Media | null;
      noindex?: boolean | null;
    }
  | null
  | undefined;

export function ogImageUrl(title: string, kind = '', subtitle = '') {
  const q = new URLSearchParams({ title, kind, subtitle });
  return `/next/og?${q.toString()}`;
}

/** "en-GB" → "en_GB" for Open Graph. */
export const ogLocale = (lang?: string | null) =>
  (lang || 'en-GB').replace('-', '_');

/** @handle from the setting, or derived from an X/Twitter link in Socials. */
export function xHandle(s: Setting): string | undefined {
  if (s.xHandle) return s.xHandle.startsWith('@') ? s.xHandle : `@${s.xHandle}`;
  const url = s.socials?.find((x) => x.platform === 'x')?.url;
  const m = url?.match(/(?:x|twitter)\.com\/(@?[A-Za-z0-9_]{1,15})/);
  return m ? `@${m[1].replace(/^@/, '')}` : undefined;
}

const ROBOTS_INDEX: Metadata['robots'] = {
  index: true,
  follow: true,
  'max-image-preview': 'large',
  'max-snippet': -1,
  'max-video-preview': -1,
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
};
const ROBOTS_NOINDEX: Metadata['robots'] = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
};

const pick = (m?: Media | number | null) =>
  m && typeof m === 'object' ? m : null;

/** Consistent, complete <head> tags for every page. */
export async function buildMetadata(opts: {
  title?: string;
  description?: string | null;
  path: string;
  meta?: Meta;
  image?: Media | number | null;
  kind?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string | null;
  modifiedTime?: string | null;
  authors?: string[];
  section?: string | null;
  tags?: string[];
  noindex?: boolean;
  canonical?: string | null;
}): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = settings.siteName || 'Zykson';
  const title = opts.meta?.title || opts.title;
  const description =
    (opts.meta?.description || opts.description || settings.description || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 300) || undefined;
  const media =
    pick(opts.meta?.image as Media) ||
    pick(opts.image) ||
    pick(settings.ogImage as Media);
  const ogImage = media
    ? {
        url: absoluteUrl(media.sizes?.og?.url || media.url || ''),
        width: media.sizes?.og?.width || media.width || 1200,
        height: media.sizes?.og?.height || media.height || 630,
        alt: media.alt || title || siteName,
        type: media.sizes?.og?.mimeType || media.mimeType || undefined,
      }
    : {
        url: absoluteUrl(
          ogImageUrl(
            opts.title || siteName,
            opts.kind ?? '',
            description?.slice(0, 120) ?? '',
          ),
        ),
        width: 1200,
        height: 630,
        alt: title || siteName,
        type: 'image/png',
      };
  const noindex = Boolean(opts.noindex || opts.meta?.noindex);
  const handle = xHandle(settings);
  const url = absoluteUrl(opts.path);

  return {
    title: opts.meta?.title ? { absolute: opts.meta.title } : title,
    description,
    keywords: opts.tags?.length ? opts.tags : undefined,
    authors: opts.authors?.map((name) => ({ name })),
    category: opts.section || undefined,
    alternates: {
      canonical: opts.canonical || url,
      // page-level alternates replace the root ones, so repeat the feeds here
      types: {
        'application/rss+xml': [
          { url: '/feed.xml', title: `${siteName} — everything` },
          { url: '/blog/feed.xml', title: `${siteName} — blog` },
          { url: '/journal/feed.xml', title: `${siteName} — journal & diary` },
        ],
      },
    },
    robots: noindex ? ROBOTS_NOINDEX : ROBOTS_INDEX,
    openGraph:
      opts.type === 'article'
        ? {
            type: 'article',
            siteName,
            locale: ogLocale(settings.language),
            title: title || siteName,
            description,
            url,
            images: [ogImage],
            publishedTime: opts.publishedTime || undefined,
            modifiedTime: opts.modifiedTime || undefined,
            authors: opts.authors,
            section: opts.section || undefined,
            tags: opts.tags,
          }
        : {
            type: opts.type === 'profile' ? 'profile' : 'website',
            siteName,
            locale: ogLocale(settings.language),
            title: title || siteName,
            description,
            url,
            images: [ogImage],
          },
    twitter: {
      card: 'summary_large_image',
      title: title || siteName,
      description,
      images: [{ url: ogImage.url, alt: ogImage.alt }],
      site: handle,
      creator: handle,
    },
  };
}

/** Site-wide defaults (root layout). */
export async function rootMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const name = s.siteName || 'Zykson';
  const appName = s.appShortName || name;
  const handle = xHandle(s);
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: `${name} — ${s.tagline || 'Writing, journal & work'}`,
      template: `%s · ${name}`,
    },
    description: s.description || undefined,
    applicationName: appName,
    authors: [{ name: s.authorName || name, url: siteUrl() }],
    creator: s.authorName || name,
    publisher: s.authorName || name,
    referrer: 'strict-origin-when-cross-origin',
    formatDetection: { telephone: false, email: false, address: false },
    robots: ROBOTS_INDEX,
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        {
          url: '/icons/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png',
        },
      ],
    },
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      title: appName,
      statusBarStyle: 'black-translucent',
    },
    verification: {
      google: s.verification?.google || undefined,
      yandex: s.verification?.yandex || undefined,
      other: s.verification?.bing
        ? { 'msvalidate.01': s.verification.bing }
        : undefined,
    },
    openGraph: {
      siteName: name,
      locale: ogLocale(s.language),
      type: 'website',
    },
    twitter: { card: 'summary_large_image', site: handle, creator: handle },
    alternates: {
      canonical: '/',
      types: {
        'application/rss+xml': [
          { url: '/feed.xml', title: `${name} — everything` },
          { url: '/blog/feed.xml', title: `${name} — blog` },
          { url: '/journal/feed.xml', title: `${name} — journal & diary` },
        ],
      },
    },
    other: { 'mobile-web-app-capable': 'yes' },
  };
}
