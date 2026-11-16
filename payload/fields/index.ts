import type { Field, FieldHook, TextField } from 'payload';

import { slugify } from '../../lib/slugify';

/** Makes `candidate` unique within the collection by appending -2, -3, … */
async function uniqueSlug(
  candidate: string,
  args: Parameters<FieldHook>[0],
): Promise<string> {
  const { req, collection, originalDoc } = args;
  if (!collection || !candidate) return candidate;
  let slug = candidate;
  for (let i = 2; i < 50; i++) {
    const existing = await req.payload.find({
      collection: collection.slug as 'posts',
      where: {
        and: [
          { slug: { equals: slug } },
          ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
        ],
      },
      limit: 1,
      depth: 0,
      draft: true,
      pagination: false,
      req,
    });
    if (existing.docs.length === 0) return slug;
    slug = `${candidate}-${i}`;
  }
  return slug;
}

type SlugSource =
  string | ((data: Record<string, unknown>) => string | undefined);

const formatSlug =
  (source: SlugSource): FieldHook =>
  async (args) => {
    const { value, data, originalDoc } = args;
    let candidate = '';
    if (typeof value === 'string' && value.trim()) {
      candidate = slugify(value);
    } else {
      const merged = { ...(originalDoc ?? {}), ...(data ?? {}) } as Record<
        string,
        unknown
      >;
      const raw =
        typeof source === 'function' ? source(merged) : merged[source];
      if (typeof raw === 'string' && raw.trim()) candidate = slugify(raw);
    }
    if (!candidate) return value;
    return uniqueSlug(candidate, args);
  };

export function slugField(
  source: SlugSource = 'title',
  overrides: Partial<TextField> = {},
): Field {
  return {
    name: 'slug',
    type: 'text',
    index: true,
    unique: true,
    label: 'Slug',
    admin: {
      position: 'sidebar',
      description: 'The URL. Leave empty to generate it automatically.',
    },
    hooks: { beforeValidate: [formatSlug(source)] },
    ...overrides,
  } as Field;
}

export function publishedAtField(
  options: { label?: string; defaultNow?: boolean } = {},
): Field {
  return {
    name: 'publishedAt',
    type: 'date',
    label: options.label ?? 'Publish date',
    index: true,
    defaultValue: options.defaultNow
      ? () => new Date().toISOString()
      : undefined,
    admin: {
      position: 'sidebar',
      date: { pickerAppearance: 'dayAndTime' },
      description:
        'Pick a future date to schedule — it appears on the site when that time arrives.',
    },
    hooks: {
      beforeChange: [
        ({ siblingData, value }) => {
          if (siblingData?._status === 'published' && !value)
            return new Date().toISOString();
          return value;
        },
      ],
    },
  };
}

export type Visibility = 'public' | 'unlisted' | 'private';

export function visibilityField(defaultValue: Visibility = 'public'): Field {
  return {
    name: 'visibility',
    type: 'select',
    required: true,
    index: true,
    defaultValue,
    options: [
      { label: '🌍 Public — listed everywhere', value: 'public' },
      { label: '🔗 Unlisted — anyone with the link', value: 'unlisted' },
      { label: '🔒 Private — only you, in author mode', value: 'private' },
    ],
    admin: {
      position: 'sidebar',
      description:
        'Unlisted pages are hidden from lists, feeds, search and the sitemap.',
    },
  };
}

/** Read-only numbers the CMS fills in on save. */
export const contentStatsFields: Field[] = [
  {
    type: 'row',
    admin: { position: 'sidebar' },
    fields: [
      {
        name: 'readingTime',
        type: 'number',
        label: 'Reading time (min)',
        admin: { readOnly: true, width: '50%' },
      },
      {
        name: 'wordCount',
        type: 'number',
        label: 'Words',
        admin: { readOnly: true, width: '50%' },
      },
    ],
  },
  {
    name: 'searchText',
    type: 'textarea',
    admin: { hidden: true },
  },
  {
    name: 'autoExcerpt',
    type: 'textarea',
    admin: { hidden: true },
  },
];

export const tagsField: Field = {
  name: 'tags',
  type: 'relationship',
  relationTo: 'tags',
  hasMany: true,
  admin: { position: 'sidebar' },
};
