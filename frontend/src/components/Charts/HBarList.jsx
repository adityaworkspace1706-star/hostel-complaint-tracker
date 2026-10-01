/** Horizontal bar list — great for "top issues" and category breakdowns. */
export const HBarList = ({ data = [], color = '#6366f1', format = (v) => v }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-3.5">
      {data.map((d, i) => (
        <li key={`${d.label}-${i}`}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="truncate font-medium text-slate-700">
              <span className="mr-2 inline-block w-5 text-right text-xs font-semibold text-slate-400">
                {i + 1}
              </span>
              {d.label}
            </span>
            <span className="shrink-0 font-semibold text-slate-900">{format(d.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};
