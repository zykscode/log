import React from 'react';

import AnimatedPostGrid from '@/components/AnimatedPostGrid';
import Wrapper from '@/components/Wrapper';
import { getAllPosts } from '@/lib/hyrgaph';

const Page = async () => {
  const posts = await getAllPosts();

  return (
    <Wrapper>
      <h1>Posts</h1>
      <AnimatedPostGrid posts={posts} />
    </Wrapper>
  );
};

export default Page;
