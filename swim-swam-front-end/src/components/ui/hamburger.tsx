import { Button } from './button';

type HamburgerProps = {
  onClick?: () => void;
};

const Hamburger: React.FC<HamburgerProps> = ({ onClick }) => {
  return (
    <Button
      type='button'
      variant='secondary'
      onClick={onClick}
      className='h-10 w-10 p-0 bg-slate-800 hover:bg-slate-700 text-white rounded-md cursor-pointer'
      aria-label='Open menu'
    >
      <span className='sr-only'>Open menu</span>
      <span className='flex flex-col items-center justify-center gap-1'>
        <span className='h-0.5 w-5 bg-white rounded-full' />
        <span className='h-0.5 w-5 bg-white rounded-full' />
        <span className='h-0.5 w-5 bg-white rounded-full' />
      </span>
    </Button>
  );
};

export default Hamburger;
