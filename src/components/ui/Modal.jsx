import { useEffect } from 'react'

export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#171717]/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto border-[3px] border-[#171717] bg-[#f7f3ed] shadow-[8px_8px_0_#ffdf4f]"
      >
        <div className="flex items-center justify-between border-b-[3px] border-[#171717] bg-[#ffdf4f] p-5">
          <h2 className="text-xl font-black uppercase">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-2xl font-black"
          >
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </section>
    </div>
  )
}
