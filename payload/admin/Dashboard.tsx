import type { Payload } from 'payload';
import React from 'react';

type Props = { payload: Payload };

const card: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-100)',
  borderRadius: 10,
  padding: '14px 16px',
  background: 'var(--theme-elevation-0)',
};

const action: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 14px',
  borderRadius: 999,
  border: '1px solid var(--theme-elevation-150)',
  textDecoration: 'none',
  color: 'var(--theme-text)',
  fontSize: 14,
  fontWeight: 500,
};

async function count(
  payload: Payload,
  collection: 'posts' | 'journal' | 'projects' | 'messages',
  where = {},
) {
  try {
    const res = await payload.count({
      collection,
      where,
      overrideAccess: true,
    });
    return res.totalDocs;
  } catch {
    return 0;
  }
}

/** Welcome panel at the top of the admin dashboard. */
export async function Dashboard({ payload }: Props) {
  const [posts, drafts, entries, diary, projects, unread] = await Promise.all([
    count(payload, 'posts', { _status: { equals: 'published' } }),
    count(payload, 'posts', { _status: { equals: 'draft' } }),
    count(payload, 'journal', { type: { equals: 'journal' } }),
    count(payload, 'journal', { type: { equals: 'diary' } }),
    count(payload, 'projects'),
    count(payload, 'messages', { status: { equals: 'new' } }),
  ]);

  const stats = [
    ['Published posts', posts],
    ['Drafts', drafts],
    ['Journal entries', entries],
    ['Diary entries', diary],
    ['Projects', projects],
    ['Unread messages', unread],
  ] as const;

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 28, letterSpacing: '-0.03em' }}>
        What are we writing today?
      </h2>
      <p style={{ margin: '0 0 18px', color: 'var(--theme-elevation-600)' }}>
        Drafts save automatically. Press <kbd>/</kbd> in the editor for blocks,
        and use Live Preview to see the page as you type.
      </p>
      <div
        style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 22 }}
      >
        <a
          style={{
            ...action,
            background: '#d32d08',
            color: '#fff',
            borderColor: '#d32d08',
          }}
          href="/admin/collections/posts/create"
        >
          ✍️ New blog post
        </a>
        <a style={action} href="/admin/collections/journal/create">
          📓 New journal / diary entry
        </a>
        <a style={action} href="/admin/collections/projects/create">
          🧰 New project
        </a>
        <a style={action} href="/admin/collections/pages/create">
          📄 New page
        </a>
        <a style={action} href="/admin/collections/media/create">
          🖼️ Upload media
        </a>
        <a
          style={action}
          href="/next/author?redirect=/"
          target="_blank"
          rel="noreferrer"
        >
          👁 View site as author
        </a>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 10,
        }}
      >
        {stats.map(([label, value]) => (
          <div key={label} style={card}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: '-0.03em',
              }}
            >
              {value}
            </div>
            <div style={{ fontSize: 13, color: 'var(--theme-elevation-600)' }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
