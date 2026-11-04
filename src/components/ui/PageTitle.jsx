export default function PageTitle({ eyebrow, title, action, onAction }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.15em] text-[#6c675f]">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-5xl font-black uppercase leading-[.9] tracking-[-0.06em]">
          {title}
        </h1>
      </div>
      {action && (
        <button
          onClick={onAction}
          className="w-fit border-[3px] border-[#171717] bg-[#171717] px-5 py-3 text-xs font-black uppercase text-white shadow-[4px_4px_0_#ff6b5c]"
        >
          {action}
        </button>
      )}
    </div>
  )
}
