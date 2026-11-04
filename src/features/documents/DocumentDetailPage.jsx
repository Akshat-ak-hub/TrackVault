import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import FileIcon from '../../components/ui/FileIcon.jsx'
import PageTitle from '../../components/ui/PageTitle.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'

export default function DocumentDetailPage({
  document,
  onNavigate,
  onUpload,
  onSubmit,
}) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  if (!document)
    return (
      <>
        <PageTitle eyebrow="Workspace / Library" title="Document not found" />
        <p className="font-semibold">
          This document may have been removed or the link is incorrect.
        </p>
        <Button
          className="mt-5"
          variant="yellow"
          onClick={() => onNavigate('/app/documents')}
        >
          Back to documents
        </Button>
      </>
    )
  const submit = async () => {
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(document.id)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => onNavigate('/app/documents')}
          className="text-xs font-black uppercase underline"
        >
          ← All documents
        </button>
        <div className="flex gap-3">
          <Button variant="plain" onClick={onUpload}>
            ＋ New version
          </Button>
          {document.previewUrl ? (
            <a
              href={document.previewUrl}
              download={document.fileName}
              className="border-[3px] border-[#171717] bg-[#ffdf4f] px-5 py-3 text-xs font-black uppercase shadow-[3px_3px_0_#171717]"
            >
              Download current
            </a>
          ) : (
            <Button variant="yellow" disabled>
              File unavailable
            </Button>
          )}
        </div>
      </div>
      <section className="border-[3px] border-[#171717] bg-white shadow-[5px_5px_0_#171717]">
        <div className="flex flex-wrap items-start gap-4 border-b-[3px] border-[#171717] p-6">
          <FileIcon type={document.type} className="h-14 w-14 text-xs" />
          <div className="min-w-[50%] flex-1">
            <p className="text-xs font-black uppercase tracking-widest text-[#6c675f]">
              {document.category} · {document.department}
            </p>
            <h1 className="mt-1 text-3xl font-black uppercase">
              {document.title}
            </h1>
            <p className="mt-2 text-sm font-semibold text-[#6c675f]">
              {document.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {document.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-[#171717] bg-[#f7f3ed] px-2 py-1 text-[10px] font-black uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <StatusBadge>{document.status}</StatusBadge>
        </div>
        <div className="grid gap-4 border-b-2 border-[#171717] bg-[#f7f3ed] p-5 sm:grid-cols-4">
          {[
            ['Owner', document.owner],
            ['Current version', `v${document.version}`],
            ['Last updated', document.updatedAt],
            ['File', `${document.fileName} · ${document.size}`],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#6c675f]">
                {label}
              </p>
              <p className="mt-1 break-words text-xs font-black">{value}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-8 p-6 lg:grid-cols-[1.3fr_.7fr]">
          <div>
            <h2 className="text-xl font-black uppercase">Version history</h2>
            <div className="mt-4 divide-y-2 divide-[#171717] border-y-2 border-[#171717]">
              {document.versions.map((version) => (
                <div
                  key={version.number}
                  className="flex items-center gap-3 py-4"
                >
                  <FileIcon type={document.type} className="h-9 w-9" />
                  <div className="min-w-0 flex-1">
                    <b className="block text-sm">
                      Version {version.number}
                      {version.number === document.version ? ' · Current' : ''}
                    </b>
                    <small className="text-xs font-semibold text-[#6c675f]">
                      {version.date} · {version.note}
                    </small>
                  </div>
                  <span className="text-xs font-bold">{version.by}</span>
                </div>
              ))}
            </div>
          </div>
          <aside className="border-[3px] border-[#171717] bg-[#fff8d5] p-5">
            <h2 className="text-sm font-black uppercase">Document workflow</h2>
            <p className="mt-3 text-xs font-semibold leading-relaxed">
              This version is currently <b>{document.status.toLowerCase()}</b>.
              Submitting sends version {document.version} for an approval
              decision.
            </p>
            <Button
              className="mt-5 w-full"
              variant="green"
              disabled={
                document.status === 'Pending' ||
                document.status === 'Archived' ||
                submitting
              }
              onClick={submit}
            >
              {submitting ? 'Submitting...' : 'Submit for approval'}
            </Button>
            {error && (
              <p
                role="alert"
                className="mt-3 text-xs font-black text-[#bd2f21]"
              >
                {error}
              </p>
            )}
            <p className="mt-3 text-[10px] font-semibold text-[#6c675f]">
              Approval status is shared with authorized workspace members.
            </p>
          </aside>
        </div>
      </section>
    </>
  )
}
