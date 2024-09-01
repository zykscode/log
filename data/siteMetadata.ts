const siteMetadata = {
  title: 'Top Zyknanigans',
  author: 'Zyk',
  headerTitle: 'Zykson',
  description: 'A blog to keep up with my shenanigans',
  language: 'en-us',
  theme: 'system' as const, // system, dark or light
  siteUrl: 'https://tailwind-nextjs-starjter-blog.vercel.app',
  siteRepo: 'https://github.com/timlrx/tailwind-nextjs-starter-blog',
  siteLogo: '/static/images/logo.png',
  socialBanner: '/static/images/twitter-card.png',
  mastodon: 'https://mastodon.social/@mastodonuser',
  email: 'address@yoursite.com',
  github: 'https://github.com',
  x: 'https://twitter.com/x',
  // twitter: 'https://twitter.com/Twitter',
  facebook: 'https://facebook.com',
  youtube: 'https://youtube.com',
  linkedin: 'https://www.linkedin.com',
  threads: 'https://www.threads.net',
  instagram: 'https://www.instagram.com',
  locale: 'en-US',
  analytics: {
    umamiAnalytics: {
      umamiWebsiteId: process.env.NEXT_UMAMI_ID,
    },
  },
  newsletter: {
    provider: 'buttondown' as const,
  },
  comments: {
    provider: 'giscus' as const,
    giscusConfig: {
      repo: process.env.NEXT_PUBLIC_GISCUS_REPO as string,
      repositoryId: process.env.NEXT_PUBLIC_GISCUS_REPOSITORY_ID as string,
      category: process.env.NEXT_PUBLIC_GISCUS_CATEGORY as string,
      categoryId: process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID as string,
      mapping: 'pathname',
      reactions: '1',
      metadata: '0',
      theme: 'light',
      darkTheme: 'transparent_dark',
      themeURL: '',
      lang: 'en',
    },
  },
  search: {
    provider: 'kbar' as const,
    kbarConfig: {
      searchDocumentsPath: `${process.env.BASE_PATH || ''}/search.json`,
    },
  },
};

export default siteMetadata;
