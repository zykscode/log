import { enterAuthorMode, safePath } from '@/lib/author-mode';

/** "View site as author" — see drafts, scheduled and private entries. */
export async function GET(req: Request) {
  const path = safePath(new URL(req.url).searchParams.get('redirect'));
  return enterAuthorMode(req, path);
}
