const colors = {
  PDF: 'bg-[#ff6b5c]',
  DOCX: 'bg-[#d6b5ff]',
  XLSX: 'bg-[#b8f36b]',
  PNG: 'bg-[#ffdf4f]',
  JPG: 'bg-[#ffdf4f]',
}
export default function FileIcon({ type = 'FILE', className = '' }) {
  return (
    <span
      className={`grid h-11 w-11 shrink-0 place-items-center border-2 border-[#171717] text-[10px] font-black ${colors[type] ?? 'bg-white'} ${className}`}
    >
      {type}
    </span>
  )
}
