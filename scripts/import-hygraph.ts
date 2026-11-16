/**
 * One-off import of posts from the old Hygraph CMS into Payload.
 *
 *   pnpm import:hygraph              → imports as DRAFTS (review, then publish)
 *   IMPORT_PUBLISH=1 pnpm import:hygraph
 *   IMPORT_DRY_RUN=1 pnpm import:hygraph  → only lists what would be imported
 *
 * Reads NEXT_HYGRAPH_ENDPOINT and HYGRAPH_MUTATION_TOKEN (as used by the old site).
 * Markdown is converted to rich text; cover images are copied into the media library;
 * tags are created as needed. Posts whose slug already exists are skipped.
 */
import {
  convertMarkdownToLexical,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical';
import { getPayload } from 'payload';

import config from '../payload.config';

type HygraphPost = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  createdAt: string;
  publishedAt?: string | null;
  coverImage?: { url: string; fileName?: string | null } | null;
  content?: { markdown?: string | null } | null;
  tag?: { title: string } | { title: string }[] | null;
};

const endpoint = process.env.NEXT_HYGRAPH_ENDPOINT?.trim();
const token = process.env.HYGRAPH_MUTATION_TOKEN?.trim();
const dryRun = Boolean(process.env.IMPORT_DRY_RUN);
const publish = Boolean(process.env.IMPORT_PUBLISH);

async function fetchPosts(): Promise<HygraphPost[]> {
  if (!endpoint) throw new Error('NEXT_HYGRAPH_ENDPOINT is not set');
  const query = `query { posts(first: 500, orderBy: createdAt_DESC) {
    id title slug summary createdAt publishedAt
    coverImage { url fileName }
    content { markdown }
    tag { title }
  } }`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query }),
  });
  const json = (await res.json()) as {
    data?: { posts: HygraphPost[] };
    errors?: { message: string }[];
  };
  if (json.errors?.length)
    throw new Error(json.errors.map((e) => e.message).join('; '));
  return json.data?.posts ?? [];
}

async function main() {
  const payload = await getPayload({ config });
  const posts = await fetchPosts();
  payload.logger.info(
    `Found ${posts.length} posts in Hygraph${dryRun ? ' (dry run)' : ''}`,
  );
  const editorConfig = await editorConfigFactory.default({
    config: payload.config,
  });
  const author = (
    await payload.find({ collection: 'users', limit: 1, overrideAccess: true })
  ).docs[0];
  const tagCache = new Map<string, number>();

  for (const p of posts) {
    const exists = await payload.find({
      collection: 'posts',
      where: { slug: { equals: p.slug } },
      limit: 1,
      draft: true,
      overrideAccess: true,
    });
    if (exists.docs.length) {
      payload.logger.info(`↷ skip (exists): ${p.slug}`);
      continue;
    }
    if (dryRun) {
      payload.logger.info(`• would import: ${p.title} (${p.slug})`);
      continue;
    }

    // cover image → media library
    let coverImage: number | undefined;
    if (p.coverImage?.url) {
      try {
        const res = await fetch(p.coverImage.url);
        const data = Buffer.from(await res.arrayBuffer());
        const mimetype = res.headers.get('content-type') || 'image/jpeg';
        const media = await payload.create({
          collection: 'media',
          data: { alt: p.title },
          file: {
            data,
            mimetype,
            name: p.coverImage.fileName || `${p.slug}.jpg`,
            size: data.length,
          },
          overrideAccess: true,
          context: { disableRevalidate: true },
        });
        coverImage = media.id;
      } catch (err) {
        payload.logger.warn(`cover image failed for ${p.slug}: ${String(err)}`);
      }
    }

    // tags
    const tagTitles = (Array.isArray(p.tag) ? p.tag : p.tag ? [p.tag] : [])
      .map((t) => t.title)
      .filter(Boolean);
    const tags: number[] = [];
    for (const title of tagTitles) {
      if (!tagCache.has(title)) {
        const found = await payload.find({
          collection: 'tags',
          where: { title: { equals: title } },
          limit: 1,
          overrideAccess: true,
        });
        const tag =
          found.docs[0] ??
          (await payload.create({
            collection: 'tags',
            data: { title },
            overrideAccess: true,
          }));
        tagCache.set(title, tag.id);
      }
      tags.push(tagCache.get(title)!);
    }

    const content = convertMarkdownToLexical({
      editorConfig,
      markdown: p.content?.markdown || p.summary || '',
    });
    await payload.create({
      collection: 'posts',
      data: {
        title: p.title,
        slug: p.slug,
        excerpt: p.summary ?? undefined,
        content: content as never,
        coverImage,
        tags,
        authors: author ? [author.id] : [],
        publishedAt: p.publishedAt || p.createdAt,
        visibility: 'public',
        _status: publish ? 'published' : 'draft',
      },
      draft: !publish,
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    payload.logger.info(`✓ imported ${publish ? '' : '(draft) '}${p.title}`);
  }
  payload.logger.info('Done.');
  process.exit(0);
}

// top-level await: `payload run` exits as soon as the module finishes loading
await main().catch((err) => {
  console.error(err);
  process.exit(1);
});
