import type { CollectionConfig } from 'payload';

import { authenticated, isAdmin } from '../access';

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Author', plural: 'Authors' },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // stay signed in for 30 days
    cookies: { sameSite: 'Lax' },
  },
  admin: {
    group: 'Settings',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
  },
  access: {
    admin: ({ req: { user } }) => Boolean(user),
    read: authenticated,
    create: isAdmin,
    update: authenticated,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'admin',
      required: true,
      options: [
        { label: 'Admin — everything', value: 'admin' },
        { label: 'Editor — content only', value: 'editor' },
      ],
      saveToJWT: true,
    },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    { name: 'bio', type: 'textarea' },
    { name: 'website', type: 'text' },
  ],
};
