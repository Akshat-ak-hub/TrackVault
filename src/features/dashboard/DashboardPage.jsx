import { useEffect, useState } from 'react'
import { dashboardApi } from '../../api/dashboard.api.js'
import Button from '../../components/ui/Button.jsx'
import FileIcon from '../../components/ui/FileIcon.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'

export default function DashboardPage({
  documents,
  user,
  onNavigate,
  onUpload,
}) {
  const [statsState, setStatsState] = useState({
    organizationId: null,
    stats: null,
    error: '',
  })
  const statsData =
    statsState.organizationId === user.organizationId ? statsState.stats : null
  const statsError =
    statsState.organizationId === user.organizationId ? statsState.error : ''
  useEffect(() => {
    let cancelled = false
    dashboardApi
      .stats()
      .then(({ stats }) => {
        if (!cancelled) {
          setStatsState({ organizationId: user.organizationId, stats, error: '' })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setStatsState({
            organizationId: user.organizationId,
            stats: null,
            error: error.message,
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [user.organizationId])

  const scopedDocuments =
    user.role === 'employee'
      ? documents.filter((doc) => doc.ownerId === user.id)
      : documents
  const pendingCount = documents.filter(
    (doc) => doc.status === 'Pending',
  ).length
  const recent = [...scopedDocuments]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4)
  const stats = [
    [
      'Documents',
      statsData?.documentCount ?? '—',
      'Visible to your account',
      'bg-white',
    ],
    ...(user.role === 'approver' || user.role === 'admin'
      ? [
          [
            'Pending approvals',
            statsData?.pendingCount ?? '—',
            'Waiting for a decision',
            'bg-[#ffbd59]',
          ],
        ]
      : []),
  ]

  return (
    <>
      <div className="mb-9 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="mb-2 inline-block -rotate-2 border-2 border-[#171717] bg-[#ff6b5c] px-2 py-1 text-xs font-black uppercase">
            Workspace overview
          </p>
          <h1 className="text-5xl font-black uppercase leading-[.9] tracking-[-0.06em] sm:text-7xl">
            Good morning,
            <br />
            <span className="text-[#ff6b5c]">{user.name.split(' ')[0]}.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm font-bold text-[#6c675f]">
            Here&apos;s the latest across your documents and review queue.
          </p>
        </div>
        <Button onClick={onUpload}>＋ Upload document</Button>
      </div>
      {statsError && (
        <p role="status" className="mt-4 text-xs font-bold text-[#9b332b]">
          Dashboard counts are unavailable: {statsError}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(([label, value, note, color]) => (
          <div
            key={label}
            className={`border-[3px] border-[#171717] ${color} p-5 shadow-[5px_5px_0_#171717]`}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.14em]">
              {label}
            </p>
            <p className="my-3 text-4xl font-black tracking-[-0.08em]">
              {value}
            </p>
            <p className="text-xs font-bold">{note}</p>
          </div>
        ))}
      </div>
      <div
        className={`mt-10 grid gap-8 ${user.role === 'approver' || user.role === 'admin' ? 'xl:grid-cols-[1.4fr_1fr]' : 'xl:grid-cols-1'}`}
      >
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-2xl font-black uppercase tracking-[-0.05em]">
              Recent documents
            </h2>
            <button
              onClick={() => onNavigate('/app/documents')}
              className="text-xs font-black uppercase underline"
            >
              View library →
            </button>
          </div>
          <div className="border-[3px] border-[#171717] bg-white shadow-[5px_5px_0_#171717]">
            {recent.length === 0 && (
              <p className="p-5 text-sm font-semibold text-[#6c675f]">
                No documents yet. Upload a file to get started.
              </p>
            )}
            {recent.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onNavigate(`/app/documents/${doc.id}`)}
                className="flex w-full items-center gap-3 border-b-2 border-[#171717] p-4 text-left last:border-0 hover:bg-[#fff8d5]"
              >
                <FileIcon type={doc.type} />
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-sm">{doc.title}</b>
                  <small className="text-xs font-semibold text-[#6c675f]">
                    {doc.owner} · v{doc.version}
                  </small>
                </span>
                <StatusBadge>{doc.status}</StatusBadge>
              </button>
            ))}
          </div>
        </section>
        {(user.role === 'approver' || user.role === 'admin') && (
          <section>
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-2xl font-black uppercase tracking-[-0.05em]">
                Review queue
              </h2>
              <span className="border-2 border-[#171717] bg-[#ffdf4f] px-2 py-1 text-[10px] font-black uppercase">
                {pendingCount} pending
              </span>
            </div>
            <div className="border-[3px] border-[#171717] bg-[#d6b5ff] p-6 shadow-[5px_5px_0_#171717]">
              <p className="text-xs font-black uppercase tracking-widest">
                Your attention, please
              </p>
              <h3 className="mt-4 text-2xl font-black uppercase leading-tight">
                {pendingCount
                  ? 'Documents are ready for review.'
                  : 'Your queue is clear.'}
              </h3>
              <p className="mt-3 text-sm font-semibold">
                Open the approval center to review the submitted version and
                leave a decision.
              </p>
              <Button
                className="mt-6"
                variant="plain"
                onClick={() => onNavigate('/app/approvals')}
              >
                Open approval center →
              </Button>
            </div>
          </section>
        )}
      </div>
    </>
  )
}
