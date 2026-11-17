import '@/styles/globals.css';

import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';

import { MenuProvider } from '@/components/site/MenuContext';
import { PwaProvider } from '@/components/site/Pwa';
import { Shell } from '@/components/site/Shell';
import { ThemeProvider } from '@/components/site/ThemeProvider';
import { toChrome } from '@/lib/chrome';
import { WhyteInktrap } from '@/lib/fonts';
import { rootMetadata } from '@/lib/metadata';
import { getMenuPages, getSettings } from '@/lib/queries';

export const generateMetadata = (): Promise<Metadata> => rootMetadata();

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e7e2dc' },
    { media: '(prefers-color-scheme: dark)', color: '#433b45' },
  ],
};

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, menuPages] = await Promise.all([
    getSettings(),
    getMenuPages(),
  ]);
  const chrome = toChrome(settings);

  return (
    <html
      lang={settings.language || 'en-GB'}
      className={WhyteInktrap.variable}
      suppressHydrationWarning
    >
      <body className="min-h-dvh">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <MenuProvider>
            <PwaProvider>
              <Shell
                chrome={chrome}
                menuPages={menuPages.map((p) => ({
                  label: p.title,
                  url: `/${p.slug}`,
                }))}
              >
                {children}
              </Shell>
            </PwaProvider>
          </MenuProvider>
        </ThemeProvider>
        {/* Vercel Analytics only works when hosted on Vercel */}
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
