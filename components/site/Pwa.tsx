'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';

import { cn } from '@/lib/utils';

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

type PwaState = {
  online: boolean;
  swReady: boolean;
  canInstall: boolean;
  isStandalone: boolean;
  isIos: boolean;
  install: () => Promise<void>;
};

const PwaContext = createContext<PwaState>({
  online: true,
  swReady: false,
  canInstall: false,
  isStandalone: false,
  isIos: false,
  install: async () => {},
});

export const usePwa = () => useContext(PwaContext);

/** Registers the service worker, tracks connectivity and the install prompt. */
const noopSubscribe = () => () => {};
const subscribeOnline = (cb: () => void) => {
  window.addEventListener('online', cb);
  window.addEventListener('offline', cb);
  return () => {
    window.removeEventListener('online', cb);
    window.removeEventListener('offline', cb);
  };
};

export function PwaProvider({ children }: { children: React.ReactNode }) {
  // Browser-only facts, read without a hydration mismatch (server assumes defaults).
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );
  const isStandalone = useSyncExternalStore(
    noopSubscribe,
    () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as { standalone?: boolean }).standalone === true,
    () => false,
  );
  const isIos = useSyncExternalStore(
    noopSubscribe,
    () =>
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !/crios|fxios/i.test(navigator.userAgent),
    () => false,
  );
  const [swReady, setSwReady] = useState(false);
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [toast, setToast] = useState<'offline' | 'online' | null>(null);

  useEffect(() => {
    const goOffline = () => setToast('offline');
    const goOnline = () => {
      setToast('online');
      setTimeout(() => setToast((t) => (t === 'online' ? null : t)), 2500);
    };
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    const enabled =
      process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_ENABLE_SW === '1';
    if (enabled && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .then(() => navigator.serviceWorker.ready)
        .then(() => setSwReady(true))
        .catch(() => setSwReady(false));
    }
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => undefined);
    setDeferred(null);
  }, [deferred]);

  return (
    <PwaContext.Provider
      value={{
        online,
        swReady,
        canInstall: Boolean(deferred),
        isStandalone,
        isIos,
        install,
      }}
    >
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-20 left-1/2 z-[65] flex -translate-x-1/2 items-center gap-3 rounded-full border border-bone/15 bg-night/95 px-4 py-2 text-sm text-bone shadow-2xl backdrop-blur"
          >
            <span
              className={cn(
                'size-2 rounded-full',
                toast === 'offline' ? 'bg-amber-400' : 'bg-emerald-400',
              )}
              aria-hidden
            />
            {toast === 'offline' ? (
              <>
                You’re offline — saved pages still work.
                <Link
                  href="/offline"
                  className="underline underline-offset-4"
                  onClick={() => setToast(null)}
                >
                  See saved
                </Link>
                <button
                  type="button"
                  onClick={() => setToast(null)}
                  aria-label="Dismiss"
                  className="text-bone/60 hover:text-bone"
                >
                  ×
                </button>
              </>
            ) : (
              'Back online.'
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PwaContext.Provider>
  );
}

/** "Install app" (Chrome/Edge/Android) or an "Add to Home Screen" tip (iPhone). */
export function InstallApp({ className }: { className?: string }) {
  const { canInstall, isStandalone, isIos, install } = usePwa();
  const [tip, setTip] = useState(false);
  if (isStandalone) return null;
  if (canInstall) {
    return (
      <button type="button" onClick={install} className={className}>
        Install the app <span aria-hidden>↓</span>
      </button>
    );
  }
  if (isIos) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setTip((v) => !v)}
          className={className}
          aria-expanded={tip}
        >
          Add to Home Screen <span aria-hidden>＋</span>
        </button>
        {tip && (
          <p className="px-4 pt-1 text-xs text-bone/60">
            Tap the Share button, then “Add to Home Screen”.
          </p>
        )}
      </div>
    );
  }
  return null;
}

/* ------------------------------------------------------------------ */

function messageSW(
  message: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    const controller = navigator.serviceWorker?.controller;
    if (!controller)
      return resolve({
        ok: false,
        error: 'Offline reading isn’t ready yet — reload once and try again.',
      });
    const channel = new MessageChannel();
    channel.port1.onmessage = (e) => resolve(e.data);
    controller.postMessage(message, [channel.port2]);
    setTimeout(() => resolve({ ok: false, error: 'Timed out.' }), 30_000);
  });
}

