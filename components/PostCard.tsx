'use client';

import { format } from 'date-fns';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import styles from './PostCard.module.css';

interface PostCardProps {
  title: string;
  excerpt: string;
  coverImage: string;
  date: string;
  author: string;
  tags: { title: string; color: string }[];
}

const PostCard: React.FC<PostCardProps> = ({
  title,
  excerpt,
  coverImage,
  date,
  author,
  tags,
}) => {
  const [loading, setLoading] = useState(true);
  const formattedDate = format(new Date(date), 'MMMM dd, yyyy');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000); // Simulate loading time
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className={styles['post-card']}
      whileHover={{
        scale: 1.05,
        boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.1)',
        transition: { duration: 0.3 },
      }}
    >
      {loading ? (
        <div className={`${styles.skeleton} ${styles['skeleton__image']}`} />
      ) : (
        <motion.div
          className={styles['post-card__image-container']}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={coverImage}
            alt={title}
            layout="fill"
            objectFit="cover"
            className={styles['post-card__image']}
            priority
          />
        </motion.div>
      )}
      <div className={styles['post-card__content']}>
        {loading ? (
          <>
            <div
              className={`${styles.skeleton} ${styles['skeleton__title']}`}
            />
            <div
              className={`${styles.skeleton} ${styles['skeleton__excerpt']}`}
            />
            <div className={`${styles.skeleton} ${styles['skeleton__meta']}`} />
            <div className={`${styles.skeleton} ${styles['skeleton__tags']}`} />
          </>
        ) : (
          <>
            <motion.h2
              className={styles['post-card__title']}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {title}
            </motion.h2>
            <motion.p
              className={styles['post-card__excerpt']}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {excerpt}
            </motion.p>
            <motion.div
              className={styles['post-card__meta']}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <span className={styles['post-card__date']}>{formattedDate}</span>
              <span className={styles['post-card__author']}>By {author}</span>
            </motion.div>
            <motion.div
              className={styles['post-card__tags']}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {tags.map((tag, index) => (
                <span key={index} className={styles['post-card__tag']}>
                  {tag.title}
                </span>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default PostCard;
