/**
 * Helpers that walk Lexical (Payload rich text) JSON without needing the
 * editor config — used both by CMS hooks (word count, search text) and by the
 * frontend (table of contents, footnotes).
 */
import { slugify } from './slugify';

export type LexicalNode = {
  type: string;
  text?: string;
  tag?: string;
  children?: LexicalNode[];
  fields?: Record<string, unknown> & { blockType?: string; id?: string };
  [key: string]: unknown;
};

export type LexicalData = { root: LexicalNode } | null | undefined;

const BLOCK_ELEMENTS = new Set([
  'paragraph',
  'heading',
  'quote',
  'list',
  'listitem',
  'table',
  'tablerow',
  'horizontalrule',
  'upload',
  'relationship',
  'block',
]);

function asData(value: unknown): LexicalNode | null {
  if (!value || typeof value !== 'object') return null;
  const root = (value as { root?: LexicalNode }).root;
  return root && typeof root === 'object' ? root : null;
}

function blockText(fields: LexicalNode['fields']): string {
  if (!fields) return '';
  const f = fields as Record<string, unknown>;
  switch (f.blockType) {
    case 'callout':
      return [f.title, lexicalToPlainText(f.content)]
        .filter(Boolean)
        .join('\n');
    case 'details':
      return [f.summary, lexicalToPlainText(f.content)]
        .filter(Boolean)
        .join('\n');
    case 'pullQuote':
    case 'verse':
      return [f.text, f.attribution].filter(Boolean).join('\n');
    case 'footnote':
      return typeof f.note === 'string' ? `(${f.note})` : '';
    case 'kbd':
      return typeof f.keys === 'string' ? f.keys : '';
    case 'gallery':
    case 'embed':
    case 'mediaPlayer':
      return typeof f.caption === 'string' ? f.caption : '';
    case 'bookmark':
      return [f.title, f.description].filter(Boolean).join('\n');
    default:
      return ''; // code, math, buttons etc. don't count as prose
  }
}

/** Flattens rich text into readable plain text (paragraphs separated by blank lines). */
export function lexicalToPlainText(value: unknown): string {
  const root = asData(value);
  if (!root) return '';

  const walk = (node: LexicalNode): string => {
    switch (node.type) {
      case 'text':
        return node.text ?? '';
      case 'linebreak':
        return '\n';
      case 'tab':
        return ' ';
      case 'block':
      case 'inlineBlock':
        return blockText(node.fields);
      default: {
        const children = node.children ?? [];
        const isContainer = children.some((c) => BLOCK_ELEMENTS.has(c.type));
        return children.map(walk).join(isContainer ? '\n\n' : '');
      }
    }
  };

  return walk(root)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function countWords(text: string): number {
  const matches = text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
  return matches ? matches.length : 0;
}

/** Minutes, rounded up, at ~225 wpm. Images/embeds add a little. */
export function readingTimeMinutes(words: number): number {
  return Math.max(1, Math.ceil(words / 225));
}

export function excerptFrom(text: string, max = 200): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : max).trim()}…`;
}

function textOf(node: LexicalNode): string {
  if (node.type === 'text') return node.text ?? '';
  return (node.children ?? []).map(textOf).join('');
}

export type TocHeading = { id: string; text: string; level: number };

/**
 * Collects h2–h4 headings (in document order) and gives each a unique id.
 * `ids` maps the heading node object to its id so the renderer can attach it.
 */
export function collectHeadings(value: unknown): {
  headings: TocHeading[];
  ids: WeakMap<object, string>;
} {
  const headings: TocHeading[] = [];
  const ids = new WeakMap<object, string>();
  const seen = new Map<string, number>();
  const root = asData(value);
  if (!root) return { headings, ids };

  const visit = (node: LexicalNode) => {
    if (node.type === 'heading' && typeof node.tag === 'string') {
      const level = Number(node.tag.replace('h', ''));
      const text = textOf(node).trim();
      if (text) {
        const base = slugify(text) || 'section';
        const n = seen.get(base) ?? 0;
        seen.set(base, n + 1);
        const id = n ? `${base}-${n + 1}` : base;
        ids.set(node, id);
        if (level >= 2 && level <= 4) headings.push({ id, text, level });
      }
    }
    node.children?.forEach(visit);
  };
  visit(root);
  return { headings, ids };
}

export type Footnote = { key: string; number: number; note: string };

/** Footnotes are inline blocks; number them in reading order. */
export function collectFootnotes(value: unknown): Footnote[] {
  const notes: Footnote[] = [];
  const root = asData(value);
  if (!root) return notes;
  const visit = (node: LexicalNode) => {
    if (node.type === 'inlineBlock' && node.fields?.blockType === 'footnote') {
      const key = String(node.fields.id ?? notes.length + 1);
      notes.push({
        key,
        number: notes.length + 1,
        note: String(node.fields.note ?? ''),
      });
    }
    node.children?.forEach(visit);
  };
  visit(root);
  return notes;
}

/** True when the rich text has no visible content. */
export function isEmptyRichText(value: unknown): boolean {
  return lexicalToPlainText(value).length === 0 && !hasMediaNodes(value);
}

function hasMediaNodes(value: unknown): boolean {
  const root = asData(value);
  if (!root) return false;
  let found = false;
  const visit = (node: LexicalNode) => {
    if (found) return;
    if (
      ['upload', 'block', 'relationship', 'horizontalrule'].includes(node.type)
    ) {
      found = true;
      return;
    }
    node.children?.forEach(visit);
  };
  visit(root);
  return found;
}
