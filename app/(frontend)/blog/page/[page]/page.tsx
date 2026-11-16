import { notFound, redirect } from 'next/navigation';

import { BlogIndex } from '@/components/views/BlogIndex';
import { buildMetadata } from '@/lib/metadata';

export const revalidate = 3600;

type Props = { params: Promise<{ page: string }> };

export async function generateMetadata({ params }: Props) {
  const { page } = await params;
  return buildMetadata({
    title: `Blog — page ${page}`,
    path: `/blog/page/${page}`,
    kind: 'Blog',
  });
}

export default async function BlogPaged({ params }: Props) {
  const n = Number((await params).page);
  if (!Number.isInteger(n) || n < 1) notFound();
  if (n === 1) redirect('/blog');
  return <BlogIndex page={n} />;
}
