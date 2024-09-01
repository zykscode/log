'use client';

import React from 'react';

import { navs } from '@/data/headerNavLinks';

import { MenuToggle } from './MenuToggle';
import NavLink from './NavLinks';

const variants = {
  open: (i) => ({
    x: '100%',
    opacity: 0,
    transition: {
      delay: i * 0.7,
      duration: 0.75,
    },
  }),
  closed: {
    x: '0',
    opacity: 0.8,
    transition: {
      duration: 0.7,
    },
  },
};

const Navs = ({ toggle }) => {
  return (
    <nav className="text-md uppercase w-1/2 justify-between breadcrumbs">
      <div className="flex w-full justify-evenly">
        {navs.map((nav, i) => {
          return <NavLink text={nav} i={i} key={nav} />;
        })}
      </div>
      <MenuToggle toggle={toggle} />
    </nav>
  );
};

export default Navs;
