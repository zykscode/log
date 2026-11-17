import 'server-only';

import type { PaginatedDocs, Where } from 'payload';
import { cache } from 'react';

import type {
  Category,
  Journal,
  Page,
  Post,
  Project,
  Series,
  Setting,
  Tag,
} from '@/payload-types';

import { excerptFrom } from './lexical';
import { getPayloadClient } from './payload';
import type { Viewer } from './viewer';

export type ContentCollection = 'posts' | 'journal' | 'projects';
export type EntryType = 'journal' | 'diary';

const LIST_SELECT = { content: false, searchText: false } as const;

/**
 * Visibility rules. Authors (in author mode) see everything incl. drafts.
 * Visitors see published docs whose date has arrived; "listed" views (lists,
 * feeds, search, sitemap) additionally hide unlisted docs.
 */
function visible(viewer: Viewer, mode: 'listed' | 'direct'): Where[] {
  if (viewer.isAuthor) return [];
  return [
    { _status: { equals: 'published' } },
    { publishedAt: { less_than_equal: new Date().toISOString() } },
    mode === 'listed'
      ? { visibility: { equals: 'public' } }
      : { visibility: { not_equals: 'private' } },
  ];
}

const and = (...parts: (Where | Where[] | undefined | false)[]): Where => ({
  and: parts.flat().filter(Boolean) as Where[],
});

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export const getSettings = cache(async (): Promise<Setting> => {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: 'settings', depth: 1 });
});

/* ------------------------------------------------------------------ */
/* Posts                                                               */
/* ------------------------------------------------------------------ */

type PostQuery = {
  page?: number;
  limit?: number;
  category?: number | string;
  tag?: number | string;
  series?: number | string;
  featured?: boolean;
  notFeatured?: boolean;
  exclude?: (number | string)[];
  ids?: (number | string)[];
  sort?: string;
};

export async function getPosts(
  viewer: Viewer,
  q: PostQuery = {},
): Promise<PaginatedDocs<Post>> {
  const payload = await getPayloadClient();
  return payload.find({
    collection: 'posts',
    draft: viewer.isAuthor,
    depth: 1,
    page: q.page ?? 1,
    limit: q.limit ?? 12,
    sort: q.sort ?? '-publishedAt',
    select: LIST_SELECT,
    where: and(
      visible(viewer, q.ids ? 'direct' : 'listed'),
      q.category ? { category: { equals: q.category } } : undefined,
      q.tag ? { tags: { contains: q.tag } } : undefined,
      q.series ? { series: { equals: q.series } } : undefined,
      q.featured ? { featured: { equals: true } } : undefined,
      q.notFeatured ? { featured: { not_equals: true } } : undefined,
      q.exclude?.length ? { id: { not_in: q.exclude } } : undefined,
      q.ids ? { id: { in: q.ids } } : undefined,
    ),
  }) as Promise<PaginatedDocs<Post>>;
}

export const getPost = cache(
  async (slug: string, viewer: Viewer): Promise<Post | null> => {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'posts',
      draft: viewer.isAuthor,
      depth: 2,
      limit: 1,
      where: and({ slug: { equals: slug } }, visible(viewer, 'direct')),
    });
    return res.docs[0] ?? null;
  },
);

async function neighbours<
  T extends { id: number | string; publishedAt?: string | null },
>(collection: ContentCollection, doc: T, viewer: Viewer, extra?: Where) {
  if (!doc.publishedAt) return { previous: null, next: null };
  const payload = await getPayloadClient();
  const base = (dir: 'less_than' | 'greater_than') =>
    payload.find({
      collection,
      draft: viewer.isAuthor,
      depth: 0,
      limit: 1,
      sort: dir === 'less_than' ? '-publishedAt' : 'publishedAt',
      select: {
        title: true,
        slug: true,
        publishedAt: true,
        type: true,
      } as never,
      where: and(visible(viewer, 'listed'), extra, {
        publishedAt: { [dir]: doc.publishedAt },
      }),
    });
  const [prev, next] = await Promise.all([
    base('less_than'),
    base('greater_than'),
  ]);
  return {
    previous:
      (prev.docs[0] as unknown as T & { title?: string; slug?: string }) ??
      null,
    next:
      (next.docs[0] as unknown as T & { title?: string; slug?: string }) ??
      null,
  };
}

