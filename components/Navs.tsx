'use client';

import React from 'react';

import { navs } from '@/data/headerNavLinks';

import { MenuToggle } from './MenuToggle';
import NavLink from './NavLinks';

const Navs = ({ toggle }: { toggle: () => void }) => {
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
