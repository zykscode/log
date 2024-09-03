'use client';

import { motion } from 'framer-motion';
import React from 'react';

import { Post } from '@/types';

import PostCard from './PostCard';

interface AnimatedPostGridProps {
  posts: Post[];
}

const AnimatedPostGrid: React.FC<AnimatedPostGridProps> = ({ posts }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      className="posts-grid overflow-y-auto max-h-[80vh]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {posts.map((post: Post) => (
        <PostCard
          key={post.id}
          tags={post.tag}
          date={post.createdAt}
          author={post.author.name}
          title={post.title}
          excerpt={post.summary}
          coverImage={post.coverImage.url}
        />
      ))}
    </motion.div>
  );
};

export default AnimatedPostGrid;
