import React from 'react';

/** Login-screen wordmark. */
export function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
      <span
        style={{
          fontSize: 44,
          fontWeight: 800,
          letterSpacing: '-0.05em',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}
      >
        Zykson
      </span>
      <span
        style={{
          fontSize: 13,
          letterSpacing: '0.2em',
          color: '#d32d08',
          fontWeight: 600,
        }}
      >
        CMS
      </span>
    </div>
  );
}

/** Small mark in the admin nav. */
export function Icon() {
  return (
    <span
      style={{
        display: 'inline-flex',
        width: 26,
        height: 26,
        borderRadius: 999,
        background: '#d32d08',
        color: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: 14,
      }}
    >
      Z
    </span>
  );
}
