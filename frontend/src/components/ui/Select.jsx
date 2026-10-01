import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(
  ({ label, error, hint, className = '', id, icon: Icon, children, placeholder, ...props }, ref) => {
    const autoId = useId();
    const selectId = id || autoId;
    return (
      <div className={className}>
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          )}
          <select
            id={selectId}
            ref={ref}
            className={`w-full appearance-none rounded-lg bg-white py-2.5 pr-10 text-sm text-slate-900 shadow-sm ring-1 ring-inset transition focus:outline-none focus:ring-2 ${
              Icon ? 'pl-10' : 'pl-3.5'
            } ${
              error
                ? 'ring-red-300 focus:ring-red-500'
                : 'ring-slate-200 focus:ring-indigo-500'
            }`}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
