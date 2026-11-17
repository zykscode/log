import type { MetadataRoute } from 'next';

import { getSettings } from '@/lib/queries';

export const revalidate = 3600;

/** Web app manifest — makes the site installable (phone home screen / desktop app). */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSettings();
  const name = s.siteName || 'Zykson';
  return {
    id: '/',
    name: s.tagline ? `${name} — ${s.tagline}` : name,
    short_name: s.appShortName || name,
    description: s.description || undefined,
    lang: s.language || 'en-GB',
    dir: 'ltr',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
    orientation: 'any',
    background_color: '#090805',
    theme_color: '#433b45',
    categories: ['blogs', 'lifestyle', 'personalization'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Blog',
        url: '/blog',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Journal',
        url: '/journal',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Search',
        url: '/search',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'New post',
        short_name: 'Write',
        url: '/admin/collections/posts/create',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
