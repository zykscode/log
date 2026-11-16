'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { cn } from '@/lib/utils';

export type ArchiveRow = {
  key: string;
  kind: 'post' | 'journal' | 'diary' | 'project';
  title: string;
  href: string;
  date: string;
  dayLabel: string;
  meta?: string | null;
  isDraft?: boolean;
  isPrivate?: boolean;
};

const KINDS = [
  { value: 'all', label: 'Everything' },
  { value: 'post', label: 'Posts' },
  { value: 'journal', label: 'Journal' },
  { value: 'diary', label: 'Diary' },
  { value: 'project', label: 'Work' },
] as const;

/** Year → month timeline of everything, filterable by type. */
export function ArchiveTimeline({ rows }: { rows: ArchiveRow[] }) {
  const [kind, setKind] = useState<(typeof KINDS)[number]['value']>('all');
  const filtered = useMemo(
    () => (kind === 'all' ? rows : rows.filter((r) => r.kind === kind)),
    [rows, kind],
  );
  const years = useMemo(() => {
    const map = new Map<string, Map<string, ArchiveRow[]>>();
    for (const r of filtered) {
      const y = r.date.slice(0, 4);
      const m = r.date.slice(0, 7);
      if (!map.has(y)) map.set(y, new Map());
      const months = map.get(y)!;
      if (!months.has(m)) months.set(m, []);
      months.get(m)!.push(r);
    }
    return [...map.entries()];
  }, [filtered]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) c[r.kind] = (c[r.kind] ?? 0) + 1;
    return c;
  }, [rows]);

  const monthName = (ym: string) =>
    new Date(`${ym}-15T12:00:00Z`).toLocaleDateString('en-GB', {
      month: 'long',
      timeZone: 'UTC',
    });

  return (
    <div className="grid gap-10 lg:grid-cols-[12rem_1fr]">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div
          className="flex flex-wrap gap-2 lg:flex-col lg:items-start"
          role="tablist"
          aria-label="Filter archive"
        >
          {KINDS.map((k) => (
            <button
              key={k.value}
              role="tab"
              aria-selected={kind === k.value}
              onClick={() => setKind(k.value)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm transition-colors',
                kind === k.value
                  ? 'bg-fg text-canvas'
                  : 'text-muted hover:bg-fg/10 hover:text-fg',
              )}
            >
              {k.label}{' '}
              <span className="ml-1 text-xs opacity-60">
                {counts[k.value] ?? 0}
              </span>
            </button>
          ))}
        </div>
        <nav aria-label="Years" className="mt-8 hidden lg:block">
          <ul className="space-y-1 text-sm">
            {years.map(([y, months]) => (
              <li key={y}>
                <a
                  href={`#y${y}`}
                  className="flex justify-between text-muted hover:text-fg"
                >
                  <span>{y}</span>
                  <span className="text-faint">
                    {[...months.values()].reduce((n, l) => n + l.length, 0)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div>
        {years.length === 0 && <p className="text-muted">Nothing here yet.</p>}
        {years.map(([y, months]) => (
          <section key={y} id={`y${y}`} className="mb-16 scroll-mt-28">
            <h2 className="display mb-6 text-[clamp(3.5rem,9vw,7rem)] text-fg/90">
              {y}
            </h2>
            {[...months.entries()].map(([m, items]) => (
              <div key={m} className="mb-8 grid gap-4 md:grid-cols-[8rem_1fr]">
                <h3 className="eyebrow pt-4 text-faint">{monthName(m)}</h3>
                <ul>
                  {items.map((r) => (
                    <li
                      key={r.key}
                      className="group relative flex items-baseline gap-4 border-t border-line py-3"
                    >
                      <span className="w-14 shrink-0 text-sm tabular-nums text-faint">
                        {r.dayLabel}
                      </span>
                      <span className="min-w-0 flex-1">
                        <Link
                          href={r.href}
                          className="text-lg leading-snug after:absolute after:inset-0 group-hover:text-accent"
                        >
                          {r.isPrivate && <span title="Private">🔒 </span>}
                          {r.title}
                        </Link>
                        {r.isDraft && (
                          <span className="ml-2 text-xs uppercase text-amber-600">
                            draft
                          </span>
                        )}
                      </span>
                      <span className="eyebrow hidden shrink-0 text-[0.62rem] text-accent sm:inline">
                        {r.kind === 'project' ? 'work' : r.kind}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
