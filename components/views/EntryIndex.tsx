import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EntryRow } from '@/components/content/EntryCards';
import { Heatmap } from '@/components/content/Heatmap';
import { PageHeader } from '@/components/ui/PageHeader';
import { Container, EmptyState, Pagination } from '@/components/ui/Primitives';
import { moodOf } from '@/lib/constants';
import {
  type EntryType,
  getEntries,
  getEntryCalendar,
  getOnThisDay,
  getSettings,
} from '@/lib/queries';
import { docPath } from '@/lib/urls';
import { formatDate, plural } from '@/lib/utils';
import { getViewer } from '@/lib/viewer';
import type { Journal } from '@/payload-types';

const COPY: Record<
  EntryType,
  { title: string; description: string; empty: string }
> = {
  journal: {
    title: 'Journal',
    description:
      'A public notebook — short dated entries, thoughts in progress, things I noticed.',
    empty: 'No journal entries yet.',
  },
  diary: {
    title: 'Diary',
    description:
      'Day-to-day entries. Most stay private; the ones here I chose to share.',
    empty: 'Nothing shared from the diary yet.',
  },
};

function groupByMonth(entries: Journal[]) {
  const groups: { key: string; label: string; items: Journal[] }[] = [];
  for (const e of entries) {
    const key = (e.publishedAt ?? e.createdAt).slice(0, 7);
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = {
        key,
        label: formatDate(e.publishedAt ?? e.createdAt, 'month'),
        items: [],
      };
      groups.push(g);
    }
    g.items.push(e);
  }
  return groups;
}

export async function EntryIndex({
  type,
  page = 1,
}: {
  type: EntryType;
  page?: number;
}) {
  const viewer = await getViewer();
  const settings = await getSettings();
  const [entries, calendar, onThisDay] = await Promise.all([
    getEntries(viewer, { type, page, limit: settings.entriesPerPage ?? 20 }),
    page === 1 ? getEntryCalendar(viewer, type) : Promise.resolve(null),
    page === 1 ? getOnThisDay(viewer) : Promise.resolve([]),
  ]);
  if (page > 1 && page > entries.totalPages) notFound();
  const copy = COPY[type];
  const base = `/${type}`;
  const memories = onThisDay.filter((e) => e.type === type);

  return (
    <>
      <PageHeader
        title={copy.title}
        kicker={plural(entries.totalDocs, 'entry', 'entries')}
        description={copy.description}
        aside={
          <div className="flex flex-wrap gap-4 text-sm">
            <Link
              href={type === 'journal' ? '/diary' : '/journal'}
              className="text-muted hover:text-fg"
            >
              {type === 'journal' ? 'Diary →' : 'Journal →'}
            </Link>
            <a href="/journal/feed.xml" className="text-muted hover:text-fg">
              ◉ RSS
            </a>
            {viewer.isAuthor && (
              // eslint-disable-next-line @next/next/no-html-link-for-pages -- the admin is a separate app (full page load)
              <a
                href="/admin/collections/journal/create"
                className="text-accent hover:underline"
              >
                + New entry
              </a>
            )}
          </div>
        }
      />
      <Container size="wide" className="pb-24">
        {calendar && Object.keys(calendar).length > 0 && (
          <section
            aria-label="Writing calendar"
            className="mb-14 rounded-2xl border border-line p-5 md:p-7"
          >
            <Heatmap
              days={calendar}
              label={type === 'diary' ? 'diary entries' : 'entries'}
            />
          </section>
        )}
        {memories.length > 0 && (
          <section aria-label="On this day" className="mb-14">
            <p className="eyebrow mb-3 text-accent">On this day</p>
            <ul className="flex flex-wrap gap-3">
              {memories.map((m) => (
                <li key={m.id}>
                  <Link
                    href={docPath('journal', m)}
                    className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:border-fg"
                  >
                    <span className="text-muted">
                      {(m.publishedAt ?? '').slice(0, 4)}
                    </span>
                    {moodOf(m.mood)?.emoji} {m.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {entries.docs.length === 0 && (
          <EmptyState title={copy.empty}>Check back soon.</EmptyState>
        )}
        {groupByMonth(entries.docs).map((g) => (
          <section key={g.key} className="mb-10">
            <h2 className="eyebrow mb-1 text-faint">{g.label}</h2>
            <div className="border-b border-line">
              {g.items.map((e) => (
                <EntryRow key={e.id} entry={e} />
              ))}
            </div>
          </section>
        ))}
        <Pagination page={page} totalPages={entries.totalPages} base={base} />
      </Container>
    </>
  );
}
