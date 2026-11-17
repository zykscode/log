import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';

import { PrevNext } from '@/components/content/Navigation';
import { RichText } from '@/components/rich-text/RichText';
import { EditLink } from '@/components/site/AuthorBar';
import { SaveOffline } from '@/components/site/Pwa';
import { MediaImage } from '@/components/ui/MediaImage';
import { StatusBadges, TagList } from '@/components/ui/Primitives';
import { moodOf, weatherOf } from '@/lib/constants';
import { breadcrumbsLd, entryLd, JsonLd } from '@/lib/jsonld';
import { buildMetadata } from '@/lib/metadata';
import {
  type EntryType,
  fallbackExcerpt,
  getEntry,
  getEntryNeighbours,
  getRedirectFor,
  getSettings,
} from '@/lib/queries';
import { dateParts } from '@/lib/utils';
import { getViewer } from '@/lib/viewer';
import type { Media } from '@/payload-types';

export async function entryMetadata(
  type: EntryType,
  slug: string,
): Promise<Metadata> {
  const entry = await getEntry(slug, type, await getViewer());
  if (!entry) return {};
  return buildMetadata({
    title: entry.title ?? undefined,
    description: fallbackExcerpt(entry),
    path: `/${type}/${entry.slug}`,
    meta: entry.meta,
    image: entry.coverImage as Media,
    kind: type === 'diary' ? 'Diary' : 'Journal',
    type: 'article',
    publishedTime: entry.publishedAt,
    noindex: entry.visibility !== 'public',
    section: type === 'diary' ? 'Diary' : 'Journal',
    tags: (entry.tags ?? []).flatMap((t) =>
      typeof t === 'object' && t ? [t.title] : [],
    ),
  });
}

/** A single journal or diary entry. */
export async function EntryView({
  type,
  slug,
}: {
  type: EntryType;
  slug: string;
}) {
  const viewer = await getViewer();
  const entry = await getEntry(slug, type, viewer);
  if (!entry) {
    const to = await getRedirectFor(`/${type}/${slug}`);
    if (to) permanentRedirect(to);
    notFound();
  }
  const { previous, next } = await getEntryNeighbours(entry, viewer);
  const d = entry.publishedAt ? dateParts(entry.publishedAt) : null;
  const mood = moodOf(entry.mood);
  const weather = weatherOf(entry.weather);
  const isDateTitle = Boolean(
    d && entry.title?.includes(d.monthLong) && entry.title?.includes(d.year),
  );
  const context = [
    entry.listeningTo && {
      icon: '🎧',
      label: 'Listening to',
      value: entry.listeningTo,
    },
    entry.reading && { icon: '📖', label: 'Reading', value: entry.reading },
    entry.watching && { icon: '🎬', label: 'Watching', value: entry.watching },
  ].filter(Boolean) as { icon: string; label: string; value: string }[];

  const settings = await getSettings();
  const section = type === 'diary' ? 'Diary' : 'Journal';
  return (
    <article className="pb-24">
      <JsonLd
        data={[
          entryLd(entry, settings),
          breadcrumbsLd([
            { name: section, path: `/${type}` },
            { name: entry.title ?? section, path: `/${type}/${entry.slug}` },
          ]),
        ]}
      />
      <header className="px-5 pb-10 pt-10 md:px-10 md:pt-14">
        <div className="eyebrow mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted">
          <Link href={`/${type}`} className="hover:text-fg">
            ← {type === 'diary' ? 'Diary' : 'Journal'}
          </Link>
          {d && <span>{d.weekday}</span>}
          <StatusBadges
            status={entry._status}
            visibility={entry.visibility}
            publishedAt={entry.publishedAt}
          />
          <EditLink collection="journal" id={entry.id} />
        </div>
        {d && (
          <p
            className="display animate-fade-up text-[clamp(5rem,19vw,16rem)]"
            aria-hidden
          >
            {d.day} {d.month}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-muted">
          {d && <span className="text-lg text-fg">{d.year}</span>}
          {entry.location && <span>📍 {entry.location}</span>}
          {mood && (
            <span>
              {mood.emoji} {mood.label}
            </span>
          )}
          {weather && (
            <span>
              {weather.emoji} {weather.label}
            </span>
          )}
          {entry.readingTime && entry.wordCount ? (
            <span>{entry.wordCount} words</span>
          ) : null}
        </div>
        <h1
          className={
            isDateTitle
              ? 'sr-only'
              : 'mt-8 max-w-4xl text-[clamp(2rem,4.5vw,3.6rem)] font-medium leading-[1.05] tracking-[-0.035em] text-balance'
          }
        >
          {entry.title}
        </h1>
      </header>

      <div className="mx-auto max-w-[46rem] px-5 md:px-0">
        {entry.coverImage && typeof entry.coverImage === 'object' && (
          <MediaImage
            media={entry.coverImage as Media}
            priority
            sizes="(min-width: 768px) 46rem, 100vw"
            className="mb-10 rounded-2xl"
          />
        )}
        <RichText data={entry.content} />

        {entry.highlights?.length ? (
          <section className="mt-12 rounded-2xl bg-fg/[0.04] p-6">
            <h2 className="eyebrow mb-4 text-accent">Good things</h2>
            <ul className="space-y-2 text-lg">
              {entry.highlights.map((h, i) => (
                <li key={h.id ?? i} className="flex gap-3">
                  <span className="text-accent" aria-hidden>
                    ✳
                  </span>
                  {h.text}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {context.length > 0 && (
          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            {context.map((c) => (
              <div key={c.label} className="rounded-2xl border border-line p-4">
                <dt className="eyebrow text-[0.62rem] text-faint">
                  {c.icon} {c.label}
                </dt>
                <dd className="mt-1.5 leading-snug">{c.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-12 space-y-10">
          <TagList tags={entry.tags} />
          <SaveOffline />
          <PrevNext
            previous={previous}
            next={next}
            base={`/${type}`}
            labels={['Earlier', 'Later']}
          />
        </div>
      </div>
    </article>
  );
}
