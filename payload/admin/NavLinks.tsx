import React from 'react';

const linkStyle: React.CSSProperties = {
  display: 'block',
  padding: '6px 0',
  fontSize: 13,
  color: 'var(--theme-elevation-800)',
  textDecoration: 'none',
};

/** Extra links under the admin navigation. */
export function NavLinks() {
  return (
    <div
      style={{
        marginTop: 16,
        paddingTop: 12,
        borderTop: '1px solid var(--theme-elevation-100)',
      }}
    >
      <a href="/" target="_blank" rel="noreferrer" style={linkStyle}>
        ↗ View site
      </a>
      <a
        href="/next/author?redirect=/"
        target="_blank"
        rel="noreferrer"
        style={linkStyle}
      >
        👁 View as author (drafts &amp; private)
      </a>
    </div>
  );
}
