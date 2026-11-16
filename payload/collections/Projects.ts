import type { CollectionConfig } from 'payload';

import { DISCIPLINES, PROJECT_STATUS } from '../../lib/constants';
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

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Project', plural: 'Portfolio' },
  defaultSort: 'sortOrder',
  admin: {
    group: 'Write',
    useAsTitle: 'title',
    description: 'Portfolio work and case studies.',
    defaultColumns: ['title', 'status', 'featured', 'year', '_status'],
    listSearchableFields: ['title', 'summary', 'client', 'slug'],
    preview: (doc) => previewPath('projects', doc as { slug?: string }),
    livePreview: {
      url: ({ data }) => previewPath('projects', data as { slug?: string }),
    },
  },
  access: {
    read: publishedOrAuthor,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
    readVersions: authenticated,
  },
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 25 },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          fields: [
            {
              name: 'summary',
              type: 'textarea',
              admin: { description: 'One or two sentences — shown on cards.' },
            },
            { name: 'coverImage', type: 'upload', relationTo: 'media' },
            {
              type: 'row',
              fields: [
                {
                  name: 'role',
                  type: 'text',
                  admin: { width: '33%', placeholder: 'Design & build' },
                },
                {
                  name: 'client',
                  type: 'text',
                  admin: { width: '33%', placeholder: 'Client / company' },
                },
                {
                  name: 'year',
                  type: 'text',
                  admin: { width: '34%', placeholder: '2024 or 2023 — 2025' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'status',
                  type: 'select',
                  defaultValue: 'shipped',
                  options: PROJECT_STATUS.map(({ value, label }) => ({
                    value,
                    label,
                  })),
                  admin: { width: '33%' },
                },
                {
                  name: 'disciplines',
                  type: 'select',
                  hasMany: true,
                  options: DISCIPLINES.map(({ value, label }) => ({
                    value,
                    label,
                  })),
                  admin: { width: '67%' },
                },
              ],
            },
            {
              name: 'stack',
              type: 'text',
              hasMany: true,
              label: 'Tools / stack',
              admin: {
                description:
                  'Type and press enter, e.g. Next.js, Figma, Python.',
              },
            },
            {
              name: 'links',
              type: 'array',
              labels: { singular: 'Link', plural: 'Links' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                      admin: { width: '35%', placeholder: 'Live site' },
                    },
                    {
                      name: 'url',
                      type: 'text',
                      required: true,
                      admin: { width: '65%' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Case study',
          fields: [
            { name: 'content', type: 'richText', editor: richEditor },
            {
              name: 'gallery',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: {
                description: 'Extra images shown after the case study.',
              },
            },
            {
              name: 'metrics',
              type: 'array',
              labels: { singular: 'Result', plural: 'Results' },
              admin: {
                description: 'Headline numbers, e.g. “3×” — “faster checkout”.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'value',
                      type: 'text',
                      required: true,
                      admin: { width: '30%' },
                    },
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                      admin: { width: '70%' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'testimonial',
              type: 'group',
              fields: [
                { name: 'quote', type: 'textarea' },
                {
                  type: 'row',
                  fields: [
                    { name: 'author', type: 'text', admin: { width: '50%' } },
                    {
                      name: 'authorRole',
                      type: 'text',
                      label: 'Role / company',
                      admin: { width: '50%' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'relatedPosts',
              type: 'relationship',
              relationTo: 'posts',
              hasMany: true,
              label: 'Related writing',
            },
          ],
        },
        seoTab,
      ],
    },
    slugField(),
    publishedAtField(),
    visibilityField('public'),
    {
      name: 'featured',
      type: 'checkbox',
      label: '⭐ Featured',
      admin: { position: 'sidebar' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar', description: 'Lower numbers show first.' },
    },
    tagsField,
    ...contentStatsFields,
  ],
  hooks: {
    beforeChange: [computeContentStats],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
};
