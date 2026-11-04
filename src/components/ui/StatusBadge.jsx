const statusColors = {
  Approved: 'bg-[#b8f36b]',
  Pending: 'bg-[#ffbd59]',
  Review: 'bg-[#ff6b5c]',
  Rejected: 'bg-[#ff6b5c]',
  Draft: 'bg-[#d6b5ff]',
}
export default function StatusBadge({ children }) {
  return (
    <span
      className={`border-2 border-[#171717] px-2 py-1 text-[10px] font-black uppercase ${statusColors[children] ?? 'bg-white'}`}
    >
      {children}
    </span>
  )
}
