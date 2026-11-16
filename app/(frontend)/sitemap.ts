import type { MetadataRoute } from 'next';

import { getAllCategories, getPublicSlugs, getTagCloud } from '@/lib/queries';
import { absoluteUrl, docPath } from '@/lib/urls';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, entries, projects, pages, categories, tags] = await Promise.all(
    [
      getPublicSlugs('posts'),
      getPublicSlugs('journal'),
      getPublicSlugs('projects'),
      getPublicSlugs('pages'),
      getAllCategories(),
      getTagCloud({ isAuthor: false, user: null }),
    ],
  );
  const fixed = [
    '/',
    '/blog',
    '/journal',
    '/diary',
    '/work',
    '/archive',
    '/tags',
  ].map((p) => ({
    url: absoluteUrl(p),
    changeFrequency: 'weekly' as const,
    priority: p === '/' ? 1 : 0.8,
  }));
  return [
    ...fixed,
    ...pages
      .filter((p) => p.slug !== 'home')
      .map((p) => ({
        url: absoluteUrl(`/${p.slug}`),
        lastModified: p.updatedAt,
      })),
    ...posts.map((p) => ({
      url: absoluteUrl(docPath('posts', p)),
      lastModified: p.updatedAt,
      priority: 0.7,
    })),
    ...entries.map((e) => ({
      url: absoluteUrl(docPath('journal', e)),
      lastModified: e.updatedAt,
      priority: 0.5,
    })),
    ...projects.map((p) => ({
      url: absoluteUrl(docPath('projects', p)),
      lastModified: p.updatedAt,
      priority: 0.7,
    })),
    ...categories.map((c) => ({
      url: absoluteUrl(docPath('categories', c)),
      priority: 0.4,
    })),
    ...tags.map((t) => ({
      url: absoluteUrl(docPath('tags', t)),
      priority: 0.3,
    })),
  ];
}
