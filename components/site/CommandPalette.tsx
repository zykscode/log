'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { useMenu } from './MenuContext';
import type { NavItem } from './types';

type Hit = {
  title: string;
  url: string;
  kind: string;
  date?: string;
  snippet?: string;
  private?: boolean;
};

const KIND_LABEL: Record<string, string> = {
  post: 'Post',
  journal: 'Journal',
  diary: 'Diary',
  project: 'Work',
  page: 'Page',
  action: 'Go to',
};

/** ⌘K / Ctrl+K / "/" — search everything, or jump to a section. */
export function CommandPalette({ navItems }: { navItems: NavItem[] }) {
  const { isSearchOpen, closeSearch } = useMenu();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions: (Hit & { run?: () => void })[] = useMemo(
    () => [
      ...navItems.map((n) => ({ title: n.label, url: n.url, kind: 'action' })),
      { title: 'All topics', url: '/tags', kind: 'action' },
      { title: 'Full search page', url: '/search', kind: 'action' },
      {
        title: `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`,
        url: '#theme',
        kind: 'action',
        run: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
      },
    ],
    [navItems, resolvedTheme, setTheme],
  );

  // Reset when the palette opens/closes (adjust state during render).
  const [wasOpen, setWasOpen] = useState(isSearchOpen);
  if (isSearchOpen !== wasOpen) {
    setWasOpen(isSearchOpen);
    setActive(0);
    if (!isSearchOpen) {
      setQuery('');
      setHits([]);
    }
  }

  useEffect(() => {
    if (isSearchOpen) requestAnimationFrame(() => inputRef.current?.focus());
  }, [isSearchOpen]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/next/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const json = (await res.json()) as { results: Hit[] };
        setHits(json.results);
        setActive(0);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 160);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  const list: (Hit & { run?: () => void })[] =
    query.trim().length >= 2
      ? [
          ...hits,
          {
            title: `Search for “${query.trim()}”`,
            url: `/search?q=${encodeURIComponent(query.trim())}`,
            kind: 'action',
          },
        ]
      : actions.filter((a) =>
          a.title.toLowerCase().includes(query.trim().toLowerCase()),
        );

  const go = (hit: Hit & { run?: () => void }) => {
    closeSearch();
    if (hit.run) hit.run();
    else router.push(hit.url);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, list.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && list[active]) {
      e.preventDefault();
      go(list[active]);
    }
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-night/50 px-3 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && closeSearch()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            initial={{ y: -12, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -12, scale: 0.98 }}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-line bg-canvas text-fg shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-line px-5">
              <svg
                viewBox="0 0 24 24"
                className="size-5 text-faint"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden
              >
                <circle cx="11" cy="11" r="6.5" />
                <path d="m20 20-4.2-4.2" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search posts, journal, diary, work…"
                className="h-16 flex-1 bg-transparent py-0 text-lg leading-[1.6] outline-none placeholder:text-faint"
                aria-controls="palette-results"
                aria-activedescendant={
                  list[active] ? `palette-${active}` : undefined
                }
              />
              {loading && query.trim().length >= 2 && (
                <span className="size-4 animate-spin rounded-full border-2 border-faint border-t-transparent" />
              )}
              <kbd className="rounded border border-line px-1.5 text-xs text-faint">
                esc
              </kbd>
            </div>
            <ul
              id="palette-results"
              role="listbox"
              className="max-h-[55vh] overflow-y-auto p-2"
            >
              {list.length === 0 && !(loading && query.trim().length >= 2) && (
                <li className="px-4 py-10 text-center text-muted">
                  Nothing found. Try another word.
                </li>
              )}
              {list.map((hit, i) => (
                <li
                  key={`${hit.url}-${i}`}
                  id={`palette-${i}`}
                  role="option"
                  aria-selected={i === active}
                >
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(hit)}
                    className={cn(
                      'flex w-full items-start gap-4 rounded-xl px-4 py-3 text-left',
                      i === active ? 'bg-fg/[0.07]' : '',
                    )}
                  >
                    <span className="eyebrow mt-1 w-16 shrink-0 text-[0.65rem] text-accent">
                      {KIND_LABEL[hit.kind] ?? hit.kind}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {hit.private && <span title="Private">🔒 </span>}
                        {hit.title}
                      </span>
                      {hit.snippet && (
                        <span className="mt-0.5 line-clamp-2 block text-sm text-muted">
                          {hit.snippet}
                        </span>
                      )}
                    </span>
                    {hit.date && (
                      <span className="shrink-0 text-xs text-faint">
                        {hit.date}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-4 border-t border-line px-5 py-2.5 text-xs text-faint">
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>esc close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
