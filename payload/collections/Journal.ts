import type { CollectionConfig } from 'payload';

import { ENTRY_TYPES, MOODS, WEATHER } from '../../lib/constants';
import { previewPath } from '../../lib/urls';
import { authenticated, publishedOrAuthor } from '../access';
import { richEditor } from '../editor/full';
import {
  contentStatsFields,
  publishedAtField,
  slugField,
  tagsField,
  visibilityField,
} from '../fields';
import { seoTab } from '../fields/seo';
import {
  computeContentStats,
  revalidateAfterChange,
  revalidateAfterDelete,
} from '../hooks';

/** Slug from the entry date (+ title if there is one): 2026-11-12-a-good-day */
const slugFromDate = (data: Record<string, unknown>) => {
  const raw = data.publishedAt
    ? new Date(String(data.publishedAt))
    : new Date();
  const date = Number.isNaN(raw.getTime()) ? new Date() : raw;
  const day = date.toISOString().slice(0, 10);
  return typeof data.title === 'string' && data.title.trim()
    ? `${day} ${data.title}`
    : day;
};

export const Journal: CollectionConfig = {
  slug: 'journal',
  labels: { singular: 'Journal / diary entry', plural: 'Journal & diary' },
  defaultSort: '-publishedAt',
  admin: {
    group: 'Write',
    useAsTitle: 'title',
    description:
      'Quick dated entries. “Journal” is your public notebook; “Diary” is personal and private by default — only you can see private entries (in author mode).',
    defaultColumns: [
      'title',
      'type',
      'mood',
      'visibility',
      'publishedAt',
      '_status',
    ],
    listSearchableFields: ['title', 'slug', 'location', 'searchText'],
    preview: (doc) =>
      previewPath('journal', doc as { slug?: string; type?: string }),
    livePreview: {
      url: ({ data }) =>
        previewPath('journal', data as { slug?: string; type?: string }),
    },
  },
  access: {
    read: publishedOrAuthor,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
    readVersions: authenticated,
  },
  versions: {
    drafts: { autosave: { interval: 2000 } },
    maxPerDoc: 25,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: { placeholder: 'Optional — the date is used if empty' },
      hooks: {
        beforeChange: [
          ({ value, siblingData }) => {
            if (typeof value === 'string' && value.trim()) return value;
            const date = siblingData?.publishedAt
              ? new Date(String(siblingData.publishedAt))
              : new Date();
            return date.toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
          },
        ],
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Entry',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  required: true,
                  defaultValue: 'journal',
                  options: ENTRY_TYPES.map(({ value, label }) => ({
                    value,
                    label,
                  })),
                  admin: { width: '34%' },
                },
                {
                  name: 'mood',
                  type: 'select',
                  options: MOODS.map((m) => ({
                    value: m.value,
                    label: `${m.emoji} ${m.label}`,
                  })),
                  admin: { width: '33%' },
                },
                {
                  name: 'weather',
                  type: 'select',
                  options: WEATHER.map((w) => ({
                    value: w.value,
                    label: `${w.emoji} ${w.label}`,
                  })),
                  admin: { width: '33%' },
                },
              ],
            },
            {
              name: 'content',
              type: 'richText',
              editor: richEditor,
            },
            {
              name: 'highlights',
              type: 'array',
              label: 'Highlights / gratitude',
              labels: { singular: 'Highlight', plural: 'Highlights' },
              admin: {
                description: 'Small good things from the day (optional).',
                initCollapsed: true,
              },
              fields: [{ name: 'text', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'Context',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'location',
                  type: 'text',
                  admin: { width: '50%', placeholder: 'Lagos, Nigeria' },
                },
                {
                  name: 'listeningTo',
                  type: 'text',
                  admin: {
                    width: '50%',
                    placeholder: 'Song / album / podcast',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'reading',
                  type: 'text',
                  admin: { width: '50%', placeholder: 'Book / article' },
                },
                {
                  name: 'watching',
                  type: 'text',
                  admin: { width: '50%', placeholder: 'Film / show' },
                },
              ],
            },
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        seoTab,
      ],
    },
    slugField(slugFromDate),
    publishedAtField({ label: 'Entry date', defaultNow: true }),
    visibilityField('private'),
    tagsField,
    ...contentStatsFields,
  ],
  hooks: {
    beforeChange: [computeContentStats],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
};
