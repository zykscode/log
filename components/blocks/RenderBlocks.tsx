import Link from 'next/link';

import { EntryCard } from '@/components/content/EntryCards';
import { FeaturedPost, PostList } from '@/components/content/PostCards';
import { ProjectCard } from '@/components/content/ProjectCard';
import { Embed, Gallery } from '@/components/rich-text/blocks';
import { RichText } from '@/components/rich-text/RichText';
import { MediaImage } from '@/components/ui/MediaImage';
import { SectionHeading } from '@/components/ui/PageHeader';
import { ButtonLink, Container } from '@/components/ui/Primitives';
import {
  getEntries,
  getPosts,
  getProjects,
  getStats,
  getTagCloud,
} from '@/lib/queries';
import { cn } from '@/lib/utils';
import type { Viewer } from '@/lib/viewer';
import type { Media, Page, Post, Project } from '@/payload-types';

import { ContactForm } from './ContactForm';

type Block = NonNullable<Page['layout']>[number];
type BlockOf<T extends Block['blockType']> = Extract<Block, { blockType: T }>;

const idOf = (v: unknown) =>
  v && typeof v === 'object'
    ? (v as { id: number }).id
    : (v as number | undefined);

async function PostsFeedBlock({
  block,
  viewer,
}: {
  block: BlockOf<'postsFeed'>;
  viewer: Viewer;
}) {
  const limit = block.limit ?? 5;
  let posts: Post[] = [];
  let href = '/blog';
  if (block.source === 'manual') {
    posts = (block.posts ?? []).filter((p): p is Post => typeof p === 'object');
  } else {
    const res = await getPosts(viewer, {
      limit,
      featured: block.source === 'featured' || undefined,
      notFeatured:
        (block.skipFeatured && block.source !== 'featured') || undefined,
      category: block.source === 'category' ? idOf(block.category) : undefined,
      tag: block.source === 'tag' ? idOf(block.tag) : undefined,
      series: block.source === 'series' ? idOf(block.series) : undefined,
    });
    posts = res.docs;
    if (
      block.source === 'category' &&
      typeof block.category === 'object' &&
      block.category
    )
      href = `/blog/category/${block.category.slug}`;
    if (block.source === 'tag' && typeof block.tag === 'object' && block.tag)
      href = `/tags/${block.tag.slug}`;
    if (
      block.source === 'series' &&
      typeof block.series === 'object' &&
      block.series
    )
      href = `/series/${block.series.slug}`;
  }
  if (!posts.length) return null;
  return (
    <Container size="wide">
      {block.heading && (
        <SectionHeading
          title={block.heading}
          href={block.showViewAll ? href : undefined}
        />
      )}
      {block.layout === 'feature' ? (
        <div className="grid gap-8">
          {posts.map((p) => (
            <FeaturedPost key={p.id} post={p} />
          ))}
        </div>
      ) : (
        <PostList
          posts={posts}
          layout={(block.layout as 'list' | 'grid' | 'compact') ?? 'list'}
        />
      )}
    </Container>
  );
}

async function ProjectsBlock({
  block,
  viewer,
}: {
  block: BlockOf<'projectsGrid'>;
  viewer: Viewer;
}) {
  const projects =
    block.source === 'manual'
      ? (block.projects ?? []).filter(
          (p): p is Project => typeof p === 'object',
        )
      : await getProjects(viewer, {
          featured: block.source === 'featured' || undefined,
          limit: block.limit ?? 4,
        });
  if (!projects.length) return null;
  return (
    <Container size="wide">
      {block.heading && (
        <SectionHeading
          title={block.heading}
          href="/work"
          linkLabel="All work"
        />
      )}
      <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
        {projects.map((p, i) => (
          <ProjectCard
            key={p.id}
            project={p}
            large={i === 0 && projects.length % 2 === 1}
          />
        ))}
      </div>
    </Container>
  );
}

async function JournalBlock({
  block,
  viewer,
}: {
  block: BlockOf<'journalFeed'>;
  viewer: Viewer;
}) {
  const type = (block.entryType ?? 'all') as 'all' | 'journal' | 'diary';
  const res = await getEntries(viewer, { type, limit: block.limit ?? 4 });
  if (!res.docs.length) return null;
  return (
    <Container size="wide">
      {block.heading && (
        <SectionHeading
          title={block.heading}
          href={type === 'diary' ? '/diary' : '/journal'}
        />
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {res.docs.map((e) => (
          <EntryCard key={e.id} entry={e} />
        ))}
      </div>
    </Container>
  );
}

async function StatsBlock({
  block,
  viewer,
}: {
  block: BlockOf<'stats'>;
  viewer: Viewer;
}) {
  let items: { value: string; label: string }[] = (block.items ?? []).map(
    (i) => ({ value: i.value, label: i.label }),
  );
  if (block.auto !== false) {
    const s = await getStats(viewer);
    items = [
      { value: s.posts.toLocaleString('en-GB'), label: 'posts' },
      {
        value: (s.journal + s.diary).toLocaleString('en-GB'),
        label: 'journal & diary entries',
      },
      { value: s.projects.toLocaleString('en-GB'), label: 'projects' },
      {
        value:
          s.words >= 10000
            ? `${Math.round(s.words / 1000)}k`
            : s.words.toLocaleString('en-GB'),
        label: 'words written',
      },
    ];
  }
  return (
    <Container size="wide">
      {block.heading && <SectionHeading title={block.heading} />}
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="bg-panel p-6">
            <dt className="text-sm text-muted">{it.label}</dt>
            <dd className="display mt-2 text-[clamp(2.6rem,6vw,4.5rem)]">
              {it.value}
            </dd>
          </div>
        ))}
      </dl>
    </Container>
  );
}

