import { initials } from '../../utils/format.js';

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

export const Avatar = ({ name = '', size = 'md', className = '' }) => (
  <span
    className={`inline-flex shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700 ${SIZES[size]} ${className}`}
    title={name}
  >
    {initials(name)}
  </span>
);
