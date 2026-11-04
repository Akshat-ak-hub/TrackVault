import { useMemo, useState } from 'react'
import PageTitle from '../../components/ui/PageTitle.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'

export default function ActivityPage({ activities }) {
  const [filter, setFilter] = useState('All activity')
  const [exportNotice, setExportNotice] = useState(false)
  const filtered = useMemo(
    () =>
      filter === 'All activity'
        ? activities
        : activities.filter((item) => item.type === filter),
    [activities, filter],
  )
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle eyebrow="Workspace / Audit trail" title="Activity log" />
        <button
          onClick={() => setExportNotice(true)}
          className="mb-8 border-[3px] border-[#171717] bg-[#171717] px-5 py-3 text-xs font-black uppercase text-white shadow-[4px_4px_0_#ff6b5c]"
        >
          Export log ↓
        </button>
      </div>
      {exportNotice && (
        <p
          role="status"
          className="mb-4 border-2 border-[#171717] bg-[#ffdf4f] p-3 text-xs font-black uppercase"
        >
          Log export will be enabled when connected to the API.
        </p>
      )}
      <section className="border-[3px] border-[#171717] bg-white shadow-[5px_5px_0_#171717]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[#171717] p-4">
          <div className="flex flex-wrap gap-2">
            {['All activity', 'Uploads', 'Approvals', 'Users'].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`border-2 border-[#171717] px-3 py-2 text-[10px] font-black uppercase ${filter === item ? 'bg-[#ffdf4f]' : 'bg-white'}`}
              >
                {item}
              </button>
            ))}
          </div>
          <span className="text-[10px] font-black uppercase text-[#6c675f]">
            {filtered.length} events
          </span>
        </div>
        {filtered.length ? (
          <div className="divide-y-2 divide-[#171717]">
            {filtered.map((item) => (
              <article key={item.id} className="flex gap-4 p-5">
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center border-2 border-[#171717] ${item.color} text-xs font-black`}
                >
                  {item.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <b>{item.actor}</b> {item.action}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#6c675f]">
                    {item.entity}
                  </p>
                </div>
                <time className="shrink-0 text-[10px] font-black uppercase text-[#6c675f]">
                  {item.time}
                </time>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              title="No matching activity"
              description="Events will appear here as people work in the workspace."
            />
          </div>
        )}
      </section>
    </>
  )
}
