import type { IconType } from 'react-icons';
import {
  FaBehance,
  FaBluesky,
  FaDribbble,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaMastodon,
  FaSpotify,
  FaThreads,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';
import { FiGlobe, FiMail, FiRss } from 'react-icons/fi';

import { SOCIAL_PLATFORMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const ICONS: Record<string, IconType> = {
  x: FaXTwitter,
  github: FaGithub,
  linkedin: FaLinkedin,
  instagram: FaInstagram,
  youtube: FaYoutube,
  bluesky: FaBluesky,
  mastodon: FaMastodon,
  threads: FaThreads,
  dribbble: FaDribbble,
  behance: FaBehance,
  tiktok: FaTiktok,
  spotify: FaSpotify,
  email: FiMail,
  rss: FiRss,
  website: FiGlobe,
};

export type Social = { platform: string; url: string; id?: string | null };

export function Socials({
  items,
  className,
}: {
  items: Social[];
  className?: string;
}) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-1', className)}>
      {items.map((s) => {
        const Icon = ICONS[s.platform] ?? FiGlobe;
        const label =
          SOCIAL_PLATFORMS.find((p) => p.value === s.platform)?.label ??
          s.platform;
        const href =
          s.platform === 'email' && !s.url.startsWith('mailto:')
            ? `mailto:${s.url}`
            : s.url;
        return (
          <li key={s.id ?? s.url}>
            <a
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer me"
              aria-label={label}
              title={label}
              className="inline-flex size-10 items-center justify-center rounded-full text-[1.15rem] transition-colors hover:bg-fg/10 hover:text-accent"
            >
              <Icon aria-hidden />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
