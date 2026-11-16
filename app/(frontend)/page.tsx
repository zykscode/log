import type { Metadata } from 'next';

import { PageHero } from '@/components/blocks/PageHero';
import { RenderBlocks } from '@/components/blocks/RenderBlocks';
import { EntryCard } from '@/components/content/EntryCards';
import { FeaturedPost, PostList } from '@/components/content/PostCards';
import { ProjectCard } from '@/components/content/ProjectCard';
import { EditLink } from '@/components/site/AuthorBar';
import { PageHeader, SectionHeading } from '@/components/ui/PageHeader';
import { ButtonLink, Container } from '@/components/ui/Primitives';
import { buildMetadata } from '@/lib/metadata';
import {
  getEntries,
  getPage,
  getPosts,
  getProjects,
  getSettings,
} from '@/lib/queries';
import { getViewer } from '@/lib/viewer';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const viewer = await getViewer();
  const page = await getPage('home', viewer);
  const settings = await getSettings();
  return buildMetadata({
    title: page?.meta?.title || undefined,
    description: page?.meta?.description || settings.description,
    path: '/',
    meta: page?.meta,
  });
}

/** Used until a page with slug "home" exists in the CMS. */
async function DefaultHome() {
  const viewer = await getViewer();
  const settings = await getSettings();
  const [featured, latest, projects, entries] = await Promise.all([
    getPosts(viewer, { featured: true, limit: 1 }),
    getPosts(viewer, { limit: 6 }),
    getProjects(viewer, { featured: true, limit: 4 }),
    getEntries(viewer, { type: 'journal', limit: 4 }),
  ]);
  const hero = featured.docs[0];
  const rest = latest.docs.filter((p) => p.id !== hero?.id).slice(0, 5);

  return (
    <div className="flex flex-col gap-20 pb-24 md:gap-28">
      <PageHeader
        title={`Hello,|I'm ${settings.authorName || 'Zykson'}`}
        kicker={settings.tagline}
        description={settings.description}
        aside={
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href="/blog">Read the blog</ButtonLink>
            <ButtonLink href="/work" variant="outline">
              See my work
            </ButtonLink>
          </div>
        }
      />
      {hero && (
        <Container size="wide">
          <FeaturedPost post={hero} />
        </Container>
      )}
      {rest.length > 0 && (
        <Container size="wide">
          <SectionHeading title="Latest writing" href="/blog" />
          <PostList posts={rest} />
        </Container>
      )}
      {projects.length > 0 && (
        <Container size="wide">
          <SectionHeading
            title="Selected work"
            href="/work"
            linkLabel="All work"
          />
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Container>
      )}
      {entries.docs.length > 0 && (
        <Container size="wide">
          <SectionHeading title="From the journal" href="/journal" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {entries.docs.map((e) => (
              <EntryCard key={e.id} entry={e} />
            ))}
          </div>
        </Container>
      )}
    </div>
  );
}

export default async function HomePage() {
  const viewer = await getViewer();
  const page = await getPage('home', viewer);
  if (!page) return <DefaultHome />;
  return (
    <>
      <PageHero
        page={page}
        aside={<EditLink collection="pages" id={page.id} />}
      />
      <RenderBlocks blocks={page.layout} viewer={viewer} />
    </>
  );
}
