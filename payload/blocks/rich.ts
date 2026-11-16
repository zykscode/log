/**
 * Blocks that can be inserted inside rich text ("/" menu or the + button).
 * Each has a frontend renderer in components/rich-text/blocks.
 */
import type { Block, FieldHook } from 'payload';

import { CALLOUT_TYPES } from '../../lib/constants';
import { simpleEditor } from '../editor/simple';

export const Callout: Block = {
  slug: 'callout',
  labels: { singular: 'Callout', plural: 'Callouts' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'note',
          required: true,
          options: CALLOUT_TYPES.map((t) => ({
            label: `${t.emoji} ${t.label}`,
            value: t.value,
          })),
          admin: { width: '40%' },
        },
        {
          name: 'title',
          type: 'text',
          admin: { width: '60%', placeholder: 'Optional title' },
        },
      ],
    },
    { name: 'content', type: 'richText', editor: simpleEditor },
  ],
};

export const Gallery: Block = {
  slug: 'gallery',
  labels: { singular: 'Gallery', plural: 'Galleries' },
  fields: [
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      minRows: 1,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'layout',
          type: 'select',
          defaultValue: 'grid',
          options: [
            { label: 'Grid', value: 'grid' },
            { label: 'Masonry', value: 'masonry' },
            { label: 'Carousel (swipe)', value: 'carousel' },
            { label: 'Side by side', value: 'row' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'columns',
          type: 'select',
          defaultValue: '3',
          options: ['2', '3', '4'],
          admin: { width: '25%' },
        },
        {
          name: 'width',
          type: 'select',
          defaultValue: 'wide',
          options: [
            { label: 'Text width', value: 'normal' },
            { label: 'Wide', value: 'wide' },
            { label: 'Full bleed', value: 'full' },
          ],
          admin: { width: '25%' },
        },
      ],
    },
    { name: 'caption', type: 'text' },
  ],
};

export const Embed: Block = {
  slug: 'embed',
  labels: { singular: 'Embed', plural: 'Embeds' },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description:
          'Paste a link: YouTube, Vimeo, Spotify, SoundCloud, CodePen, CodeSandbox, Figma, Loom, Google Maps, Bandcamp… Anything else shows as a link card.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'aspect',
          type: 'select',
          defaultValue: 'auto',
          options: [
            { label: 'Auto', value: 'auto' },
            { label: '16:9', value: '16/9' },
            { label: '4:3', value: '4/3' },
            { label: '1:1', value: '1/1' },
            { label: '9:16 (vertical)', value: '9/16' },
          ],
          admin: { width: '50%' },
        },
        { name: 'caption', type: 'text', admin: { width: '50%' } },
      ],
    },
  ],
};

/** Fetches the page's title/description/image the first time a bookmark is saved. */
const unfurl: FieldHook = async ({ siblingData, value }) => {
  if (value || !siblingData?.url) return value;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(String(siblingData.url), {
      signal: controller.signal,
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)' },
    });
    clearTimeout(timer);
    const html = (await res.text()).slice(0, 300_000);
    const meta = (prop: string) =>
      html.match(
        new RegExp(
          `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
          'i',
        ),
      )?.[1] ??
      html.match(
        new RegExp(
          `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
          'i',
        ),
      )?.[1];
    const decode = (s?: string) =>
      s
        ?.replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
    const title = decode(
      meta('og:title') ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1],
    );
    siblingData.description ||= decode(
      meta('og:description') ?? meta('description'),
    );
    siblingData.image ||= meta('og:image');
    siblingData.siteName ||= decode(meta('og:site_name'));
    return title?.trim() || value;
  } catch {
    return value;
  }
};

export const Bookmark: Block = {
  slug: 'bookmark',
  labels: { singular: 'Link card', plural: 'Link cards' },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description:
          'Title, description and image are fetched automatically on save.',
      },
    },
    { name: 'title', type: 'text', hooks: { beforeChange: [unfurl] } },
    { name: 'description', type: 'textarea' },
    {
      type: 'row',
      fields: [
        {
          name: 'image',
          type: 'text',
          label: 'Image URL',
          admin: { width: '60%' },
        },
        { name: 'siteName', type: 'text', admin: { width: '40%' } },
      ],
    },
  ],
};

