import { notFound, redirect } from 'next/navigation';

import { EntryIndex } from '@/components/views/EntryIndex';
import { buildMetadata } from '@/lib/metadata';

export const revalidate = 3600;

type Props = { params: Promise<{ page: string }> };

export async function generateMetadata({ params }: Props) {
  const { page } = await params;
  return buildMetadata({
    title: `Journal — page ${page}`,
    path: `/journal/page/${page}`,
    kind: 'Journal',
  });
}

export default async function JournalPaged({ params }: Props) {
  const n = Number((await params).page);
  if (!Number.isInteger(n) || n < 1) notFound();
  if (n === 1) redirect('/journal');
  return <EntryIndex type="journal" page={n} />;
}
