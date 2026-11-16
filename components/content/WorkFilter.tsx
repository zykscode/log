'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';

/**
 * Discipline filter chips for the work grid. Cards carry
 * data-disciplines="design development …"; non-matching ones are hidden.
 */
export function WorkFilter({
  options,
  children,
}: {
  options: { value: string; label: string; count: number }[];
  children: React.ReactNode;
}) {
  const [active, setActive] = useState('all');
  return (
    <div>
      {options.length > 1 && (
        <div
          className="mb-12 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filter by discipline"
        >
          {[{ value: 'all', label: 'All', count: 0 }, ...options].map((o) => (
            <button
              key={o.value}
              role="tab"
              aria-selected={active === o.value}
              onClick={() => setActive(o.value)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm transition-colors',
                active === o.value
                  ? 'bg-fg text-canvas'
                  : 'border border-line text-muted hover:border-fg hover:text-fg',
              )}
            >
              {o.label}
              {o.count ? (
                <span className="ml-1.5 text-xs opacity-60">{o.count}</span>
              ) : null}
            </button>
          ))}
        </div>
      )}
      <div
        data-filter={active}
        className="grid gap-x-8 gap-y-14 sm:grid-cols-2"
      >
        {children}
      </div>
      {active !== 'all' && (
        // values come from the fixed DISCIPLINES list; sanitised anyway
        <style>{`[data-filter="${active.replace(/[^a-z-]/g, '')}"] > article:not([data-disciplines~="${active.replace(/[^a-z-]/g, '')}"]) { display: none; }`}</style>
      )}
    </div>
  );
}
