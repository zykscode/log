'use client';

import { motion } from 'framer-motion';

import { useMenu } from '@/contexts/MenuContext';

const Main = ({ children }: { children: React.ReactNode }) => {
  const { isOpen } = useMenu();

  const variants = {
    open: {
      opacity: 0,
    },
    closed: {
      opacity: 1,
      transition: {
        delay: 0.75,
      },
    },
  };

  return (
    <motion.main
      className="flex-grow px-1 flex flex-col overflow-hidden"
      initial="closed"
      animate={isOpen ? 'open' : 'closed'}
      variants={variants}
    >
      <div className="flex flex-col lg:flex-row h-full overflow-hidden">
        {children}
      </div>
    </motion.main>
  );
};

export default Main;
