export default function Loading({ label = 'Memuat data...' }) {
  return <div className="flex min-h-40 items-center justify-center gap-3 rounded-2xl border-2 border-black bg-white p-8 text-sm font-semibold"><span className="h-7 w-7 animate-spin rounded-full border-4 border-[#e1e2ed] border-t-[#9f149f]" /><span>{label}</span></div>
}
