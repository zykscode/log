import type { MetadataRoute } from 'next';

import { getSettings } from '@/lib/queries';
import { absoluteUrl } from '@/lib/urls';

export const revalidate = 3600;

/** AI training / answer-engine crawlers that honour robots.txt. */
const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'Google-Extended',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'CCBot',
  'PerplexityBot',
  'Applebot-Extended',
  'Bytespider',
  'Meta-ExternalAgent',
  'cohere-ai',
  'Diffbot',
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSettings();
  const privatePaths = ['/admin', '/api', '/next/', '/search', '/offline'];
  return {
    rules: [
      { userAgent: '*', allow: ['/', '/next/og'], disallow: privatePaths },
      ...(settings.blockAICrawlers
        ? [{ userAgent: AI_CRAWLERS, disallow: '/' }]
        : []),
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