export const getPostNeighbours = (post: Post, viewer: Viewer) =>
  neighbours('posts', post, viewer);

export async function getRelatedPosts(
  post: Post,
  viewer: Viewer,
  limit = 3,
): Promise<Post[]> {
  const manual = (post.relatedPosts ?? []).filter(
    (p): p is Post => typeof p === 'object' && p !== null,
  );
  if (manual.length) return manual.slice(0, limit);

  const tagIds = (post.tags ?? []).map((t) =>
    typeof t === 'object' ? t.id : t,
  );
  const payload = await getPayloadClient();
  const found: Post[] = [];
  const seen = new Set<number | string>([post.id]);
  const take = (docs: Post[]) => {
    for (const d of docs) {
      if (seen.has(d.id) || found.length >= limit) continue;
      seen.add(d.id);
      found.push(d);
    }
  };

  if (tagIds.length) {
    const res = await payload.find({
      collection: 'posts',
      draft: viewer.isAuthor,
      depth: 1,
      limit: limit * 3,
      select: LIST_SELECT,
      where: and(
        visible(viewer, 'listed'),
        { tags: { in: tagIds } },
        { id: { not_equals: post.id } },
      ),
    });
    // rank by number of shared tags
    const score = (p: Post) =>
      (p.tags ?? []).filter((t) =>
        tagIds.includes(typeof t === 'object' ? t.id : t),
      ).length;
    take((res.docs as Post[]).sort((a, b) => score(b) - score(a)));
  }
  const categoryId =
    typeof post.category === 'object' ? post.category?.id : post.category;
  if (found.length < limit && categoryId) {
    const res = await getPosts(viewer, {
      category: categoryId,
      limit: limit + 1,
    });
    take(res.docs);
  }
  if (found.length < limit)
    take((await getPosts(viewer, { limit: limit + 1 })).docs);
  return found;
}

export async function getSeriesPosts(
  seriesId: number | string,
  viewer: Viewer,
): Promise<Post[]> {
  const res = await getPosts(viewer, {
    series: seriesId,
    limit: 100,
    sort: 'seriesOrder',
  });
  return res.docs;
}

/* ------------------------------------------------------------------ */
/* Journal & diary                                                     */
/* ------------------------------------------------------------------ */

type EntryQuery = {
  type?: EntryType | 'all';
  page?: number;
  limit?: number;
  tag?: number | string;
  from?: string;
  to?: string;
};

export async function getEntries(
  viewer: Viewer,
  q: EntryQuery = {},
): Promise<PaginatedDocs<Journal>> {
  const payload = await getPayloadClient();
  return payload.find({
    collection: 'journal',
    draft: viewer.isAuthor,
    depth: 1,
    page: q.page ?? 1,
    limit: q.limit ?? 20,
    sort: '-publishedAt',
    where: and(
      visible(viewer, 'listed'),
      q.type && q.type !== 'all' ? { type: { equals: q.type } } : undefined,
      q.tag ? { tags: { contains: q.tag } } : undefined,
      q.from ? { publishedAt: { greater_than_equal: q.from } } : undefined,
      q.to ? { publishedAt: { less_than: q.to } } : undefined,
    ),
  }) as Promise<PaginatedDocs<Journal>>;
}

export const getEntry = cache(
  async (slug: string, type: EntryType, viewer: Viewer) => {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'journal',
      draft: viewer.isAuthor,
      depth: 2,
      limit: 1,
      where: and(
        { slug: { equals: slug } },
        { type: { equals: type } },
        visible(viewer, 'direct'),
      ),
    });
    return (res.docs[0] as Journal) ?? null;
  },
);

export const getEntryNeighbours = (entry: Journal, viewer: Viewer) =>
  neighbours('journal', entry, viewer, { type: { equals: entry.type } });

