import { NextResponse } from 'next/server';

import { searchContent } from '@/lib/queries';
import { docPath } from '@/lib/urls';
import { formatDate } from '@/lib/utils';
import { getViewer } from '@/lib/viewer';

/** JSON search used by the ⌘K palette. */
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get('q') ?? '').slice(0, 120);
  const viewer = await getViewer();
  const results = q.trim().length > 1 ? await searchContent(viewer, q, 12) : [];
  return NextResponse.json(
    {
      results: results.map((r) => ({
        title: r.title,
        url: docPath(r.collection, {
          slug: r.slug,
          type: r.kind === 'diary' ? 'diary' : 'journal',
        }),
        kind: r.kind,
        date: r.publishedAt ? formatDate(r.publishedAt, 'short') : undefined,
        snippet: r.snippet,
        private: r.isPrivate,
      })),
    },
    {
      headers: {
        'Cache-Control': viewer.isAuthor
          ? 'private, no-store'
          : 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    },
  );
}
