import { buildRss } from '@/lib/feed';

export const revalidate = 3600;

export function GET() {
  return buildRss('posts', '/blog/feed.xml');
}
