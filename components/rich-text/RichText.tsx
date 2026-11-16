import 'katex/dist/katex.min.css';

import {
  type JSXConverters,
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as PayloadRichText,
} from '@payloadcms/richtext-lexical/react';
import Link from 'next/link';
import { createElement, Fragment } from 'react';

import { MediaImage } from '@/components/ui/MediaImage';
import {
  collectFootnotes,
  collectHeadings,
  type LexicalNode,
} from '@/lib/lexical';
import { docPath } from '@/lib/urls';
import { cn } from '@/lib/utils';
import type { Media } from '@/payload-types';

import {
  Bookmark,
  ButtonBlock,
  Callout,
  Details,
  Embed,
  FootnoteList,
  FootnoteRef,
  Gallery,
  InlineMath,
  Kbd,
  MathBlock,
  MediaPlayer,
  PullQuote,
  toLightbox,
  Verse,
} from './blocks';
import { Code } from './Code';
import { Lightbox } from './Lightbox';

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyNode = LexicalNode & Record<string, any>;

const FORMAT = {
  bold: 1,
  italic: 2,
  strike: 4,
  underline: 8,
  code: 16,
  sub: 32,
  sup: 64,
};

function renderText(node: AnyNode): React.ReactNode {
  let out: React.ReactNode = node.text;
  const f = (node.format as number) ?? 0;
  if (f & FORMAT.code) out = <code>{out}</code>;
  if (f & FORMAT.bold) out = <strong>{out}</strong>;
  if (f & FORMAT.italic) out = <em>{out}</em>;
  if (f & FORMAT.underline)
    out = <u className="decoration-accent underline-offset-4">{out}</u>;
  if (f & FORMAT.strike) out = <s>{out}</s>;
  if (f & FORMAT.sub) out = <sub>{out}</sub>;
  if (f & FORMAT.sup) out = <sup>{out}</sup>;
  // text colours / highlights / styles from the editor (stored in node.$)
  const state = node.$ as Record<string, string> | undefined;
  if (state && (state.color || state.highlight || state.style)) {
    out = (
      <span
        data-color={state.color}
        data-highlight={state.highlight}
        data-style={state.style}
        tabIndex={state.style === 'spoiler' ? 0 : undefined}
      >
        {out}
      </span>
    );
  }
  return out;
}

const internalDocToHref = ({ linkNode }: { linkNode: any }) => {
  const doc = linkNode?.fields?.doc;
  if (!doc || typeof doc.value !== 'object' || !doc.value) return '#';
  return docPath(doc.relationTo, doc.value);
};