/** Count of entries per day (YYYY-MM-DD) for the past year — drives the heatmap. */
export async function getEntryCalendar(
  viewer: Viewer,
  type: EntryType | 'all' = 'all',
) {
  const payload = await getPayloadClient();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 371);
  const res = await payload.find({
    collection: 'journal',
    draft: viewer.isAuthor,
    depth: 0,
    pagination: false,
    select: { publishedAt: true, type: true },
    where: and(
      visible(viewer, 'listed'),
      type !== 'all' ? { type: { equals: type } } : undefined,
      { publishedAt: { greater_than_equal: since.toISOString() } },
    ),
  });
  const days: Record<string, number> = {};
  for (const d of res.docs) {
    if (!d.publishedAt) continue;
    const key = d.publishedAt.slice(0, 10);
    days[key] = (days[key] ?? 0) + 1;
  }
  return days;
}

/** Entries written on this calendar day in previous years. */
export async function getOnThisDay(
  viewer: Viewer,
  date = new Date(),
): Promise<Journal[]> {
  const payload = await getPayloadClient();
  const md = date.toISOString().slice(5, 10);
  const res = await payload.find({
    collection: 'journal',
    draft: viewer.isAuthor,
    depth: 1,
    pagination: false,
    select: {
      title: true,
      slug: true,
      type: true,
      publishedAt: true,
      mood: true,
      visibility: true,
      _status: true,
    },
    where: and(visible(viewer, 'listed'), {
      publishedAt: {
        less_than: `${date.getUTCFullYear()}-01-01T00:00:00.000Z`,
      },
    }),
  });
  return (res.docs as Journal[]).filter(
    (d) => d.publishedAt?.slice(5, 10) === md,
  );
}

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export async function getProjects(
  viewer: Viewer,
  q: {
    featured?: boolean;
    limit?: number;
    ids?: (number | string)[];
    exclude?: (number | string)[];
  } = {},
): Promise<Project[]> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: 'projects',
    draft: viewer.isAuthor,
    depth: 1,
    limit: q.limit ?? 100,
    sort: ['sortOrder', '-publishedAt'],
    select: LIST_SELECT,
    where: and(
      visible(viewer, q.ids ? 'direct' : 'listed'),
      q.featured ? { featured: { equals: true } } : undefined,
      q.ids ? { id: { in: q.ids } } : undefined,
      q.exclude?.length ? { id: { not_in: q.exclude } } : undefined,
    ),
  });
  return res.docs as Project[];
}

export const getProject = cache(
  async (slug: string, viewer: Viewer): Promise<Project | null> => {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'projects',
      draft: viewer.isAuthor,
      depth: 2,
      limit: 1,
      where: and({ slug: { equals: slug } }, visible(viewer, 'direct')),
    });
    return (res.docs[0] as Project) ?? null;
  },
);

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

export const getPage = cache(
  async (slug: string, viewer: Viewer): Promise<Page | null> => {
    const payload = await getPayloadClient();
    const res = await payload.find({
      collection: 'pages',
      draft: viewer.isAuthor,
      depth: 2,
      limit: 1,
      where: and(
        { slug: { equals: slug } },
        viewer.isAuthor
          ? undefined
          : [
              { _status: { equals: 'published' } },
              { visibility: { not_equals: 'private' } },
            ],
      ),
    });
    return (res.docs[0] as Page) ?? null;
  },
);

export async function getMenuPages(): Promise<Pick<Page, 'title' | 'slug'>[]> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: 'pages',
    depth: 0,
    pagination: false,
    select: { title: true, slug: true },
    where: and(
      { showInMenu: { equals: true } },
      { _status: { equals: 'published' } },
      { visibility: { equals: 'public' } },
    ),
  });
  return res.docs as Pick<Page, 'title' | 'slug'>[];
}

/* ------------------------------------------------------------------ */
/* Taxonomy                                                            */
/* ------------------------------------------------------------------ */

