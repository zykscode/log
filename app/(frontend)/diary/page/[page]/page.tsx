import { notFound, redirect } from 'next/navigation';

import { EntryIndex } from '@/components/views/EntryIndex';
import { buildMetadata } from '@/lib/metadata';

export const revalidate = 3600;

type Props = { params: Promise<{ page: string }> };

export async function generateMetadata({ params }: Props) {
  const { page } = await params;
  return buildMetadata({
    title: `Diary — page ${page}`,
    path: `/diary/page/${page}`,
    kind: 'Diary',
  });
}

export default async function DiaryPaged({ params }: Props) {
  const n = Number((await params).page);
  if (!Number.isInteger(n) || n < 1) notFound();
  if (n === 1) redirect('/diary');
  return <EntryIndex type="diary" page={n} />;
}
