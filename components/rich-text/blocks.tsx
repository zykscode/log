import katex from 'katex';

import { ButtonLink } from '@/components/ui/Primitives';
import { CALLOUT_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Media } from '@/payload-types';

import { resolveEmbed } from './embeds';
import { Lightbox, type LightboxImage } from './Lightbox';

/* ---------------- shared helpers ---------------- */

export function toLightbox(m: Media, caption?: string | null): LightboxImage {
  return {
    src: m.sizes?.hero?.url || m.url || '',
    alt: m.alt ?? '',
    caption: caption ?? m.caption,
    width: m.width,
    height: m.height,
  };
}

const widthClass = (w?: string | null) =>
  w === 'full' ? 'w-full' : w === 'wide' ? 'w-wide' : '';

function linkify(text: string) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return parts.map((p, i) =>
    /^https?:\/\//.test(p) ? (
      <a key={i} href={p} target="_blank" rel="noopener noreferrer">
        {p.replace(/^https?:\/\/(www\.)?/, '')}
      </a>
    ) : (
      p
    ),
  );
}

/* ---------------- blocks ---------------- */

export function Callout({
  variant,
  title,
  children,
}: {
  variant?: string | null;
  title?: string | null;
  children?: React.ReactNode;
}) {
  const type =
    CALLOUT_TYPES.find((t) => t.value === variant) ?? CALLOUT_TYPES[0];
  const tone: Record<string, string> = {
    note: 'border-fg/20 bg-fg/[0.04]',
    tip: 'border-[light-dark(#4f6b3a,#a7c48f)]/40 bg-[light-dark(#4f6b3a,#a7c48f)]/[0.08]',
    important: 'border-accent/40 bg-accent/[0.06]',
    warning: 'border-amber-500/50 bg-amber-400/[0.09]',
    danger: 'border-red-600/50 bg-red-500/[0.08]',
    success: 'border-emerald-600/40 bg-emerald-500/[0.08]',
    quote: 'border-fg/15 bg-transparent italic',
  };
  return (
    <aside
      role="note"
      className={cn(
        'not-prose my-8 flex gap-4 rounded-xl border p-5 text-[0.98em]',
        tone[type.value],
      )}
    >
      <span className="text-xl leading-none" aria-hidden>
        {type.emoji}
      </span>
      <div className="min-w-0 flex-1 space-y-2 [&_p+p]:mt-2">
        {title ? (
          <p className="font-semibold">{title}</p>
        ) : (
          <span className="sr-only">{type.label}</span>
        )}
        {children}
      </div>
    </aside>
  );
}

export function Gallery({
  images,
  layout,
  columns,
  width,
  caption,
}: {
  images: Media[];
  layout?: string | null;
  columns?: string | null;
  width?: string | null;
  caption?: string | null;
}) {
  const list = images.filter((m) => m?.url);
  const lb = list.map((m) => toLightbox(m));
  const cols =
    columns === '2'
      ? 'sm:grid-cols-2'
      : columns === '4'
        ? 'sm:grid-cols-2 lg:grid-cols-4'
        : 'sm:grid-cols-2 lg:grid-cols-3';
  const img = (m: Media, i: number, cls?: string) => (
    <Lightbox
      images={lb}
      index={i}
      key={m.id}
      className={cn(
        'block w-full cursor-zoom-in overflow-hidden rounded-lg',
        cls,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={m.sizes?.card?.url || m.url || ''}
        alt={m.alt ?? ''}
        width={m.width ?? undefined}
        height={m.height ?? undefined}
        loading="lazy"
        decoding="async"
        className={cn(
          'h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]',
          layout === 'masonry' && 'h-auto',
        )}
        style={{
          background: m.blurDataURL
            ? `center/cover url(${m.blurDataURL})`
            : undefined,
        }}
      />
    </Lightbox>
  );
  return (
    <figure className={cn('not-prose my-10', widthClass(width))}>
      {layout === 'carousel' ? (
        <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3">
          {list.map((m, i) => (
            <div key={m.id} className="w-[80%] shrink-0 snap-center sm:w-[55%]">
              {img(m, i, 'aspect-[4/3]')}
            </div>
          ))}
        </div>
      ) : layout === 'masonry' ? (
        <div
          className={cn(
            'columns-1 gap-3 [&>*]:mb-3',
            columns === '2'
              ? 'sm:columns-2'
              : columns === '4'
                ? 'sm:columns-2 lg:columns-4'
                : 'sm:columns-2 lg:columns-3',
          )}
        >
          {list.map((m, i) => img(m, i))}
        </div>
      ) : layout === 'row' ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          {list.map((m, i) => (
            <div
              key={m.id}
              className="min-w-0 sm:flex-1"
              style={{ flexGrow: m.width && m.height ? m.width / m.height : 1 }}
            >
              {img(m, i)}
            </div>
          ))}
        </div>
      ) : (
        <div className={cn('grid grid-cols-1 gap-3', cols)}>
          {list.map((m, i) => img(m, i, 'aspect-square'))}
        </div>
      )}
      {caption && <figcaption className="caption">{caption}</figcaption>}
    </figure>
  );
}

export function Bookmark({
  url,
  title,
  description,
  image,
  siteName,
}: {
  url: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  siteName?: string | null;
}) {
  let host = url;
  try {
    host = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    /* keep raw */
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="no-prose not-prose group my-8 flex overflow-hidden rounded-xl border border-line transition-colors hover:border-fg/40"
    >
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-4 md:p-5">
        <div>
          <p className="line-clamp-2 font-medium leading-snug group-hover:text-accent">
            {title || url}
          </p>
          {description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted">
              {description}
            </p>
          )}
        </div>
        <p className="truncate text-xs text-faint">↗ {siteName || host}</p>
      </div>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          loading="lazy"
          className="hidden w-44 shrink-0 object-cover sm:block md:w-56"
        />
      )}
    </a>
  );
}