async function bySlug<T>(
  collection: 'categories' | 'tags' | 'series',
  slug: string,
): Promise<T | null> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection,
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
  });
  return (res.docs[0] as T) ?? null;
}
export const getCategory = cache((slug: string) =>
  bySlug<Category>('categories', slug),
);
export const getTag = cache((slug: string) => bySlug<Tag>('tags', slug));
export const getSeries = cache((slug: string) =>
  bySlug<Series>('series', slug),
);

export async function getAllCategories(): Promise<Category[]> {
  const payload = await getPayloadClient();
  return (
    await payload.find({
      collection: 'categories',
      pagination: false,
      sort: 'title',
    })
  ).docs;
}

export async function getAllSeries(viewer: Viewer) {
  const payload = await getPayloadClient();
  const series = (
    await payload.find({
      collection: 'series',
      pagination: false,
      depth: 1,
      sort: 'title',
    })
  ).docs;
  const withCounts = await Promise.all(
    series.map(async (s) => ({
      ...s,
      count: (await getPosts(viewer, { series: s.id, limit: 1 })).totalDocs,
    })),
  );
  return withCounts.filter((s) => s.count > 0);
}

/** All tags with how many listed items use them (posts + journal + projects). */
export async function getTagCloud(
  viewer: Viewer,
): Promise<(Tag & { count: number })[]> {
  const payload = await getPayloadClient();
  const [tags, ...lists] = await Promise.all([
    payload.find({ collection: 'tags', pagination: false, sort: 'title' }),
    ...(['posts', 'journal', 'projects'] as const).map((collection) =>
      payload.find({
        collection,
        draft: viewer.isAuthor,
        depth: 0,
        pagination: false,
        select: { tags: true },
        where: and(visible(viewer, 'listed')),
      }),
    ),
  ]);
  const counts = new Map<number | string, number>();
  for (const list of lists)
    for (const doc of list.docs as { tags?: (number | Tag)[] | null }[])
      for (const t of doc.tags ?? []) {
        const id = typeof t === 'object' ? t.id : t;
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
  return tags.docs
    .map((t) => ({ ...t, count: counts.get(t.id) ?? 0 }))
    .filter((t) => t.count > 0);
}

export async function getTaggedEverything(
  viewer: Viewer,
  tagId: number | string,
) {
  const payload = await getPayloadClient();
  const [posts, entries, projects] = await Promise.all([
    getPosts(viewer, { tag: tagId, limit: 100 }),
    getEntries(viewer, { tag: tagId, limit: 100 }),
    payload.find({
      collection: 'projects',
      draft: viewer.isAuthor,
      depth: 1,
      pagination: false,
      select: LIST_SELECT,
      where: and(visible(viewer, 'listed'), { tags: { contains: tagId } }),
    }),
  ]);
  return {
    posts: posts.docs,
    entries: entries.docs,
    projects: projects.docs as Project[],
  };
}

/* ------------------------------------------------------------------ */
/* Archive, search, stats                                              */
/* ------------------------------------------------------------------ */

export type ArchiveItem = {
  id: number | string;
  collection: ContentCollection;
  kind: 'post' | 'journal' | 'diary' | 'project';
  title: string;
  slug: string;
  publishedAt: string;
  excerpt?: string | null;
  meta?: string | null;
  isDraft?: boolean;
  isPrivate?: boolean;
};

export async function getArchive(viewer: Viewer): Promise<ArchiveItem[]> {
  const payload = await getPayloadClient();
  const common = {
    draft: viewer.isAuthor,
    depth: 1,
    pagination: false as const,
    where: and(visible(viewer, 'listed')),
  };
  const [posts, entries, projects] = await Promise.all([
    payload.find({
      collection: 'posts',
      ...common,
      select: {
        title: true,
        slug: true,
        publishedAt: true,
        excerpt: true,
        category: true,
        readingTime: true,
        _status: true,
        visibility: true,
      },
    }),
    payload.find({
      collection: 'journal',
      ...common,
      depth: 0,
      select: {
        title: true,
        slug: true,
        publishedAt: true,
        type: true,
        mood: true,
        _status: true,
        visibility: true,
      },
    }),
    payload.find({
      collection: 'projects',
      ...common,
      depth: 0,
      select: {
        title: true,
        slug: true,
        publishedAt: true,
        summary: true,
        year: true,
        _status: true,
        visibility: true,
      },
    }),
  ]);
  const items: ArchiveItem[] = [
    ...(posts.docs as Post[]).map((p) => ({
      id: p.id,
      collection: 'posts' as const,
      kind: 'post' as const,
      title: p.title,
      slug: p.slug ?? '',
      publishedAt: p.publishedAt ?? p.createdAt,
      excerpt: p.excerpt,
      meta:
        typeof p.category === 'object' && p.category ? p.category.title : null,
      isDraft: p._status === 'draft',
      isPrivate: p.visibility === 'private',
    })),
    ...(entries.docs as Journal[]).map((e) => ({
      id: e.id,
      collection: 'journal' as const,
      kind: (e.type === 'diary' ? 'diary' : 'journal') as 'diary' | 'journal',
      title: e.title ?? '',
      slug: e.slug ?? '',
      publishedAt: e.publishedAt ?? e.createdAt,
      meta: e.mood ?? null,
      isDraft: e._status === 'draft',
      isPrivate: e.visibility === 'private',
    })),
    ...(projects.docs as Project[]).map((p) => ({
      id: p.id,
      collection: 'projects' as const,
      kind: 'project' as const,
      title: p.title,
      slug: p.slug ?? '',
      publishedAt: p.publishedAt ?? p.createdAt,
      excerpt: p.summary,
      meta: p.year ?? null,
      isDraft: p._status === 'draft',
      isPrivate: p.visibility === 'private',
    })),
  ];
  return items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export type SearchResult = ArchiveItem & { snippet: string; score: number };

export async function searchContent(
  viewer: Viewer,
  query: string,
  limit = 30,
): Promise<SearchResult[]> {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[%_]/g, ''))
    .filter((w) => w.length > 1)
    .slice(0, 6);
  if (!words.length) return [];
  const payload = await getPayloadClient();
  const match: Where = {
    and: words.map((w): Where => ({
      or: [{ title: { like: w } }, { searchText: { like: w } }],
    })),
  };
  const run = (collection: ContentCollection) =>
    payload.find({
      collection,
      draft: viewer.isAuthor,
      depth: 0,
      limit: 40,
      sort: '-publishedAt',
      select: {
        title: true,
        slug: true,
        publishedAt: true,
        searchText: true,
        type: true,
        _status: true,
        visibility: true,
      } as never,
      where: and(visible(viewer, 'listed'), match),
    });
  const [posts, entries, projects] = await Promise.all([
    run('posts'),
    run('journal'),
    run('projects'),
  ]);

  const snippetOf = (text: string) => {
    const lower = text.toLowerCase();
    const idx = Math.max(0, lower.indexOf(words[0]));
    const start = Math.max(0, idx - 70);
    const slice = text
      .slice(start, start + 200)
      .replace(/\s+/g, ' ')
      .trim();
    return `${start > 0 ? '…' : ''}${slice}${start + 200 < text.length ? '…' : ''}`;
  };

  const toResult = (
    collection: ContentCollection,
    d: Record<string, unknown>,
  ): SearchResult => {
    const title = String(d.title ?? '');
    const text = String(d.searchText ?? '');
    const titleHits = words.filter((w) =>
      title.toLowerCase().includes(w),
    ).length;
    const kind =
      collection === 'posts'
        ? 'post'
        : collection === 'projects'
          ? 'project'
          : d.type === 'diary'
            ? 'diary'
            : 'journal';
    return {
      id: d.id as number,
      collection,
      kind,
      title,
      slug: String(d.slug ?? ''),
      publishedAt: String(d.publishedAt ?? ''),
      snippet: snippetOf(text),
      score: titleHits * 10 + (collection === 'posts' ? 2 : 0),
      isDraft: d._status === 'draft',
      isPrivate: d.visibility === 'private',
    };
  };

  return [
    ...posts.docs.map((d) => toResult('posts', d as never)),
    ...entries.docs.map((d) => toResult('journal', d as never)),
    ...projects.docs.map((d) => toResult('projects', d as never)),
  ]
    .sort(
      (a, b) => b.score - a.score || b.publishedAt.localeCompare(a.publishedAt),
    )
    .slice(0, limit);
}

