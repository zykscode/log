import type { CollectionConfig } from 'payload';

import { anyone, authenticated } from '../access';
import { slugField } from '../fields';
import { revalidateAfterChange, revalidateAfterDelete } from '../hooks';

const hooks = {
  afterChange: [revalidateAfterChange],
  afterDelete: [revalidateAfterDelete],
};
const access = {
  read: anyone,
  create: authenticated,
  update: authenticated,
  delete: authenticated,
};

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Category', plural: 'Categories' },
  admin: {
    group: 'Organise',
    useAsTitle: 'title',
    description: 'Broad sections of the blog (one per post).',
  },
  access,
  hooks,
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    slugField(),
  ],
};

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: { singular: 'Tag', plural: 'Tags' },
  admin: {
    group: 'Organise',
    useAsTitle: 'title',
    description: 'Topics shared across posts, journal entries and projects.',
  },
  access,
  hooks,
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    slugField(),
  ],
};

export const Series: CollectionConfig = {
  slug: 'series',
  labels: { singular: 'Series', plural: 'Series' },
  admin: {
    group: 'Organise',
    useAsTitle: 'title',
    description:
      'Multi-part posts. Set a post’s series + part number in its Details tab.',
  },
  access,
  hooks,
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    slugField(),
  ],
};
