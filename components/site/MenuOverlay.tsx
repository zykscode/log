'use client';

import { motion, type Variants } from 'motion/react';
import Link from 'next/link';

import { toRoman } from '@/lib/utils';

import { useMenu } from './MenuContext';
import { InstallApp } from './Pwa';
import { Socials } from './Socials';
import { ThemeToggle } from './ThemeToggle';
import type { Chrome } from './types';

const container: Variants = {
  open: {
    height: 'calc(100dvh - 5rem)',
    opacity: 1,
    transition: {
      duration: 0.75,
      ease: [0.65, 0, 0.35, 1],
      delayChildren: 0.25,
      staggerChildren: 0.07,
    },
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: [0.65, 0, 0.35, 1],
      when: 'afterChildren',
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

const item: Variants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { type: 'spring', stiffness: 300, damping: 26 },
      opacity: { duration: 0.3 },
    },
  },
  closed: { y: 40, opacity: 0, transition: { duration: 0.2 } },
};

const underline: Variants = {
  open: { scaleX: 1, transition: { duration: 0.5, ease: 'easeInOut' } },
  closed: { scaleX: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
};

/** The full-panel menu with giant links and roman numerals. */
export function MenuOverlay({
  chrome,
  extraLinks = [],
}: {
  chrome: Chrome;
  extraLinks?: { label: string; url: string }[];
}) {
  const { isOpen, openSearch } = useMenu();
  const links = [
    ...chrome.navItems,
    ...extraLinks.filter((e) => !chrome.navItems.some((n) => n.url === e.url)),
  ];

  return (
    <motion.div
      id="site-menu"
      aria-hidden={!isOpen}
      inert={!isOpen}
      initial={false}
      animate={isOpen ? 'open' : 'closed'}
      variants={container}
      className="absolute inset-x-0 top-0 z-30 overflow-hidden rounded-2xl bg-[#121011] text-bone"
    >
      <div className="flex h-full flex-col gap-10 overflow-y-auto px-6 py-8 md:flex-row md:px-12 md:py-10">
        <ul className="flex flex-1 flex-col justify-evenly">
          {links.map((link, i) => (
            <motion.li key={link.url} className="relative" variants={item}>
              <motion.span
                aria-hidden
                variants={underline}
                className="absolute inset-x-0 bottom-0 h-px origin-left bg-bone/20"
              />
              <Link
                href={link.url}
                className="group flex items-baseline py-2 capitalize leading-[1.05] tracking-[-0.03em] transition-colors hover:text-white"
                style={{
                  fontSize: `clamp(2rem, ${Math.min(9, Math.floor(64 / Math.max(links.length, 1)))}vh, 6.5rem)`,
                }}
              >
                <span className="transition-transform duration-300 group-hover:translate-x-2">
                  {link.label}
                </span>
                <span className="ml-3 self-start pt-[0.5em] text-base tracking-normal text-bone/25 transition-colors group-hover:text-ember">
                  {toRoman(i + 1)}
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>

        <motion.aside
          variants={item}
          className="flex flex-col justify-between gap-8 md:w-80 md:border-l md:border-bone/10 md:pl-10"
        >
          <div className="space-y-8">
            {chrome.now?.text && (
              <div>
                <p className="eyebrow text-bone/40">Currently</p>
                <p className="mt-2 text-xl leading-snug">
                  {chrome.now.emoji ? (
                    <span className="mr-2">{chrome.now.emoji}</span>
                  ) : null}
                  {chrome.now.text}
                </p>
              </div>
            )}
            <div className="space-y-2 text-sm">
              <button
                type="button"
                onClick={openSearch}
                className="flex w-full items-center justify-between rounded-xl border border-bone/15 px-4 py-3 text-left text-bone/80 transition-colors hover:border-bone/40 hover:text-white"
              >
                Search everything
                <kbd className="rounded border border-bone/20 px-1.5 text-xs text-bone/50">
                  ⌘K
                </kbd>
              </button>
              <Link
                href="/tags"
                className="flex justify-between rounded-xl px-4 py-2 text-bone/70 hover:text-white"
              >
                Browse topics <span aria-hidden>→</span>
              </Link>
              <a
                href="/feed.xml"
                className="flex justify-between rounded-xl px-4 py-2 text-bone/70 hover:text-white"
              >
                RSS feed <span aria-hidden>↗</span>
              </a>
              <InstallApp className="flex w-full justify-between rounded-xl px-4 py-2 text-left text-bone/70 hover:text-white" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <Socials items={chrome.socials} className="-ml-2" />
            <ThemeToggle className="text-bone hover:bg-bone/10" />
          </div>
        </motion.aside>
      </div>
    </motion.div>
  );
}
