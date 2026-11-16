import { BlogIndex } from '@/components/views/BlogIndex';
import { buildMetadata } from '@/lib/metadata';

export const revalidate = 3600;

export const generateMetadata = () =>
  buildMetadata({
    title: 'Blog',
    description: 'Essays, notes and long-form writing.',
    path: '/blog',
    kind: 'Blog',
  });

export default function BlogPage() {
  return <BlogIndex />;
}
