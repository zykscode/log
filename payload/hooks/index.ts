import { revalidatePath } from 'next/cache';
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  GlobalAfterChangeHook,
  Payload,
  PayloadRequest,
} from 'payload';

import {
  countWords,
  excerptFrom,
  lexicalToPlainText,
  readingTimeMinutes,
} from '../../lib/lexical';

/**
 * The public site is statically generated. Whenever published content changes
 * we mark every page stale; Next.js regenerates each one on its next visit.
 * (Cheap and always correct for a personal site.)
 */
function revalidateSite(payload: Payload, reason: string) {
  try {
    revalidatePath('/', 'layout');
    payload.logger.info(`↻ revalidated site (${reason})`);
  } catch {
    // Not running inside Next.js (e.g. `pnpm seed`) — nothing to revalidate.
  }
}

const isAutosave = (req: PayloadRequest) =>
  req.query?.autosave === 'true' ||
  (req.query as { autosave?: unknown })?.autosave === true;

export const revalidateAfterChange: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req,
  collection,
}) => {
  if (req.context?.disableRevalidate) return doc;
  const hasDrafts = Boolean(collection.versions?.drafts);
  if (!hasDrafts) {
    revalidateSite(req.payload, `${collection.slug} changed`);
    return doc;
  }
  const publishedNow = doc?._status === 'published';
  const wasPublished = previousDoc?._status === 'published';
  if (publishedNow || (wasPublished && !isAutosave(req))) {
    revalidateSite(
      req.payload,
      `${collection.slug} ${publishedNow ? 'published' : 'unpublished'}`,
    );
  }
  return doc;
};

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({
  doc,
  req,
  collection,
}) => {
  if (!req.context?.disableRevalidate)
    revalidateSite(req.payload, `${collection.slug} deleted`);
  return doc;
};

export const revalidateGlobal: GlobalAfterChangeHook = ({
  doc,
  req,
  global,
}) => {
  if (!req.context?.disableRevalidate)
    revalidateSite(req.payload, `${global.slug} updated`);
  return doc;
};

/** Fills wordCount / readingTime / searchText from the rich-text `content` field. */
export const computeContentStats: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
}) => {
  const content = data?.content ?? originalDoc?.content;
  const text = lexicalToPlainText(content);
  const words = countWords(text);
  const extra = [data?.title, data?.subtitle, data?.excerpt, data?.summary]
    .filter((v): v is string => typeof v === 'string' && v.length > 0)
    .join('\n');
  return {
    ...data,
    wordCount: words,
    readingTime: readingTimeMinutes(words),
    searchText: `${text}\n\n${extra}`.slice(0, 50_000),
    autoExcerpt: excerptFrom(text, 220),
  };
};
