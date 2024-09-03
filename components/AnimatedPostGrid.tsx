'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import React, { useEffect, useRef } from 'react';

import { Post } from '@/types';

import PostCard from './PostCard';
import styles from './PostCard.module.css';

interface AnimatedPostGridProps {
  posts: Post[];
}

const AnimatedPostGrid: React.FC<AnimatedPostGridProps> = ({ posts }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);

  // Ensure the transform updates when scrollYProgress changes
  useEffect(() => {
    y.set(`${scrollYProgress.get()}%`); // Convert number to string with percentage
  }, [scrollYProgress, y]);

  return (
    <div className={styles['posts-container']} ref={containerRef}>
      <motion.div className={styles['posts-grid']} style={{ y }}>
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
    </div>
  );
};

export default AnimatedPostGrid;
