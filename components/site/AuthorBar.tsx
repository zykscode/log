import { getViewer } from '@/lib/viewer';

/** Floating bar shown only in author mode (drafts + private entries visible). */
export async function AuthorBar() {
  const viewer = await getViewer();
  if (!viewer.isAuthor) return null;
  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-bone/15 bg-night/95 p-1 pl-4 text-sm text-bone shadow-2xl backdrop-blur">
      <span className="mr-2 flex items-center gap-2">
        <span
          className="size-2 animate-pulse rounded-full bg-ember"
          aria-hidden
        />
        Author mode
        <span className="hidden text-bone/50 sm:inline">
          · drafts, scheduled &amp; private visible
        </span>
      </span>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- admin/route handler: full page load */}
      <a href="/admin" className="rounded-full px-3 py-1.5 hover:bg-bone/10">
        Admin
      </a>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- admin/route handler: full page load */}
      <a
        href="/next/exit-preview"
        className="rounded-full bg-bone px-3 py-1.5 text-night hover:bg-white"
      >
        Exit
      </a>
    </div>
  );
}

/** Small “Edit” link for a document, visible only in author mode. */
export async function EditLink({
  collection,
  id,
}: {
  collection: string;
  id: number | string;
}) {
  const viewer = await getViewer();
  if (!viewer.isAuthor) return null;
  return (
    <a
      href={`/admin/collections/${collection}/${id}`}
      className="inline-flex items-center gap-1 rounded-full border border-accent/40 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent hover:bg-accent hover:text-accent-fg"
    >
      ✎ Edit
    </a>
  );
}
