export default function EmptyState({ icon = '▤', title, description, action }) {
  return (
    <div className="grid min-h-64 place-items-center border-[3px] border-dashed border-[#171717] bg-white p-8 text-center">
      <div>
        <div className="mx-auto grid h-14 w-14 place-items-center border-[3px] border-[#171717] bg-[#ffdf4f] text-2xl">
          {icon}
        </div>
        <h2 className="mt-4 text-xl font-black uppercase">{title}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm font-semibold text-[#6c675f]">
          {description}
        </p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    </div>
  )
}
