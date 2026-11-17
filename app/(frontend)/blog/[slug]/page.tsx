import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';

import { Comments } from '@/components/content/Comments';
import { PrevNext, SeriesBox } from '@/components/content/Navigation';
import { PostCard } from '@/components/content/PostCards';
import { ShareLinks } from '@/components/content/Share';
import { TableOfContents } from '@/components/content/TableOfContents';
import { RichText } from '@/components/rich-text/RichText';
import { EditLink } from '@/components/site/AuthorBar';
import { SaveOffline } from '@/components/site/Pwa';
import { ScrollProgress } from '@/components/site/ScrollProgress';
import { MediaImage } from '@/components/ui/MediaImage';
import { SectionHeading } from '@/components/ui/PageHeader';
import { StatusBadges, TagList } from '@/components/ui/Primitives';
import { breadcrumbsLd, JsonLd, postLd } from '@/lib/jsonld';
import { collectHeadings } from '@/lib/lexical';
import { buildMetadata } from '@/lib/metadata';
import {
  fallbackExcerpt,
  getPost,
  getPostNeighbours,
  getPublicSlugs,
  getRedirectFor,
  getRelatedPosts,
  getSeriesPosts,
  getSettings,
} from '@/lib/queries';
import { absoluteUrl } from '@/lib/urls';
import { cn, formatDate } from '@/lib/utils';
import { getViewer } from '@/lib/viewer';
import type { Category, Media, Series, User } from '@/payload-types';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPublicSlugs('posts')).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug, await getViewer());
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: fallbackExcerpt(post),
    path: `/blog/${post.slug}`,
    meta: post.meta,
    image: post.coverImage as Media,
    kind: 'Blog',
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    noindex: post.visibility === 'unlisted',
    canonical: post.canonicalUrl,
    authors: (post.authors ?? []).flatMap((a) =>
      typeof a === 'object' && a ? [a.name] : [],
    ),
    section:
      typeof post.category === 'object' ? post.category?.title : undefined,
    tags: (post.tags ?? []).flatMap((t) =>
      typeof t === 'object' && t ? [t.title] : [],
    ),
  });
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const viewer = await getViewer();
  const post = await getPost(slug, viewer);
  if (!post) {
    const to = await getRedirectFor(`/blog/${slug}`);
    if (to) permanentRedirect(to);
    notFound();
  }

  const category =
    typeof post.category === 'object'
      ? (post.category as Category | null)
      : null;
  const series =
    typeof post.series === 'object' ? (post.series as Series | null) : null;
  const authors = (post.authors ?? []).filter(
    (a): a is User => typeof a === 'object' && a !== null,
  );
  const cover =
    typeof post.coverImage === 'object'
      ? (post.coverImage as Media | null)
      : null;
  const { headings } = collectHeadings(post.content);
  const showToc = post.showToc !== false && headings.length >= 2;

  const [neighbours, related, seriesPosts, settings] = await Promise.all([
    getPostNeighbours(post, viewer),
    getRelatedPosts(post, viewer, 3),
    series ? getSeriesPosts(series.id, viewer) : Promise.resolve([]),
    getSettings(),
  ]);
  const comments = settings.comments;
  const commentsReady =
    post.allowComments !== false &&
    comments?.enabled &&
    comments.repo &&
    comments.repoId &&
    comments.category &&
    comments.categoryId;
  const url = absoluteUrl(`/blog/${post.slug}`);
  const updated =
    post.updatedAt &&
    post.publishedAt &&
    new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() >
      86_400_000;

  return (
    <article>
      <ScrollProgress />
      <JsonLd
        data={[
          postLd(post, settings),
          breadcrumbsLd([
            { name: 'Blog', path: '/blog' },
            ...(category
              ? [
                  {
                    name: category.title,
                    path: `/blog/category/${category.slug}`,
                  },
                ]
              : []),
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />

      <header className="mx-auto max-w-[90rem] px-5 pb-10 pt-10 md:px-10 md:pt-16">
        <div className="eyebrow mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted">
          <Link href="/blog" className="hover:text-fg">
            ← Blog
          </Link>
          {category && (
            <Link
              href={`/blog/category/${category.slug}`}
              className="text-accent hover:underline"
            >
              {category.title}
            </Link>
          )}
          {series && (
            <Link href={`/series/${series.slug}`} className="hover:text-fg">
              Series: {series.title}
            </Link>
          )}
          <StatusBadges
            status={post._status}
            visibility={post.visibility}
            publishedAt={post.publishedAt}
          />
          <EditLink collection="posts" id={post.id} />
        </div>
        <h1 className="max-w-6xl animate-fade-up text-[clamp(2.6rem,7vw,6.6rem)] font-normal uppercase leading-[0.9] tracking-[-0.045em] text-balance">
          {post.title}
        </h1>
        {post.subtitle && (
          <p className="mt-6 max-w-3xl text-xl leading-snug text-fg/80 md:text-2xl">
            {post.subtitle}
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-5 text-sm text-muted">
          {authors.length > 0 && (
            <span className="text-fg">
              By {authors.map((a) => a.name).join(', ')}
            </span>
          )}
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
          )}
          {updated && <span>Updated {formatDate(post.updatedAt)}</span>}
          {post.readingTime ? <span>{post.readingTime} min read</span> : null}
          {post.wordCount ? (
            <span>{post.wordCount.toLocaleString('en-GB')} words</span>
          ) : null}
        </div>
      </header>

      {cover && (
        <figure className="mx-auto mb-14 max-w-[90rem] px-5 md:px-10">
          <MediaImage
            media={cover}
            aspect="16/9"
            priority
            sizes="(min-width: 1440px) 1360px, 100vw"
            className="rounded-2xl"
          />
          {(cover.caption || cover.credit) && (
            <figcaption className="mt-3 text-center text-sm text-muted">
              {cover.caption}{' '}
              {cover.credit && (
                <span className="text-faint">· {cover.credit}</span>
              )}
            </figcaption>
          )}
        </figure>
      )}

      <div
        className={cn(
          'mx-auto grid max-w-[90rem] gap-10 px-5 md:px-10',
          showToc
            ? 'xl:grid-cols-[minmax(0,1fr)_minmax(0,46rem)_minmax(0,1fr)]'
            : 'grid-cols-1',
        )}
      >
        {showToc && (
          <aside className="hidden xl:block">
            <div className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto pr-4">
              <TableOfContents headings={headings} />
            </div>
          </aside>
        )}
        <div
          className={cn('min-w-0', !showToc && 'mx-auto w-full max-w-[46rem]')}
        >
          {showToc && (
            <details className="mb-10 rounded-xl border border-line px-5 py-3 xl:hidden">
              <summary className="cursor-pointer text-sm font-medium">
                On this page
              </summary>
              <div className="mt-4 pb-2">
                <TableOfContents headings={headings} />
              </div>
            </details>
          )}
          {series && seriesPosts.length > 1 && (
            <div className="mb-10">
              <SeriesBox
                series={series}
                posts={seriesPosts}
                currentId={post.id}
              />
            </div>
          )}
          <RichText data={post.content} large={post.largeType ?? false} />

          <footer className="mt-16 space-y-8">
            <TagList tags={post.tags} />
            <div className="flex flex-wrap items-center gap-3">
              <ShareLinks url={url} title={post.title} />
              <SaveOffline />
            </div>
            {authors[0] && (
              <div className="flex items-center gap-4 rounded-2xl bg-fg/[0.04] p-5">
                {typeof authors[0].avatar === 'object' && authors[0].avatar && (
                  <MediaImage
                    media={authors[0].avatar as Media}
                    aspect="1/1"
                    className="size-14 shrink-0 rounded-full"
                    sizes="56px"
                  />
                )}
                <div>
                  <p className="font-medium">{authors[0].name}</p>
                  {authors[0].bio && (
                    <p className="mt-0.5 text-sm text-muted">
                      {authors[0].bio}
                    </p>
                  )}
                </div>
              </div>
            )}
            <PrevNext
              previous={neighbours.previous}
              next={neighbours.next}
              base="/blog"
            />
            {commentsReady && (
              <Comments
                config={{
                  repo: comments.repo as string,
                  repoId: comments.repoId as string,
                  category: comments.category as string,
                  categoryId: comments.categoryId as string,
                }}
              />
            )}
          </footer>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-24 max-w-[90rem] px-5 pb-24 md:px-10">
          <SectionHeading title="Keep reading" href="/blog" />
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
      {!related.length && <div className="h-24" />}
    </article>
  );
}
