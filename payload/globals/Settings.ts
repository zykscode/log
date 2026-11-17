import type { GlobalConfig } from 'payload';

import { SOCIAL_PLATFORMS } from '../../lib/constants';
import { anyone, isAdmin } from '../access';
import { revalidateGlobal } from '../hooks';

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Site settings',
  admin: { group: 'Settings' },
  access: { read: anyone, update: isAdmin }, // settings: admin only
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identity',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'siteName',
                  type: 'text',
                  required: true,
                  defaultValue: 'Zykson',
                  admin: { width: '50%' },
                },
                {
                  name: 'authorName',
                  type: 'text',
                  defaultValue: 'Zykson',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'wordmark',
                  type: 'text',
                  defaultValue: 'Zykson.com',
                  admin: {
                    width: '50%',
                    description: 'Shown next to your avatar in the header.',
                  },
                },
                {
                  name: 'tagline',
                  type: 'text',
                  defaultValue: 'Writing, journal, diary & work',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'description',
              type: 'textarea',
              defaultValue:
                'A personal blog, journal, diary, archive and portfolio.',
              admin: {
                description:
                  'Default description for search engines and link previews.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'avatar',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { width: '50%' },
                },
                {
                  name: 'ogImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Default share image',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'location', type: 'text', admin: { width: '50%' } },
                {
                  name: 'email',
                  type: 'email',
                  label: 'Public email',
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        {
          label: 'Navigation',
          fields: [
            {
              name: 'navItems',
              type: 'array',
              label: 'Menu items',
              admin: {
                description:
                  'Links in the big menu (☰). Tick “Header” to also show a link in the top bar (4 max fit nicely).',
              },
              defaultValue: [
                { label: 'Blog', url: '/blog', inHeader: true },
                { label: 'Journal', url: '/journal', inHeader: true },
                { label: 'Diary', url: '/diary', inHeader: false },
                { label: 'Work', url: '/work', inHeader: true },
                { label: 'Archive', url: '/archive', inHeader: true },
                { label: 'About', url: '/about', inHeader: false },
              ],
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                      admin: { width: '40%' },
                    },
                    {
                      name: 'url',
                      type: 'text',
                      required: true,
                      admin: { width: '40%' },
                    },
                    {
                      name: 'inHeader',
                      type: 'checkbox',
                      label: 'Header',
                      admin: { width: '20%' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'socials',
              type: 'array',
              admin: { description: 'Shown in the footer and menu.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      required: true,
                      options: SOCIAL_PLATFORMS.map(({ value, label }) => ({
                        value,
                        label,
                      })),
                      admin: { width: '35%' },
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
          label: 'Now & footer',
          fields: [
            {
              name: 'now',
              type: 'group',
              label: 'Currently',
              admin: {
                description:
                  'A one-line status shown in the menu and footer, e.g. “Reading Piranesi”.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'emoji',
                      type: 'text',
                      admin: { width: '15%', placeholder: '📖' },
                    },
                    { name: 'text', type: 'text', admin: { width: '85%' } },
                  ],
                },
              ],
            },
            {
              name: 'announcement',
              type: 'group',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  label: 'Show an announcement bar',
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'text', type: 'text', admin: { width: '60%' } },
                    { name: 'url', type: 'text', admin: { width: '40%' } },
                  ],
                },
              ],
            },
            {
              name: 'footerNote',
              type: 'text',
              defaultValue: 'Made with care. Words are mine.',
            },
          ],
        },
        {
          label: 'Reading',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'postsPerPage',
                  type: 'number',
                  defaultValue: 12,
                  min: 3,
                  max: 60,
                  admin: { width: '50%' },
                },
                {
                  name: 'entriesPerPage',
                  type: 'number',
                  defaultValue: 20,
                  min: 5,
                  max: 100,
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'comments',
              type: 'group',
              label: 'Comments (Giscus — free, uses GitHub Discussions)',
              admin: {
                description:
                  'Set up at https://giscus.app, then paste the values here.',
              },
              fields: [
                { name: 'enabled', type: 'checkbox' },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'repo',
                      type: 'text',
                      admin: { width: '50%', placeholder: 'user/repo' },
                    },
                    { name: 'repoId', type: 'text', admin: { width: '50%' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'category', type: 'text', admin: { width: '50%' } },
                    {
                      name: 'categoryId',
                      type: 'text',
                      admin: { width: '50%' },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
