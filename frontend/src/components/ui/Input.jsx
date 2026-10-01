import { forwardRef, useId } from 'react';

export const Input = forwardRef(
  ({ label, error, icon: Icon, hint, className = '', id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id || autoId;
    return (
      <div className={className}>
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-lg bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
              Icon ? 'pl-10' : ''
            } ${
              error
                ? 'ring-red-300 focus:ring-red-500'
                : 'ring-slate-200 focus:ring-indigo-500'
            }`}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
