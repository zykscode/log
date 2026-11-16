'use client';

import { motion, useScroll, useSpring } from 'motion/react';

/** Thin reading-progress bar at the very top of the window. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-ember"
      style={{ scaleX }}
    />
  );
}
