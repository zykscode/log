import type { Social } from './Socials';

export type NavItem = { label: string; url: string; inHeader?: boolean | null };

/** Everything the site chrome (header, menu, footer) needs from Settings. */
export type Chrome = {
  siteName: string;
  wordmark: string;
  authorName: string;
  avatarUrl: string;
  navItems: NavItem[];
  socials: Social[];
  now?: { emoji?: string | null; text?: string | null } | null;
  footerNote?: string | null;
  announcement?: {
    enabled?: boolean | null;
    text?: string | null;
    url?: string | null;
  } | null;
};
