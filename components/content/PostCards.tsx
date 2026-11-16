import Link from 'next/link';

import { MediaImage } from '@/components/ui/MediaImage';
import { StatusBadges } from '@/components/ui/Primitives';
import { fallbackExcerpt } from '@/lib/queries';
import { cn, formatDate } from '@/lib/utils';
import type { Category, Post } from '@/payload-types';

const categoryOf = (p: Post) =>
  typeof p.category === 'object' && p.category
    ? (p.category as Category)
    : null;

export function PostMeta({
  post,
  className,
}: {
  post: Post;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted',
        className,
      )}
    >
      {post.publishedAt && (
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      )}
      {post.readingTime ? (
        <>
          <span aria-hidden className="text-faint">
            /
          </span>
          <span>{post.readingTime} min read</span>
        </>
      ) : null}
      <StatusBadges
        status={post._status}
        visibility={post.visibility}
        publishedAt={post.publishedAt}
      />
    </div>
  );
}

/** Editorial list row: date column · big title · excerpt · thumbnail. */
export function PostRow({ post, index }: { post: Post; index?: number }) {
  const category = categoryOf(post);
  return (
    <article className="group relative grid grid-cols-1 gap-x-8 gap-y-3 border-t border-line py-8 md:grid-cols-[9rem_1fr_14rem] md:py-10">
      <div className="flex items-center gap-3 text-sm text-muted md:block">
        {index !== undefined && (
          <span className="mb-2 hidden font-medium text-faint md:block">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
        {post.publishedAt && (
          <time dateTime={post.publishedAt}>
            {formatDate(post.publishedAt, 'short')}
          </time>
        )}
        {category && (
          <div className="eyebrow mt-1 text-[0.65rem] text-accent">
            {category.title}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="text-[clamp(1.6rem,3.2vw,2.6rem)] font-medium leading-[1.05] tracking-[-0.03em] text-balance">
          <Link
            href={`/blog/${post.slug}`}
            className="after:absolute after:inset-0"
          >
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_2px]">
              {post.title}
            </span>
          </Link>
        </h3>
        {post.subtitle && (
          <p className="mt-2 text-lg text-fg/80">{post.subtitle}</p>
        )}
        <p className="mt-3 line-clamp-2 max-w-2xl text-muted">
          {fallbackExcerpt(post)}
        </p>
        <PostMeta post={post} className="mt-4" />
      </div>
      {post.coverImage && typeof post.coverImage === 'object' ? (
        <MediaImage
          media={post.coverImage}
          aspect="4/3"
          sizes="(min-width: 768px) 14rem, 100vw"
          className="order-first rounded-xl md:order-none md:opacity-80 md:grayscale md:transition md:duration-500 md:group-hover:opacity-100 md:group-hover:grayscale-0"
        />
      ) : (
        <div className="hidden md:block" />
      )}
    </article>
  );
}

/** Card for grids. */
export function PostCard({
  post,
  priority,
}: {
  post: Post;
  priority?: boolean;
}) {
  const category = categoryOf(post);
  return (
    <article className="group relative flex flex-col">
      <MediaImage
        media={typeof post.coverImage === 'object' ? post.coverImage : null}
        aspect="3/2"
        priority={priority}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="mb-4 rounded-xl transition-transform duration-500 group-hover:scale-[0.985]"
      />
      {!post.coverImage && (
        <div className="mb-4 flex aspect-[3/2] items-end rounded-xl bg-fg/[0.06] p-5">
          <span className="display text-6xl text-fg/15">
            {post.title.slice(0, 2)}
          </span>
        </div>
      )}
      {category && (
        <div className="eyebrow mb-2 text-[0.65rem] text-accent">
          {category.title}
        </div>
      )}
      <h3 className="text-2xl font-medium leading-tight tracking-[-0.02em] text-balance">
        <Link
          href={`/blog/${post.slug}`}
          className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-accent group-hover:decoration-2 group-hover:underline-offset-4"
        >
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-muted">{fallbackExcerpt(post)}</p>
      <PostMeta post={post} className="mt-auto pt-4" />
    </article>
  );
}

/** One-line list. */
export function PostCompact({ post }: { post: Post }) {
  return (
    <li className="group relative flex items-baseline justify-between gap-6 border-t border-line py-3.5">
      <Link
        href={`/blog/${post.slug}`}
        className="min-w-0 truncate text-lg after:absolute after:inset-0 group-hover:text-accent"
      >
        {post.title}
      </Link>
      <time
        className="shrink-0 text-sm tabular-nums text-muted"
        dateTime={post.publishedAt ?? undefined}
      >
        {formatDate(post.publishedAt, 'short')}
      </time>
    </li>
  );
}

/** Big featured post. */
export function FeaturedPost({ post }: { post: Post }) {
  const category = categoryOf(post);
  return (
    <article className="group relative grid gap-8 overflow-hidden rounded-2xl bg-fg/[0.04] p-5 md:grid-cols-2 md:p-8">
      <MediaImage
        media={typeof post.coverImage === 'object' ? post.coverImage : null}
        aspect="4/3"
        priority
        sizes="(min-width: 768px) 50vw, 100vw"
        className="rounded-xl"
      />
      <div className="flex flex-col justify-center">
        <div className="eyebrow mb-4 flex items-center gap-3 text-accent">
          <span>★ Featured</span>
          {category && <span className="text-muted">{category.title}</span>}
        </div>
        <h3 className="text-[clamp(2rem,4.5vw,3.8rem)] font-medium leading-[0.98] tracking-[-0.035em] text-balance">
          <Link
            href={`/blog/${post.slug}`}
            className="after:absolute after:inset-0"
          >
            {post.title}
          </Link>
        </h3>
        <p className="mt-4 line-clamp-3 text-lg text-muted">
          {post.subtitle || fallbackExcerpt(post)}
        </p>
        <PostMeta post={post} className="mt-6" />
      </div>
    </article>
  );
}

export function PostList({
  posts,
  layout = 'list',
}: {
  posts: Post[];
  layout?: 'list' | 'grid' | 'compact';
}) {
  if (layout === 'grid')
    return (
      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, i) => (
          <PostCard key={p.id} post={p} priority={i < 3} />
        ))}
      </div>
    );
  if (layout === 'compact')
    return (
      <ul className="border-b border-line">
        {posts.map((p) => (
          <PostCompact key={p.id} post={p} />
        ))}
      </ul>
    );
  return (
    <div className="border-b border-line">
      {posts.map((p, i) => (
        <PostRow key={p.id} post={p} index={i} />
      ))}
    </div>
  );
}
