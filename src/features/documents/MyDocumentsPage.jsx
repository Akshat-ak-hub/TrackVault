import DocumentsPage from './DocumentsPage.jsx'

export default function MyDocumentsPage({
  documents,
  user,
  onNavigate,
  onUpload,
}) {
  const mine = documents.filter((document) => document.ownerId === user.id)
  return (
    <DocumentsPage
      documents={mine}
      onNavigate={onNavigate}
      onUpload={onUpload}
      title="My documents"
      eyebrow="Workspace / Personal library"
    />
  )
}
