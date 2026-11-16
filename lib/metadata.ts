import 'server-only';

import type { Metadata } from 'next';

import type { Media } from '@/payload-types';

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

/** Consistent <head> tags for every page (title, description, Open Graph, Twitter, canonical, RSS). */
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
  noindex?: boolean;
  canonical?: string | null;
}): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = settings.siteName || 'Zykson';
  const title = opts.meta?.title || opts.title;
  const description =
    opts.meta?.description ||
    opts.description ||
    settings.description ||
    undefined;
  const pick = (m?: Media | number | null) =>
    m && typeof m === 'object' ? m : null;
  const media =
    pick(opts.meta?.image as Media) ||
    pick(opts.image) ||
    pick(settings.ogImage as Media);
  const image = media
    ? absoluteUrl(media.sizes?.og?.url || media.url || '')
    : absoluteUrl(
        ogImageUrl(
          opts.title || siteName,
          opts.kind ?? '',
          description?.slice(0, 120) ?? '',
        ),
      );
  const noindex = Boolean(opts.noindex || opts.meta?.noindex);

  return {
    title: opts.meta?.title ? { absolute: opts.meta.title } : title,
    description,
    alternates: { canonical: opts.canonical || opts.path },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: opts.type ?? 'website',
      siteName,
      title: title || siteName,
      description,
      url: absoluteUrl(opts.path),
      images: [{ url: image, width: 1200, height: 630 }],
      ...(opts.publishedTime ? { publishedTime: opts.publishedTime } : {}),
      ...(opts.modifiedTime ? { modifiedTime: opts.modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: title || siteName,
      description,
      images: [image],
    },
  };
}

export async function rootMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const name = s.siteName || 'Zykson';
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: `${name} — ${s.tagline || 'Writing, journal & work'}`,
      template: `%s · ${name}`,
    },
    description: s.description || undefined,
    applicationName: name,
    authors: [{ name: s.authorName || name }],
    icons: {
      icon: [
        {
          url: '/static/favicons/favicon-32x32.png',
          sizes: '32x32',
          type: 'image/png',
        },
        {
          url: '/static/favicons/favicon-16x16.png',
          sizes: '16x16',
          type: 'image/png',
        },
      ],
      apple: '/static/favicons/apple-touch-icon.png',
    },
    manifest: '/static/favicons/site.webmanifest',
    alternates: {
      types: {
        'application/rss+xml': [
          { url: '/feed.xml', title: `${name} — everything` },
          { url: '/blog/feed.xml', title: `${name} — blog` },
          { url: '/journal/feed.xml', title: `${name} — journal & diary` },
        ],
      },
    },
  };
}
