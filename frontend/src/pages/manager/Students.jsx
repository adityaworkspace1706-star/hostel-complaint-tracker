import { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { managerService } from '../../services/api.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { FilterBar } from '../../components/Complaints/FilterBar.jsx';
import { HOSTELS } from '../../utils/constants.js';

export default function Students() {
  const { data: students, loading, error, refetch } = useFetch(() =>
    managerService.getStudents().then((res) => res.students)
  );

  const [search, setSearch] = useState('');
  const [hostel, setHostel] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => {
    let list = [...(students || [])];
    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || String(s.room).toLowerCase().includes(q)
      );
    }
    if (hostel) list = list.filter((s) => s.hostel === hostel);
    return list;
  }, [students, debouncedSearch, hostel]);

  const clearFilters = () => {
    setSearch('');
    setHostel('');
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Students" description="Registered students and their complaint activity." />

      {error ? (
        <Card>
          <ErrorState message={error.message} onRetry={refetch} />
        </Card>
      ) : (
        <>
          <Card className="mb-5 p-4">
            <FilterBar
              search={search}
              onSearch={setSearch}
              searchPlaceholder="Search by name, email or room…"
              filters={[
                { key: 'hostel', value: hostel, onChange: setHostel, label: 'All hostels', options: HOSTELS },
              ]}
              onClear={clearFilters}
              resultCount={filtered.length}
            />
          </Card>

          {loading ? (
            <Card className="p-16">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
                Loading students…
              </div>
            </Card>
          ) : filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={Users}
                title={students?.length ? 'No matching students' : 'No students registered yet'}
                description={students?.length ? 'Try adjusting your search.' : 'Students appear here after they register.'}
              />
            </Card>
          ) : (
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                      <th className="px-4 py-3 font-semibold">Student</th>
                      <th className="px-4 py-3 font-semibold">Hostel</th>
                      <th className="px-4 py-3 font-semibold">Room</th>
                      <th className="px-4 py-3 text-center font-semibold">Total</th>
                      <th className="px-4 py-3 text-center font-semibold">Pending</th>
                      <th className="px-4 py-3 text-center font-semibold">In Progress</th>
                      <th className="px-4 py-3 text-center font-semibold">Resolved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((s) => (
                      <tr key={s._id} className="transition hover:bg-slate-50">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={s.name} size="sm" />
                            <div>
                              <p className="font-semibold text-slate-900">{s.name}</p>
                              <p className="text-xs text-slate-400">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">{s.hostel}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">{s.room}</td>
                        <td className="px-4 py-3.5 text-center font-semibold text-slate-900">{s.stats.total}</td>
                        <td className="px-4 py-3.5 text-center font-medium text-amber-600">{s.stats.pending}</td>
                        <td className="px-4 py-3.5 text-center font-medium text-blue-600">{s.stats.inProgress}</td>
                        <td className="px-4 py-3.5 text-center font-medium text-emerald-600">{s.stats.resolved}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 p-4 md:hidden">
                {filtered.map((s) => (
                  <div key={s._id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/60">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{s.name}</p>
                        <p className="truncate text-xs text-slate-400">{s.email}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      {s.hostel} · Room {s.room}
                    </p>
                    <div className="mt-2.5 grid grid-cols-4 gap-2 text-center">
                      {[
                        ['Total', s.stats.total, 'text-slate-900'],
                        ['Pending', s.stats.pending, 'text-amber-600'],
                        ['In Prog.', s.stats.inProgress, 'text-blue-600'],
                        ['Resolved', s.stats.resolved, 'text-emerald-600'],
                      ].map(([label, value, color]) => (
                        <div key={label} className="rounded-lg bg-white py-1.5 ring-1 ring-slate-200/60">
                          <p className={`text-sm font-bold ${color}`}>{value}</p>
                          <p className="text-[10px] text-slate-400">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
