import EmptyState from '../../components/ui/EmptyState.jsx'
import FileIcon from '../../components/ui/FileIcon.jsx'
import PageTitle from '../../components/ui/PageTitle.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'

export default function ApprovalsPage({ documents, onNavigate }) {
  const pending = documents.filter((document) => document.status === 'Pending')
  return (
    <>
      <PageTitle eyebrow="Workspace / Decisions" title="Approval center" />
      <div className="mb-7 grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="border-[3px] border-[#171717] bg-[#d6b5ff] p-6 shadow-[5px_5px_0_#171717]">
          <p className="text-xs font-black uppercase tracking-[0.15em]">
            Your queue
          </p>
          <h2 className="mt-2 text-3xl font-black uppercase">
            {pending.length
              ? `${pending.length} document${pending.length === 1 ? '' : 's'} need your review.`
              : 'You are all caught up.'}
          </h2>
          <p className="mt-2 text-sm font-semibold">
            Review the current version before making a decision.
          </p>
        </div>
        <div className="grid min-w-40 place-items-center border-[3px] border-[#171717] bg-[#ffbd59] p-5 shadow-[5px_5px_0_#171717]">
          <span className="text-5xl font-black">
            {pending.length.toString().padStart(2, '0')}
          </span>
          <span className="text-[10px] font-black uppercase">Pending</span>
        </div>
      </div>
      {pending.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {pending.map((document) => (
            <article
              key={document.id}
              className="border-[3px] border-[#171717] bg-white p-5 shadow-[4px_4px_0_#171717]"
            >
              <div className="flex items-start justify-between">
                <StatusBadge>Pending</StatusBadge>
                <span className="text-xs font-bold text-[#6c675f]">
                  Submitted {document.updatedAt}
                </span>
              </div>
              <div className="mt-5 flex items-center gap-3">
                <FileIcon type={document.type} />
                <div>
                  <h3 className="text-lg font-black uppercase">
                    {document.title}
                  </h3>
                  <p className="text-xs font-semibold text-[#6c675f]">
                    v{document.version} · {document.category}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-between border-y-2 border-[#171717] py-3 text-xs">
                <span className="font-semibold">
                  Submitted by <b>{document.owner}</b>
                </span>
                <span className="font-black uppercase">
                  {document.department}
                </span>
              </div>
              <button
                onClick={() => onNavigate(`/app/approvals/${document.id}`)}
                className="mt-4 w-full border-[3px] border-[#171717] bg-[#ffdf4f] py-3 text-xs font-black uppercase shadow-[3px_3px_0_#171717]"
              >
                Review this version →
              </button>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No pending reviews"
          description="New approval requests will appear here when a document is submitted."
        />
      )}
    </>
  )
}
