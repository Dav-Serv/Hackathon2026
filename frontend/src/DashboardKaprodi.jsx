import React, { useEffect, useMemo, useState } from 'react'
import api, { getApiError } from './lib/api'
import Loading from './components/Loading.jsx'

function Icon({ children, className = '' }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>
}

const labels = { draft: 'Draft', menunggu_verifikasi: 'Menunggu Verifikasi', disetujui: 'Disetujui', ditolak: 'Ditolak', menunggu_persetujuan_dpl: 'Menunggu Persetujuan DPL', revisi: 'Revisi', menunggu_penilaian_mitra: 'Menunggu Penilaian Mitra', menunggu_review_dpl: 'Menunggu Review DPL' }
const formatNumber = value => Number(value || 0).toLocaleString('id-ID')
const displayName = item => item?.mahasiswa?.name || item?.mahasiswa?.nama || item?.magang?.mahasiswa?.name || item?.magang?.mahasiswa?.nama || item?.klaim_konversi?.magang?.mahasiswa?.name || '-'
const cardClass = 'rounded-2xl border-[3px] border-[#191b23] bg-white p-5 shadow-[4px_4px_0_#191b23]'

export default function DashboardKaprodi({ user, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const validTabs = ['dashboard', 'statistics', 'reports', 'profile']
  const tabFromUrl = () => {
    const value = new URLSearchParams(window.location.search).get('tab')
    return validTabs.includes(value) ? value : 'dashboard'
  }
  const [activeTab, setActiveTab] = useState(tabFromUrl)
  const changeTab = (tab) => {
    if (!validTabs.includes(tab)) return
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    window.history.pushState({}, '', url)
  }
  useEffect(() => {
    const onPopState = () => setActiveTab(tabFromUrl())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  const [jenisProgram, setJenisProgram] = useState('')
  const [status, setStatus] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    api.get('/kaprodi/dashboard', { params: { jenis_program: jenisProgram || undefined, status: status || undefined } }).then(({ data: response }) => mounted && setData(response)).catch(err => mounted && setError(getApiError(err))).finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [jenisProgram, status])

  const summary = data?.summary || {}
  const nilai = data?.nilai_akhir || {}
  const recent = useMemo(() => Object.entries(data?.recent || {}).flatMap(([type, items]) => (items || []).map(item => ({ ...item, type }))).slice(0, 10), [data])
  const cards = [['Total Pengguna', summary.total_users, 'groups'], ['Total Magang', summary.total_magang, 'work_history'], ['Total Mitra', summary.total_mitra, 'corporate_fare'], ['Usulan Konversi', summary.total_usulan_konversi, 'swap_horiz'], ['Klaim Konversi', summary.total_klaim_konversi, 'assignment_turned_in'], ['Nilai Akhir', summary.total_nilai_akhir, 'grade']]
  const downloadCsv = () => {
    const rows = [['ID', 'Mahasiswa', 'Jenis', 'Status', 'Tanggal'], ...recent.map(item => [item.id || '', displayName(item), item.type, item.status || '', item.created_at || item.updated_at || ''])]
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a'); link.href = url; link.download = 'laporan-kaprodi.csv'; link.click(); URL.revokeObjectURL(url)
  }
  const nav = [['dashboard', 'Dashboard', 'dashboard'], ['statistics', 'Statistik', 'leaderboard'], ['reports', 'Laporan', 'description'], ['profile', 'Profil Kaprodi', 'person']]

  return <div className="flex min-h-screen bg-[#faf8ff] font-['Space_Grotesk',sans-serif] text-[#191b23]">
    {isSidebarOpen && <div className="fixed inset-0 z-30 bg-[#191b23]/30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
    <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col justify-between border-r-[3px] border-[#191b23] bg-[#f8fafc] transition-transform lg:static`}><div><div className="flex h-16 items-center justify-between border-b-[3px] border-[#191b23] bg-[#9f149f] px-6 text-xl font-bold text-white"><span className="flex items-center gap-2"><Icon>school</Icon>Kaprodi Portal</span><button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}><Icon>close</Icon></button></div><nav className="mt-8 space-y-3 px-3">{nav.map(([id, label, icon]) => <button key={id} onClick={() => { changeTab(id); setIsSidebarOpen(false) }} className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-left font-bold ${activeTab === id ? 'border-[#191b23] bg-[#9f149f] text-white shadow-[4px_4px_0_#191b23]' : 'border-transparent hover:border-[#191b23] hover:bg-purple-50'}`}><Icon>{icon}</Icon><span className="text-xs uppercase tracking-wider">{label}</span></button>)}</nav></div><div className="space-y-3 border-t-[3px] border-[#191b23] bg-purple-50/50 p-4"><div className="text-[10px] font-black uppercase tracking-wider text-[#9f149f]">Kaprodi</div><button onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#191b23] bg-[#191b23] py-2.5 text-xs font-bold text-white"><Icon>logout</Icon>Keluar</button></div></aside>
    <div className="flex min-w-0 flex-1 flex-col"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b-[3px] border-[#191b23] bg-white px-4 md:px-8"><div className="flex items-center gap-3"><button className="rounded-xl border-2 border-[#191b23] bg-purple-50 p-2 lg:hidden" onClick={() => setIsSidebarOpen(true)}><Icon>menu</Icon></button><div><span className="text-[10px] font-black uppercase tracking-widest text-[#9f149f]">Portal Ketua Program Studi</span><h1 className="text-lg font-bold uppercase">{nav.find(item => item[0] === activeTab)?.[1]}</h1></div></div><span className="text-xs font-bold">{user?.name || 'Kaprodi'}</span></header>
      <main className="flex-1 space-y-6 bg-[#faf8ff] p-4 [background-image:radial-gradient(#e1e2ed_1px,transparent_1px)] [background-size:24px_24px] md:p-8"><div className="flex flex-wrap justify-between gap-4 border-b-[4px] border-[#191b23] pb-6"><div><span className="inline-block rounded-xl border-[3px] border-[#191b23] bg-[#f1d7f1] px-4 py-1.5 text-xs font-bold uppercase text-[#9f149f]">Executive Overview</span><h2 className="mt-3 text-4xl font-bold uppercase italic">Selamat Datang,<br />Kaprodi</h2></div><div className="flex gap-3 rounded-2xl border-2 border-[#191b23] bg-white p-3"><label className="text-[10px] font-bold uppercase text-gray-500">Jenis Program<select value={jenisProgram} onChange={e => setJenisProgram(e.target.value)} className="mt-1 block rounded-lg border-2 border-[#191b23] p-2 text-xs font-bold"><option value="">Semua</option><option value="magang">Magang</option><option value="studi_independen">Studi Independen</option></select></label><label className="text-[10px] font-bold uppercase text-gray-500">Status<select value={status} onChange={e => setStatus(e.target.value)} className="mt-1 block rounded-lg border-2 border-[#191b23] p-2 text-xs font-bold"><option value="">Semua</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div></div>
        {loading && <Loading label="Memuat dashboard..." />}{error && <div className="border-2 border-[#191b23] bg-[#ffdad6] p-4 font-bold text-[#93000a]">{error}</div>}{!loading && !error && !data && <div className={cardClass}>Data dashboard kosong.</div>}{!loading && !error && data && <>{activeTab === 'dashboard' && <><section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-6">{cards.map(([title, value, icon]) => <div className={cardClass} key={title}><Icon className="text-[#9f149f]">{icon}</Icon><p className="mt-3 text-xs font-bold uppercase text-gray-500">{title}</p><strong className="text-3xl">{formatNumber(value)}</strong></div>)}</section><section className={cardClass}><h3 className="mb-4 text-lg font-bold uppercase">Distribusi Status</h3>{Object.entries(data.magang?.status_distribution || {}).map(([key, value]) => <div className="mb-2 flex justify-between" key={key}><span>{labels[key] || key}</span><b>{formatNumber(value)}</b></div>)}</section></>}{activeTab === 'statistics' && <section className="space-y-6"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">{[['Total', nilai.total], ['Rata-rata', nilai.rata_rata], ['Minimum', nilai.nilai_akhir_minimum], ['Maksimum', nilai.nilai_akhir_maksimum], ['Total SKS', nilai.total_sks]].map(([label, value]) => <div className={cardClass} key={label}><p className="text-xs font-bold uppercase text-gray-500">{label}</p><strong className="text-3xl">{formatNumber(value)}</strong></div>)}</div><div className={cardClass}><h3 className="mb-4 text-lg font-bold uppercase">Distribusi Nilai Huruf</h3>{Object.entries(nilai.nilai_huruf_distribution || {}).map(([key, value]) => <div className="mb-2 flex justify-between" key={key}><span>{key}</span><b>{formatNumber(value)}</b></div>)}</div></section>}{activeTab === 'reports' && <section className={cardClass}><div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold uppercase">Laporan Terbaru</h3><button onClick={downloadCsv} className="rounded-xl border-2 border-[#191b23] bg-[#9f149f] px-4 py-2 text-xs font-bold text-white">Download CSV</button></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b-2 border-[#191b23]"><th className="p-3">Mahasiswa</th><th className="p-3">Jenis</th><th className="p-3">Status</th><th className="p-3">Tanggal</th></tr></thead><tbody>{recent.map((item, index) => <tr className="border-b border-slate-200" key={`${item.type}-${item.id || index}`}><td className="p-3 font-bold">{displayName(item)}</td><td className="p-3 capitalize">{item.type.replaceAll('_', ' ')}</td><td className="p-3">{labels[item.status] || item.status || '-'}</td><td className="p-3">{item.created_at || item.updated_at || '-'}</td></tr>)}</tbody></table></div></section>}{activeTab === 'profile' && <section className={`${cardClass} max-w-xl`}><h3 className="mb-4 text-lg font-bold uppercase">Profil Kaprodi</h3>{[['Nama', user?.name], ['Email', user?.email], ['Role', user?.role]].map(([label, value]) => <div className="flex justify-between border-b border-slate-200 py-3" key={label}><span className="font-bold text-gray-500">{label}</span><span>{value || '-'}</span></div>)}</section>}</>}</main></div></div>
}
