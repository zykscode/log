import 'server-only';

import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import type { PayloadRequest } from 'payload';

import { getPayloadClient } from './payload';

/** Only same-site relative paths — never redirect to another origin. */
export function safePath(raw: string | null): string {
  if (
    !raw ||
    !raw.startsWith('/') ||
    raw.startsWith('//') ||
    raw.includes('\\')
  )
    return '/';
  return raw;
}

/**
 * Turns on author mode (Next draft mode) — but only for someone logged in to
 * the CMS. Otherwise sends them to the admin login and back.
 */
export async function enterAuthorMode(
  req: Request,
  path: string,
): Promise<Response> {
  const payload = await getPayloadClient();
  let user = null;
  try {
    ({ user } = await payload.auth({
      req: req as unknown as PayloadRequest,
      headers: req.headers,
    }));
  } catch {
    user = null;
  }
  const draft = await draftMode();
  if (!user) {
    draft.disable();
    redirect(
      `/admin/login?redirect=${encodeURIComponent(`/next/author?redirect=${path}`)}`,
    );
  }
  draft.enable();
  redirect(path);
}
