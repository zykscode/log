import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical';

/**
 * A lighter editor for nested text (inside callouts, toggles, accordions…):
 * formatting, lists, links, quotes and headings — no blocks or uploads.
 */
export const simpleEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter(
      (f) => !['upload', 'relationship'].includes(f.key),
    ),
    InlineToolbarFeature(),
  ],
});

export const toolbarEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter(
      (f) => !['upload', 'relationship'].includes(f.key),
    ),
    FixedToolbarFeature(),
  ],
});
