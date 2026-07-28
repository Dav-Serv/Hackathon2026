import React, { useEffect, useState } from 'react'
import api, { getApiError } from './lib/api'
import Loading from './components/Loading.jsx'

const labels = { draft: 'Draft', menunggu_verifikasi: 'Menunggu Verifikasi', disetujui: 'Disetujui', ditolak: 'Ditolak', menunggu_persetujuan_dpl: 'Menunggu Persetujuan DPL', revisi: 'Revisi', menunggu_penilaian_mitra: 'Menunggu Penilaian Mitra', menunggu_review_dpl: 'Menunggu Review DPL' }
const format = value => Number(value || 0).toLocaleString('id-ID')
const card = 'rounded-2xl border-[3px] border-[#191b23] bg-white p-5 shadow-[4px_4px_0_#191b23]'

function Distribution({ title, values }) {
  const rows = Object.entries(values || {})
  const max = Math.max(...rows.map(([, value]) => Number(value)), 1)
  return <section className={card}><h3 className="mb-4 text-lg font-bold uppercase">{title}</h3>{rows.length ? rows.map(([key, value]) => <div className="mb-3" key={key}><div className="flex justify-between text-xs font-bold"><span>{labels[key] || key.replaceAll('_', ' ')}</span><b>{format(value)}</b></div><div className="mt-1 h-3 rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#9f149f]" style={{ width: `${Number(value) ? Math.max(Number(value) / max * 100, 4) : 0}%` }} /></div></div>) : <p className="py-5 text-sm font-bold text-slate-400">Belum ada data.</p>}</section>
}

function Names({ title, rows }) {
  return <section className={card}><h3 className="mb-4 text-lg font-bold uppercase">{title}</h3><div className="grid gap-2 sm:grid-cols-2">{rows.length ? rows.map((row, index) => <div key={`${row.name}-${index}`} className="rounded-lg border-2 border-slate-200 bg-slate-50 p-3"><p className="text-sm font-bold">{row.name || '-'}</p><p className="mt-1 text-[10px] font-semibold uppercase text-slate-500">{row.meta || '-'}</p></div>) : <p className="py-5 text-sm font-bold text-slate-400">Belum ada data.</p>}</div></section>
}

