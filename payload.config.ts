import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { redirectsPlugin } from '@payloadcms/plugin-redirects';
import { seoPlugin } from '@payloadcms/plugin-seo';
import { s3Storage } from '@payloadcms/storage-s3';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import path from 'path';
import { buildConfig, type Plugin } from 'payload';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

import { docPath } from './lib/urls';
import { Journal } from './payload/collections/Journal';
import { Media } from './payload/collections/Media';
import { Messages } from './payload/collections/Messages';
import { Pages } from './payload/collections/Pages';
import { Posts } from './payload/collections/Posts';
import { Projects } from './payload/collections/Projects';
import { Categories, Series, Tags } from './payload/collections/Taxonomies';
import { Users } from './payload/collections/Users';
import { richEditor } from './payload/editor/full';
import { Settings } from './payload/globals/Settings';
import { revalidateAfterChange, revalidateAfterDelete } from './payload/hooks';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** Uploads: local disk by default; Vercel Blob or any S3-compatible bucket (R2, B2, AWS) when configured. */
function storagePlugins(): Plugin[] {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return [
      vercelBlobStorage({
        collections: { media: true },
        token: process.env.BLOB_READ_WRITE_TOKEN,
      }),
    ];
  }
  if (process.env.S3_BUCKET) {
    const publicUrl = process.env.S3_PUBLIC_URL?.replace(/\/$/, '');
    return [
      s3Storage({
        bucket: process.env.S3_BUCKET,
        collections: {
          media: publicUrl
            ? {
                prefix: 'media',
                disablePayloadAccessControl: true,
                generateFileURL: ({ filename, prefix }) =>
                  `${publicUrl}/${prefix ? `${prefix}/` : ''}${filename}`,
              }
            : { prefix: 'media' },
        },
        config: {
          endpoint: process.env.S3_ENDPOINT || undefined,
          region: process.env.S3_REGION || 'auto',
          forcePathStyle: Boolean(process.env.S3_ENDPOINT),
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
          },
        },
      }),
    ];
  }
  return [];
}

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  secret: process.env.PAYLOAD_SECRET || '',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' · Zykson CMS',
      icons: [
        {
          rel: 'icon',
          type: 'image/png',
          url: '/static/favicons/favicon-32x32.png',
        },
      ],
    },
    components: {
      graphics: {
        Logo: '@/payload/admin/Logo#Logo',
        Icon: '@/payload/admin/Logo#Icon',
      },
      beforeDashboard: ['@/payload/admin/Dashboard#Dashboard'],
      afterNavLinks: ['@/payload/admin/NavLinks#NavLinks'],
    },
    livePreview: {
      breakpoints: [
        { label: 'Phone', name: 'phone', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 820, height: 1180 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  editor: richEditor,
  collections: [
    Posts,
    Journal,
    Projects,
    Pages,
    Categories,
    Tags,
    Series,
    Media,
    Messages,
    Users,
  ],
  globals: [Settings],
  db: sqliteAdapter({
    client: {
      url:
        process.env.DATABASE_URL ||
        `file:${path.resolve(dirname, 'data/zykson.db')}`,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    },
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  graphQL: { disable: true },
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  plugins: [
    seoPlugin({
      generateTitle: ({ doc }) => {
        const title = (doc as { title?: string })?.title;
        return title ? `${title} · Zykson` : 'Zykson';
      },
      generateDescription: ({ doc }) => {
        const d = doc as {
          excerpt?: string;
          summary?: string;
          subtitle?: string;
          searchText?: string;
        };
        return (d.excerpt || d.summary || d.subtitle || d.searchText || '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 160);
      },
      generateURL: ({ doc, collectionSlug }) =>
        `${process.env.NEXT_PUBLIC_SERVER_URL || ''}${docPath(collectionSlug ?? '', doc as { slug?: string; type?: string })}`,
    }),
    redirectsPlugin({
      collections: ['posts', 'journal', 'projects', 'pages'],
      overrides: {
        admin: { group: 'Settings' },
        hooks: {
          afterChange: [revalidateAfterChange],
          afterDelete: [revalidateAfterDelete],
        },
      },
    }),
    ...storagePlugins(),
  ],
});
