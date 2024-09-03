'use client';

import { motion } from 'framer-motion';
import React, { useEffect, useRef } from 'react';

import { Post } from '@/types';

import PostCard from './PostCard';

interface AnimatedPostGridProps {
  posts: Post[];
}

const AnimatedPostGrid: React.FC<AnimatedPostGridProps> = ({ posts }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (scrollRef.current) {
        e.preventDefault();
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollTop + e.deltaY,
          behavior: 'smooth',
        });
      }
    };

    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

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
      ref={scrollRef}
      className="posts-grid overflow-y-auto max-h-[calc(100vh-200px)] lg:max-h-[80vh] custom-scrollbar"
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
