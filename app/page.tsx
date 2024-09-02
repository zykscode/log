/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';

import PostCard from '@/components/PostCard';
import Wrapper from '@/components/Wrapper';
import { getAllPosts } from '@/lib/hyrgaph';
import { Post } from '@/types/post'; // Adjust the import path as needed

const Page = async () => {
  const posts = await getAllPosts();

  return (
    <Wrapper>
      <h1>Posts</h1>
      <div className="posts-grid">
        {posts.map((post: Post) => (
          <PostCard
            tags={post.tag}
            date={post.createdAt}
            author={post.author.name}
            key={post.id}
            title={post.title}
            excerpt={post.summary}
            coverImage={post.coverImage.url}
          />
        ))}
      </div>
    </Wrapper>
  );
};

export default Page;