async function TagCloudBlock({
  block,
  viewer,
}: {
  block: BlockOf<'tagCloud'>;
  viewer: Viewer;
}) {
  const tags = await getTagCloud(viewer);
  if (!tags.length) return null;
  const max = Math.max(...tags.map((t) => t.count));
  return (
    <Container size="wide">
      {block.heading && <SectionHeading title={block.heading} href="/tags" />}
      <ul className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
        {tags.map((t) => (
          <li key={t.id}>
            <Link
              href={`/tags/${t.slug}`}
              className="hover:text-accent"
              style={{
                fontSize: `${1 + (t.count / max) * 1.4}rem`,
                opacity: 0.55 + (t.count / max) * 0.45,
              }}
            >
              #{t.title}
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}

function BlockSwitch({ block, viewer }: { block: Block; viewer: Viewer }) {
  switch (block.blockType) {
    case 'content': {
      const width =
        block.width === 'narrow'
          ? 'narrow'
          : block.width === 'wide'
            ? 'wide'
            : 'default';
      return (
        <Container size={width}>
          {block.heading && <SectionHeading title={block.heading} />}
          <div className={cn(width === 'default' && 'max-w-3xl')}>
            <RichText data={block.content} />
          </div>
        </Container>
      );
    }
    case 'bigText':
      return (
        <div
          className={cn(
            'overflow-x-clip px-5 pt-[0.08em] md:px-10',
            block.align === 'center' && 'text-center',
            block.align === 'right' && 'text-right',
          )}
        >
          {(block.lines ?? []).map((l, i) => (
            <p
              key={l.id ?? i}
              className={cn(
                'display text-[clamp(3.5rem,14vw,13rem)]',
                block.tone === 'accent' && 'text-ember',
                block.tone === 'muted' && 'text-fg/20',
                block.tone === 'outline' &&
                  'text-transparent [-webkit-text-stroke:1.5px_var(--fg)]',
              )}
            >
              {l.text}
            </p>
          ))}
          {block.caption && (
            <p className="mt-6 text-lg text-muted">{block.caption}</p>
          )}
        </div>
      );
    case 'mediaSection':
      return (
        <Container
          size={
            block.size === 'full'
              ? 'full'
              : block.size === 'normal'
                ? 'default'
                : 'wide'
          }
        >
          <figure>
            <MediaImage
              media={block.media as Media}
              sizes="100vw"
              className="rounded-2xl"
            />
            {block.caption && (
              <figcaption className="mt-3 text-center text-sm text-muted">
                {block.caption}
              </figcaption>
            )}
          </figure>
        </Container>
      );
    case 'gallerySection':
      return (
        <Container size="wide">
          {block.heading && <SectionHeading title={block.heading} />}
          <Gallery
            images={(block.images ?? []).filter(
              (m): m is Media => typeof m === 'object',
            )}
            layout={block.layout}
            columns="3"
          />
        </Container>
      );
    case 'cta':
      return (
        <Container size="wide">
          <div className="rounded-3xl bg-night px-6 py-14 text-bone md:px-14 md:py-20">
            {block.heading && (
              <h2 className="display max-w-4xl text-[clamp(2.6rem,7vw,6rem)]">
                {block.heading}
              </h2>
            )}
            {block.body && (
              <p className="mt-6 max-w-xl text-lg text-bone/70">{block.body}</p>
            )}
            {block.links?.length ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {block.links.map((l, i) => (
                  <ButtonLink
                    key={l.id ?? i}
                    href={l.url}
                    variant={(l.style as 'primary') ?? 'primary'}
                    className={cn(
                      l.style === 'primary' && 'bg-bone text-night',
                      l.style === 'outline' && 'border-bone/40 text-bone',
                      l.style === 'link' && 'text-bone',
                    )}
                  >
                    {l.label}
                  </ButtonLink>
                ))}
              </div>
            ) : null}
          </div>
        </Container>
      );
    case 'postsFeed':
      return <PostsFeedBlock block={block} viewer={viewer} />;
    case 'projectsGrid':
      return <ProjectsBlock block={block} viewer={viewer} />;
    case 'journalFeed':
      return <JournalBlock block={block} viewer={viewer} />;
    case 'timeline':
      return (
        <Container size="default">
          {block.heading && <SectionHeading title={block.heading} />}
          <ol className="relative">
            {(block.items ?? []).map((it, i) => (
              <li
                key={it.id ?? i}
                className="grid gap-2 border-t border-line py-6 md:grid-cols-[11rem_1fr] md:gap-8"
              >
                <span className="text-sm tabular-nums text-muted">
                  {it.period}
                </span>
                <div>
                  <h3 className="text-xl font-medium">
                    {it.url ? (
                      <a
                        href={it.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent"
                      >
                        {it.title} ↗
                      </a>
                    ) : (
                      it.title
                    )}
                    {it.org && <span className="text-muted"> · {it.org}</span>}
                  </h3>
                  {it.description && (
                    <p className="mt-2 max-w-2xl whitespace-pre-line text-muted">
                      {it.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Container>
      );
    case 'stats':
      return <StatsBlock block={block} viewer={viewer} />;
    case 'quote':
      return (
        <Container size="default">
          <figure className="py-6">
            <blockquote className="text-[clamp(1.8rem,4vw,3.2rem)] font-medium leading-[1.12] tracking-[-0.025em] text-balance">
              <span className="text-accent">“</span>
              {block.text}
              <span className="text-accent">”</span>
            </blockquote>
            {block.attribution && (
              <figcaption className="mt-5 text-muted">
                — {block.attribution}
              </figcaption>
            )}
          </figure>
        </Container>
      );
    case 'accordion':
      return (
        <Container size="default">
          {block.heading && <SectionHeading title={block.heading} />}
          <div className="divide-y divide-line border-y border-line">
            {(block.items ?? []).map((it, i) => (
              <details key={it.id ?? i} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-xl font-medium [&::-webkit-details-marker]:hidden">
                  {it.title}
                  <span
                    className="text-2xl text-muted transition-transform group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <div className="prose-zyk pb-6 text-muted">
                  <RichText data={it.content} nested />
                </div>
              </details>
            ))}
          </div>
        </Container>
      );
    case 'linkList':
      return (
        <Container size="default">
          {block.heading && <SectionHeading title={block.heading} />}
          <ul
            className={cn(
              block.layout === 'grid'
                ? 'grid gap-4 sm:grid-cols-2'
                : 'border-b border-line',
            )}
          >
            {(block.links ?? []).map((l, i) => (
              <li
                key={l.id ?? i}
                className={cn(
                  block.layout === 'grid'
                    ? 'rounded-2xl border border-line'
                    : 'border-t border-line',
                )}
              >
                <a
                  href={l.url}
                  target={l.url.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="group flex items-baseline justify-between gap-6 p-4"
                >
                  <span>
                    <span className="text-lg font-medium group-hover:text-accent">
                      {l.label}
                    </span>
                    {l.description && (
                      <span className="mt-0.5 block text-sm text-muted">
                        {l.description}
                      </span>
                    )}
                  </span>
                  <span className="text-muted transition-transform group-hover:translate-x-1">
                    {l.url.startsWith('http') ? '↗' : '→'}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      );
    case 'embedSection':
      return (
        <Container size="default">
          <Embed url={block.url} caption={block.caption} />
        </Container>
      );
    case 'columns':
      return (
        <Container size="wide">
          {block.heading && <SectionHeading title={block.heading} />}
          <div
            className={cn(
              'grid gap-10',
              (block.columns?.length ?? 2) >= 3
                ? 'md:grid-cols-3'
                : 'md:grid-cols-2',
              block.columns?.length === 4 && 'lg:grid-cols-4',
            )}
          >
            {(block.columns ?? []).map((col, i) => (
              <div key={col.id ?? i} className="prose-zyk">
                <RichText data={col.content} nested />
              </div>
            ))}
          </div>
        </Container>
      );
    case 'contact':
      return (
        <Container size="default">
          <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
            <div>
              {block.heading && (
                <h2 className="text-3xl font-medium tracking-[-0.02em]">
                  {block.heading}
                </h2>
              )}
              {block.intro && (
                <p className="mt-3 whitespace-pre-line text-lg text-muted">
                  {block.intro}
                </p>
              )}
            </div>
            <ContactForm successMessage={block.successMessage} />
          </div>
        </Container>
      );
    case 'tagCloud':
      return <TagCloudBlock block={block} viewer={viewer} />;
    case 'spacer':
      return (
        <div
          className={cn(
            block.size === 'sm' && 'h-4',
            block.size === 'md' && 'h-10',
            block.size === 'lg' && 'h-20',
            block.size === 'xl' && 'h-36',
          )}
        >
          {block.line && <hr className="mx-5 border-line md:mx-10" />}
        </div>
      );
    default:
      return null;
  }
}

/** Renders a page's sections in order. */
export function RenderBlocks({
  blocks,
  viewer,
}: {
  blocks: Page['layout'];
  viewer: Viewer;
}) {
  if (!blocks?.length) return null;
  return (
    <div className="flex flex-col gap-20 pb-24 md:gap-28">
      {blocks.map((block, i) => (
        <section
          key={block.id ?? i}
          aria-label={
            'heading' in block && block.heading ? block.heading : undefined
          }
        >
          <BlockSwitch block={block} viewer={viewer} />
        </section>
      ))}
    </div>
  );
}
