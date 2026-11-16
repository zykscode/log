import { ProjectCard } from '@/components/content/ProjectCard';
import { WorkFilter } from '@/components/content/WorkFilter';
import { PageHeader } from '@/components/ui/PageHeader';
import { Container, EmptyState } from '@/components/ui/Primitives';
import { DISCIPLINES } from '@/lib/constants';
import { buildMetadata } from '@/lib/metadata';
import { getProjects } from '@/lib/queries';
import { plural } from '@/lib/utils';
import { getViewer } from '@/lib/viewer';

export const revalidate = 3600;

export const generateMetadata = () =>
  buildMetadata({
    title: 'Work',
    description: 'Selected projects and case studies.',
    path: '/work',
    kind: 'Work',
  });

export default async function WorkPage() {
  const viewer = await getViewer();
  const projects = await getProjects(viewer);
  const counts = new Map<string, number>();
  for (const p of projects)
    for (const d of p.disciplines ?? [])
      counts.set(d, (counts.get(d) ?? 0) + 1);
  const options = DISCIPLINES.filter((d) => counts.has(d.value)).map((d) => ({
    ...d,
    count: counts.get(d.value) ?? 0,
  }));

  return (
    <>
      <PageHeader
        title="Work"
        kicker={plural(projects.length, 'project')}
        description="Selected projects, experiments and case studies — what I made, why, and what happened."
      />
      <Container size="wide" className="pb-24">
        {projects.length ? (
          <WorkFilter options={options}>
            {projects.map((p, i) => (
              <ProjectCard key={p.id} project={p} priority={i < 2} />
            ))}
          </WorkFilter>
        ) : (
          <EmptyState title="Projects coming soon" />
        )}
      </Container>
    </>
  );
}
