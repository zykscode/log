/** Single source of truth for where each kind of document lives on the site. */

export type DocCollection =
  'posts' | 'journal' | 'projects' | 'pages' | 'tags' | 'categories' | 'series';

type DocLike =
  { slug?: string | null; type?: string | null } | null | undefined;

export function docPath(
  collection: DocCollection | string,
  doc: DocLike,
): string {
  const slug = doc?.slug ?? '';
  switch (collection) {
    case 'posts':
      return `/blog/${slug}`;
    case 'journal':
      return doc?.type === 'diary' ? `/diary/${slug}` : `/journal/${slug}`;
    case 'projects':
      return `/work/${slug}`;
    case 'pages':
      return !slug || slug === 'home' ? '/' : `/${slug}`;
    case 'tags':
      return `/tags/${slug}`;
    case 'categories':
      return `/blog/category/${slug}`;
    case 'series':
      return `/series/${slug}`;
    default:
      return '/';
  }
}

export function siteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000');
  return url.replace(/\/$/, '');
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Opens the page in author (draft) mode — used by the admin Preview button. */
export function previewPath(collection: DocCollection, doc: DocLike): string {
  return `/next/preview?path=${encodeURIComponent(docPath(collection, doc))}`;
}
