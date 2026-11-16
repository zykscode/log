import { entryMetadata, EntryView } from '@/components/views/EntryView';
import { getPublicSlugs } from '@/lib/queries';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPublicSlugs('journal', { type: { equals: 'diary' } })).map(
    ({ slug }) => ({ slug }),
  );
}

export async function generateMetadata({ params }: Props) {
  return entryMetadata('diary', (await params).slug);
}

export default async function DiaryEntryPage({ params }: Props) {
  return <EntryView type="diary" slug={(await params).slug} />;
}