function buildConverters(opts: {
  headingIds?: WeakMap<object, string>;
  footnotes?: Map<string, { number: number; note: string }>;
}): JSXConvertersFunction {
  return ({ defaultConverters }) => {
    const c: JSXConverters = {
      ...defaultConverters,
      ...LinkJSXConverter({ internalDocToHref }),
      text: ({ node }: any) => renderText(node),

      heading: ({ node, nodesToJSX }: any) => {
        const id = opts.headingIds?.get(node);
        const Tag = (
          ['h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tag) ? node.tag : 'h2'
        ) as 'h2';
        return createElement(
          Tag,
          { id, 'data-align': node.format || undefined },
          id ? (
            <a
              href={`#${id}`}
              className="heading-anchor no-prose"
              aria-hidden
              tabIndex={-1}
            >
              #
            </a>
          ) : null,
          nodesToJSX({ nodes: node.children }),
        );
      },

      paragraph: ({ node, nodesToJSX }: any) => {
        const children = nodesToJSX({ nodes: node.children });
        if (!children?.length) return <p aria-hidden className="h-[0.5em]" />;
        return (
          <p
            data-align={node.format || undefined}
            style={
              node.indent
                ? { paddingLeft: `${node.indent * 1.5}em` }
                : undefined
            }
          >
            {children}
          </p>
        );
      },

      list: ({ node, nodesToJSX }: any) => {
        const children = nodesToJSX({ nodes: node.children });
        if (node.listType === 'check')
          return <ul className="checklist">{children}</ul>;
        return node.tag === 'ol' ? (
          <ol start={node.start > 1 ? node.start : undefined}>{children}</ol>
        ) : (
          <ul>{children}</ul>
        );
      },

      listitem: ({ node, nodesToJSX, parent }: any) => {
        const hasSubList = node.children?.some(
          (ch: AnyNode) => ch.type === 'list',
        );
        const children = nodesToJSX({ nodes: node.children });
        if (hasSubList) return <li className="nested-list">{children}</li>;
        if (parent?.listType === 'check') {
          return (
            <li data-checked={node.checked ? 'true' : 'false'}>
              <span className="check" aria-hidden>
                {node.checked ? '✓' : ''}
              </span>
              <span className="check-text">
                <span className="sr-only">
                  {node.checked ? 'Done: ' : 'To do: '}
                </span>
                {children}
              </span>
            </li>
          );
        }
        return <li value={node.value}>{children}</li>;
      },

      table: ({ node, nodesToJSX }: any) => (
        <div className="table-wrap">
          <table>
            <tbody>{nodesToJSX({ nodes: node.children })}</tbody>
          </table>
        </div>
      ),

      upload: ({ node }: any) => {
        const media = node.value as Media | undefined;
        if (!media || typeof media !== 'object' || !media.url) return null;
        const caption: string | undefined =
          node.fields?.caption || media.caption || undefined;
        const size: string = node.fields?.size ?? 'normal';
        if (!media.mimeType?.startsWith('image/')) {
          if (
            media.mimeType?.startsWith('video/') ||
            media.mimeType?.startsWith('audio/')
          )
            return <MediaPlayer file={media} caption={caption} />;
          return (
            <p>
              <a href={media.url} target="_blank" rel="noopener noreferrer">
                ⬇ {media.filename}
              </a>
            </p>
          );
        }
        const img = (
          <MediaImage
            media={media}
            sizes={
              size === 'full'
                ? '100vw'
                : size === 'wide'
                  ? '(min-width: 1024px) 64rem, 100vw'
                  : '(min-width: 768px) 46rem, 100vw'
            }
            className="rounded-xl"
          />
        );
        return (
          <figure
            className={cn(
              'not-prose my-8',
              size === 'wide' && 'w-wide',
              size === 'full' && 'w-full',
              size === 'float-left' && 'float-left',
              size === 'float-right' && 'float-right',
            )}
          >
            {node.fields?.zoom === false ? (
              img
            ) : (
              <Lightbox images={[toLightbox(media, caption)]}>{img}</Lightbox>
            )}
            {(caption || media.credit) && (
              <figcaption className="caption">
                {caption}
                {media.credit && (
                  <span className="ml-1 text-faint">· {media.credit}</span>
                )}
              </figcaption>
            )}
          </figure>
        );
      },

      relationship: ({ node }: any) => {
        const doc = node.value;
        if (!doc || typeof doc !== 'object') return null;
        const label =
          node.relationTo === 'projects'
            ? 'Project'
            : node.relationTo === 'journal'
              ? 'Journal'
              : 'Read';
        return (
          <Link
            href={docPath(node.relationTo, doc)}
            className="no-prose not-prose group my-8 flex items-center justify-between gap-6 rounded-xl border border-line p-5 transition-colors hover:border-fg/40"
          >
            <span className="min-w-0">
              <span className="eyebrow text-[0.62rem] text-accent">
                {label}
              </span>
              <span className="mt-1 block text-xl font-medium leading-snug group-hover:text-accent">
                {doc.title}
              </span>
              {(doc.excerpt || doc.summary || doc.autoExcerpt) && (
                <span className="mt-1 line-clamp-2 block text-sm text-muted">
                  {doc.excerpt || doc.summary || doc.autoExcerpt}
                </span>
              )}
            </span>
            <span
              className="text-2xl transition-transform group-hover:translate-x-1"
              aria-hidden
            >
              →
            </span>
          </Link>
        );
      },

      blocks: {
        code: ({ node }: any) => (
          <Code code={node.fields.code ?? ''} language={node.fields.language} />
        ),
        callout: ({ node }: any) => (
          <Callout variant={node.fields.variant} title={node.fields.title}>
            <RichText data={node.fields.content} nested />
          </Callout>
        ),
        gallery: ({ node }: any) => (
          <Gallery
            images={(node.fields.images ?? []).filter(
              (m: unknown) => typeof m === 'object',
            )}
            layout={node.fields.layout}
            columns={node.fields.columns}
            width={node.fields.width}
            caption={node.fields.caption}
          />
        ),
        embed: ({ node }: any) => (
          <Embed
            url={node.fields.url}
            aspect={node.fields.aspect}
            caption={node.fields.caption}
          />
        ),
        bookmark: ({ node }: any) => <Bookmark {...node.fields} />,
        pullQuote: ({ node }: any) => <PullQuote {...node.fields} />,
        verse: ({ node }: any) => <Verse {...node.fields} />,
        math: ({ node }: any) => (
          <MathBlock
            latex={node.fields.latex ?? ''}
            caption={node.fields.caption}
          />
        ),
        details: ({ node }: any) => (
          <Details summary={node.fields.summary} open={node.fields.open}>
            <RichText data={node.fields.content} nested />
          </Details>
        ),
        button: ({ node }: any) => <ButtonBlock {...node.fields} />,
        mediaPlayer: ({ node }: any) => (
          <MediaPlayer
            file={
              typeof node.fields.file === 'object' ? node.fields.file : null
            }
            url={node.fields.url}
            caption={node.fields.caption}
            loop={node.fields.loop}
            muted={node.fields.muted}
          />
        ),
      },

      inlineBlocks: {
        footnote: ({ node }: any) => {
          const fn = opts.footnotes?.get(String(node.fields.id));
          return fn ? <FootnoteRef number={fn.number} note={fn.note} /> : null;
        },
        inlineMath: ({ node }: any) => (
          <InlineMath latex={node.fields.latex ?? ''} />
        ),
        kbd: ({ node }: any) => <Kbd keys={node.fields.keys ?? ''} />,
      },

      unknown: () => null,
    };
    return c;
  };
}

/**
 * Renders CMS rich text. Top-level use gives headings ids (for the table of
 * contents) and collects footnotes at the end; `nested` is for rich text
 * inside blocks (callouts, toggles, accordions…).
 */
export function RichText({
  data,
  className,
  nested = false,
  large = false,
}: {
  data: unknown;
  className?: string;
  nested?: boolean;
  large?: boolean;
}) {
  if (!data || typeof data !== 'object' || !('root' in (data as object)))
    return null;

  if (nested) {
    return (
      <PayloadRichText
        data={data as never}
        converters={buildConverters({})}
        disableContainer
      />
    );
  }

  const { ids } = collectHeadings(data);
  const notes = collectFootnotes(data);
  const footnotes = new Map(
    notes.map((n) => [n.key, { number: n.number, note: n.note }]),
  );

  return (
    <Fragment>
      <div className={cn('prose-zyk', large && 'prose-lg', className)}>
        <PayloadRichText
          data={data as never}
          converters={buildConverters({ headingIds: ids, footnotes })}
          disableContainer
        />
        <FootnoteList notes={notes} />
      </div>
    </Fragment>
  );
}