export function Embed({
  url,
  aspect,
  caption,
}: {
  url: string;
  aspect?: string | null;
  caption?: string | null;
}) {
  const info = resolveEmbed(url);
  if (!info) return <Bookmark url={url} title={caption} />;
  const ratio = aspect && aspect !== 'auto' ? aspect : info.aspect;
  return (
    <figure className="not-prose my-10">
      <div
        className={cn(
          'overflow-hidden rounded-xl bg-fg/5',
          ratio === '9/16' && 'mx-auto max-w-sm',
        )}
        style={ratio ? { aspectRatio: ratio } : { height: info.height }}
      >
        <iframe
          src={info.src}
          title={caption || info.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="h-full w-full border-0"
        />
      </div>
      {caption && <figcaption className="caption">{caption}</figcaption>}
    </figure>
  );
}

export function PullQuote({
  text,
  attribution,
  source,
  style,
}: {
  text: string;
  attribution?: string | null;
  source?: string | null;
  style?: string | null;
}) {
  const giant = style === 'giant';
  return (
    <figure
      className={cn(
        'not-prose my-12',
        giant ? 'w-wide' : 'border-y border-line py-8',
      )}
    >
      <blockquote
        className={cn(
          'text-balance',
          giant
            ? 'display text-[clamp(2.4rem,7vw,5.5rem)] text-fg'
            : 'text-[1.6em] font-medium leading-[1.2] tracking-[-0.02em] before:mr-1 before:text-accent before:content-["“"] after:text-accent after:content-["”"]',
        )}
      >
        {text}
      </blockquote>
      {attribution && (
        <figcaption className="mt-4 text-sm text-muted">
          —{' '}
          {source ? (
            <a
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-accent underline-offset-4"
            >
              {attribution}
            </a>
          ) : (
            attribution
          )}
        </figcaption>
      )}
    </figure>
  );
}

export function Verse({
  title,
  text,
  attribution,
  align,
}: {
  title?: string | null;
  text: string;
  attribution?: string | null;
  align?: string | null;
}) {
  return (
    <figure
      className={cn('not-prose my-10', align === 'center' && 'text-center')}
    >
      {title && (
        <p className="mb-4 text-lg font-medium uppercase tracking-[0.06em]">
          {title}
        </p>
      )}
      <div
        className={cn(
          'inline-block whitespace-pre-wrap text-[1.08em] italic leading-[1.85]',
          align === 'center' ? '' : 'border-l-2 border-accent/50 pl-6',
        )}
      >
        {text}
      </div>
      {attribution && (
        <figcaption className="mt-3 text-sm text-muted">
          — {attribution}
        </figcaption>
      )}
    </figure>
  );
}

export function MathBlock({
  latex,
  caption,
}: {
  latex: string;
  caption?: string | null;
}) {
  const html = katex.renderToString(latex, {
    displayMode: true,
    throwOnError: false,
    output: 'htmlAndMathml',
  });
  return (
    <figure className="not-prose my-8">
      {/* KaTeX output is generated from the author's LaTeX on the server. */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {caption && <figcaption className="caption">{caption}</figcaption>}
    </figure>
  );
}

export function InlineMath({ latex }: { latex: string }) {
  const html = katex.renderToString(latex, {
    displayMode: false,
    throwOnError: false,
    output: 'htmlAndMathml',
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Details({
  summary,
  open,
  children,
}: {
  summary: string;
  open?: boolean | null;
  children?: React.ReactNode;
}) {
  return (
    <details
      open={open ?? undefined}
      className="group not-prose my-6 rounded-xl border border-line px-5 [&[open]]:pb-5"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
        {summary}
        <span
          className="text-xl text-muted transition-transform group-open:rotate-45"
          aria-hidden
        >
          +
        </span>
      </summary>
      <div className="space-y-3 text-[0.98em] text-fg/90">{children}</div>
    </details>
  );
}

export function ButtonBlock({
  label,
  url,
  style,
  newTab,
}: {
  label: string;
  url: string;
  style?: string | null;
  newTab?: boolean | null;
}) {
  return (
    <p className="not-prose my-8">
      <ButtonLink
        href={url}
        variant={(style as 'primary' | 'outline' | 'link') ?? 'primary'}
        external={newTab ?? undefined}
      >
        {label}
      </ButtonLink>
    </p>
  );
}

export function MediaPlayer({
  file,
  url,
  caption,
  loop,
  muted,
}: {
  file?: Media | null;
  url?: string | null;
  caption?: string | null;
  loop?: boolean | null;
  muted?: boolean | null;
}) {
  const src = file?.url || url;
  if (!src) return null;
  const isAudio =
    file?.mimeType?.startsWith('audio/') ||
    /\.(mp3|m4a|wav|ogg|aac|flac)(\?|$)/i.test(src);
  return (
    <figure className="not-prose my-8">
      {isAudio ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption -- uploaded media has no caption files
        <audio
          controls
          src={src}
          loop={loop ?? false}
          className="w-full"
          preload="metadata"
        />
      ) : (
        // eslint-disable-next-line jsx-a11y/media-has-caption -- uploaded media has no caption files
        <video
          controls
          playsInline
          src={src}
          loop={loop ?? false}
          muted={muted ?? false}
          preload="metadata"
          className="w-full rounded-xl bg-night"
        />
      )}
      {caption && <figcaption className="caption">{caption}</figcaption>}
    </figure>
  );
}

export function Kbd({ keys }: { keys: string }) {
  const parts = keys
    .split('+')
    .map((k) => k.trim())
    .filter(Boolean);
  return (
    <span className="whitespace-nowrap">
      {parts.map((k, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-0.5 text-faint">+</span>}
          <kbd>{k}</kbd>
        </span>
      ))}
    </span>
  );
}

export function FootnoteRef({
  number,
  note,
}: {
  number: number;
  note: string;
}) {
  return (
    <sup className="fn-ref group relative" id={`fnref-${number}`}>
      <a href={`#fn-${number}`} aria-describedby="footnotes-label">
        {number}
      </a>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-72 -translate-x-1/2 rounded-lg border border-line bg-canvas p-3 text-left text-[0.8rem] font-normal leading-snug text-fg shadow-xl group-hover:block"
      >
        {note}
      </span>
    </sup>
  );
}

export function FootnoteList({
  notes,
}: {
  notes: { number: number; note: string }[];
}) {
  if (!notes.length) return null;
  return (
    <section
      className="not-prose mt-14 border-t border-line pt-6 text-[0.9rem] text-muted"
      aria-labelledby="footnotes-label"
    >
      <h2 id="footnotes-label" className="eyebrow mb-3 text-faint">
        Notes
      </h2>
      <ol className="space-y-2">
        {notes.map((n) => (
          <li
            key={n.number}
            id={`fn-${n.number}`}
            className="flex gap-3 scroll-mt-28"
          >
            <span className="w-5 shrink-0 tabular-nums text-accent">
              {n.number}.
            </span>
            <span className="min-w-0 [&_a]:underline [&_a]:decoration-accent [&_a]:underline-offset-2">
              {linkify(n.note)}{' '}
              <a
                href={`#fnref-${n.number}`}
                aria-label={`Back to reference ${n.number}`}
                className="!no-underline"
              >
                ↩
              </a>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
