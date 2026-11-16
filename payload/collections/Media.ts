import path from 'path';
import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

import { anyone, authenticated } from '../access';
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** Stores a tiny blurred preview so images fade in from a blur instead of popping. */
const generateBlur: CollectionBeforeChangeHook = async ({ data, req }) => {
  const file = req.file;
  if (
    !file?.data ||
    !file.mimetype?.startsWith('image/') ||
    file.mimetype === 'image/svg+xml'
  ) {
    return data;
  }
  try {
    const buffer = await sharp(file.data)
      .resize(16, 16, { fit: 'inside' })
      .webp({ quality: 50 })
      .toBuffer();
    return {
      ...data,
      blurDataURL: `data:image/webp;base64,${buffer.toString('base64')}`,
    };
  } catch {
    return data;
  }
};

const webp = { format: 'webp' as const, options: { quality: 82 } };

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Media', plural: 'Media library' },
  admin: {
    group: 'Library',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize', 'updatedAt'],
    listSearchableFields: ['filename', 'alt', 'caption'],
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    // Local disk in development; Vercel Blob / S3 / R2 take over in production
    // (see payload.config.ts).
    staticDir: path.resolve(dirname, '../../media'),
    mimeTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
    focalPoint: true,
    crop: true,
    adminThumbnail: 'thumb',
    imageSizes: [
      {
        name: 'thumb',
        width: 480,
        withoutEnlargement: true,
        formatOptions: webp,
      },
      {
        name: 'card',
        width: 960,
        withoutEnlargement: true,
        formatOptions: webp,
      },
      {
        name: 'feature',
        width: 1600,
        withoutEnlargement: true,
        formatOptions: webp,
      },
      {
        name: 'hero',
        width: 2400,
        withoutEnlargement: true,
        formatOptions: webp,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
        formatOptions: { format: 'jpeg', options: { quality: 85 } },
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt text',
      admin: {
        description:
          'Describe the image for screen readers and search engines.',
      },
    },
    { name: 'caption', type: 'textarea' },
    {
      name: 'credit',
      type: 'text',
      admin: { description: 'Photographer / source, shown under the image.' },
    },
    { name: 'blurDataURL', type: 'text', admin: { hidden: true } },
  ],
  hooks: {
    beforeChange: [generateBlur],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
};
