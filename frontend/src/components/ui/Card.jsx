export const Card = ({ className = '', children }) => (
  <div className={`rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 ${className}`}>
    {children}
  </div>
);
