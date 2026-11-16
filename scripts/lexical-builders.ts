/**
 * Tiny helpers for writing Lexical (Payload rich text) JSON in scripts —
 * used by the seed and the Hygraph importer.
 */
import { randomBytes } from 'crypto';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Node = Record<string, any>;

const base = { direction: 'ltr' as const, format: '', indent: 0, version: 1 };
export const oid = () => randomBytes(12).toString('hex');

export const FMT = { b: 1, i: 2, s: 4, u: 8, code: 16, sub: 32, sup: 64 };

export function t(
  text: string,
  format = 0,
  state?: Record<string, string>,
): Node {
  return {
    type: 'text',
    text,
    format,
    detail: 0,
    mode: 'normal',
    style: '',
    version: 1,
    ...(state ? { $: state } : {}),
  };
}
const kids = (c: (Node | string)[]) =>
  c.map((x) => (typeof x === 'string' ? t(x) : x));

export const p = (...c: (Node | string)[]): Node => ({
  ...base,
  type: 'paragraph',
  textFormat: 0,
  textStyle: '',
  children: kids(c),
});
export const h = (level: 2 | 3 | 4, ...c: (Node | string)[]): Node => ({
  ...base,
  type: 'heading',
  tag: `h${level}`,
  children: kids(c),
});
export const quote = (...c: (Node | string)[]): Node => ({
  ...base,
  type: 'quote',
  children: kids(c),
});
export const hr = (): Node => ({ type: 'horizontalrule', version: 1 });
export const br = (): Node => ({ type: 'linebreak', version: 1 });

export function link(url: string, ...c: (Node | string)[]): Node {
  return {
    ...base,
    type: 'link',
    version: 3,
    fields: { url, newTab: /^https?:/.test(url), linkType: 'custom' },
    children: kids(c),
  };
}
export function docLink(
  relationTo: string,
  id: number | string,
  ...c: (Node | string)[]
): Node {
  return {
    ...base,
    type: 'link',
    version: 3,
    fields: {
      linkType: 'internal',
      newTab: false,
      doc: { relationTo, value: id },
    },
    children: kids(c),
  };
}

function list(
  listType: 'bullet' | 'number' | 'check',
  items: (string | Node | (Node | string)[])[],
  checked?: boolean[],
): Node {
  return {
    ...base,
    type: 'list',
    listType,
    tag: listType === 'number' ? 'ol' : 'ul',
    start: 1,
    children: items.map((item, i) => ({
      ...base,
      type: 'listitem',
      value: i + 1,
      ...(listType === 'check' ? { checked: Boolean(checked?.[i]) } : {}),
      children: Array.isArray(item) ? kids(item) : kids([item]),
    })),
  };
}
export const ul = (...items: (string | Node | (Node | string)[])[]) =>
  list('bullet', items);
export const ol = (...items: (string | Node | (Node | string)[])[]) =>
  list('number', items);
export const checklist = (items: [string, boolean][]) =>
  list(
    'check',
    items.map((i) => i[0]),
    items.map((i) => i[1]),
  );

export function block(
  blockType: string,
  fields: Record<string, unknown>,
): Node {
  return {
    type: 'block',
    version: 2,
    format: '',
    fields: { id: oid(), blockName: '', blockType, ...fields },
  };
}
export function inline(
  blockType: string,
  fields: Record<string, unknown>,
): Node {
  return {
    type: 'inlineBlock',
    version: 1,
    fields: { id: oid(), blockName: '', blockType, ...fields },
  };
}
export function upload(
  id: number | string,
  fields: Record<string, unknown> = {},
): Node {
  return {
    type: 'upload',
    version: 3,
    format: '',
    relationTo: 'media',
    value: id,
    id: oid(),
    fields,
  };
}
export function relationship(relationTo: string, id: number | string): Node {
  return {
    type: 'relationship',
    version: 2,
    format: '',
    relationTo,
    value: id,
  };
}
export function table(rows: string[][], header = true): Node {
  return {
    ...base,
    type: 'table',
    children: rows.map((r, ri) => ({
      ...base,
      type: 'tablerow',
      children: r.map((cell) => ({
        ...base,
        type: 'tablecell',
        headerState: header && ri === 0 ? 1 : 0,
        colSpan: 1,
        rowSpan: 1,
        children: [p(cell)],
      })),
    })),
  };
}

export const doc = (...children: Node[]) => ({
  root: { ...base, type: 'root', children },
});

/** Plain paragraphs separated by blank lines → rich text. */
export const fromText = (s: string) =>
  doc(
    ...s
      .trim()
      .split(/\n{2,}/)
      .map((para) => p(para.replace(/\n/g, ' '))),
  );
