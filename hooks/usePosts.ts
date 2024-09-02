/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';

import {
  getAdjacentPosts,
  getAllAuthors,
  getAllPosts,
  getAllTags,
  getAuthorById,
  getCachedPosts,
  getCommentsByPostId,
  getPostBySlug,
  getPostsByTag,
} from '@/lib/hyrgaph';

// Hook to get all posts
export function useAllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    function fetchPosts() {
      (async () => {
        try {
          const data = await getAllPosts();
          setPosts(data);
        } catch (err: any) {
          // Explicitly type the error as 'any'
          setError(err);
        } finally {
          setLoading(false);
        }
      })();
    }
    fetchPosts();
  }, []);

  return { posts, loading, error };
}

// Hook to get a post by slug
export function usePostBySlug(slug: string) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    function fetchPost() {
      (async () => {
        try {
          const data = await getPostBySlug(slug);
          setPost(data);
        } catch (err: any) {
          // Explicitly type the error as 'any'
          setError(err);
        } finally {
          setLoading(false);
        }
      })();
    }
    fetchPost();
  }, [slug]);

  return { post, loading, error };
}

// Hook to get all authors
export function useAllAuthors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    function fetchAuthors() {
      (async () => {
        try {
          const data = await getAllAuthors();
          setAuthors(data);
        } catch (err: any) {
          // Explicitly type the error as 'any'
          setError(err);
        } finally {
          setLoading(false);
        }
      })();
    }
    fetchAuthors();
  }, []);

  return { authors, loading, error };
}

// Hook to get an author by ID
export function useAuthorById(id: string) {
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    function fetchAuthor() {
      (async () => {
        try {
          const data = await getAuthorById(id);
          setAuthor(data);
        } catch (err: any) {
          // Explicitly type the error as 'any'
          setError(err);
        } finally {
          setLoading(false);
        }
      })();
    }
    fetchAuthor();
  }, [id]);

  return { author, loading, error };
}

// Hook to get all tags
export function useAllTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    function fetchTags() {
      (async () => {
        try {
          const data = await getAllTags();
          setTags(data);
        } catch (err: any) {
          // Explicitly type the error as 'any'
          setError(err);
        } finally {
          setLoading(false);
        }
      })();
    }
    fetchTags();
  }, []);

  return { tags, loading, error };
}

// Hook to get posts by tag
export function usePostsByTag(tag: string) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    function fetchPosts() {
      (async () => {
        try {
          const data = await getPostsByTag(tag);
          setPosts(data);
        } catch (err: any) {
          // Explicitly type the error as 'any'
          setError(err);
        } finally {
          setLoading(false);
        }
      })();
    }
    fetchPosts();
  }, [tag]);

  return { posts, loading, error };
}

// Hook to get cached posts
export function useCachedPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    function fetchPosts() {
      (async () => {
        try {
          const data = await getCachedPosts();
          setPosts(data);
        } catch (err: any) {
          // Explicitly type the error as 'any'
          setError(err);
        } finally {
          setLoading(false);
        }
      })();
    }
    fetchPosts();
  }, []);

  return { posts, loading, error };
}

// Hook to get adjacent posts
export function useAdjacentPosts(currentDate: string) {
  const [adjacentPosts, setAdjacentPosts] = useState({
    previousPost: null,
    nextPost: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    function fetchAdjacentPosts() {
      (async () => {
        try {
          const data = await getAdjacentPosts(currentDate);
          setAdjacentPosts(data);
        } catch (err: any) {
          // Explicitly type the error as 'any'
          setError(err);
        } finally {
          setLoading(false);
        }
      })();
    }
    fetchAdjacentPosts();
  }, [currentDate]);

  return { adjacentPosts, loading, error };
}

// Hook to get comments by post ID
export function useCommentsByPostId(postId: string) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    function fetchComments() {
      (async () => {
        try {
          const data = await getCommentsByPostId(postId);
          setComments(data);
        } catch (err: any) {
          // Explicitly type the error as 'any'
          setError(err);
        } finally {
          setLoading(false);
        }
      })();
    }
    fetchComments();
  }, [postId]);

  return { comments, loading, error };
}
