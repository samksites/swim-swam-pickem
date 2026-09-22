import React from 'react';
import Hamburger from '@/components/ui/hamburger';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type HamburgerMenuProps = {
  children: React.ReactNode;
};

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ children }) => {
  return (
    <div className='absolute top-6 right-6'>
      <Popover>
        <PopoverTrigger asChild>
          <div>
            <Hamburger />
          </div>
        </PopoverTrigger>
        <PopoverContent align='end' className='w-56 bg-slate-900 border-slate-700 p-2'>
          <div className='flex flex-col gap-1'>
            {children}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default HamburgerMenu;
