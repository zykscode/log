import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

import { safePath } from '@/lib/author-mode';

/** Leave author mode and go back to the public view. */
export async function GET(req: Request) {
  (await draftMode()).disable();
  const referer = req.headers.get('referer');
  let path = '/';
  if (referer) {
    try {
      const url = new URL(referer);
      if (url.host === new URL(req.url).host) path = safePath(url.pathname);
    } catch {
      /* ignore */
    }
  }
  redirect(path);
}
