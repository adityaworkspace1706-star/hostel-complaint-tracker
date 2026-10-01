/** SVG donut chart with legend. */
export const DonutChart = ({ data = [], size = 180, thickness = 26, centerLabel, centerValue }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = data.map((d) => {
    const fraction = d.value / total;
    const segment = {
      ...d,
      dash: `${fraction * circumference} ${circumference}`,
      offset: -offset * circumference,
    };
    offset += fraction;
    return segment;
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={thickness}
          />
          {segments.map((s, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={s.dash}
              strokeDashoffset={s.offset}
              strokeLinecap="butt"
              className="transition-all duration-500"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{centerValue}</span>
          {centerLabel && <span className="text-xs font-medium text-slate-400">{centerLabel}</span>}
        </div>
      </div>
      <ul className="w-full max-w-[220px] space-y-2.5">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2.5 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="flex-1 truncate text-slate-600">{d.label}</span>
            <span className="font-semibold text-slate-900">{d.value}</span>
            <span className="w-10 text-right text-xs text-slate-400">
              {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
