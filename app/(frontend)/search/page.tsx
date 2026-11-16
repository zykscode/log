import Link from 'next/link';

import { PageHeader } from '@/components/ui/PageHeader';
import { Container, EmptyState } from '@/components/ui/Primitives';
import { buildMetadata } from '@/lib/metadata';
import { searchContent } from '@/lib/queries';
import { docPath } from '@/lib/urls';
import { formatDate } from '@/lib/utils';
import { getViewer } from '@/lib/viewer';

type Props = { searchParams: Promise<{ q?: string }> };

export const generateMetadata = () =>
  buildMetadata({ title: 'Search', path: '/search', noindex: true });

function highlight(text: string, q: string) {
  const words = q
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!words.length) return text;
  const parts = text.split(new RegExp(`(${words.join('|')})`, 'gi'));
  return parts.map((p, i) =>
    i % 2 ? (
      <mark key={i} className="rounded bg-accent/20 px-0.5 text-fg">
        {p}
      </mark>
    ) : (
      p
    ),
  );
}

const KIND: Record<string, string> = {
  post: 'Post',
  journal: 'Journal',
  diary: 'Diary',
  project: 'Work',
};

export default async function SearchPage({ searchParams }: Props) {
  const q = ((await searchParams).q ?? '').slice(0, 120);
  const results =
    q.trim().length > 1 ? await searchContent(await getViewer(), q, 50) : [];

  return (
    <>
      <PageHeader title="Search" size="lg" />
      <Container size="default" className="pb-24">
        <form action="/search" role="search" className="mb-12 flex gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="What are you looking for?"
            className="h-14 flex-1 rounded-full border border-line bg-transparent px-6 text-lg outline-none placeholder:text-faint focus:border-fg"
          />
          <button className="rounded-full bg-fg px-6 font-medium text-canvas hover:bg-accent hover:text-accent-fg">
            Search
          </button>
        </form>
        {q && (
          <p className="mb-6 text-sm text-muted">
            {results.length} result{results.length === 1 ? '' : 's'} for “{q}”
          </p>
        )}
        {q && results.length === 0 && (
          <EmptyState title="Nothing found">
            Try fewer or different words.
          </EmptyState>
        )}
        <ul className="border-b border-line">
          {results.map((r) => (
            <li
              key={`${r.collection}-${r.id}`}
              className="group relative border-t border-line py-6"
            >
              <div className="mb-1 flex items-center gap-3 text-xs text-muted">
                <span className="eyebrow text-[0.62rem] text-accent">
                  {KIND[r.kind]}
                </span>
                {r.publishedAt && <span>{formatDate(r.publishedAt)}</span>}
                {r.isPrivate && <span>🔒 private</span>}
              </div>
              <Link
                href={docPath(r.collection, {
                  slug: r.slug,
                  type: r.kind === 'diary' ? 'diary' : 'journal',
                })}
                className="text-2xl font-medium leading-snug after:absolute after:inset-0 group-hover:text-accent"
              >
                {highlight(r.title, q)}
              </Link>
              {r.snippet && (
                <p className="mt-2 line-clamp-3 text-muted">
                  {highlight(r.snippet, q)}
                </p>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
