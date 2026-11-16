import Link from 'next/link';

import { MediaImage } from '@/components/ui/MediaImage';
import { StatusBadges } from '@/components/ui/Primitives';
import { DISCIPLINES, labelOf } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Project } from '@/payload-types';

export function ProjectCard({
  project,
  large,
  priority,
}: {
  project: Project;
  large?: boolean;
  priority?: boolean;
}) {
  return (
    <article
      className="group relative flex flex-col"
      data-disciplines={(project.disciplines ?? []).join(' ')}
    >
      <div className="relative mb-4 overflow-hidden rounded-2xl">
        {project.coverImage && typeof project.coverImage === 'object' ? (
          <MediaImage
            media={project.coverImage}
            aspect={large ? '16/10' : '4/3'}
            priority={priority}
            sizes={
              large
                ? '(min-width: 1024px) 66vw, 100vw'
                : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
            }
            imgClassName="transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div
            className={cn(
              'flex items-end bg-fg/[0.06] p-6',
              large ? 'aspect-[16/10]' : 'aspect-[4/3]',
            )}
          >
            <span className="display text-7xl text-fg/15">{project.title}</span>
          </div>
        )}
        {project.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-night/80 px-3 py-1 text-xs text-bone backdrop-blur">
            ★ Featured
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3
            className={cn(
              'font-medium leading-tight tracking-[-0.02em]',
              large ? 'text-3xl md:text-4xl' : 'text-2xl',
            )}
          >
            <Link
              href={`/work/${project.slug}`}
              className="after:absolute after:inset-0"
            >
              {project.title}
            </Link>
          </h3>
          {project.summary && (
            <p className="mt-1.5 line-clamp-2 text-muted">{project.summary}</p>
          )}
          <div className="mt-2">
            <StatusBadges
              status={project._status}
              visibility={project.visibility}
              publishedAt={project.publishedAt}
            />
          </div>
        </div>
        {project.year && (
          <span className="shrink-0 pt-1 text-sm tabular-nums text-muted">
            {project.year}
          </span>
        )}
      </div>
      {project.disciplines?.length ? (
        <p className="eyebrow mt-3 text-[0.62rem] text-faint">
          {project.disciplines.map((d) => labelOf(DISCIPLINES, d)).join(' · ')}
        </p>
      ) : null}
    </article>
  );
}

export function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
      {projects.map((p, i) => (
        <ProjectCard key={p.id} project={p} priority={i < 2} />
      ))}
    </div>
  );
}
