import { forwardRef, useId } from 'react';

export const Textarea = forwardRef(
  ({ label, error, hint, className = '', id, rows = 4, ...props }, ref) => {
    const autoId = useId();
    const textareaId = id || autoId;
    return (
      <div className={className}>
        {label && (
          <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`w-full resize-none rounded-lg bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset transition placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
            error
              ? 'ring-red-300 focus:ring-red-500'
              : 'ring-slate-200 focus:ring-indigo-500'
          }`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
