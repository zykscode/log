import { notFound } from 'next/navigation';

import { BlogIndex } from '@/components/views/BlogIndex';
import { buildMetadata } from '@/lib/metadata';
import { getAllCategories, getCategory } from '@/lib/queries';

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getAllCategories())
    .filter((c) => c.slug)
    .map((c) => ({ slug: c.slug as string }));
}

export async function generateMetadata({ params }: Props) {
  const category = await getCategory((await params).slug);
  if (!category) return {};
  return buildMetadata({
    title: category.title,
    description: category.description,
    path: `/blog/category/${category.slug}`,
    kind: 'Category',
  });
}

export default async function CategoryPage({ params }: Props) {
  const category = await getCategory((await params).slug);
  if (!category) notFound();
  return <BlogIndex category={category} />;
}
