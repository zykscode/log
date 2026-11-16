import Link from 'next/link';

/** The giant-type 404 from the original site, rebuilt cleanly. */
export function NotFoundView() {
  return (
    <section className="relative flex min-h-[78vh] flex-1 flex-col justify-between overflow-hidden px-5 pb-8 pt-10 md:px-10">
      <div
        aria-hidden
        className="grid grid-cols-2 gap-y-16 text-sm text-muted opacity-60 md:grid-cols-3"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i}>Not Found</span>
        ))}
      </div>

      <div className="relative z-10">
        <h1 className="display text-[clamp(4.5rem,15vw,13rem)] text-fg">
          <span className="block">Not</span>
          <span className="block">Found</span>
        </h1>
        <div className="mt-10 max-w-3xl space-y-2 text-[clamp(1.4rem,3.4vw,2.6rem)] uppercase leading-[1.05] tracking-[-0.03em] text-muted">
          <p>You look lost, no qualms.</p>
          <p>
            Try the{' '}
            <Link
              href="/"
              className="text-fg underline decoration-ember decoration-2 underline-offset-[0.15em] hover:text-ember"
            >
              homepage
            </Link>
            , the{' '}
            <Link
              href="/archive"
              className="text-fg underline decoration-ember decoration-2 underline-offset-[0.15em] hover:text-ember"
            >
              archive
            </Link>{' '}
            or{' '}
            <Link
              href="/search"
              className="text-fg underline decoration-ember decoration-2 underline-offset-[0.15em] hover:text-ember"
            >
              search
            </Link>
            .
          </p>
        </div>
      </div>

      <p
        aria-hidden
        className="display pointer-events-none absolute -bottom-[0.12em] -right-[0.04em] select-none text-[clamp(10rem,38vw,36rem)] text-ember/35"
      >
        404
      </p>
    </section>
  );
}
