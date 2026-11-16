import Link from 'next/link';

import { StatusBadges } from '@/components/ui/Primitives';
import { moodOf, weatherOf } from '@/lib/constants';
import { fallbackExcerpt } from '@/lib/queries';
import { docPath } from '@/lib/urls';
import { cn, dateParts, formatDate } from '@/lib/utils';
import type { Journal } from '@/payload-types';

/** Journal/diary row with a calendar-style date block. */
export function EntryRow({
  entry,
  showType = false,
}: {
  entry: Journal;
  showType?: boolean;
}) {
  const d = entry.publishedAt ? dateParts(entry.publishedAt) : null;
  const mood = moodOf(entry.mood);
  const weather = weatherOf(entry.weather);
  const isDateTitle =
    entry.title &&
    d &&
    entry.title.includes(d.year) &&
    entry.title.includes(d.monthLong);
  return (
    <article className="group relative grid grid-cols-[4.5rem_1fr] gap-5 border-t border-line py-6 md:grid-cols-[6rem_1fr_auto] md:gap-8">
      {d && (
        <div className="text-center leading-none">
          <div className="display text-[3.2rem] md:text-[4.2rem]">{d.day}</div>
          <div className="eyebrow mt-1 text-[0.65rem] text-muted">
            {d.month} {d.year}
          </div>
        </div>
      )}
      <div className="min-w-0 self-center">
        <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
          {showType && (
            <span className="eyebrow text-[0.62rem] text-accent">
              {entry.type}
            </span>
          )}
          {d && <span>{d.weekday}</span>}
          {entry.location && <span>· {entry.location}</span>}
          <StatusBadges
            status={entry._status}
            visibility={entry.visibility}
            publishedAt={entry.publishedAt}
          />
        </div>
        <h3 className="text-xl font-medium leading-snug tracking-[-0.015em] md:text-2xl">
          <Link
            href={docPath('journal', entry)}
            className="after:absolute after:inset-0 group-hover:text-accent"
          >
            {isDateTitle
              ? fallbackExcerpt(entry).slice(0, 90) || entry.title
              : entry.title}
          </Link>
        </h3>
        {!isDateTitle && (
          <p className="mt-1.5 line-clamp-2 text-muted">
            {fallbackExcerpt(entry)}
          </p>
        )}
      </div>
      <div
        className="col-start-2 flex items-center gap-2 text-xl md:col-start-auto"
        aria-label={[mood?.label, weather?.label].filter(Boolean).join(', ')}
      >
        {mood && <span title={mood.label}>{mood.emoji}</span>}
        {weather && <span title={weather.label}>{weather.emoji}</span>}
      </div>
    </article>
  );
}

/** Small card for home/feeds. */
export function EntryCard({
  entry,
  className,
}: {
  entry: Journal;
  className?: string;
}) {
  const mood = moodOf(entry.mood);
  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-2xl border border-line p-5 transition-colors hover:border-fg/40',
        className,
      )}
    >
      <div className="mb-6 flex items-center justify-between text-xs text-muted">
        <span className="eyebrow text-[0.62rem] text-accent">{entry.type}</span>
        <time dateTime={entry.publishedAt ?? undefined}>
          {formatDate(entry.publishedAt, 'short')}
        </time>
      </div>
      <h3 className="text-lg font-medium leading-snug">
        <Link
          href={docPath('journal', entry)}
          className="after:absolute after:inset-0"
        >
          {mood && <span className="mr-1.5">{mood.emoji}</span>}
          {entry.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted">
        {fallbackExcerpt(entry)}
      </p>
    </article>
  );
}
