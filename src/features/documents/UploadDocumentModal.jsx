import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import Modal from '../../components/ui/Modal.jsx'

const categories = ['Policy', 'Contract', 'Report', 'Guide', 'Other']

export default function UploadDocumentModal({ document, onClose, onUpload }) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submit = async (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const file = form.get('file')
    if (!file || !file.size) {
      setError('Choose a file to continue.')
      return
    }
    const extension = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx', 'xlsx', 'png', 'jpg', 'jpeg'].includes(extension)) {
      setError('Choose a PDF, DOCX, XLSX, PNG or JPG file.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('The file must be 10 MB or smaller.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await onUpload({
        title: form.get('title'),
        category: form.get('category'),
        description: form.get('description'),
        tags: form
          .get('tags')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        note: form.get('note'),
        file,
      })
      onClose()
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={document ? `New version · ${document.title}` : 'Upload a document'}
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={submit}>
        {!document && (
          <>
            <Field
              label="Document title"
              name="title"
              required
              placeholder="e.g. Employee handbook"
            />
            <label className="block text-xs font-black uppercase">
              Category
              <select
                name="category"
                className="mt-2 block w-full border-[3px] border-[#171717] bg-white px-3 py-3 text-sm font-semibold"
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-black uppercase">
              Description
              <textarea
                name="description"
                rows="2"
                className="mt-2 block w-full border-[3px] border-[#171717] bg-white p-3 text-sm font-semibold normal-case"
                placeholder="What is this document for?"
              />
            </label>
            <Field
              label="Tags"
              name="tags"
              placeholder="e.g. HR, policy, 2026"
            />
          </>
        )}
        <label className="block text-xs font-black uppercase">
          File{' '}
          <span className="font-semibold normal-case text-[#6c675f]">
            PDF, DOCX, XLSX, PNG or JPG · 10 MB max
          </span>
          <input
            name="file"
            type="file"
            accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
            required
            className="mt-2 block w-full border-[3px] border-[#171717] bg-white p-2 text-xs font-semibold file:mr-3 file:border-0 file:bg-[#ffdf4f] file:px-3 file:py-2 file:text-xs file:font-black file:uppercase"
          />
        </label>
        <Field
          label={document ? 'Version note' : 'Upload note'}
          name="note"
          placeholder={
            document ? 'Summarize what changed' : 'Optional change note'
          }
          required={Boolean(document)}
        />
        {error && (
          <p role="alert" className="text-xs font-black text-[#bd2f21]">
            {error}
          </p>
        )}
        <p className="border-2 border-[#171717] bg-[#fff8d5] p-3 text-[10px] font-semibold">
          The file will be stored in this workspace and available to its
          authorized members.
        </p>
        <Button type="submit" className="w-full">
          {submitting
            ? 'Uploading...'
            : document
              ? 'Add version'
              : 'Upload document'}
        </Button>
      </form>
    </Modal>
  )
}
