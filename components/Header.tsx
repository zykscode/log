'use client';

import { motion } from 'framer-motion';
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
      className="header items-center h-18 md:h-20"
    >
      <Breadcrumbs />

      <Navs toggle={() => toggleOpen()} />
    </motion.header>
  );
};

export default Header;
