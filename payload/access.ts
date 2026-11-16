import type { Access, FieldAccess, Where } from 'payload';

export const anyone: Access = () => true;
export const nobody: Access = () => false;
export const authenticated: Access = ({ req: { user } }) => Boolean(user);
export const authenticatedField: FieldAccess = ({ req: { user } }) =>
  Boolean(user);

export const isAdmin: Access = ({ req: { user } }) =>
  Boolean(user && (user as { role?: string }).role === 'admin');

/**
 * Logged-in authors can read everything. Anonymous visitors (and the public
 * REST API) only get published, non-private documents whose publish date has
 * arrived — so drafts, private diary entries and scheduled posts never leak.
 */
export const publishedOrAuthor: Access = ({ req: { user } }) => {
  if (user) return true;
  const where: Where = {
    and: [
      { _status: { equals: 'published' } },
      { visibility: { not_equals: 'private' } },
      { publishedAt: { less_than_equal: new Date().toISOString() } },
    ],
  };
  return where;
};

/** Same, for collections with drafts but no visibility/publish date (pages). */
export const publishedPagesOrAuthor: Access = ({ req: { user } }) => {
  if (user) return true;
  const where: Where = {
    and: [
      { _status: { equals: 'published' } },
      { visibility: { not_equals: 'private' } },
    ],
  };
  return where;
};
