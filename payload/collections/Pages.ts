import type { CollectionConfig } from 'payload';

import { previewPath } from '../../lib/urls';
import { authenticated, publishedPagesOrAuthor } from '../access';
import { LAYOUT_BLOCKS } from '../blocks/layout';
import { slugField, visibilityField } from '../fields';
import { seoTab } from '../fields/seo';
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks';

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    group: 'Write',
    useAsTitle: 'title',
    description:
      'Build any page from sections — Home (slug “home”), About, Now, Uses, Contact, or anything new. A page with slug “x” lives at /x.',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    preview: (doc) => previewPath('pages', doc as { slug?: string }),
    livePreview: {
      url: ({ data }) => previewPath('pages', data as { slug?: string }),
    },
  },
  access: {
    read: publishedPagesOrAuthor,
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
          label: 'Hero',
          fields: [
            {
              name: 'hero',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'style',
                  type: 'select',
                  defaultValue: 'giant',
                  options: [
                    { label: 'Giant title (signature)', value: 'giant' },
                    { label: 'Split — text + image', value: 'split' },
                    { label: 'Minimal', value: 'minimal' },
                    { label: 'None', value: 'none' },
                  ],
                },
                {
                  name: 'kicker',
                  type: 'text',
                  admin: { placeholder: 'Small label above the title' },
                },
                {
                  name: 'heading',
                  type: 'text',
                  admin: {
                    description:
                      'Defaults to the page title. Use “|” for a line break.',
                  },
                },
                { name: 'intro', type: 'textarea' },
                {
                  name: 'media',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { condition: (_, s) => s?.style === 'split' },
                },
              ],
            },
          ],
        },
        {
          label: 'Sections',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: LAYOUT_BLOCKS,
              admin: { initCollapsed: true },
            },
          ],
        },
        seoTab,
      ],
    },
    slugField(),
    visibilityField('public'),
    {
      name: 'showInMenu',
      type: 'checkbox',
      label: 'List in the big menu',
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
};
