'use client';

import { useState } from 'react';

/** Copy link / native share / X / LinkedIn / email. */
export function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const btn =
    'inline-flex h-9 items-center rounded-full border border-line px-3.5 text-sm transition-colors hover:border-fg hover:bg-fg hover:text-canvas';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="eyebrow mr-1 text-faint">Share</span>
      <button
        type="button"
        className={btn}
        onClick={async () => {
          if (
            typeof navigator !== 'undefined' &&
            'share' in navigator &&
            /Mobi/.test(navigator.userAgent)
          ) {
            try {
              await navigator.share({ title, url });
              return;
            } catch {
              /* cancelled */
            }
          }
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }}
      >
        {copied ? 'Copied ✓' : 'Copy link'}
      </button>
      <a
        className={btn}
        target="_blank"
        rel="noopener noreferrer"
        href={`https://x.com/intent/post?url=${enc(url)}&text=${enc(title)}`}
      >
        X
      </a>
      <a
        className={btn}
        target="_blank"
        rel="noopener noreferrer"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`}
      >
        LinkedIn
      </a>
      <a
        className={btn}
        href={`mailto:?subject=${enc(title)}&body=${enc(url)}`}
      >
        Email
      </a>
    </div>
  );
}
