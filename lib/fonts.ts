import localFont from 'next/font/local';

/** Whyte Inktrap — the site's typeface (self-hosted from /public/fonts). */
export const WhyteInktrap = localFont({
  src: [
    {
      path: '../public/fonts/whyte-inktrap/WhyteInktrap-Thin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../public/fonts/whyte-inktrap/WhyteInktrap-ExtraLight.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../public/fonts/whyte-inktrap/WhyteInktrap-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/whyte-inktrap/WhyteInktrap-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/whyte-inktrap/WhyteInktrap-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/fonts/whyte-inktrap/WhyteInktrap-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/whyte-inktrap/WhyteInktrap-MediumItalic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../public/fonts/whyte-inktrap/WhyteInktrap-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/whyte-inktrap/WhyteInktrap-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../public/fonts/whyte-inktrap/WhyteInktrap-Black.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-whyteinktrap',
  display: 'swap',
});
