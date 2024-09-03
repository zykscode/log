'use client';

import { format } from 'date-fns';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import React, { useRef } from 'react';

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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      className={styles['post-card']}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles['post-card__image-container']}>
        <Image
          src={coverImage}
          alt={title}
          layout="fill"
          objectFit="cover"
          className={styles['post-card__image']}
        />
      </div>
      <div className={styles['post-card__content']}>
        <h2 className={styles['post-card__title']}>{title}</h2>
        <p className={styles['post-card__excerpt']}>{excerpt}</p>
        <div className={styles['post-card__meta']}>
          <p className={styles['post-card__date']}>
            {format(new Date(date), 'MMMM d, yyyy')}
          </p>
          <p className={styles['post-card__author']}>{author}</p>
        </div>
        <div className={styles['post-card__tags']}>
          {tags.map((tag) => (
            <span
              key={tag.title}
              className={styles['post-card__tag']}
              style={{ backgroundColor: tag.color }}
            >
              {tag.title}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
