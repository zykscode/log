import { buildRss } from '@/lib/feed';

export const revalidate = 3600;

/** Everything: posts, journal & diary entries, projects. */
export function GET() {
  return buildRss('all', '/feed.xml');
}
