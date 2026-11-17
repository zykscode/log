import {
  BlocksFeature,
  CodeBlock,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
  LinkFeature,
  RelationshipFeature,
  TextStateFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical';

import { TEXT_STATES } from '../../lib/textStates';
import {
  Bookmark,
  ButtonBlock,
  Callout,
  Details,
  Embed,
  Footnote,
  Gallery,
  InlineMath,
  Kbd,
  MathBlock,
  MediaPlayer,
  PullQuote,
  Verse,
} from '../blocks/rich';
import { WritingCheckFeature } from './writing-check/server';

/** Languages offered in code blocks (Monaco ids → labels). */
export const CODE_LANGUAGES: Record<string, string> = {
  plaintext: 'Plain text',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  json: 'JSON',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  shell: 'Shell / Bash',
  python: 'Python',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  kotlin: 'Kotlin',
  swift: 'Swift',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  php: 'PHP',
  ruby: 'Ruby',
  sql: 'SQL',
  graphql: 'GraphQL',
  yaml: 'YAML',
  xml: 'XML',
  markdown: 'Markdown',
  dockerfile: 'Dockerfile',
  powershell: 'PowerShell',
  lua: 'Lua',
  dart: 'Dart',
  r: 'R',
};

/**
 * The main writing editor. Everything from the default set (bold, italic,
 * underline, strike, sub/superscript, inline code, alignment, indent, bullet /
 * numbered / check lists, quotes, dividers) plus:
 *   • headings H2–H4 (H1 is the page title)
 *   • links to any URL or to your own posts/projects/pages
 *   • images with caption + size, inline cards for other posts
 *   • tables, text colours & highlights, a fixed toolbar
 *   • blocks: code, callout, gallery, embed, link card, pull quote, poem,
 *     equation, toggle, button, audio/video
 *   • inline: footnotes, inline equations, keyboard keys
 * Type "/" in the editor to see them all; Markdown shortcuts work too.
 */
export const richEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter(
      (f) => !['heading', 'upload', 'link', 'relationship'].includes(f.key),
    ),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    LinkFeature({
      enabledCollections: ['posts', 'journal', 'projects', 'pages'],
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: 'rel',
          type: 'select',
          hasMany: true,
          options: ['noopener', 'noreferrer', 'nofollow'],
          admin: { description: 'Optional rel attributes for external links.' },
        },
      ],
    }),
    UploadFeature({
      collections: {
        media: {
          fields: [
            { name: 'caption', type: 'textarea' },
            {
              name: 'size',
              type: 'select',
              defaultValue: 'normal',
              options: [
                { label: 'Text width', value: 'normal' },
                { label: 'Wide', value: 'wide' },
                { label: 'Full bleed', value: 'full' },
                { label: 'Small, floated left', value: 'float-left' },
                { label: 'Small, floated right', value: 'float-right' },
              ],
            },
            {
              name: 'zoom',
              type: 'checkbox',
              defaultValue: true,
              label: 'Click to zoom',
            },
          ],
        },
      },
    }),
    RelationshipFeature({
      enabledCollections: ['posts', 'projects', 'journal'],
    }),
    EXPERIMENTAL_TableFeature(),
    TextStateFeature({ state: TEXT_STATES }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
    WritingCheckFeature(),
    BlocksFeature({
      blocks: [
        CodeBlock({
          slug: 'code',
          languages: CODE_LANGUAGES,
          defaultLanguage: 'typescript',
        }),
        Callout,
        Gallery,
        Embed,
        Bookmark,
        PullQuote,
        Verse,
        MathBlock,
        Details,
        ButtonBlock,
        MediaPlayer,
      ],
      inlineBlocks: [Footnote, InlineMath, Kbd],
    }),
  ],
});
