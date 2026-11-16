import { MediaImage } from '@/components/ui/MediaImage';
import { PageHeader } from '@/components/ui/PageHeader';
import type { Media, Page } from '@/payload-types';

/** Top of a CMS page — giant title (signature), split with image, minimal, or none. */
export function PageHero({
  page,
  aside,
}: {
  page: Page;
  aside?: React.ReactNode;
}) {
  const hero = page.hero ?? {};
  const style = hero.style ?? 'giant';
  const title = hero.heading || page.title;
  if (style === 'none') return <div className="h-10" />;

  if (style === 'split') {
    return (
      <header className="grid items-end gap-10 px-5 pb-16 pt-10 md:px-10 md:pt-14 lg:grid-cols-[1.3fr_1fr]">
        <div>
          {hero.kicker && (
            <p className="eyebrow mb-5 text-accent">{hero.kicker}</p>
          )}
          <h1 className="display animate-fade-up text-[clamp(3.2rem,9vw,8.5rem)]">
            {title.split('|').map((l, i) => (
              <span key={i} className="block">
                {l.trim()}
              </span>
            ))}
          </h1>
          {hero.intro && (
            <p className="mt-8 max-w-xl whitespace-pre-line text-xl leading-relaxed text-muted">
              {hero.intro}
            </p>
          )}
          {aside}
        </div>
        {hero.media && typeof hero.media === 'object' && (
          <MediaImage
            media={hero.media as Media}
            aspect="4/5"
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="rounded-2xl"
          />
        )}
      </header>
    );
  }

  if (style === 'minimal') {
    return (
      <header className="px-5 pb-10 pt-12 md:px-10 md:pt-16">
        {hero.kicker && (
          <p className="eyebrow mb-4 text-accent">{hero.kicker}</p>
        )}
        <h1 className="max-w-4xl text-[clamp(2.4rem,5vw,4.2rem)] font-medium leading-[1.02] tracking-[-0.035em] text-balance">
          {title.replace(/\|/g, ' ')}
        </h1>
        {hero.intro && (
          <p className="mt-5 max-w-2xl whitespace-pre-line text-xl text-muted">
            {hero.intro}
          </p>
        )}
        {aside}
      </header>
    );
  }

  return (
    <PageHeader
      title={title}
      kicker={hero.kicker}
      description={
        hero.intro ? (
          <span className="whitespace-pre-line">{hero.intro}</span>
        ) : undefined
      }
      aside={aside}
    />
  );
}
