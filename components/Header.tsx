'use client';

import { motion } from 'motion/react';
import React from 'react';

import { useMenu } from '@/contexts/MenuContext';

import Breadcrumbs from './Breadcrumbs';
import Navs from './Navs';

const Header = () => {
  const { isOpen, toggleOpen } = useMenu();
  return (
    <motion.header
      initial={false}
      animate={isOpen ? 'open' : 'closed'}
      className="header items-center md:h-20"
    >
      <Breadcrumbs />

      <Navs toggle={() => toggleOpen()} />
    </motion.header>
  );
};

export default Header;
