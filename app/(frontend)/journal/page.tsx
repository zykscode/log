import { EntryIndex } from '@/components/views/EntryIndex';
import { buildMetadata } from '@/lib/metadata';

export const revalidate = 3600;

export const generateMetadata = () =>
  buildMetadata({ title: 'Journal', path: '/journal', kind: 'Journal' });

export default function JournalPage() {
  return <EntryIndex type="journal" />;
}
