import { Search, X } from 'lucide-react';
import { Select } from '../ui/Select.jsx';
import { titleCase } from '../../utils/format.js';

/**
 * filter: { key, value, onChange, label, options: string[] | {value,label}[] }
 */
export const FilterBar = ({ search, onSearch, searchPlaceholder = 'Search…', filters = [], onClear, resultCount }) => {
  const hasFilters = search !== '' || filters.some((f) => f.value);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg bg-white py-2.5 pr-3.5 pl-10 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {filters.map((f) => (
          <Select
            key={f.key}
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            className="w-full lg:w-44"
            placeholder={f.label}
          >
            {f.options.map((opt) => {
              const value = typeof opt === 'string' ? opt : opt.value;
              const label = typeof opt === 'string' ? titleCase(opt) : opt.label;
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </Select>
        ))}
      </div>

      {hasFilters && (
        <div className="flex items-center justify-between">
          {typeof resultCount === 'number' && (
            <p className="text-xs font-medium text-slate-400">
              {resultCount} {resultCount === 1 ? 'result' : 'results'}
            </p>
          )}
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-500"
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        </div>
      )}
    </div>
  );
};
