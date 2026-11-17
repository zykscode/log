import { breadcrumbsLd, collectionLd, JsonLd } from '@/lib/jsonld';

/**
 * Structured data for list pages (CollectionPage + ItemList + breadcrumbs)
 * and rel="prev"/"next" links for paginated lists (React hoists them to <head>).
 */
export function ListingSeo({
  name,
  path,
  items,
  description,
  crumbs,
  page = 1,
  totalPages = 1,
  base,
}: {
  name: string;
  path: string;
  items: { name: string; path: string }[];
  description?: string | null;
  crumbs?: { name: string; path: string }[];
  page?: number;
  totalPages?: number;
  base?: string;
}) {
  const href = (p: number) => (p === 1 ? base : `${base}/page/${p}`);
  return (
    <>
      <JsonLd
        data={[
          collectionLd(name, path, items, description),
          breadcrumbsLd(crumbs ?? [{ name, path }]),
        ]}
      />
      {base && page > 1 && <link rel="prev" href={href(page - 1)} />}
      {base && page < totalPages && <link rel="next" href={href(page + 1)} />}
    </>
  );
}
