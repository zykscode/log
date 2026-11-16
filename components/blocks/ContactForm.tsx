'use client';

import { usePathname } from 'next/navigation';
import { useActionState } from 'react';

import { type ContactState, sendMessage } from '@/app/actions';

const field =
  'w-full rounded-xl border border-line bg-transparent px-4 py-3 text-base outline-none transition-colors placeholder:text-faint focus:border-fg';

export function ContactForm({
  successMessage,
}: {
  successMessage?: string | null;
}) {
  const [state, action, pending] = useActionState<ContactState, FormData>(
    sendMessage,
    null,
  );
  const pathname = usePathname();

  if (state?.ok) {
    return (
      <div role="status" className="rounded-2xl border border-line p-8 text-xl">
        {successMessage || 'Thanks — your message is in.'}
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="page" value={pathname} />
      <div className="hidden" aria-hidden>
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="grid gap-1.5 text-sm">
        Name
        <input name="name" required autoComplete="name" className={field} />
      </label>
      <label className="grid gap-1.5 text-sm">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={field}
        />
      </label>
      <label className="grid gap-1.5 text-sm sm:col-span-2">
        Subject <span className="sr-only">(optional)</span>
        <input name="subject" className={field} placeholder="Optional" />
      </label>
      <label className="grid gap-1.5 text-sm sm:col-span-2">
        Message
        <textarea name="message" required rows={6} className={field} />
      </label>
      <div className="flex items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-fg px-6 py-3 font-medium text-canvas transition-colors hover:bg-accent hover:text-accent-fg disabled:opacity-60"
        >
          {pending ? 'Sending…' : 'Send message →'}
        </button>
        {state?.error && (
          <p role="alert" className="text-sm text-accent">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