export const PullQuote: Block = {
  slug: 'pullQuote',
  labels: { singular: 'Pull quote', plural: 'Pull quotes' },
  fields: [
    { name: 'text', type: 'textarea', required: true },
    {
      type: 'row',
      fields: [
        { name: 'attribution', type: 'text', admin: { width: '40%' } },
        {
          name: 'source',
          type: 'text',
          label: 'Source URL',
          admin: { width: '40%' },
        },
        {
          name: 'style',
          type: 'select',
          defaultValue: 'pull',
          options: [
            { label: 'Pull quote', value: 'pull' },
            { label: 'Giant', value: 'giant' },
          ],
          admin: { width: '20%' },
        },
      ],
    },
  ],
};

export const Verse: Block = {
  slug: 'verse',
  labels: { singular: 'Poem / verse', plural: 'Poems' },
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'text',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Line breaks and indentation are kept exactly as typed.',
        rows: 10,
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'attribution', type: 'text', admin: { width: '60%' } },
        {
          name: 'align',
          type: 'select',
          defaultValue: 'left',
          options: ['left', 'center'],
          admin: { width: '40%' },
        },
      ],
    },
  ],
};

export const MathBlock: Block = {
  slug: 'math',
  labels: { singular: 'Equation', plural: 'Equations' },
  fields: [
    {
      name: 'latex',
      type: 'textarea',
      required: true,
      label: 'LaTeX',
      admin: {
        description:
          'e.g. E = mc^2 or \\int_0^1 x^2\\,dx — rendered with KaTeX.',
      },
    },
    { name: 'caption', type: 'text' },
  ],
};

export const Details: Block = {
  slug: 'details',
  labels: { singular: 'Toggle / details', plural: 'Toggles' },
  fields: [
    {
      name: 'summary',
      type: 'text',
      required: true,
      label: 'Title (always visible)',
    },
    { name: 'content', type: 'richText', editor: simpleEditor },
    { name: 'open', type: 'checkbox', label: 'Open by default' },
  ],
};

export const ButtonBlock: Block = {
  slug: 'button',
  labels: { singular: 'Button', plural: 'Buttons' },
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
        { name: 'url', type: 'text', required: true, admin: { width: '60%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'style',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Solid', value: 'primary' },
            { label: 'Outline', value: 'outline' },
            { label: 'Arrow link', value: 'link' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'newTab',
          type: 'checkbox',
          label: 'Open in new tab',
          admin: { width: '50%' },
        },
      ],
    },
  ],
};

export const MediaPlayer: Block = {
  slug: 'mediaPlayer',
  labels: { singular: 'Audio / video', plural: 'Audio / video' },
  fields: [
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Upload an audio or video file…' },
    },
    { name: 'url', type: 'text', label: '…or a direct file URL' },
    {
      type: 'row',
      fields: [
        { name: 'caption', type: 'text', admin: { width: '60%' } },
        { name: 'loop', type: 'checkbox', admin: { width: '20%' } },
        { name: 'muted', type: 'checkbox', admin: { width: '20%' } },
      ],
    },
  ],
};

/* ---------- inline blocks (sit inside a line of text) ---------- */

export const Footnote: Block = {
  slug: 'footnote',
  labels: { singular: 'Footnote', plural: 'Footnotes' },
  fields: [
    {
      name: 'note',
      type: 'textarea',
      required: true,
      admin: {
        description:
          'Numbered automatically and listed at the end. Links (https://…) become clickable.',
      },
    },
  ],
};

export const InlineMath: Block = {
  slug: 'inlineMath',
  labels: { singular: 'Inline equation', plural: 'Inline equations' },
  fields: [{ name: 'latex', type: 'text', required: true, label: 'LaTeX' }],
};

export const Kbd: Block = {
  slug: 'kbd',
  labels: { singular: 'Keyboard keys', plural: 'Keyboard keys' },
  fields: [
    {
      name: 'keys',
      type: 'text',
      required: true,
      admin: { description: 'Separate keys with + (e.g. Cmd+Shift+P).' },
    },
  ],
};
