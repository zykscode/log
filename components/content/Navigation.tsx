import Link from 'next/link';

import { cn } from '@/lib/utils';
import type { Post, Series } from '@/payload-types';

type Neighbour = { title?: string | null; slug?: string | null } | null;

export function PrevNext({
  previous,
  next,
  base,
  labels = ['Older', 'Newer'],
}: {
  previous: Neighbour;
  next: Neighbour;
  base: string;
  labels?: [string, string];
}) {
  if (!previous && !next) return null;
  return (
    <nav
      aria-label="More"
      className="grid gap-4 border-t border-line pt-8 sm:grid-cols-2"
    >
      {previous?.slug ? (
        <Link
          href={`${base}/${previous.slug}`}
          className="group rounded-2xl p-4 transition-colors hover:bg-fg/5"
        >
          <span className="eyebrow text-faint">← {labels[0]}</span>
          <span className="mt-2 block text-xl font-medium leading-snug group-hover:text-accent">
            {previous.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next?.slug ? (
        <Link
          href={`${base}/${next.slug}`}
          className="group rounded-2xl p-4 text-right transition-colors hover:bg-fg/5"
        >
          <span className="eyebrow text-faint">{labels[1]} →</span>
          <span className="mt-2 block text-xl font-medium leading-snug group-hover:text-accent">
            {next.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

export function SeriesBox({
  series,
  posts,
  currentId,
}: {
  series: Series;
  posts: Post[];
  currentId: number | string;
}) {
  const index = posts.findIndex((p) => p.id === currentId);
  return (
    <aside className="rounded-2xl border border-line p-5 md:p-6">
      <p className="eyebrow text-accent">
        Series · Part {index + 1} of {posts.length}
      </p>
      <Link
        href={`/series/${series.slug}`}
        className="mt-1 block text-xl font-medium hover:text-accent"
      >
        {series.title}
      </Link>
      <ol className="mt-4 space-y-1.5 text-[0.95rem]">
        {posts.map((p, i) => (
          <li key={p.id} className="flex gap-3">
            <span className="w-5 shrink-0 tabular-nums text-faint">
              {i + 1}.
            </span>
            {p.id === currentId ? (
              <span className="font-medium">{p.title}</span>
            ) : (
              <Link
                href={`/blog/${p.slug}`}
                className={cn('text-muted hover:text-fg')}
              >
                {p.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </aside>
  );
}
