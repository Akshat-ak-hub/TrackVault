import { useMemo, useState } from 'react'
import EmptyState from '../../components/ui/EmptyState.jsx'
import FileIcon from '../../components/ui/FileIcon.jsx'
import PageTitle from '../../components/ui/PageTitle.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import Button from '../../components/ui/Button.jsx'

export default function DocumentsPage({
  documents,
  onNavigate,
  onUpload,
  title = 'Documents',
  eyebrow = 'Workspace / Library',
}) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const filtered = useMemo(
    () =>
      documents.filter(
        (doc) =>
          `${doc.title} ${doc.category} ${doc.owner}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (statusFilter === 'All statuses' || doc.status === statusFilter),
      ),
    [documents, query, statusFilter],
  )
  const countFor = (status) =>
    status === 'All files'
      ? documents.length
      : status === 'Needs review'
        ? documents.filter((doc) => doc.status === 'Pending').length
        : documents.filter((doc) => doc.status === status).length

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <PageTitle eyebrow={eyebrow} title={title} />
        <Button onClick={onUpload}>＋ Upload document</Button>
      </div>
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          ['All files', countFor('All files'), 'bg-white'],
          ['Approved', countFor('Approved'), 'bg-[#b8f36b]'],
          ['Needs review', countFor('Needs review'), 'bg-[#ffbd59]'],
        ].map(([label, value, color]) => (
          <div
            key={label}
            className={`border-[3px] border-[#171717] ${color} p-4 shadow-[4px_4px_0_#171717]`}
          >
            <p className="text-xs font-black uppercase">{label}</p>
            <p className="mt-2 text-3xl font-black">
              {value.toString().padStart(2, '0')}
            </p>
          </div>
        ))}
      </div>
      <section className="border-[3px] border-[#171717] bg-white shadow-[5px_5px_0_#171717]">
        <div className="flex flex-col gap-3 border-b-[3px] border-[#171717] p-4 sm:flex-row">
          <label className="flex flex-1 items-center gap-2 border-2 border-[#171717] px-3">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search documents"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent py-2 text-sm font-bold outline-none"
              placeholder="Search by name, category or owner..."
            />
          </label>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="border-2 border-[#171717] bg-[#f7f3ed] px-3 py-2 text-xs font-black uppercase"
          >
            <option>All statuses</option>
            {['Draft', 'Pending', 'Approved', 'Rejected', 'Archived'].map(
              (status) => (
                <option key={status}>{status}</option>
              ),
            )}
          </select>
        </div>
        {filtered.length ? (
          <>
            <div className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto] gap-4 border-b-2 border-[#171717] bg-[#f7f3ed] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#6c675f] md:grid">
              <span>Document</span>
              <span>Category</span>
              <span>Owner</span>
              <span>Updated</span>
              <span>Status</span>
            </div>
            <div className="divide-y-2 divide-[#171717]">
              {filtered.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-wrap items-center gap-3 p-4 hover:bg-[#fff8d5] md:grid md:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto] md:gap-4"
                >
                  <button
                    onClick={() => onNavigate(`/app/documents/${doc.id}`)}
                    className="flex min-w-[65%] flex-1 items-center gap-3 text-left md:min-w-0"
                  >
                    <FileIcon type={doc.type} />
                    <span className="min-w-0">
                      <b className="block truncate text-sm">{doc.title}</b>
                      <small className="text-xs font-semibold text-[#6c675f]">
                        {doc.fileName} · v{doc.version}
                      </small>
                    </span>
                  </button>
                  <span className="hidden text-xs font-bold md:block">
                    {doc.category}
                  </span>
                  <span className="hidden text-xs font-semibold md:block">
                    {doc.owner}
                  </span>
                  <span className="hidden text-xs font-semibold text-[#6c675f] md:block">
                    {doc.updatedAt}
                  </span>
                  <StatusBadge>{doc.status}</StatusBadge>
                </div>
              ))}
            </div>
            <div className="border-t-2 border-[#171717] p-3 text-xs font-semibold text-[#6c675f]">
              Showing {filtered.length} of {documents.length} documents
            </div>
          </>
        ) : (
          <div className="p-5">
            <EmptyState
              title="No matching documents"
              description="Try another search or clear the status filter."
              action={
                <Button
                  variant="yellow"
                  onClick={() => {
                    setQuery('')
                    setStatusFilter('All statuses')
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          </div>
        )}
      </section>
    </>
  )
}
