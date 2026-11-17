import type { Metadata } from 'next';

import { OfflineLibrary } from '@/components/site/Pwa';
import { PageHeader } from '@/components/ui/PageHeader';
import { Container } from '@/components/ui/Primitives';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Offline',
  robots: { index: false, follow: false },
};

/** Shown by the service worker when you're offline and the page isn't saved. */
export default function OfflinePage() {
  return (
    <>
      <PageHeader
        title="Offline"
        kicker="No connection"
        description="This page isn’t saved on your device. Everything below is — open any of it now, or try again when you’re back online."
      />
      <Container size="default" className="pb-24">
        <OfflineLibrary />
      </Container>
    </>
  );
}
