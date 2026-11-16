'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type LightboxImage = {
  src: string;
  alt: string;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
};

/** Click an image to view it large; arrows / swipe move through a gallery. */
export function Lightbox({
  images,
  index = 0,
  children,
  className,
}: {
  images: LightboxImage[];
  index?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) =>
      setOpen((i) =>
        i === null ? i : (i + d + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close, step]);

  const current = open !== null ? images[open] : null;
  const touchX = useRef(0);

  return (
    <>
      <button
        type="button"
        className={className ?? 'block w-full cursor-zoom-in'}
        onClick={() => setOpen(index)}
        aria-label="Enlarge image"
      >
        {children}
      </button>
      <AnimatePresence>
        {current && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={current.alt || 'Image'}
            className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-night/95 p-4 text-bone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            }}
          >
            {}
            <motion.img
              key={current.src}
              src={current.src}
              alt={current.alt}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {(current.caption || images.length > 1) && (
              <p className="mt-4 max-w-2xl text-center text-sm text-bone/70">
                {images.length > 1 && (
                  <span className="mr-3 tabular-nums">
                    {(open ?? 0) + 1} / {images.length}
                  </span>
                )}
                {current.caption}
              </p>
            )}
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 rounded-full px-3 py-1 text-2xl hover:bg-bone/10"
              aria-label="Close"
            >
              ×
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => (e.stopPropagation(), step(-1))}
                  className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full p-3 text-3xl hover:bg-bone/10 md:block"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(e) => (e.stopPropagation(), step(1))}
                  className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full p-3 text-3xl hover:bg-bone/10 md:block"
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
