'use client';

import { motion, useReducedMotion, type Variants } from 'motion/react';
import { useEffect, useState } from 'react';

/**
 * The signature backdrop: light trails tracing "Z Y K" across the panel.
 * The dot grid itself is plain CSS (`dot-grid` utility) — cheap to render.
 */
export default function AnimatedBackground({
  speed = 1,
  opacity = 0.35,
}: {
  speed?: number;
  opacity?: number;
}) {
  const reduce = useReducedMotion();
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const update = () =>
      setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (!size) return null;

  const letterWidth = Math.min(size.w * 0.15, 150);
  const letterHeight = letterWidth * 1.5;
  const gap = letterWidth * 0.5;
  const startX = size.w / 2 - (letterWidth * 3 + gap * 2) / 2;
  const top = size.h / 2 - letterHeight / 2;
  const bottom = size.h / 2 + letterHeight / 2;
  const mid = size.h / 2;
  const x2 = startX + letterWidth + gap;
  const x3 = startX + (letterWidth + gap) * 2;

  const z = `M${startX},${top} L${startX + letterWidth},${top} L${startX},${bottom} L${startX + letterWidth},${bottom}`;
  const y = `M${x2},${top} L${x2 + letterWidth / 2},${mid} L${x2 + letterWidth / 2},${bottom} M${x2 + letterWidth},${top} L${x2 + letterWidth / 2},${mid}`;
  const k = `M${x3},${top} L${x3},${bottom} M${x3},${mid} L${x3 + letterWidth},${top} M${x3},${mid} L${x3 + letterWidth},${bottom}`;

  const trail: Variants = {
    initial: { pathLength: 0, pathOffset: 0 },
    animate: {
      pathLength: [0.05, 0.05],
      pathOffset: [0, 1],
      transition: { duration: 6 / speed, ease: 'linear', repeat: Infinity },
    },
  };

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full text-fg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="zyk-glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {[z, y, k].map((d) =>
        reduce ? (
          <path
            key={d}
            d={d}
            stroke="currentColor"
            strokeWidth={2}
            fill="none"
            opacity={opacity * 0.3}
          />
        ) : (
          <motion.path
            key={d}
            d={d}
            stroke="currentColor"
            strokeWidth={6}
            fill="none"
            filter="url(#zyk-glow)"
            variants={trail}
            initial="initial"
            animate="animate"
            opacity={opacity}
          />
        ),
      )}
      {!reduce && (
        <motion.path
          d={`${z} ${y} ${k}`}
          stroke="currentColor"
          strokeWidth={6}
          fill="none"
          filter="url(#zyk-glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 6 / speed,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
          }}
          opacity={opacity * 0.5}
        />
      )}
    </svg>
  );
}
