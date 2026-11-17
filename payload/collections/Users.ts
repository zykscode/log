import {
  type Access,
  APIError,
  type CollectionBeforeChangeHook,
  type CollectionBeforeDeleteHook,
  type CollectionConfig,
  type PayloadRequest,
} from 'payload';

import { isAdmin } from '../access';

type Role = 'admin' | 'editor';

const roleOf = (user: unknown): Role | undefined =>
  (user as { role?: Role } | null | undefined)?.role;

/** Admin sees every account; everyone else only their own. */
const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (roleOf(user) === 'admin') return true;
  return { id: { equals: user.id } };
};

async function countAdmins(req: PayloadRequest, excludeId?: number | string) {
  const res = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
    req,
    where: {
      and: [
        { role: { equals: 'admin' } },
        ...(excludeId !== undefined ? [{ id: { not_equals: excludeId } }] : []),
      ],
    },
  });
  return res.totalDocs;
}

/**
 * Single-owner rules (enforced on the server, whatever the UI sends):
 *  - the very first account becomes the admin (the owner);
 *  - every later account is an editor;
 *  - only the admin can change roles;
 *  - there can only be one admin, and the only admin can't be demoted.
 * To allow more admins later, remove the "one admin" check below.
 */
const enforceRoles: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  const total = await req.payload.count({
    collection: 'users',
    overrideAccess: true,
    req,
  });
  if (operation === 'create') {
    // first account = the owner; every account after that starts as an editor
    return { ...data, role: total.totalDocs === 0 ? 'admin' : 'editor' };
  }

  const previous: Role = roleOf(originalDoc) ?? 'editor';
  const next: Role = (data?.role as Role | undefined) ?? previous;
  const actorIsAdmin = roleOf(req.user) === 'admin';

  if (next !== previous && !actorIsAdmin) {
    throw new APIError('Only the admin can change roles.', 403, null, true);
  }
  if (next === 'admin' && (await countAdmins(req, originalDoc?.id)) > 0) {
    throw new APIError(
      'There can only be one admin. Give new accounts the Editor role.',
      403,
      null,
      true,
    );
  }
  if (
    previous === 'admin' &&
    next !== 'admin' &&
    (await countAdmins(req, originalDoc?.id)) === 0
  ) {
    throw new APIError('You can’t demote the only admin.', 403, null, true);
  }
  return { ...data, role: next };
};

const protectAdmin: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const doc = await req.payload.findByID({
    collection: 'users',
    id,
    overrideAccess: true,
    depth: 0,
    req,
  });
  if (roleOf(doc) === 'admin') {
    throw new APIError('The admin account can’t be deleted.', 403, null, true);
  }
};

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Author', plural: 'Authors' },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // stay signed in for 30 days
    cookies: { sameSite: 'Lax' },
    // brute-force protection: lock an account for 15 min after 5 wrong passwords
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  admin: {
    group: 'Settings',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    description:
      'Only one admin (you). Anyone you invite is an Editor: they can write and edit content but not change settings or accounts.',
  },
  access: {
    admin: ({ req: { user } }) => Boolean(user),
    read: adminOrSelf,
    create: isAdmin, // no public sign-up: only the admin can add accounts
    update: adminOrSelf,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [enforceRoles],
    beforeDelete: [protectAdmin],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      // (kept as the stored database default; the hook above always decides the
      // real role: new accounts are created as editors)
      defaultValue: 'admin',
      required: true,
      options: [
        { label: 'Admin — everything (only one)', value: 'admin' },
        { label: 'Editor — content only', value: 'editor' },
      ],
      saveToJWT: true,
      admin: {
        position: 'sidebar',
        description:
          'New accounts are always created as Editors. Only the admin can change roles.',
      },
    },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    { name: 'bio', type: 'textarea' },
    { name: 'website', type: 'text' },
  ],
};
