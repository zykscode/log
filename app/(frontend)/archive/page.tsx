import {
  type ArchiveRow,
  ArchiveTimeline,
} from '@/components/content/ArchiveTimeline';
import { PageHeader } from '@/components/ui/PageHeader';
import { Container } from '@/components/ui/Primitives';
import { buildMetadata } from '@/lib/metadata';
import { getArchive, getStats } from '@/lib/queries';
import { docPath } from '@/lib/urls';
import { formatDate, plural } from '@/lib/utils';
import { getViewer } from '@/lib/viewer';

export const revalidate = 3600;

export const generateMetadata = () =>
  buildMetadata({
    title: 'Archive',
    description: 'Everything, in order — posts, journal, diary and work.',
    path: '/archive',
    kind: 'Archive',
  });

export default async function ArchivePage() {
  const viewer = await getViewer();
  const [items, stats] = await Promise.all([
    getArchive(viewer),
    getStats(viewer),
  ]);
  const rows: ArchiveRow[] = items.map((i) => ({
    key: `${i.collection}-${i.id}`,
    kind: i.kind,
    title: i.title || formatDate(i.publishedAt),
    href: docPath(i.collection, {
      slug: i.slug,
      type: i.kind === 'diary' ? 'diary' : 'journal',
    }),
    date: i.publishedAt,
    dayLabel: formatDate(i.publishedAt, 'day'),
    meta: i.meta,
    isDraft: i.isDraft,
    isPrivate: i.isPrivate,
  }));
  const since = stats.since ? new Date(stats.since).getFullYear() : null;

  return (
    <>
      <PageHeader
        title="Archive"
        kicker={`${plural(rows.length, 'thing')}${since ? ` since ${since}` : ''}`}
        description={
          <>
            Every post, journal and diary entry and project, newest first.{' '}
            {stats.words > 0 && (
              <>About {stats.words.toLocaleString('en-GB')} words so far.</>
            )}
          </>
        }
      />
      <Container size="wide" className="pb-24">
        <ArchiveTimeline rows={rows} />
      </Container>
    </>
  );
}
