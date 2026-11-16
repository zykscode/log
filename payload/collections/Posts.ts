import type { CollectionConfig } from 'payload';

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

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Blog post', plural: 'Blog posts' },
  defaultSort: '-publishedAt',
  admin: {
    group: 'Write',
    useAsTitle: 'title',
    description:
      'Long-form writing. Drafts autosave; publish when ready or schedule with a future date.',
    defaultColumns: [
      'title',
      'category',
      '_status',
      'visibility',
      'publishedAt',
    ],
    listSearchableFields: ['title', 'subtitle', 'excerpt', 'slug'],
    preview: (doc) => previewPath('posts', doc as { slug?: string }),
    livePreview: {
      url: ({ data }) => previewPath('posts', data as { slug?: string }),
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
    maxPerDoc: 50,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { placeholder: 'A title worth clicking' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Write',
          fields: [
            {
              name: 'subtitle',
              type: 'text',
              admin: { placeholder: 'Optional subtitle / standfirst' },
            },
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Shown at the top of the post, on cards and when shared.',
              },
            },
            {
              name: 'content',
              type: 'richText',
              editor: richEditor,
              admin: {
                description:
                  'Type "/" for blocks (code, callouts, galleries, embeds, maths…).',
              },
            },
          ],
        },
        {
          label: 'Details',
          fields: [
            {
              name: 'excerpt',
              type: 'textarea',
              admin: {
                description:
                  'Short summary for cards, feeds and search results. Leave empty to use the opening lines.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'category',
                  type: 'relationship',
                  relationTo: 'categories',
                  admin: { width: '50%' },
                },
                {
                  name: 'series',
                  type: 'relationship',
                  relationTo: 'series',
                  admin: { width: '35%' },
                },
                {
                  name: 'seriesOrder',
                  type: 'number',
                  label: 'Part #',
                  admin: {
                    width: '15%',
                    condition: (_, s) => Boolean(s?.series),
                  },
                },
              ],
            },
            {
              name: 'relatedPosts',
              type: 'relationship',
              relationTo: 'posts',
              hasMany: true,
              admin: {
                description:
                  'Optional. Otherwise related posts are picked by shared tags.',
              },
              filterOptions: ({ id }) => ({ id: { not_equals: id } }),
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'featured',
                  type: 'checkbox',
                  label: '⭐ Featured / pinned',
                  admin: { width: '25%' },
                },
                {
                  name: 'showToc',
                  type: 'checkbox',
                  label: 'Table of contents',
                  defaultValue: true,
                  admin: { width: '25%' },
                },
                {
                  name: 'allowComments',
                  type: 'checkbox',
                  label: 'Comments',
                  defaultValue: true,
                  admin: { width: '25%' },
                },
                {
                  name: 'largeType',
                  type: 'checkbox',
                  label: 'Large type',
                  admin: {
                    width: '25%',
                    description: 'Bigger text — nice for short essays.',
                  },
                },
              ],
            },
            {
              name: 'canonicalUrl',
              type: 'text',
              admin: {
                description:
                  'If this was first published elsewhere, its original URL.',
              },
            },
          ],
        },
        seoTab,
      ],
    },
    slugField(),
    publishedAtField(),
    visibilityField('public'),
    tagsField,
    {
      name: 'authors',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      defaultValue: ({ user }) => (user ? [user.id] : []),
      admin: { position: 'sidebar' },
    },
    ...contentStatsFields,
  ],
  hooks: {
    beforeChange: [computeContentStats],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
};
