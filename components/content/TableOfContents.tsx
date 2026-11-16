'use client';

import { useEffect, useState } from 'react';

import type { TocHeading } from '@/lib/lexical';
import { cn } from '@/lib/utils';

/** Sticky "On this page" list that highlights the section you're reading. */
export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((e): e is HTMLElement => Boolean(e));
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-15% 0px -70% 0px' },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;
  return (
    <nav aria-label="Table of contents" className="text-sm">
      <p className="eyebrow mb-3 text-faint">On this page</p>
      <ol className="space-y-2 border-l border-line">
        {headings.map((h) => (
          <li
            key={h.id}
            style={{ paddingLeft: `${(h.level - 2) * 0.9 + 1}rem` }}
          >
            <a
              href={`#${h.id}`}
              className={cn(
                '-ml-px block border-l py-0.5 pl-3 leading-snug transition-colors',
                active === h.id
                  ? 'border-accent text-fg'
                  : 'border-transparent text-muted hover:text-fg',
              )}
              style={{ marginLeft: `-${(h.level - 2) * 0.9 + 1}rem` }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
