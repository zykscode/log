'use client';

import Giscus from '@giscus/react';
import { useTheme } from 'next-themes';

export type GiscusConfig = {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
};

/** Free comments via GitHub Discussions (configure in Site settings → Reading). */
export function Comments({ config }: { config: GiscusConfig }) {
  const { resolvedTheme } = useTheme();
  return (
    <section aria-label="Comments" className="mt-4">
      <Giscus
        repo={config.repo as `${string}/${string}`}
        repoId={config.repoId}
        category={config.category}
        categoryId={config.categoryId}
        mapping="pathname"
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={resolvedTheme === 'dark' ? 'transparent_dark' : 'light'}
        lang="en"
        loading="lazy"
      />
    </section>
  );
}
