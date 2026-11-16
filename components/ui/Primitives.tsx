import Link from 'next/link';

import { cn } from '@/lib/utils';
import type { Tag } from '@/payload-types';

export function Container({
  children,
  className,
  size = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  size?: 'narrow' | 'default' | 'wide' | 'full';
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-5 md:px-10',
        size === 'narrow' && 'max-w-3xl',
        size === 'default' && 'max-w-6xl',
        size === 'wide' && 'max-w-[90rem]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  className,
  external,
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'link';
  className?: string;
  external?: boolean;
}) {
  const ext = external ?? /^https?:\/\//.test(href);
  const cls = cn(
    'no-prose group inline-flex items-center gap-2 text-[0.95rem] font-medium transition-colors',
    variant === 'primary' &&
      'rounded-full bg-fg px-5 py-2.5 text-canvas hover:bg-accent hover:text-accent-fg',
    variant === 'outline' &&
      'rounded-full border border-fg/30 px-5 py-2.5 hover:border-fg hover:bg-fg hover:text-canvas',
    variant === 'link' && 'text-fg hover:text-accent',
    className,
  );
  const arrow = (
    <span className="transition-transform group-hover:translate-x-1">
      {ext ? '↗' : '→'}
    </span>
  );
  return ext ? (
    <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
      {children}
      {arrow}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
      {arrow}
    </Link>
  );
}

export function TagList({
  tags,
  className,
}: {
  tags?: (number | Tag)[] | null;
  className?: string;
}) {
  const list = (tags ?? []).filter(
    (t): t is Tag => typeof t === 'object' && t !== null,
  );
  if (!list.length) return null;
  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {list.map((t) => (
        <li key={t.id}>
          <Link
            href={`/tags/${t.slug}`}
            className="inline-block rounded-full border border-line px-3 py-1 text-xs uppercase tracking-wider text-muted transition-colors hover:border-fg hover:text-fg"
          >
            #{t.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Badge({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'accent' | 'warn';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.68rem] font-medium uppercase tracking-wider',
        tone === 'default' && 'bg-fg/10 text-fg',
        tone === 'accent' && 'bg-accent text-accent-fg',
        tone === 'warn' && 'bg-amber-400/90 text-ink',
      )}
    >
      {children}
    </span>
  );
}

/** Draft / private / scheduled markers — only ever visible in author mode. */
export function StatusBadges({
  status,
  visibility,
  publishedAt,
}: {
  status?: string | null;
  visibility?: string | null;
  publishedAt?: string | null;
}) {
  const scheduled = publishedAt && new Date(publishedAt) > new Date();
  if (status !== 'draft' && visibility === 'public' && !scheduled) return null;
  return (
    <span className="inline-flex flex-wrap gap-1.5">
      {status === 'draft' && <Badge tone="warn">Draft</Badge>}
      {scheduled && <Badge tone="warn">Scheduled</Badge>}
      {visibility === 'private' && <Badge tone="accent">🔒 Private</Badge>}
      {visibility === 'unlisted' && <Badge>Unlisted</Badge>}
    </span>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center">
      <p className="text-2xl font-medium">{title}</p>
      {children && <div className="mt-2 text-muted">{children}</div>}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  base,
}: {
  page: number;
  totalPages: number;
  base: string;
}) {
  if (totalPages <= 1) return null;
  const href = (p: number) => (p === 1 ? base : `${base}/page/${p}`);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );
  return (
    <nav
      aria-label="Pagination"
      className="mt-14 flex items-center justify-between gap-4 border-t border-line pt-6"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} className="group text-sm">
          <span className="inline-block transition-transform group-hover:-translate-x-1">
            ←
          </span>{' '}
          Newer
        </Link>
      ) : (
        <span />
      )}
      <ol className="flex items-center gap-1 text-sm">
        {pages.map((p, i) => (
          <li key={p} className="flex items-center gap-1">
            {i > 0 && pages[i - 1] !== p - 1 && (
              <span className="px-1 text-faint">…</span>
            )}
            <Link
              href={href(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cn(
                'inline-flex size-9 items-center justify-center rounded-full',
                p === page ? 'bg-fg text-canvas' : 'hover:bg-fg/10',
              )}
            >
              {p}
            </Link>
          </li>
        ))}
      </ol>
      {page < totalPages ? (
        <Link href={href(page + 1)} className="group text-sm">
          Older{' '}
          <span className="inline-block transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
