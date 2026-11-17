import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ListingSeo } from '@/components/ui/ListingSeo';
import { PageHeader } from '@/components/ui/PageHeader';
import { Container, EmptyState } from '@/components/ui/Primitives';
import { buildMetadata } from '@/lib/metadata';
import { fallbackExcerpt, getSeries, getSeriesPosts } from '@/lib/queries';
import { formatDate, plural } from '@/lib/utils';
import { getViewer } from '@/lib/viewer';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const series = await getSeries((await params).slug);
  if (!series) return {};
  return buildMetadata({
    title: series.title,
    description: series.description,
    path: `/series/${series.slug}`,
    kind: 'Series',
  });
}

export default async function SeriesPage({ params }: Props) {
  const series = await getSeries((await params).slug);
  if (!series) notFound();
  const posts = await getSeriesPosts(series.id, await getViewer());

  return (
    <>
      <ListingSeo
        name={series.title}
        path={`/series/${series.slug}`}
        description={series.description}
        items={posts.map((p) => ({ name: p.title, path: `/blog/${p.slug}` }))}
        crumbs={[
          { name: 'Topics', path: '/tags' },
          { name: series.title, path: `/series/${series.slug}` },
        ]}
      />
      <PageHeader
        title={series.title}
        size="lg"
        kicker={`Series · ${plural(posts.length, 'part')}`}
        description={series.description}
      />
      <Container size="default" className="pb-24">
        {posts.length === 0 && <EmptyState title="No parts published yet" />}
        <ol className="border-b border-line">
          {posts.map((p, i) => (
            <li
              key={p.id}
              className="group relative grid grid-cols-[3.5rem_1fr] gap-4 border-t border-line py-7"
            >
              <span className="display text-5xl text-fg/25">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h2 className="text-2xl font-medium leading-tight">
                  <Link
                    href={`/blog/${p.slug}`}
                    className="after:absolute after:inset-0 group-hover:text-accent"
                  >
                    {p.title}
                  </Link>
                </h2>
                <p className="mt-1.5 line-clamp-2 text-muted">
                  {fallbackExcerpt(p)}
                </p>
                <p className="mt-2 text-sm text-faint">
                  {formatDate(p.publishedAt)}{' '}
                  {p.readingTime ? `· ${p.readingTime} min` : ''}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </>
  );
}
