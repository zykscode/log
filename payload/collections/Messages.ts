import type { CollectionConfig } from 'payload';

import { authenticated, nobody } from '../access';

/** Contact-form submissions. Created only by the site's server action. */
export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: { singular: 'Message', plural: 'Inbox' },
  defaultSort: '-createdAt',
  admin: {
    group: 'Inbox',
    useAsTitle: 'subject',
    defaultColumns: ['subject', 'name', 'email', 'status', 'createdAt'],
    description: 'Messages sent through the contact form.',
  },
  access: {
    read: authenticated,
    create: nobody,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        {
          name: 'email',
          type: 'email',
          required: true,
          admin: { width: '50%' },
        },
      ],
    },
    { name: 'subject', type: 'text' },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'page',
      type: 'text',
      admin: { readOnly: true, description: 'Where it was sent from.' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: '🟠 New', value: 'new' },
        { label: '✔ Read', value: 'read' },
        { label: '↩ Replied', value: 'replied' },
        { label: '🗄 Archived', value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
};
