import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';

import { PageHero } from '@/components/blocks/PageHero';
import { RenderBlocks } from '@/components/blocks/RenderBlocks';
import { EditLink } from '@/components/site/AuthorBar';
import { StatusBadges } from '@/components/ui/Primitives';
import { buildMetadata } from '@/lib/metadata';
import { getPage, getPublicSlugs, getRedirectFor } from '@/lib/queries';
import { getViewer } from '@/lib/viewer';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string[] }> };

export async function generateStaticParams() {
  const pages = await getPublicSlugs('pages');
  return pages
    .filter((p) => p.slug !== 'home')
    .map((p) => ({ slug: [p.slug] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug.length !== 1) return {};
  const page = await getPage(slug[0], await getViewer());
  if (!page) return {};
  return buildMetadata({
    title: page.title,
    description: page.hero?.intro,
    path: `/${page.slug}`,
    meta: page.meta,
    noindex: page.visibility === 'unlisted',
  });
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  const path = `/${slug.join('/')}`;
  const viewer = await getViewer();
  const page =
    slug.length === 1 && slug[0] !== 'home'
      ? await getPage(slug[0], viewer)
      : null;

  if (!page) {
    const to = await getRedirectFor(path);
    if (to && to !== path) permanentRedirect(to);
    notFound();
  }

  return (
    <article>
      <PageHero
        page={page}
        aside={
          <div className="mt-4 flex items-center gap-3">
            <StatusBadges status={page._status} visibility={page.visibility} />
            <EditLink collection="pages" id={page.id} />
          </div>
        }
      />
      <RenderBlocks blocks={page.layout} viewer={viewer} />
    </article>
  );
}
