import { EntryIndex } from '@/components/views/EntryIndex';
import { buildMetadata } from '@/lib/metadata';

export const revalidate = 3600;

export const generateMetadata = () =>
  buildMetadata({ title: 'Diary', path: '/diary', kind: 'Diary' });

export default function DiaryPage() {
  return <EntryIndex type="diary" />;
}