export const getStats = cache(async (viewer: Viewer) => {
  const payload = await getPayloadClient();
  const sum = async (collection: ContentCollection, extra?: Where) => {
    const res = await payload.find({
      collection,
      draft: viewer.isAuthor,
      depth: 0,
      pagination: false,
      select: { wordCount: true, publishedAt: true },
      where: and(visible(viewer, 'listed'), extra),
    });
    const docs = res.docs as {
      wordCount?: number | null;
      publishedAt?: string | null;
    }[];
    return {
      count: docs.length,
      words: docs.reduce((n, d) => n + (d.wordCount ?? 0), 0),
      first:
        docs
          .map((d) => d.publishedAt)
          .filter(Boolean)
          .sort()[0] ?? null,
    };
  };
  const [posts, journal, diary, projects] = await Promise.all([
    sum('posts'),
    sum('journal', { type: { equals: 'journal' } }),
    sum('journal', { type: { equals: 'diary' } }),
    sum('projects'),
  ]);
  const first =
    [posts.first, journal.first, diary.first, projects.first]
      .filter(Boolean)
      .sort()[0] ?? null;
  return {
    posts: posts.count,
    journal: journal.count,
    diary: diary.count,
    projects: projects.count,
    words: posts.words + journal.words + diary.words + projects.words,
    since: first,
  };
});

