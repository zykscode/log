import type { MetadataRoute } from 'next';

import {
  getAllCategories,
  getPublicSlugs,
  getTagCloud,
  type PublicSlug,
} from '@/lib/queries';
import { absoluteUrl, docPath } from '@/lib/urls';

export const revalidate = 3600;

const entry = (
  path: string,
  doc: PublicSlug | null,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'monthly',
): MetadataRoute.Sitemap[number] => ({
  url: absoluteUrl(path),
  lastModified: doc?.updatedAt ? new Date(doc.updatedAt) : undefined,
  changeFrequency,
  priority,
  ...(doc?.image ? { images: [absoluteUrl(doc.image)] } : {}),
});

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
  const newest = (list: PublicSlug[]) =>
    list.reduce<PublicSlug | null>(
      (a, b) => (!a || (b.updatedAt ?? '') > (a.updatedAt ?? '') ? b : a),
      null,
    );

  return [
    entry('/', newest([...posts, ...entries, ...projects]), 1, 'daily'),
    entry('/blog', newest(posts), 0.9, 'daily'),
    entry(
      '/journal',
      newest(entries.filter((e) => e.type !== 'diary')),
      0.8,
      'daily',
    ),
    entry(
      '/diary',
      newest(entries.filter((e) => e.type === 'diary')),
      0.6,
      'weekly',
    ),
    entry('/work', newest(projects), 0.8, 'monthly'),
    entry(
      '/archive',
      newest([...posts, ...entries, ...projects]),
      0.5,
      'weekly',
    ),
    entry('/tags', null, 0.4, 'weekly'),
    ...pages
      .filter((p) => p.slug !== 'home')
      .map((p) => entry(`/${p.slug}`, p, 0.7)),
    ...posts.map((p) => entry(docPath('posts', p), p, 0.8)),
    ...projects.map((p) => entry(docPath('projects', p), p, 0.7)),
    ...entries.map((e) => entry(docPath('journal', e), e, 0.5, 'yearly')),
    ...categories.map((c) =>
      entry(docPath('categories', c), null, 0.4, 'weekly'),
    ),
    ...tags.map((t) => entry(docPath('tags', t), null, 0.3, 'weekly')),
  ];
}
