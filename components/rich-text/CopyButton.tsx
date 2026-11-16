'use client';

import { useState } from 'react';

export function CopyButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      aria-label="Copy code"
    >
      {done ? 'Copied ✓' : 'Copy'}
    </button>
  );
}
