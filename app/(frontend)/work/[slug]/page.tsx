import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';

import { PostCompact } from '@/components/content/PostCards';
import { ProjectCard } from '@/components/content/ProjectCard';
import { Gallery } from '@/components/rich-text/blocks';
import { RichText } from '@/components/rich-text/RichText';
import { EditLink } from '@/components/site/AuthorBar';
import { SaveOffline } from '@/components/site/Pwa';
import { MediaImage } from '@/components/ui/MediaImage';
import { SectionHeading } from '@/components/ui/PageHeader';
import { ButtonLink, StatusBadges, TagList } from '@/components/ui/Primitives';
import { DISCIPLINES, labelOf, PROJECT_STATUS } from '@/lib/constants';
import { breadcrumbsLd, JsonLd, projectLd } from '@/lib/jsonld';
import { buildMetadata } from '@/lib/metadata';
import {
  fallbackExcerpt,
  getProject,
  getProjects,
  getPublicSlugs,
  getRedirectFor,
  getSettings,
} from '@/lib/queries';
import { getViewer } from '@/lib/viewer';
import type { Media, Post } from '@/payload-types';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPublicSlugs('projects')).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProject((await params).slug, await getViewer());
  if (!project) return {};
  return buildMetadata({
    title: project.title,
    description: fallbackExcerpt(project),
    path: `/work/${project.slug}`,
    meta: project.meta,
    image: project.coverImage as Media,
    kind: 'Work',
    noindex: project.visibility === 'unlisted',
    tags: [
      ...(project.stack ?? []),
      ...(project.tags ?? []).flatMap((t) =>
        typeof t === 'object' && t ? [t.title] : [],
      ),
    ],
  });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const viewer = await getViewer();
  const project = await getProject(slug, viewer);
  if (!project) {
    const to = await getRedirectFor(`/work/${slug}`);
    if (to) permanentRedirect(to);
    notFound();
  }
  const others = await getProjects(viewer, { exclude: [project.id], limit: 2 });
  const cover =
    typeof project.coverImage === 'object'
      ? (project.coverImage as Media | null)
      : null;
  const gallery = (project.gallery ?? []).filter(
    (m): m is Media => typeof m === 'object' && m !== null,
  );
  const related = (project.relatedPosts ?? []).filter(
    (p): p is Post => typeof p === 'object' && p !== null,
  );

  const facts = [
    project.role && ['Role', project.role],
    project.client && ['Client', project.client],
    project.year && ['Year', project.year],
    project.status && ['Status', labelOf(PROJECT_STATUS, project.status)],
    project.disciplines?.length && [
      'Disciplines',
      project.disciplines.map((d) => labelOf(DISCIPLINES, d)).join(', '),
    ],
    project.stack?.length && ['Tools', project.stack.join(', ')],
  ].filter(Boolean) as [string, string][];

  const settings = await getSettings();
  return (
    <article className="pb-24">
      <JsonLd
        data={[
          projectLd(project, settings),
          breadcrumbsLd([
            { name: 'Work', path: '/work' },
            { name: project.title, path: `/work/${project.slug}` },
          ]),
        ]}
      />
      <header className="px-5 pb-12 pt-10 md:px-10 md:pt-14">
        <div className="eyebrow mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted">
          <Link href="/work" className="hover:text-fg">
            ← Work
          </Link>
          {project.year && <span>{project.year}</span>}
          <StatusBadges
            status={project._status}
            visibility={project.visibility}
            publishedAt={project.publishedAt}
          />
          <EditLink collection="projects" id={project.id} />
        </div>
        <h1 className="display max-w-[14ch] animate-fade-up text-[clamp(3.2rem,11vw,10rem)]">
          {project.title}
        </h1>
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          {project.summary && (
            <p className="max-w-2xl text-xl leading-relaxed text-fg/85 md:text-2xl">
              {project.summary}
            </p>
          )}
          <div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt className="eyebrow text-[0.62rem] text-faint">{k}</dt>
                  <dd className="mt-1 leading-snug">{v}</dd>
                </div>
              ))}
            </dl>
            {project.links?.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {project.links.map((l, i) => (
                  <ButtonLink
                    key={l.id ?? i}
                    href={l.url}
                    variant={i === 0 ? 'primary' : 'outline'}
                  >
                    {l.label}
                  </ButtonLink>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {cover && (
        <div className="mb-16 px-5 md:px-10">
          <MediaImage
            media={cover}
            aspect="16/9"
            priority
            sizes="100vw"
            className="rounded-2xl"
          />
        </div>
      )}

      {project.metrics?.length ? (
        <div className="mx-auto mb-16 max-w-6xl px-5 md:px-10">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
            {project.metrics.map((m, i) => (
              <div
                key={m.id ?? i}
                className="flex flex-col-reverse bg-panel p-6"
              >
                <dt className="mt-2 text-sm text-muted">{m.label}</dt>
                <dd className="display text-[clamp(2.6rem,6vw,4.5rem)] text-accent">
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      <div className="mx-auto max-w-[46rem] px-5 md:px-0">
        <RichText data={project.content} />
      </div>

      {gallery.length > 0 && (
        <div className="mx-auto max-w-[90rem] px-5 md:px-10">
          <Gallery images={gallery} layout="masonry" columns="3" />
        </div>
      )}

      {project.testimonial?.quote && (
        <figure className="mx-auto my-20 max-w-4xl px-5 md:px-10">
          <blockquote className="text-[clamp(1.6rem,3.6vw,2.8rem)] font-medium leading-[1.15] tracking-[-0.025em] text-balance">
            <span className="text-accent">“</span>
            {project.testimonial.quote}
            <span className="text-accent">”</span>
          </blockquote>
          {project.testimonial.author && (
            <figcaption className="mt-5 text-muted">
              — {project.testimonial.author}
              {project.testimonial.authorRole && (
                <span className="text-faint">
                  , {project.testimonial.authorRole}
                </span>
              )}
            </figcaption>
          )}
        </figure>
      )}

      <div className="mx-auto mt-12 max-w-[46rem] space-y-10 px-5 md:px-0">
        <TagList tags={project.tags} />
        <SaveOffline />
        {related.length > 0 && (
          <section>
            <h2 className="eyebrow mb-2 text-faint">Related writing</h2>
            <ul className="border-b border-line">
              {related.map((p) => (
                <PostCompact key={p.id} post={p} />
              ))}
            </ul>
          </section>
        )}
      </div>

      {others.length > 0 && (
        <section className="mx-auto mt-24 max-w-[90rem] px-5 md:px-10">
          <SectionHeading title="More work" href="/work" linkLabel="All work" />
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
            {others.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
