import Link from 'next/link';
import { notFound } from 'next/navigation';

import { FeaturedPost, PostList } from '@/components/content/PostCards';
import { ListingSeo } from '@/components/ui/ListingSeo';
import { PageHeader } from '@/components/ui/PageHeader';
import { Container, EmptyState, Pagination } from '@/components/ui/Primitives';
import { getAllCategories, getPosts, getSettings } from '@/lib/queries';
import { cn, plural } from '@/lib/utils';
import { getViewer } from '@/lib/viewer';
import type { Category } from '@/payload-types';

/** Blog listing (all posts, or one category), paginated. */
export async function BlogIndex({
  page = 1,
  category,
}: {
  page?: number;
  category?: Category;
}) {
  const viewer = await getViewer();
  const settings = await getSettings();
  const perPage = settings.postsPerPage ?? 12;
  const [featured, categories] = await Promise.all([
    page === 1 && !category
      ? getPosts(viewer, { featured: true, limit: 1 })
      : null,
    getAllCategories(),
  ]);
  const hero = featured?.docs[0];
  const posts = await getPosts(viewer, {
    page,
    limit: perPage,
    category: category?.id,
    exclude: hero ? [hero.id] : undefined,
  });
  if (page > 1 && page > posts.totalPages) notFound();
  const base = category ? `/blog/category/${category.slug}` : '/blog';

  return (
    <>
      <ListingSeo
        name={category ? category.title : 'Blog'}
        path={page > 1 ? `${base}/page/${page}` : base}
        description={category?.description}
        items={[...(hero ? [hero] : []), ...posts.docs].map((p) => ({
          name: p.title,
          path: `/blog/${p.slug}`,
        }))}
        crumbs={[
          { name: 'Blog', path: '/blog' },
          ...(category ? [{ name: category.title, path: base }] : []),
        ]}
        page={page}
        totalPages={posts.totalPages}
        base={base}
      />
      <PageHeader
        title={category ? category.title : 'Blog'}
        kicker={
          category
            ? 'Category'
            : plural(posts.totalDocs + (hero ? 1 : 0), 'post')
        }
        description={
          category?.description ||
          'Long-form writing — essays, notes and ideas worked out in public.'
        }
        aside={
          <a
            href="/blog/feed.xml"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg"
          >
            <span aria-hidden>◉</span> Subscribe via RSS
          </a>
        }
      />
      <Container size="wide" className="pb-24">
        {categories.length > 0 && (
          <nav
            aria-label="Categories"
            className="-mt-4 mb-10 flex flex-wrap gap-2"
          >
            <Link
              href="/blog"
              className={cn(
                'rounded-full px-4 py-1.5 text-sm transition-colors',
                !category
                  ? 'bg-fg text-canvas'
                  : 'border border-line text-muted hover:border-fg hover:text-fg',
              )}
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/blog/category/${c.slug}`}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm transition-colors',
                  category?.id === c.id
                    ? 'bg-fg text-canvas'
                    : 'border border-line text-muted hover:border-fg hover:text-fg',
                )}
              >
                {c.title}
              </Link>
            ))}
          </nav>
        )}
        {hero && (
          <div className="mb-12">
            <FeaturedPost post={hero} />
          </div>
        )}
        {posts.docs.length ? (
          <PostList posts={posts.docs} />
        ) : (
          !hero && (
            <EmptyState title="No posts yet">
              The first one is on its way.
            </EmptyState>
          )
        )}
        <Pagination page={page} totalPages={posts.totalPages} base={base} />
      </Container>
    </>
  );
}
