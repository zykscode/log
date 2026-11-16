import { buildRss } from '@/lib/feed';

export const revalidate = 3600;

/** Public journal and diary entries. */
export function GET() {
  return buildRss('journal', '/journal/feed.xml');
}
