import type { Payload } from 'payload';

import { absoluteUrl, docPath, siteUrl } from '../../lib/urls';

/**
 * Tells IndexNow search engines (Bing, Yandex, Seznam, Naver…) that a page
 * changed, so it is recrawled within minutes. Production only, and only when
 * INDEXNOW_KEY is set (any 8–128 character letters/digits/dashes string).
 */
export function pingIndexNow(
  payload: Payload,
  collection: string,
  doc: { slug?: string | null; type?: string | null },
) {
  const key = process.env.INDEXNOW_KEY;
  if (!key || process.env.VERCEL_ENV !== 'production' || !doc?.slug) return;
  const host = new URL(siteUrl()).host;
  const urls = [absoluteUrl(docPath(collection, doc))];
  if (collection === 'posts') urls.push(absoluteUrl('/blog'));
  if (collection === 'journal')
    urls.push(absoluteUrl(doc.type === 'diary' ? '/diary' : '/journal'));
  void fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key,
      keyLocation: absoluteUrl('/indexnow.txt'),
      urlList: urls,
    }),
    signal: AbortSignal.timeout(8000),
  })
    .then((res) =>
      payload.logger.info(`IndexNow: ${res.status} for ${urls[0]}`),
    )
    .catch(() => payload.logger.warn('IndexNow ping failed'));
}
