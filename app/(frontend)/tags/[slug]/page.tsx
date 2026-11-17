import { notFound } from 'next/navigation';

import { EntryRow } from '@/components/content/EntryCards';
import { PostList } from '@/components/content/PostCards';
import { ProjectGrid } from '@/components/content/ProjectCard';
import { ListingSeo } from '@/components/ui/ListingSeo';
import { PageHeader, SectionHeading } from '@/components/ui/PageHeader';
import { Container, EmptyState } from '@/components/ui/Primitives';
import { buildMetadata } from '@/lib/metadata';
import { getTag, getTagCloud, getTaggedEverything } from '@/lib/queries';
import { plural } from '@/lib/utils';
import { getViewer } from '@/lib/viewer';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getTagCloud({ isAuthor: false, user: null }))
    .filter((t) => t.slug)
    .map((t) => ({ slug: t.slug as string }));
}

export async function generateMetadata({ params }: Props) {
  const tag = await getTag((await params).slug);
  if (!tag) return {};
  return buildMetadata({
    title: `#${tag.title}`,
    description: tag.description,
    path: `/tags/${tag.slug}`,
    kind: 'Topic',
  });
}

export default async function TagPage({ params }: Props) {
  const tag = await getTag((await params).slug);
  if (!tag) notFound();
  const { posts, entries, projects } = await getTaggedEverything(
    await getViewer(),
    tag.id,
  );
  const total = posts.length + entries.length + projects.length;

  return (
    <>
      <ListingSeo
        name={`#${tag.title}`}
        path={`/tags/${tag.slug}`}
        description={tag.description}
        items={[
          ...posts.map((p) => ({ name: p.title, path: `/blog/${p.slug}` })),
          ...entries.map((e) => ({
            name: e.title ?? '',
            path: `/${e.type === 'diary' ? 'diary' : 'journal'}/${e.slug}`,
          })),
          ...projects.map((p) => ({ name: p.title, path: `/work/${p.slug}` })),
        ]}
        crumbs={[
          { name: 'Topics', path: '/tags' },
          { name: `#${tag.title}`, path: `/tags/${tag.slug}` },
        ]}
      />
      <PageHeader
        title={`#${tag.title}`}
        size="lg"
        kicker={`Topic · ${plural(total, 'item')}`}
        description={tag.description}
      />
      <Container size="wide" className="space-y-20 pb-24">
        {total === 0 && <EmptyState title="Nothing tagged here yet" />}
        {posts.length > 0 && (
          <section>
            <SectionHeading title="Posts" />
            <PostList posts={posts} layout="compact" />
          </section>
        )}
        {entries.length > 0 && (
          <section>
            <SectionHeading title="Journal & diary" />
            <div className="border-b border-line">
              {entries.map((e) => (
                <EntryRow key={e.id} entry={e} showType />
              ))}
            </div>
          </section>
        )}
        {projects.length > 0 && (
          <section>
            <SectionHeading title="Work" />
            <ProjectGrid projects={projects} />
          </section>
        )}
      </Container>
    </>
  );
}
