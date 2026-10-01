import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, FilePlus2, Inbox } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { complaintService } from '../../services/api.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { ComplaintTable } from '../../components/Complaints/ComplaintTable.jsx';
import { FilterBar } from '../../components/Complaints/FilterBar.jsx';
import {
  CATEGORY_NAMES,
  COMPLAINT_STATUSES,
  PRIORITIES,
  SORT_OPTIONS,
} from '../../utils/constants.js';
import { Select } from '../../components/ui/Select.jsx';

const PAGE_SIZE = 8;

export default function MyComplaints() {
  const navigate = useNavigate();
  const { data: complaints, loading, error, refetch } = useFetch(() =>
    complaintService.getMy().then((res) => res.complaints)
  );

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, category, priority, sort]);

  const filtered = useMemo(() => {
    let list = [...(complaints || [])];
    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.complaintId.toLowerCase().includes(q) ||
          c.issue.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    if (status) list = list.filter((c) => c.status === status);
    if (category) list = list.filter((c) => c.category === category);
    if (priority) list = list.filter((c) => c.priority === priority);

    list.sort((a, b) => {
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === 'priority') return PRIORITIES.indexOf(b.priority) - PRIORITIES.indexOf(a.priority);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return list;
  }, [complaints, debouncedSearch, status, category, priority, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setCategory('');
    setPriority('');
    setSort('newest');
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="My Complaints"
        description="Search, filter and track everything you have reported."
        actions={
          <Button icon={FilePlus2} onClick={() => navigate('/student/complaints/new')}>
            New Complaint
          </Button>
        }
      />

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
              searchPlaceholder="Search by ID, issue or category…"
              filters={[
                {
                  key: 'status',
                  value: status,
                  onChange: setStatus,
                  label: 'All statuses',
                  options: COMPLAINT_STATUSES,
                },
                {
                  key: 'category',
                  value: category,
                  onChange: setCategory,
                  label: 'All categories',
                  options: CATEGORY_NAMES,
                },
                {
                  key: 'priority',
                  value: priority,
                  onChange: setPriority,
                  label: 'All priorities',
                  options: PRIORITIES,
                },
              ]}
              onClear={clearFilters}
              resultCount={filtered.length}
            />
            <div className="mt-3 flex justify-end">
              <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full sm:w-52">
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
          </Card>

          {loading ? (
            <Card className="p-16">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
                Loading complaints…
              </div>
            </Card>
          ) : filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={complaints?.length ? ClipboardList : Inbox}
                title={complaints?.length ? 'No matching complaints' : 'No complaints yet'}
                description={
                  complaints?.length
                    ? 'Try adjusting your search or filters.'
                    : 'Report your first issue and track it here.'
                }
              >
                <Button icon={FilePlus2} onClick={() => navigate('/student/complaints/new')}>
                  Create Your First Complaint
                </Button>
              </EmptyState>
            </Card>
          ) : (
            <>
              <ComplaintTable
                complaints={pageItems}
                onView={(id) => navigate(`/student/complaints/${id}`)}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
