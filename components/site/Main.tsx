'use client';

import { motion } from 'motion/react';

import { useMenu } from './MenuContext';

/** Fades the page out while the big menu is open (as in the original). */
export function Main({ children }: { children: React.ReactNode }) {
  const { isOpen } = useMenu();
  return (
    <motion.main
      id="content"
      className="relative z-10 flex flex-1 flex-col"
      initial={false}
      animate={{ opacity: isOpen ? 0 : 1 }}
      transition={{ delay: isOpen ? 0 : 0.45, duration: 0.35 }}
    >
      {children}
    </motion.main>
  );
}
