/**
 * Page-builder sections for the Pages collection (Home, About, Now, Uses, or
 * any new page). Each has a renderer in components/blocks.
 */
import type { Block, Field } from 'payload';

import { ENTRY_TYPES } from '../../lib/constants';
import { richEditor } from '../editor/full';
import { simpleEditor } from '../editor/simple';

const heading: Field = { name: 'heading', type: 'text' };

const linkFields: Field[] = [
  {
    type: 'row',
    fields: [
      { name: 'label', type: 'text', required: true, admin: { width: '35%' } },
      { name: 'url', type: 'text', required: true, admin: { width: '45%' } },
      {
        name: 'style',
        type: 'select',
        defaultValue: 'primary',
        options: [
          { label: 'Solid', value: 'primary' },
          { label: 'Outline', value: 'outline' },
          { label: 'Arrow link', value: 'link' },
        ],
        admin: { width: '20%' },
      },
    ],
  },
];

export const ContentSection: Block = {
  slug: 'content',
  labels: { singular: 'Rich text', plural: 'Rich text' },
  fields: [
    heading,
    { name: 'content', type: 'richText', editor: richEditor },
    {
      name: 'width',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { label: 'Narrow (reading)', value: 'narrow' },
        { label: 'Normal', value: 'normal' },
        { label: 'Wide', value: 'wide' },
      ],
    },
  ],
};

export const BigTextSection: Block = {
  slug: 'bigText',
  labels: { singular: 'Giant text', plural: 'Giant text' },
  fields: [
    {
      name: 'lines',
      type: 'array',
      minRows: 1,
      fields: [{ name: 'text', type: 'text', required: true }],
      admin: {
        description:
          'Each line is set huge and uppercase — the signature look.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'tone',
          type: 'select',
          defaultValue: 'fg',
          options: [
            { label: 'Text colour', value: 'fg' },
            { label: 'Ember red', value: 'accent' },
            { label: 'Faded', value: 'muted' },
            { label: 'Outline', value: 'outline' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'align',
          type: 'select',
          defaultValue: 'left',
          options: ['left', 'center', 'right'],
          admin: { width: '50%' },
        },
      ],
    },
    { name: 'caption', type: 'text' },
  ],
};

export const MediaSection: Block = {
  slug: 'mediaSection',
  labels: { singular: 'Image / video', plural: 'Images / videos' },
  fields: [
    { name: 'media', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', type: 'text' },
    {
      name: 'size',
      type: 'select',
      defaultValue: 'wide',
      options: [
        { label: 'Normal', value: 'normal' },
        { label: 'Wide', value: 'wide' },
        { label: 'Full bleed', value: 'full' },
      ],
    },
  ],
};

export const GallerySection: Block = {
  slug: 'gallerySection',
  labels: { singular: 'Gallery', plural: 'Galleries' },
  fields: [
    heading,
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'masonry',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Masonry', value: 'masonry' },
        { label: 'Carousel', value: 'carousel' },
      ],
    },
  ],
};

export const CallToAction: Block = {
  slug: 'cta',
  labels: { singular: 'Call to action', plural: 'Calls to action' },
  fields: [
    heading,
    { name: 'body', type: 'textarea' },
    { name: 'links', type: 'array', maxRows: 3, fields: linkFields },
  ],
};

export const PostsFeed: Block = {
  slug: 'postsFeed',
  labels: { singular: 'Posts list', plural: 'Posts lists' },
  fields: [
    heading,
    {
      type: 'row',
      fields: [
        {
          name: 'source',
          type: 'select',
          defaultValue: 'latest',
          options: [
            { label: 'Latest', value: 'latest' },
            { label: 'Featured', value: 'featured' },
            { label: 'From a category', value: 'category' },
            { label: 'With a tag', value: 'tag' },
            { label: 'A series', value: 'series' },
            { label: 'Hand-picked', value: 'manual' },
          ],
          admin: { width: '40%' },
        },
        {
          name: 'layout',
          type: 'select',
          defaultValue: 'list',
          options: [
            { label: 'Editorial list', value: 'list' },
            { label: 'Card grid', value: 'grid' },
            { label: 'Compact', value: 'compact' },
            { label: 'Big feature card(s)', value: 'feature' },
          ],
          admin: { width: '30%' },
        },
        {
          name: 'limit',
          type: 'number',
          defaultValue: 5,
          min: 1,
          max: 24,
          admin: { width: '30%' },
        },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      admin: { condition: (_, s) => s?.source === 'category' },
    },
    {
      name: 'tag',
      type: 'relationship',
      relationTo: 'tags',
      admin: { condition: (_, s) => s?.source === 'tag' },
    },
    {
      name: 'series',
      type: 'relationship',
      relationTo: 'series',
      admin: { condition: (_, s) => s?.source === 'series' },
    },
    {
      name: 'posts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: { condition: (_, s) => s?.source === 'manual' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'showViewAll',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show “view all” link',
          admin: { width: '50%' },
        },
        {
          name: 'skipFeatured',
          type: 'checkbox',
          label: 'Leave out featured posts',
          admin: {
            width: '50%',
            description: 'Avoid repeating a featured post shown above.',
          },
        },
      ],
    },
  ],
};

