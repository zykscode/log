import 'server-only';

import { draftMode, headers } from 'next/headers';
import { cache } from 'react';

import type { User } from '@/payload-types';

import { getPayloadClient } from './payload';

export type Viewer = { isAuthor: boolean; user: User | null };

/**
 * "Author mode" = Next.js draft mode *and* a logged-in Payload session.
 * Only then do pages include drafts, scheduled and private entries. For
 * everyone else pages stay static and only show published, public content.
 */
export const getViewer = cache(async (): Promise<Viewer> => {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return { isAuthor: false, user: null };
  try {
    const payload = await getPayloadClient();
    const { user } = await payload.auth({ headers: await headers() });
    return { isAuthor: Boolean(user), user: (user as User) ?? null };
  } catch {
    return { isAuthor: false, user: null };
  }
});
