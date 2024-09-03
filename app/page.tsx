import React from 'react';

import AnimatedPostGrid from '@/components/AnimatedPostGrid';
import Wrapper from '@/components/Wrapper';
import { getAllPosts } from '@/lib/hyrgaph';

const Page = async () => {
  const posts = await getAllPosts();

  return (
    <Wrapper>
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-1/3 lg:pr-8 mb-8 lg:mb-0">
          <h1 className="text-3xl font-bold mb-4">Posts</h1>
          <p className="text-lg">
            Welcome to our blog! Here you'll find the latest articles on various
            topics. Scroll through the list on the right to explore our content.
          </p>
        </div>
        <div className="lg:w-2/3">
          <AnimatedPostGrid posts={posts} />
        </div>
      </div>
    </Wrapper>
  );
};

export default Page;