export const ProjectsGrid: Block = {
  slug: 'projectsGrid',
  labels: { singular: 'Projects grid', plural: 'Projects grids' },
  fields: [
    heading,
    {
      type: 'row',
      fields: [
        {
          name: 'source',
          type: 'select',
          defaultValue: 'featured',
          options: [
            { label: 'Featured', value: 'featured' },
            { label: 'Latest', value: 'latest' },
            { label: 'Hand-picked', value: 'manual' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'limit',
          type: 'number',
          defaultValue: 4,
          min: 1,
          max: 24,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'projects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      admin: { condition: (_, s) => s?.source === 'manual' },
    },
  ],
};

export const JournalFeed: Block = {
  slug: 'journalFeed',
  labels: { singular: 'Journal / diary feed', plural: 'Journal feeds' },
  fields: [
    heading,
    {
      type: 'row',
      fields: [
        {
          name: 'entryType',
          type: 'select',
          defaultValue: 'all',
          options: [
            { label: 'Journal & diary', value: 'all' },
            ...ENTRY_TYPES.map(({ value, label }) => ({ value, label })),
          ],
          admin: { width: '50%' },
        },
        {
          name: 'limit',
          type: 'number',
          defaultValue: 4,
          min: 1,
          max: 24,
          admin: { width: '50%' },
        },
      ],
    },
  ],
};

export const TimelineSection: Block = {
  slug: 'timeline',
  labels: { singular: 'Timeline / CV', plural: 'Timelines' },
  fields: [
    heading,
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'period',
              type: 'text',
              required: true,
              admin: { width: '25%', placeholder: '2022 — now' },
            },
            {
              name: 'title',
              type: 'text',
              required: true,
              admin: { width: '40%' },
            },
            {
              name: 'org',
              type: 'text',
              label: 'Organisation',
              admin: { width: '35%' },
            },
          ],
        },
        { name: 'description', type: 'textarea' },
        { name: 'url', type: 'text' },
      ],
    },
  ],
};

export const StatsSection: Block = {
  slug: 'stats',
  labels: { singular: 'Stats', plural: 'Stats' },
  fields: [
    heading,
    {
      name: 'auto',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show live site stats (posts, entries, projects, words written)',
    },
    {
      name: 'items',
      type: 'array',
      admin: { condition: (_, s) => !s?.auto },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'value',
              type: 'text',
              required: true,
              admin: { width: '40%' },
            },
            {
              name: 'label',
              type: 'text',
              required: true,
              admin: { width: '60%' },
            },
          ],
        },
      ],
    },
  ],
};

export const QuoteSection: Block = {
  slug: 'quote',
  labels: { singular: 'Quote', plural: 'Quotes' },
  fields: [
    { name: 'text', type: 'textarea', required: true },
    { name: 'attribution', type: 'text' },
  ],
};

export const AccordionSection: Block = {
  slug: 'accordion',
  labels: { singular: 'Accordion / FAQ', plural: 'Accordions' },
  fields: [
    heading,
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'richText', editor: simpleEditor },
      ],
    },
  ],
};

export const LinkListSection: Block = {
  slug: 'linkList',
  labels: { singular: 'Link list', plural: 'Link lists' },
  fields: [
    heading,
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'list',
      options: [
        { label: 'List', value: 'list' },
        { label: 'Grid', value: 'grid' },
      ],
    },
    {
      name: 'links',
      type: 'array',
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
              admin: { width: '60%' },
            },
          ],
        },
        { name: 'description', type: 'text' },
      ],
    },
  ],
};

export const EmbedSection: Block = {
  slug: 'embedSection',
  labels: { singular: 'Embed', plural: 'Embeds' },
  fields: [
    { name: 'url', type: 'text', required: true },
    { name: 'caption', type: 'text' },
  ],
};

export const ColumnsSection: Block = {
  slug: 'columns',
  labels: { singular: 'Columns', plural: 'Columns' },
  fields: [
    heading,
    {
      name: 'columns',
      type: 'array',
      minRows: 2,
      maxRows: 4,
      fields: [{ name: 'content', type: 'richText', editor: simpleEditor }],
    },
  ],
};

export const ContactSection: Block = {
  slug: 'contact',
  labels: { singular: 'Contact form', plural: 'Contact forms' },
  fields: [
    heading,
    { name: 'intro', type: 'textarea' },
    {
      name: 'successMessage',
      type: 'text',
      defaultValue: 'Thanks — your message is in. I’ll get back to you soon.',
    },
  ],
};

export const TagCloudSection: Block = {
  slug: 'tagCloud',
  labels: { singular: 'Tag cloud', plural: 'Tag clouds' },
  fields: [heading],
};

export const SpacerSection: Block = {
  slug: 'spacer',
  labels: { singular: 'Spacer / divider', plural: 'Spacers' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'size',
          type: 'select',
          defaultValue: 'md',
          options: ['sm', 'md', 'lg', 'xl'],
          admin: { width: '50%' },
        },
        {
          name: 'line',
          type: 'checkbox',
          label: 'Show a line',
          admin: { width: '50%' },
        },
      ],
    },
  ],
};

export const LAYOUT_BLOCKS: Block[] = [
  ContentSection,
  BigTextSection,
  MediaSection,
  GallerySection,
  CallToAction,
  PostsFeed,
  ProjectsGrid,
  JournalFeed,
  TimelineSection,
  StatsSection,
  QuoteSection,
  AccordionSection,
  LinkListSection,
  EmbedSection,
  ColumnsSection,
  ContactSection,
  TagCloudSection,
  SpacerSection,
];