export default function DashboardKaprodi({ user, onLogout }) {
  const tabs = [['dashboard', 'Dashboard'], ['statistics', 'Statistik'], ['reports', 'Laporan'], ['profile', 'Profil Kaprodi']]
  const [activeTab, setActiveTab] = useState(new URLSearchParams(window.location.search).get('tab') || 'dashboard')
  const [filters, setFilters] = useState({ jenis_program: '', status: '', from: '', to: '', tahun_akademik: '' })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)

  const query = () => Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
  const setFilter = (key, value) => setFilters(previous => ({ ...previous, [key]: value }))
  const changeTab = tab => { setActiveTab(tab); const url = new URL(window.location.href); url.searchParams.set('tab', tab); window.history.pushState({}, '', url) }

  useEffect(() => {
    let alive = true
    setLoading(true)
    api.get('/kaprodi/dashboard', { params: query() }).then(({ data: response }) => alive && setData(response)).catch(response => alive && setError(getApiError(response))).finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [filters.jenis_program, filters.status, filters.from, filters.to, filters.tahun_akademik])

  const exportSpreadsheet = async () => {
    setExporting(true)
    try {
      const response = await api.get('/kaprodi/export/hasil-konversi', { params: query(), responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = 'laporan-kaprodi.xlsx'
      link.click()
      URL.revokeObjectURL(url)
    } catch (response) { setError(getApiError(response)) } finally { setExporting(false) }
  }

  const summary = data?.summary || {}
  const nilai = data?.nilai_akhir || {}
  const directory = data?.directory || {}
  const metrics = [['Total Pengguna', summary.total_users], ['Total Magang', summary.total_magang], ['Total Mitra', summary.total_mitra], ['Usulan', summary.total_usulan_konversi], ['Klaim', summary.total_klaim_konversi], ['Nilai Akhir', summary.total_nilai_akhir]]
  const users = (directory.pengguna || []).map(item => ({ name: item.name, meta: `${item.role || '-'} · ${item.email || '-'}` }))
  const magang = (directory.magang || []).map(item => ({ name: item.mahasiswa?.name, meta: `${item.nomor_magang || '-'} · ${item.status || '-'}` }))
  const mitra = (directory.mitra || []).map(item => ({ name: item.nama_perusahaan, meta: item.bidang }))
  const usulan = (directory.usulan || []).map(item => ({ name: item.magang?.mahasiswa?.name, meta: item.status }))
  const klaim = (directory.klaim || []).map(item => ({ name: item.magang?.mahasiswa?.name, meta: item.status }))
  const nilaiRows = (directory.nilai || []).map(item => ({ name: item.klaim_konversi?.magang?.mahasiswa?.name, meta: `${item.mata_kuliah?.kode_mk || '-'} · ${item.nilai_akhir ?? '-'}` }))

  return <div className="flex min-h-screen bg-[#faf8ff] text-[#191b23]">
    <aside className="hidden w-64 shrink-0 border-r-[3px] border-[#191b23] bg-white lg:block"><div className="bg-[#9f149f] p-5 text-xl font-bold text-white">Kaprodi Portal</div><nav className="space-y-3 p-4">{tabs.map(([id, title]) => <button key={id} onClick={() => changeTab(id)} className={`w-full rounded-xl border-2 p-3 text-left text-xs font-bold uppercase ${activeTab === id ? 'border-black bg-[#9f149f] text-white' : 'border-transparent hover:border-black'}`}>{title}</button>)}</nav><button onClick={onLogout} className="m-4 w-[calc(100%-2rem)] rounded-xl bg-[#191b23] p-3 text-xs font-bold text-white">Keluar</button></aside>
    <main className="min-w-0 flex-1 p-4 md:p-8"><header className="mb-6 flex justify-between border-b-[4px] border-black pb-5"><div><span className="text-[10px] font-black uppercase text-[#9f149f]">Portal Ketua Program Studi</span><h1 className="text-2xl font-bold uppercase">{tabs.find(tab => tab[0] === activeTab)?.[1]}</h1></div><b className="text-xs">{user?.name || 'Kaprodi'}</b></header>
       {activeTab !== 'profile' && <div className="mb-6 flex flex-wrap gap-3 rounded-2xl border-2 border-black bg-white p-3"><select value={filters.jenis_program} onChange={event => setFilter('jenis_program', event.target.value)} className="rounded-lg border-2 border-black p-2 text-xs font-bold"><option value="">Semua Program</option><option value="magang">Magang</option></select><select value={filters.status} onChange={event => setFilter('status', event.target.value)} className="rounded-lg border-2 border-black p-2 text-xs font-bold"><option value="">Semua Status</option>{Object.entries(labels).map(([key, title]) => <option key={key} value={key}>{title}</option>)}</select><input type="date" value={filters.from} onChange={event => setFilter('from', event.target.value)} className="rounded-lg border-2 border-black p-2 text-xs font-bold" /><input type="date" value={filters.to} onChange={event => setFilter('to', event.target.value)} className="rounded-lg border-2 border-black p-2 text-xs font-bold" /><select value={filters.tahun_akademik} onChange={event => setFilter('tahun_akademik', event.target.value)} className="rounded-lg border-2 border-black p-2 text-xs font-bold"><option value="">Semua Tahun</option>{Array.from({ length: 7 }, (_, index) => new Date().getFullYear() - index).map(year => <option key={year} value={year}>{year}</option>)}</select></div>}
      {loading && <Loading label="Memuat data realtime..." />}{error && <p className="border-2 border-red-700 bg-red-50 p-4 font-bold text-red-700">{error}</p>}{!loading && !error && data && <>
        {activeTab === 'dashboard' && <><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-6">{metrics.map(([title, value]) => <div className={card} key={title}><p className="text-xs font-bold uppercase text-slate-500">{title}</p><strong className="text-3xl">{format(value)}</strong></div>)}</div><div className="mt-6"><Distribution title="Status Magang" values={data.magang?.status_distribution} /></div></>}
        {activeTab === 'statistics' && <div className="space-y-6"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">{[['Total Nilai', nilai.total], ['Rata-rata', nilai.rata_rata], ['Minimum', nilai.nilai_akhir_minimum], ['Maksimum', nilai.nilai_akhir_maksimum], ['Total SKS', nilai.total_sks]].map(([title, value]) => <div className={card} key={title}><p className="text-xs font-bold uppercase text-slate-500">{title}</p><strong className="text-3xl">{format(value)}</strong></div>)}</div><div className="grid gap-6 lg:grid-cols-3"><Distribution title="Status Magang" values={data.magang?.status_distribution} /><Distribution title="Status Usulan" values={data.usulan_konversi?.status_distribution} /><Distribution title="Status Klaim" values={data.klaim_konversi?.status_distribution} /></div><Distribution title="Distribusi Nilai Huruf" values={nilai.nilai_huruf_distribution} /></div>}
        {activeTab === 'reports' && <div className="space-y-6"><section className={card}><h2 className="text-lg font-bold uppercase">Rekap Hasil Konversi</h2><button onClick={exportSpreadsheet} disabled={exporting} className="mt-4 rounded-xl border-2 border-black bg-[#9f149f] px-4 py-2 text-xs font-bold text-white">{exporting ? 'Menyiapkan...' : 'Unduh Spreadsheet'}</button></section><Names title="Total Pengguna" rows={users} /><Names title="Total Magang" rows={magang} /><Names title="Total Mitra" rows={mitra} /><Names title="Usulan" rows={usulan} /><Names title="Klaim" rows={klaim} /><Names title="Nilai Akhir" rows={nilaiRows} /></div>}
        {activeTab === 'profile' && <section className={card}><h2 className="text-lg font-bold uppercase">Profil Kaprodi</h2><p className="mt-3 text-sm font-bold">{user?.email || '-'}</p></section>}
      </>}
    </main>
  </div>
}
