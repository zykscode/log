'use client';

import { usePathname } from 'next/navigation';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type MenuContextType = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
};

const MenuContext = createContext<MenuContextType | undefined>(undefined);

/** Shared state for the big menu overlay and the ⌘K search palette. */
export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const openSearch = useCallback(() => {
    setIsOpen(false);
    setSearchOpen(true);
  }, []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Close everything when navigating (adjust state during render — no effect needed).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setIsOpen(false);
    setSearchOpen(false);
  }

  // Lock page scroll while the menu is open.
  useEffect(() => {
    document.documentElement.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard: Esc closes, ⌘K / Ctrl+K / "/" opens search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.isContentEditable ||
          /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchOpen(false);
      } else if (
        (e.key === 'k' && (e.metaKey || e.ctrlKey)) ||
        (e.key === '/' && !typing)
      ) {
        e.preventDefault();
        setIsOpen(false);
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo(
    () => ({ isOpen, toggle, close, isSearchOpen, openSearch, closeSearch }),
    [isOpen, toggle, close, isSearchOpen, openSearch, closeSearch],
  );
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu(): MenuContextType {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used within <MenuProvider>');
  return ctx;
}
