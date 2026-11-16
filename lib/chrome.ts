import 'server-only';

import type { Chrome } from '@/components/site/types';
import type { Media, Setting } from '@/payload-types';

export function toChrome(s: Setting): Chrome {
  const avatar =
    typeof s.avatar === 'object' && s.avatar ? (s.avatar as Media) : null;
  return {
    siteName: s.siteName || 'Zykson',
    wordmark: s.wordmark || s.siteName || 'Zykson',
    authorName: s.authorName || s.siteName || 'Zykson',
    avatarUrl: avatar?.sizes?.thumb?.url || avatar?.url || '/me.jpg',
    navItems: (s.navItems ?? []).map((n) => ({
      label: n.label,
      url: n.url,
      inHeader: n.inHeader,
    })),
    socials: (s.socials ?? []).map((x) => ({
      platform: x.platform,
      url: x.url,
      id: x.id,
    })),
    now: s.now ?? null,
    footerNote: s.footerNote,
    announcement: s.announcement ?? null,
  };
}
