import { gql, GraphQLClient } from 'graphql-request';

const endpoint = process.env.NEXT_HYGRAPH_ENDPOINT;
const token = process.env.HYGRAPH_MUTATION_TOKEN;

if (!endpoint || !token) {
  throw new Error('Missing required environment variables');
}

const hygraphClient = new GraphQLClient(endpoint, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Keep only the query functions (getAllPosts, getPostBySlug, etc.)
// Remove all mutation functions

// Add a new function for fetching comments
export async function getCommentsByPostId(postId: string) {
  const query = gql`
    query CommentsByPostId($postId: ID!) {
      comments(where: { post: { id: $postId } }, orderBy: createdAt_DESC) {
        id
        name
        email
        content
        createdAt
      }
    }
  `;
  interface CommentsResponse {
    comments: Array<{
      id: string;
      name: string;
      email: string;
      content: string;
      createdAt: string;
    }>;
  }
  const { comments } = await hygraphClient.request<CommentsResponse>(query, {
    postId,
  });
  return comments;
}

// Queries

// Use this to get all posts, ordered by creation date
export async function getAllPosts() {
  const query = gql`
    query {
      posts(orderBy: createdAt_DESC) {
        id
        title
        createdAt
        tag {
          id
          title
          colors
        }
        summary
        coverImage {
          url
        }
        slug
        author {
          id
          name
        }
      }
    }
  `;
  try {
    const { posts } = await hygraphClient.request<{ posts: Post[] }>(query);
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

// Use this to get a specific post by its slug
export async function getPostBySlug(slug: string) {
  const query = gql`
    query PostBySlug($slug: String!) {
      post(where: { slug: $slug }) {
        id
        title
        coverImage {
          url
        }
        createdAt
        tag {
          id
          title
          colors
        }
        isFeatured
        summary
        slug
        content {
          text
          markdown
        }
        author {
          id
          name
          avatar {
            url
          }
          email
          twitter
          linkedin
          github
        }
      }
    }
  `;
  const { post } = await hygraphClient.request<PostResponse>(query, { slug });
  return post;
}

// Use this to get all authors
export async function getAllAuthors() {
  const query = gql`
    query AllAuthors {
      authors {
        id
        name
        avatar {
          url
        }
        occupation
        company
        email
        twitter
        linkedin
        github
      }
    }
  `;
  const { authors } = await hygraphClient.request<{ authors: Author[] }>(query);
  return authors;
}

// Use this to get a specific author by their ID
export async function getAuthorById(id: string) {
  const query = gql`
    query AuthorById($id: ID!) {
      author(where: { id: $id }) {
        id
        name
        avatar {
          url
        }
        occupation
        company
        email
        twitter
        linkedin
        github
      }
    }
  `;
  const { author } = await hygraphClient.request<AuthorResponse>(query, { id });
  return author;
}

// Use this to get all tags
export async function getAllTags() {
  const query = gql`
    query AllTags {
      tags {
        id
        title
        colors
      }
    }
  `;
  interface TagsResponse {
    tags: Array<{ id: string; title: string; colors: string }>;
  }
  const { tags } = await hygraphClient.request<TagsResponse>(query);
  return tags;
}

export async function getPostsByTag(tag: string) {
  const query = gql`
    query PostsByTag($tag: String!) {
      posts(where: { tags_some: { slug: $tag } }, orderBy: date_DESC) {
        title
        slug
        excerpt
        date
        coverImage {
          url
        }
        tags {
          name
          slug
        }
      }
    }
  `;

  interface PostsByTagResponse {
    posts: Array<{
      title: string;
      slug: string;
      excerpt: string;
      date: string;
      coverImage: { url: string };
      tags: Array<{ name: string; slug: string }>;
    }>;
  }

  const { posts } = await hygraphClient.request<PostsByTagResponse>(query, {
    tag,
  });
  return posts;
}

// Add caching
let cachedPosts: Post[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Use this to get cached posts for better performance
export async function getCachedPosts() {
  const now = Date.now();
  if (cachedPosts && now - lastFetchTime < CACHE_DURATION) {
    return cachedPosts;
  }

  cachedPosts = await getAllPosts();
  lastFetchTime = now;
  return cachedPosts;
}

// Use this to get adjacent posts for navigation
export async function getAdjacentPosts(currentDate: string) {
  const query = gql`
    query AdjacentPosts($currentDate: DateTime!) {
      previousPost: posts(
        first: 1
        orderBy: createdAt_DESC
        where: { createdAt_lt: $currentDate }
      ) {
        title
        slug
      }
      nextPost: posts(
        first: 1
        orderBy: createdAt_ASC
        where: { createdAt_gt: $currentDate }
      ) {
        title
        slug
      }
    }
  `;
  const { previousPost, nextPost } =
    await hygraphClient.request<AdjacentPostsResponse>(query, {
      currentDate,
    });

  return {
    previousPost: previousPost[0] || null,
    nextPost: nextPost[0] || null,
  };
}

interface Post {
  id: string;
  title: string;
  createdAt: string;
  tag: {
    id: string;
    title: string;
    colors: string;
  };
  summary: string;
  coverImage: {
    url: string;
  };
  slug: string;
  author: {
    id: string;
    name: string;
  };
}

interface PostResponse {
  post: Post; // Replace 'any' with a more specific type if available
}

interface Author {
  id: string;
  name: string;
  avatar: { url: string };
  occupation: string;
  company: string;
  email: string;
  twitter: string;
  linkedin: string;
  github: string;
}

interface AuthorResponse {
  author: Author;
}

interface AdjacentPostsResponse {
  previousPost: { title: string; slug: string }[];
  nextPost: { title: string; slug: string }[];
}