/* ------------------------------------------------------------------ */
/* Static params & redirects                                           */
/* ------------------------------------------------------------------ */

export type PublicSlug = {
  slug: string;
  type?: string | null;
  updatedAt?: string;
  publishedAt?: string | null;
  /** cover image URL (for image sitemaps) */
  image?: string | null;
};

export async function getPublicSlugs(
  collection: 'posts' | 'journal' | 'projects' | 'pages',
  extra?: Where,
): Promise<PublicSlug[]> {
  const payload = await getPayloadClient();
  const where =
    collection === 'pages'
      ? and(
          { _status: { equals: 'published' } },
          { visibility: { equals: 'public' } },
          extra,
        )
      : and(visible({ isAuthor: false, user: null }, 'listed'), extra);
  const res = await payload.find({
    collection,
    depth: collection === 'pages' ? 0 : 1,
    pagination: false,
    select: {
      slug: true,
      updatedAt: true,
      ...(collection === 'pages'
        ? {}
        : { publishedAt: true, coverImage: true }),
      ...(collection === 'journal' ? { type: true } : {}),
    } as never,
    where,
  });
  type Row = {
    slug?: string | null;
    type?: string | null;
    updatedAt?: string;
    publishedAt?: string | null;
    coverImage?: { url?: string | null } | number | null;
  };
  return (res.docs as Row[])
    .filter((d) => Boolean(d.slug))
    .map((d) => ({
      slug: d.slug as string,
      type: d.type,
      updatedAt: d.updatedAt,
      publishedAt: d.publishedAt,
      image:
        d.coverImage && typeof d.coverImage === 'object'
          ? d.coverImage.url
          : null,
    }));
}

export async function getRedirectFor(path: string): Promise<string | null> {
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: 'redirects',
    depth: 1,
    limit: 1,
    where: { from: { equals: path } },
  });
  const r = res.docs[0];
  if (!r) return null;
  if (r.to?.type === 'custom') return r.to.url ?? null;
  const ref = r.to?.reference;
  if (ref && typeof ref.value === 'object' && ref.value) {
    const { docPath } = await import('./urls');
    return docPath(
      ref.relationTo,
      ref.value as { slug?: string; type?: string },
    );
  }
  return null;
}

export function fallbackExcerpt(doc: {
  excerpt?: string | null;
  summary?: string | null;
  autoExcerpt?: string | null;
  searchText?: string | null;
}) {
  return (
    doc.excerpt ||
    doc.summary ||
    doc.autoExcerpt ||
    (doc.searchText ? excerptFrom(doc.searchText) : '')
  );
}
