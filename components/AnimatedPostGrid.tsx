'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import React from 'react';

import { Post } from '@/types';

import PostCard from './PostCard';
import styles from './PostCard.module.css';

interface AnimatedPostGridProps {
  posts: Post[];
}

const AnimatedPostGrid: React.FC<AnimatedPostGridProps> = ({ posts }) => {
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <>
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'var(--primary-color)',
          transformOrigin: '0%',
          scaleX,
        }}
      />
      <div className={styles['posts-container']}>
        {[...posts, ...posts, ...posts, ...posts].map(
          (post: Post, index: number) => (
            <motion.div
              key={`${post.id}-${index}`}
              className={styles['post-item']}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
            >
              <PostCard
                tags={post.tag}
                date={post.createdAt}
                author={post.author.name}
                title={post.title}
                excerpt={post.summary}
                coverImage={post.coverImage.url}
              />
            </motion.div>
          ),
        )}
      </div>
    </>
  );
};

export default AnimatedPostGrid;
