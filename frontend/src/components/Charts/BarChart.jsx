/** Vertical bar chart built with pure CSS — no chart library needed. */
export const BarChart = ({ data = [], color = '#6366f1', height = 180, format = (v) => v }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
      {data.map((d, i) => (
        <div key={`${d.label}-${i}`} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          <div className="relative flex w-full flex-1 items-end justify-center">
            <div
              className="w-full max-w-[38px] rounded-t-md transition-all duration-300 group-hover:opacity-80"
              style={{
                height: `${Math.max((d.value / max) * 100, 3)}%`,
                backgroundColor: color,
              }}
            />
            {/* tooltip */}
            <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold whitespace-nowrap text-white opacity-0 shadow-lg transition group-hover:opacity-100">
              {format(d.value)}
            </div>
          </div>
          <span className="max-w-full truncate text-[11px] font-medium text-slate-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
};
