import { withPayload } from '@payloadcms/next/withPayload';

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app va.vercel-scripts.com blob:;
  style-src 'self' 'unsafe-inline' giscus.app;
  img-src * blob: data:;
  media-src 'self' https: blob:;
  connect-src *;
  font-src 'self' data:;
  frame-src 'self' giscus.app www.youtube-nocookie.com www.youtube.com player.vimeo.com open.spotify.com w.soundcloud.com codepen.io codesandbox.io www.figma.com embed.figma.com www.loom.com www.google.com maps.google.com bandcamp.com;
  frame-ancestors 'self'
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ''),
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.graphassets.com',
      },
      {
        protocol: 'https',
        hostname: 'media.graphassets.com',
      },
      {
        protocol: 'https',
        hostname: 'eu-central-1.graphassets.com',
      },
      {
        protocol: 'https',
        hostname: 'zykson.vercel.app',
      },
    ],
  },
  experimental: {
    // One 404 page for every unmatched URL (the app has two root layouts:
    // the public site and the Payload admin).
    globalNotFound: true,
  },
  async headers() {
    return [
      {
        // Public site only — the Payload admin (/admin) and API (/api) manage
        // their own requirements (Monaco editor, workers, inline scripts).
        source: '/((?!admin|api).*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
