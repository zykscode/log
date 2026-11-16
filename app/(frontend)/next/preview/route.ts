import { enterAuthorMode, safePath } from '@/lib/author-mode';

/** Admin "Preview" / Live Preview → author mode on the requested page. */
export async function GET(req: Request) {
  const path = safePath(new URL(req.url).searchParams.get('path'));
  return enterAuthorMode(req, path);
}
