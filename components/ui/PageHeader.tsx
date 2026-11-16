import { cn } from '@/lib/utils';

/**
 * The signature page title: giant, uppercase, tight — with an optional
 * kicker above and description/count beside it.
 */
export function PageHeader({
  title,
  kicker,
  description,
  aside,
  size = 'xl',
  className,
  children,
}: {
  title: string;
  kicker?: React.ReactNode;
  description?: React.ReactNode;
  aside?: React.ReactNode;
  size?: 'lg' | 'xl';
  className?: string;
  children?: React.ReactNode;
}) {
  const lines = title.split('|');
  return (
    <header
      className={cn('px-5 pb-10 pt-10 md:px-10 md:pb-14 md:pt-14', className)}
    >
      {kicker && <div className="eyebrow mb-5 text-accent">{kicker}</div>}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <h1
          className={cn(
            'display animate-fade-up break-words',
            size === 'xl'
              ? 'text-[clamp(3.6rem,13vw,11.5rem)]'
              : 'text-[clamp(2.8rem,8vw,7rem)]',
          )}
        >
          {lines.map((line, i) => (
            <span key={i} className="block">
              {line.trim()}
            </span>
          ))}
        </h1>
        {(description || aside) && (
          <div className="max-w-md animate-fade-up space-y-4 text-lg leading-relaxed text-muted [animation-delay:120ms] lg:pb-3">
            {description && <div className="text-balance">{description}</div>}
            {aside}
          </div>
        )}
      </div>
      {children}
    </header>
  );
}

export function SectionHeading({
  title,
  href,
  linkLabel = 'View all',
  className,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mb-6 flex items-end justify-between gap-4 border-b border-line pb-3',
        className,
      )}
    >
      <h2 className="text-2xl font-medium uppercase tracking-[-0.02em] md:text-3xl">
        {title}
      </h2>
      {href && (
        <a
          href={href}
          className="group shrink-0 text-sm text-muted hover:text-fg"
        >
          {linkLabel}{' '}
          <span className="inline-block transition-transform group-hover:translate-x-1">
            →
          </span>
        </a>
      )}
    </div>
  );
}
