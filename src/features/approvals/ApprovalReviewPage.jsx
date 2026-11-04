import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import FileIcon from '../../components/ui/FileIcon.jsx'
import PageTitle from '../../components/ui/PageTitle.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'

export default function ApprovalReviewPage({
  document,
  onNavigate,
  onDecision,
}) {
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  if (!document)
    return (
      <>
        <PageTitle eyebrow="Workspace / Decisions" title="Request not found" />
        <Button variant="yellow" onClick={() => onNavigate('/app/approvals')}>
          Back to queue
        </Button>
      </>
    )
  const decide = async (status) => {
    if (status === 'Rejected' && !comment.trim()) {
      setError('Add a comment explaining the rejection.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await onDecision(document.id, status, comment.trim())
      onNavigate('/app/approvals')
    } catch (decisionError) {
      setError(decisionError.message)
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <>
      <button
        onClick={() => onNavigate('/app/approvals')}
        className="mb-5 text-xs font-black uppercase underline"
      >
        ← Back to queue
      </button>
      <PageTitle eyebrow="Workspace / Review" title="Review document" />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <section className="border-[3px] border-[#171717] bg-white shadow-[5px_5px_0_#171717]">
          <div className="flex items-center gap-4 border-b-[3px] border-[#171717] p-5">
            <FileIcon type={document.type} className="h-14 w-14" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest">
                {document.category} · Version {document.version}
              </p>
              <h2 className="truncate text-2xl font-black uppercase">
                {document.title}
              </h2>
            </div>
            <StatusBadge>{document.status}</StatusBadge>
          </div>
          <div className="min-h-72 bg-[#e9e4dc] p-4 sm:p-6">
            {document.previewUrl && document.type === 'PDF' ? (
              <iframe
                title={`Preview of ${document.title}`}
                src={document.previewUrl}
                className="h-[65vh] min-h-[480px] w-full border-[3px] border-[#171717] bg-white"
              />
            ) : document.previewUrl &&
              ['PNG', 'JPG'].includes(document.type) ? (
              <img
                src={document.previewUrl}
                alt={`Preview of ${document.title}`}
                className="mx-auto max-h-[65vh] max-w-full border-[3px] border-[#171717] bg-white object-contain"
              />
            ) : (
              <div className="grid min-h-72 place-items-center text-center">
                <div className="max-w-sm border-[3px] border-[#171717] bg-white p-8 shadow-[5px_5px_0_#171717]">
                  <FileIcon
                    type={document.type}
                    className="mx-auto h-14 w-14"
                  />
                  <h3 className="mt-4 font-black uppercase">
                    {document.previewUrl
                      ? 'Open the original file'
                      : 'File is unavailable'}
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-[#6c675f]">
                    {document.previewUrl
                      ? 'This file type cannot be shown in the browser preview. Download it to inspect the contents.'
                      : 'The stored file could not be loaded. Check your connection and reload the review page.'}
                  </p>
                  {document.previewUrl && (
                    <a
                      href={document.previewUrl}
                      download={document.fileName}
                      className="mt-5 inline-block border-[3px] border-[#171717] bg-[#ffdf4f] px-5 py-3 text-xs font-black uppercase shadow-[3px_3px_0_#171717]"
                    >
                      Download {document.fileName}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="p-5">
            <h3 className="text-sm font-black uppercase">Version note</h3>
            <p className="mt-2 text-sm font-semibold">
              {document.versions.at(-1)?.note || 'Submitted for review.'}
            </p>
          </div>
        </section>
        <aside className="h-fit border-[3px] border-[#171717] bg-[#fff8d5] p-5 shadow-[5px_5px_0_#171717]">
          <h2 className="text-xl font-black uppercase">Decision</h2>
          <p className="mt-2 text-xs font-semibold">
            This decision applies to version {document.version} only.
          </p>
          <label className="mt-6 block text-xs font-black uppercase">
            Review comment{' '}
            <span className="font-semibold normal-case text-[#6c675f]">
              (required for rejection)
            </span>
            <textarea
              value={comment}
              onChange={(event) => {
                setComment(event.target.value)
                setError('')
              }}
              rows="5"
              className="mt-2 block w-full resize-y border-[3px] border-[#171717] bg-white p-3 text-sm font-semibold normal-case outline-none"
              placeholder="Add context for the document owner..."
            />
          </label>
          {error && (
            <p role="alert" className="mt-2 text-xs font-black text-[#bd2f21]">
              {error}
            </p>
          )}
          <Button
            variant="green"
            className="mt-5 w-full"
            disabled={submitting}
            onClick={() => decide('Approved')}
          >
            {submitting ? 'Saving decision...' : 'Approve version'}
          </Button>
          <Button
            variant="coral"
            className="mt-3 w-full shadow-none"
            disabled={submitting}
            onClick={() => decide('Rejected')}
          >
            Reject with comment
          </Button>
        </aside>
      </div>
    </>
  )
}
