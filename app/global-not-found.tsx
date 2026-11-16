import '@/styles/globals.css';

import type { Metadata } from 'next';

import { NotFoundView } from '@/components/site/NotFoundView';
import { WhyteInktrap } from '@/lib/fonts';

export const metadata: Metadata = { title: 'Not found' };

/** Fallback 404 for URLs no route matches (the app has two root layouts). */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${WhyteInktrap.variable} dark`}>
      <body className="min-h-dvh p-3 md:p-4">
        <div className="dot-grid flex min-h-[calc(100dvh-2rem)] flex-col rounded-2xl bg-panel">
          <NotFoundView />
        </div>
      </body>
    </html>
  );
}
