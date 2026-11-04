export default function Button({
  children,
  variant = 'dark',
  className = '',
  ...props
}) {
  const variants = {
    dark: 'bg-[#171717] text-white shadow-[4px_4px_0_#ff6b5c]',
    yellow: 'bg-[#ffdf4f] text-[#171717] shadow-[3px_3px_0_#171717]',
    green: 'bg-[#b8f36b] text-[#171717] shadow-[3px_3px_0_#171717]',
    coral: 'bg-[#ff6b5c] text-[#171717]',
    plain: 'bg-white text-[#171717]',
  }
  return (
    <button
      className={`border-[3px] border-[#171717] px-5 py-3 text-xs font-black uppercase transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