/** Save the current page (and its images) for offline reading. */
export function SaveOffline({ className }: { className?: string }) {
  const { swReady } = usePwa();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!('caches' in window)) return;
    const url = new URL(window.location.href);
    url.hash = '';
    caches
      .open('zyk-saved')
      .then((c) => c.match(url.toString(), { ignoreVary: true }))
      .then((r) => setSaved(Boolean(r)))
      .catch(() => undefined);
  }, [swReady]);

  if (!swReady) return null;

  const toggle = async () => {
    setBusy(true);
    setError('');
    const url = new URL(window.location.href);
    url.hash = '';
    if (saved) {
      const res = await messageSW({ type: 'REMOVE_PAGE', url: url.toString() });
      if (res.ok) setSaved(false);
    } else {
      const assets = [
        ...Array.from(
          document.querySelectorAll<HTMLImageElement>('main img'),
        ).map((img) => img.currentSrc || img.src),
        ...Array.from(
          document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
        ).map((l) => l.href),
        ...Array.from(
          document.querySelectorAll<HTMLScriptElement>('script[src]'),
        ).map((s) => s.src),
      ].filter(Boolean);
      const res = await messageSW({
        type: 'SAVE_PAGE',
        url: url.toString(),
        assets,
      });
      if (res.ok) setSaved(true);
      else setError(res.error || 'Couldn’t save.');
    }
    setBusy(false);
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={saved}
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors disabled:opacity-60',
          saved
            ? 'border-accent bg-accent text-accent-fg'
            : 'border-line hover:border-fg hover:bg-fg hover:text-canvas',
          className,
        )}
      >
        {busy
          ? 'Saving…'
          : saved
            ? '✓ Saved for offline'
            : '⤓ Save for offline'}
      </button>
      {error && <span className="text-xs text-accent">{error}</span>}
    </span>
  );
}

/* ------------------------------------------------------------------ */

type CachedPage = { url: string; path: string; title: string; saved: boolean };

/** Lists pages available offline (on the /offline page). */
export function OfflineLibrary() {
  const [pages, setPages] = useState<CachedPage[] | null>(null);

  useEffect(() => {
    (async () => {
      if (!('caches' in window)) return setPages([]);
      const read = async (name: string, saved: boolean) => {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        return Promise.all(
          keys.map(async (req) => {
            const res = await cache.match(req);
            const html = res ? await res.clone().text() : '';
            const title = (
              html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? ''
            )
              .replace(/&amp;/g, '&')
              .replace(/&#x27;|&#39;/g, "'")
              .replace(/&quot;/g, '"');
            const url = new URL(req.url);
            return {
              url: req.url,
              path: url.pathname + url.search,
              title: title || url.pathname,
              saved,
            };
          }),
        );
      };
      const [saved, recent] = await Promise.all([
        read('zyk-saved', true),
        read('zyk-pages', false),
      ]);
      const seen = new Set<string>();
      const all = [...saved, ...recent.reverse()].filter((p) => {
        if (seen.has(p.path) || p.path.startsWith('/offline')) return false;
        seen.add(p.path);
        return true;
      });
      setPages(all);
    })().catch(() => setPages([]));
  }, []);

  if (pages === null)
    return <p className="text-muted">Looking for saved pages…</p>;
  if (pages.length === 0)
    return (
      <p className="text-muted">
        Nothing saved on this device yet. Next time you’re online, use{' '}
        <b>Save for offline</b> on any post — or just read: recent pages are
        kept automatically.
      </p>
    );
  return (
    <ul className="border-b border-line">
      {pages.map((p) => (
        <li
          key={p.url}
          className="group relative flex items-baseline justify-between gap-4 border-t border-line py-3.5"
        >
          <a
            href={p.path}
            className="min-w-0 truncate text-lg after:absolute after:inset-0 group-hover:text-accent"
          >
            {p.title.replace(/ · [^·]+$/, '')}
          </a>
          <span className="eyebrow shrink-0 text-[0.62rem] text-faint">
            {p.saved ? 'Saved' : 'Recent'}
          </span>
        </li>
      ))}
    </ul>
  );
}
