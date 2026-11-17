import Link from 'next/link';

import { ListingSeo } from '@/components/ui/ListingSeo';
import { PageHeader } from '@/components/ui/PageHeader';
import { Container, EmptyState } from '@/components/ui/Primitives';
import { buildMetadata } from '@/lib/metadata';
import { getAllSeries, getTagCloud } from '@/lib/queries';
import { plural } from '@/lib/utils';
import { getViewer } from '@/lib/viewer';

export const revalidate = 3600;

export const generateMetadata = () =>
  buildMetadata({ title: 'Topics', path: '/tags', kind: 'Topics' });

export default async function TagsPage() {
  const viewer = await getViewer();
  const [tags, series] = await Promise.all([
    getTagCloud(viewer),
    getAllSeries(viewer),
  ]);
  const max = Math.max(1, ...tags.map((t) => t.count));

  return (
    <>
      <ListingSeo
        name="Topics"
        path="/tags"
        items={tags.map((t) => ({
          name: `#${t.title}`,
          path: `/tags/${t.slug}`,
        }))}
      />
      <PageHeader
        title="Topics"
        kicker={plural(tags.length, 'topic')}
        description="Everything grouped by what it’s about."
      />
      <Container size="wide" className="space-y-20 pb-24">
        {tags.length ? (
          <ul className="flex flex-wrap items-baseline gap-x-8 gap-y-4">
            {tags.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/tags/${t.slug}`}
                  className="group inline-flex items-baseline gap-1.5 hover:text-accent"
                  style={{ fontSize: `${1.1 + (t.count / max) * 2.4}rem` }}
                >
                  <span className="tracking-[-0.02em]">#{t.title}</span>
                  <sup className="text-xs text-faint group-hover:text-accent">
                    {t.count}
                  </sup>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No topics yet" />
        )}
        {series.length > 0 && (
          <section>
            <h2 className="mb-6 border-b border-line pb-3 text-2xl font-medium uppercase md:text-3xl">
              Series
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {series.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/series/${s.slug}`}
                    className="block rounded-2xl border border-line p-5 transition-colors hover:border-fg/40"
                  >
                    <span className="eyebrow text-[0.62rem] text-accent">
                      {plural(s.count, 'part')}
                    </span>
                    <span className="mt-1 block text-xl font-medium">
                      {s.title}
                    </span>
                    {s.description && (
                      <span className="mt-1 line-clamp-2 block text-sm text-muted">
                        {s.description}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </>
  );
}
