import { entryMetadata, EntryView } from '@/components/views/EntryView';
import { getPublicSlugs } from '@/lib/queries';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPublicSlugs('journal', { type: { equals: 'journal' } })).map(
    ({ slug }) => ({ slug }),
  );
}

export async function generateMetadata({ params }: Props) {
  return entryMetadata('journal', (await params).slug);
}

export default async function JournalEntryPage({ params }: Props) {
  return <EntryView type="journal" slug={(await params).slug} />;
}
