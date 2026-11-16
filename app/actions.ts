'use server';

import { headers } from 'next/headers';

import { getPayloadClient } from '@/lib/payload';

export type ContactState = { ok: boolean; error?: string } | null;

const recent = new Map<string, number>();

/** Stores a contact-form message in the CMS inbox (Messages collection). */
export async function sendMessage(
  _prev: ContactState,
  form: FormData,
): Promise<ContactState> {
  // honeypot: real people never fill this hidden field
  if (String(form.get('website') ?? '')) return { ok: true };

  const name = String(form.get('name') ?? '')
    .trim()
    .slice(0, 120);
  const email = String(form.get('email') ?? '')
    .trim()
    .slice(0, 200);
  const subject = String(form.get('subject') ?? '')
    .trim()
    .slice(0, 200);
  const message = String(form.get('message') ?? '')
    .trim()
    .slice(0, 5000);
  const page = String(form.get('page') ?? '').slice(0, 300);

  if (!name || !message)
    return { ok: false, error: 'Please add your name and a message.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: 'That email address doesn’t look right.' };

  // light rate-limit per IP (per server instance)
  const ip =
    (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  const last = recent.get(ip) ?? 0;
  if (Date.now() - last < 20_000)
    return {
      ok: false,
      error: 'Easy there — please wait a few seconds and try again.',
    };
  recent.set(ip, Date.now());

  try {
    const payload = await getPayloadClient();
    await payload.create({
      collection: 'messages',
      data: {
        name,
        email,
        subject: subject || `Message from ${name}`,
        message,
        page,
        status: 'new',
      },
      overrideAccess: true,
    });
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'Something went wrong. Please try again, or email me directly.',
    };
  }
}
