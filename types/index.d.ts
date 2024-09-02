export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    twitter: string;
    github: string;
    youtube: string;
    linkedin: string;
  };
};

export interface Post {
  id: string;
  title: string;
  summary: string;
  tag: { title: string; color: string }[];
  createdAt: string;
  author: {
    name: string;
  };
  coverImage: {
    url: string;
  };
}
