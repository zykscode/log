import Link from 'next/link';

import { Socials } from './Socials';
import { ThemeToggle } from './ThemeToggle';
import type { Chrome } from './types';

export function Footer({ chrome }: { chrome: Chrome }) {
  const year = new Date().getFullYear();
  return (
    <footer className="flex flex-col gap-4 py-6 text-sm text-muted md:flex-row md:items-center md:justify-between md:py-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span>
          © {year} {chrome.authorName}
        </span>
        {chrome.footerNote && (
          <span className="text-faint">{chrome.footerNote}</span>
        )}
      </div>
      <nav
        aria-label="Footer"
        className="flex flex-wrap items-center gap-x-5 gap-y-1"
      >
        <Link className="link-underline" href="/archive">
          Archive
        </Link>
        <Link className="link-underline" href="/tags">
          Topics
        </Link>
        <Link className="link-underline" href="/search">
          Search
        </Link>
        <a className="link-underline" href="/feed.xml">
          RSS
        </a>
        <Link className="link-underline" href="/sitemap.xml" prefetch={false}>
          Sitemap
        </Link>
      </nav>
      <div className="flex items-center gap-1 text-fg">
        <ThemeToggle />
        <Socials items={chrome.socials} />
      </div>
    </footer>
  );
}
