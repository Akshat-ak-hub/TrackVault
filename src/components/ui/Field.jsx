export default function Field({ label, className = '', ...props }) {
  return (
    <label className={`block text-xs font-black uppercase ${className}`}>
      {label}
      <input
        className="mt-2 block w-full border-[3px] border-[#171717] bg-white px-3 py-3 text-sm font-semibold normal-case outline-none focus:ring-2 focus:ring-[#ffbd59]"
        {...props}
      />
    </label>
  )
}
