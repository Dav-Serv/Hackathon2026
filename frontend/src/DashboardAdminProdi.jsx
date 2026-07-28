import React, { useState, useEffect } from 'react'
import api, { getApiError } from './lib/api'

function Icon({ children, className = '' }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>
}

export default function DashboardAdminProdi({ user, onLogout }) {
  // Collapsible sidebar state (False = closed/hidden by default)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const validTabs = ['dashboard', 'pengajuan', 'konversi-mk', 'data-master', 'laporan', 'pengaturan', 'surat']
  const tabFromUrl = () => {
    const value = new URLSearchParams(window.location.search).get('tab')
    return validTabs.includes(value) ? value : 'dashboard'
  }
  const [activeTab, setActiveTab] = useState(tabFromUrl)
  const selectTab = (tab) => {
    if (!validTabs.includes(tab)) return
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    window.history.pushState({}, '', url)
  }
  useEffect(() => {
    const handlePopState = () => setActiveTab(tabFromUrl())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])
  const [tabData, setTabData] = useState({ courses: [], letters: [], dashboard: null })
  const [tabLoading, setTabLoading] = useState(false)
  const [tabError, setTabError] = useState('')

  useEffect(() => {
    let mounted = true
    const loadTab = async () => {
      if (activeTab === 'pengajuan' || activeTab === 'pengaturan' || activeTab === 'konversi-mk') return
      setTabLoading(true)
      setTabError('')
      try {
        const endpoint = activeTab === 'data-master' ? '/admin/mata-kuliah' : activeTab === 'surat' ? '/admin/surat-pengantar' : '/admin/dashboard'
        const { data } = await api.get(endpoint)
        if (!mounted) return
        setTabData(prev => ({ ...prev, ...(activeTab === 'data-master' ? { courses: data?.data || data || [] } : activeTab === 'surat' ? { letters: data?.data || data || [] } : { dashboard: data?.data || data }) }))
      } catch (error) {
        if (mounted) setTabError(getApiError(error))
      } finally {
        if (mounted) setTabLoading(false)
      }
    }
    loadTab()
    return () => { mounted = false }
  }, [activeTab])

  const exportData = async (endpoint, filename) => {
    try {
      const { data } = await api.get(endpoint, { responseType: 'blob' })
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      showToast(getApiError(error), 'error')
    }
  }

  const issueLetter = async (letter, file) => {
    if (!file) {
      showToast('Pilih file surat pengantar PDF terlebih dahulu.', 'error')
      return
    }
    try {
      const payload = new FormData()
      payload.append('status', 'disetujui')
      payload.append('file', file)
      const { data } = await api.post(`/admin/surat-pengantar/${letter.id}/terbitkan`, payload, { headers: { 'Content-Type': 'multipart/form-data' } })
      setTabData(prev => ({ ...prev, letters: prev.letters.map(item => item.id === letter.id ? data : item) }))
      showToast('Surat pengantar berhasil diterbitkan.')
    } catch (error) {
      showToast(getApiError(error), 'error')
    }
  }

  // Notification helper
  const [toast, setToast] = useState(null)
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const tasks = []
  const toggleTask = () => {}

  const [submissions, setSubmissions] = useState([])
  const [search, setSearch] = useState('')
  const [selectedSubmission, setSelectedSubmission] = useState(null)

  const loadData = async () => {
    try {
      const [{ data: dashboard }, { data: magang }] = await Promise.all([api.get('/admin/dashboard'), api.get('/admin/magang')])
      const records = magang?.data || magang || []
      setSubmissions(records.map(item => ({
        id: item.id,
        nama: item.mahasiswa?.name || item.mahasiswa?.nama || '-',
        nim: item.mahasiswa?.nim_nip || item.mahasiswa?.nim || '-',
        perusahaan: item.mitra_industri?.nama_perusahaan || item.mitraIndustri?.nama_perusahaan || '-',
        dpl: item.dpl?.name || '-',
        status: item.status === 'menunggu_verifikasi' ? 'pending' : item.status === 'disetujui' ? 'approved' : item.status === 'ditolak' ? 'revisi' : item.status,
        avatar: item.mahasiswa?.avatar || '',
      })))
      setTabData(prev => ({ ...prev, dashboard }))
    } catch (error) { showToast(getApiError(error), 'error') }
  }

  useEffect(() => { loadData() }, [])

  const handleVerify = async (id, name, status) => {
    try {
      await api.post(`/admin/magang/${id}/verifikasi`, { status })
      await loadData()
      showToast(`Pengajuan ${name} berhasil diproses.`)
    } catch (error) { showToast(getApiError(error), 'error') }
  }

  const handleApprove = (id, name) => handleVerify(id, name, 'disetujui')
  const handleReject = (id, name) => handleVerify(id, name, 'ditolak')



  // Count helper
  const pendingCount = submissions.filter(s => s.status === 'pending').length
  const dashboard = tabData.dashboard || {}

  return (
    <div className="flex h-screen overflow-hidden bg-[#faf8ff] font-['Space_Grotesk',sans-serif] text-[#191b23]">
      
      {/* Toast Notification Alert */}
      {toast && (
        <div className={`fixed top-20 right-5 z-50 flex items-center gap-3 border-[3px] border-[#191b23] p-4 font-bold shadow-[4px_4px_0_#191b23] transition-all transform animate-bounce ${
          toast.type === 'error' ? 'bg-[#ffdad6] text-[#93000a]' : toast.type === 'info' ? 'bg-[#fbf0fb] text-[#9f149f]' : 'bg-[#e8f5e9] text-[#2e7d32]'
        }`}>
          <Icon>{toast.type === 'error' ? 'error' : toast.type === 'info' ? 'info' : 'check_circle'}</Icon>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Backdrop overlay when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#191b23]/30 z-30 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ============================================================== */}
      {/* COLLAPSIBLE LEFT SIDEBAR */}
      {/* ============================================================== */}
      <aside className={`w-64 shrink-0 border-r-3 border-[#191b23] bg-[#f8fafc] flex flex-col justify-between h-screen fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col flex-1">
          {/* Header Brand */}
          <div className="bg-[#9f149f] border-b-3 border-[#191b23] h-16 flex items-center px-6 text-white font-bold text-xl justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white text-[#9f149f]"><Icon className="text-[18px]">sync_alt</Icon></span>
              <span className="tracking-tight uppercase">GradeSync</span>
            </div>
            <button className="text-white hover:opacity-80" onClick={() => setIsSidebarOpen(false)}>
              <Icon>close</Icon>
            </button>
          </div>

          {/* Navigation Sidebar Buttons */}
          <nav className="mt-8 flex flex-col gap-2 px-3">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
              { id: 'pengajuan', label: 'Pengajuan', icon: 'description' },
               { id: 'konversi-mk', label: 'Konversi MK', icon: 'swap_horiz' },
               { id: 'data-master', label: 'Data Master', icon: 'database' },
               { id: 'surat', label: 'Surat Pengantar', icon: 'mail' },
              { id: 'laporan', label: 'Laporan', icon: 'assessment' },
              { id: 'pengaturan', label: 'Pengaturan', icon: 'settings' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  selectTab(item.id)
                  setIsSidebarOpen(false)
                }}
                className={`flex items-center gap-3 w-full rounded-2xl border-2 p-3 text-left font-bold transition-all duration-150 ${
                  activeTab === item.id
                    ? 'border-[#191b23] bg-[#9f149f] text-white shadow-[4px_4px_0_#191b23] -translate-y-0.5'
                    : 'border-transparent text-[#191b23] hover:bg-purple-50 hover:border-[#191b23]'
                }`}
              >
                <Icon className={`text-xl ${activeTab === item.id ? 'text-white' : 'text-[#191b23]'}`}>{item.icon}</Icon>
                <span className="text-xs uppercase tracking-wider">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer info in sidebar with Logout button */}
        <div className="p-4 border-t-3 border-[#191b23] bg-purple-50/50 space-y-3">
          <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-wider text-[#9f149f]">
            <Icon className="text-base">verified_user</Icon>
            GradeSync Admin Portal
          </div>
          
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
            <button 
              onClick={onLogout}
              className="flex items-center justify-center gap-1.5 w-full rounded-xl border-2 border-[#191b23] bg-[#191b23] py-2 text-xs font-bold text-white shadow-[2.5px_2.5px_0_#9f149f] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <Icon className="text-base text-white">logout</Icon>
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MAIN VIEWPORT */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto w-full">
        
        {/* Top Bar Header */}
        <header className="h-16 shrink-0 border-b-3 border-[#191b23] bg-white flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Toggle Menu Button */}
            <button 
              className="p-2 border-2 border-[#191b23] rounded-xl bg-purple-50 hover:bg-purple-100 shadow-[2.5px_2.5px_0_#9f149f] transition-all flex items-center justify-center"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Icon className="text-xl font-bold text-[#9f149f]">{isSidebarOpen ? 'menu_open' : 'menu'}</Icon>
            </button>
            
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-[#9f149f] tracking-widest leading-none">PORTAL ADMIN PROGRAM STUDI</span>
              <h1 className="text-xl font-bold uppercase tracking-tight text-slate-800 mt-0.5">ADMIN PRODI DASHBOARD</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 border-2 border-[#191b23] bg-purple-100 text-[#9f149f] font-bold text-xs uppercase rounded-xl">
              Semester Genap 2026
            </div>
            
            <div 
              onClick={() => selectTab('pengaturan')}
              className="flex items-center gap-2 cursor-pointer hover:opacity-85"
            >
              <div className="w-8 h-8 rounded-full border border-[#191b23] bg-[#9f149f] flex items-center justify-center text-white text-xs font-black">
                ADM
              </div>
              <span className="text-xs font-black hidden sm:inline">Admin Prodi</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 md:p-8 space-y-8 flex-1 bg-[#faf8ff] [background-image:radial-gradient(#e1e2ed_1px,transparent_1px)] [background-size:24px_24px]">
          
          <div className="border-b-2 border-slate-200 pb-3 -mt-2">
            <p className="text-xs font-bold text-slate-500">
              Selamat datang kembali, <b>{user?.name || 'Admin Prodi'}</b> • Superuser Portal
            </p>
          </div>

          {/* ============================================================== */}
          {/* TAB: DASHBOARD (Overview) */}
          {/* ============================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              
              {/* Hero Banner Card */}
              <section className="relative overflow-hidden rounded-3xl border-3 border-[#191b23] bg-[#f1d7f1] p-8 md:p-10 shadow-[6px_6px_0_#191b23]">
                <div className="relative z-10 max-w-2xl">
                  <span className="inline-block px-3 py-1 rounded-full border-2 border-[#191b23] bg-white text-[#9f149f] font-extrabold text-[9px] uppercase tracking-wider mb-4">
                    Overview Dashboard
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#191b23] mb-4">
                    Selamat Datang, Admin Prodi
                  </h1>
                  <p className="text-sm md:text-base font-bold text-[#434655] mb-6 leading-relaxed">
                    Sistem manajemen konversi nilai magang terintegrasi. Saat ini terdapat <span className="text-[#9f149f] underline decoration-2">{pendingCount} pengajuan baru</span> yang memerlukan tindakan verifikasi segera.
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => selectTab('pengajuan')}
                      className="flex items-center gap-2 rounded-xl border-2 border-[#191b23] bg-[#9f149f] px-5 py-2.5 text-xs font-bold text-white shadow-[3px_3px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                    >
                      <Icon className="text-md">verified_user</Icon>
                      Verifikasi Pengajuan
                    </button>
                    <button 
                      onClick={() => selectTab('laporan')}
                      className="flex items-center gap-2 rounded-xl border-2 border-[#191b23] bg-white px-5 py-2.5 text-xs font-bold text-[#191b23] shadow-[3px_3px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                    >
                      <Icon className="text-md">analytics</Icon>
                      Lihat Laporan
                    </button>
                  </div>
                </div>
                
                {/* Decorative element */}
                <div className="absolute right-10 bottom-0 top-0 hidden lg:flex items-center w-1/4 opacity-15">
                  <Icon className="text-[180px] text-[#9f149f]">school</Icon>
                </div>
              </section>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                   { title: 'Total Pengajuan', val: dashboard.total_pengajuan ?? submissions.length, icon: 'folder_shared', color: 'bg-white' },
                   { title: 'Menunggu Verifikasi', val: dashboard.menunggu_verifikasi ?? pendingCount, icon: 'pending_actions', color: 'bg-[#ffdad6] text-[#93000a] border-[#ba1a1a]', isWarning: true },
                   { title: 'Menunggu Review DPL', val: dashboard.menunggu_review_dpl ?? 0, icon: 'rate_review', color: 'bg-purple-50 text-[#9f149f]' },
                   { title: 'Konversi Selesai', val: dashboard.konversi_selesai ?? 0, icon: 'task_alt', color: 'bg-[#e8f5e9] text-[#2e7d32]' }
                 ].map((kpi, idx) => (

                  <div key={idx} className={`p-6 rounded-2xl border-3 border-[#191b23] shadow-[4px_4px_0_#191b23] ${kpi.color} flex flex-col gap-2`}>
                    <p className="text-[10px] font-black uppercase tracking-wider opacity-85">{kpi.title}</p>
                    <div className="flex items-end justify-between mt-2">
                      <span className="text-3xl font-black">{kpi.val}</span>
                      <Icon className={`text-3xl ${kpi.isWarning ? 'animate-bounce text-[#ba1a1a]' : ''}`}>{kpi.icon}</Icon>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Content Layout splits: Left (Table), Right (Panel) */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Left Side: Table of submissions */}
                <div className="lg:col-span-3 rounded-2xl border-3 border-[#191b23] bg-white shadow-[6px_6px_0_#191b23] overflow-hidden">
                  <div className="p-5 border-b-3 border-[#191b23] flex flex-wrap justify-between items-center gap-4">
                    <h2 className="text-base font-black uppercase tracking-tight">Daftar Pengajuan Magang Terbaru</h2>
                    <div className="flex gap-2">
                       <button onClick={() => selectTab('pengajuan')} className="p-2 rounded-lg border-2 border-[#191b23] hover:bg-slate-50 transition-colors">

                        <Icon className="text-md">filter_list</Icon>
                      </button>
                       <button onClick={() => exportData('/admin/export/hasil-konversi', 'hasil-konversi.xlsx')} className="p-2 rounded-lg border-2 border-[#191b23] hover:bg-slate-50 transition-colors">

                        <Icon className="text-md">download</Icon>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#f8fafc] border-b-2 border-[#191b23] text-[10px] font-black uppercase text-[#434655]">
                        <tr>
                          <th className="p-4">Mahasiswa</th>
                          <th className="p-4">Perusahaan</th>
                          <th className="p-4">DPL</th>
                          <th className="p-4 text-center">Status</th>
                          <th className="p-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs font-bold divide-y border-b border-[#191b23]/10">
                        {submissions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 shrink-0 rounded-full border-2 border-[#191b23] overflow-hidden bg-purple-100 flex items-center justify-center">
                                  {sub.avatar ? (
                                    <img className="w-full h-full object-cover" src={sub.avatar} alt={sub.nama} />
                                  ) : (
                                    <Icon className="text-lg">account_circle</Icon>
                                  )}
                                </div>
                                <div>
                                  <div className="text-sm font-black">{sub.nama}</div>
                                  <div className="text-[10px] text-gray-500 font-mono">NIM: {sub.nim}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-[#434655]">{sub.perusahaan}</td>
                            <td className="p-4 text-[#434655]">{sub.dpl}</td>
                            <td className="p-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full border-2 text-[9px] font-black uppercase ${
                                sub.status === 'approved' 
                                  ? 'bg-[#e8f5e9] text-[#2e7d32] border-[#2e7d32]' 
                                  : sub.status === 'revisi' 
                                    ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]' 
                                    : 'bg-yellow-100 text-yellow-800 border-yellow-500'
                              }`}>
                                {sub.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button 
                                   onClick={() => selectTab('pengajuan')}

                                  className="p-2 rounded-lg border-2 border-[#191b23] bg-white hover:bg-slate-50 transition-all active:translate-y-0.5"
                                  title="Lihat Berkas"
                                >
                                  <Icon className="text-sm">visibility</Icon>
                                </button>
                                {sub.status === 'pending' && (
                                  <>
                                    <button 
                                      onClick={() => handleApprove(sub.id, sub.nama)}
                                      className="p-2 rounded-lg border-2 border-[#191b23] bg-[#9f149f] text-white hover:bg-[#861086] transition-all active:translate-y-0.5"
                                      title="Setujui"
                                    >
                                      <Icon className="text-sm">check_circle</Icon>
                                    </button>
                                    <button 
                                      onClick={() => handleReject(sub.id, sub.nama)}
                                      className="p-2 rounded-lg border-2 border-[#191b23] bg-[#ba1a1a] text-white hover:bg-[#93000a] transition-all active:translate-y-0.5"
                                      title="Tolak / Revisi"
                                    >
                                      <Icon className="text-sm">cancel</Icon>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="p-4 bg-slate-50 text-center border-t-2 border-[#191b23]">
                    <button 
                      onClick={() => selectTab('pengajuan')}
                      className="text-xs font-black uppercase tracking-wider text-[#9f149f] hover:underline"
                    >
                       Lihat Semua Pengajuan ({submissions.length})

                    </button>
                  </div>
                </div>

                {/* Right Side Column Panels */}
                <div className="flex flex-col gap-6">
                  
                  {/* Task List */}
                  <div className="rounded-2xl border-3 border-[#191b23] bg-white p-5 shadow-[4px_4px_0_#191b23]">
                    <div className="flex items-center gap-2 mb-4 border-b-2 border-[#191b23] pb-2">
                      <Icon className="text-md text-[#9f149f]">assignment</Icon>
                      <h3 className="text-xs font-black uppercase tracking-wider">Tugas Hari Ini</h3>
                    </div>
                    <div className="flex flex-col gap-3">
                      {tasks.map(task => (
                        <label key={task.id} className="flex items-center gap-2.5 cursor-pointer group text-xs font-bold">
                          <input 
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className="w-4 h-4 rounded border-2 border-[#191b23] accent-[#9f149f] cursor-pointer"
                          />
                          <span className={`group-hover:text-[#9f149f] transition-colors ${task.completed ? 'line-through opacity-50' : ''}`}>
                            {task.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity logs */}
                  <div className="rounded-2xl border-3 border-[#191b23] bg-[#191b23] text-white p-5 shadow-[4px_4px_0_#9f149f]">
                    <div className="flex items-center gap-2 mb-4 border-b-2 border-white/20 pb-2">
                      <Icon className="text-md text-yellow-300">history</Icon>
                      <h3 className="text-xs font-black uppercase tracking-wider text-yellow-300">Aktivitas Terbaru</h3>
                    </div>
                    <div className="flex flex-col gap-4 relative pl-3 text-xs font-bold">
                      <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-white/20" />
                      {(dashboard.activities || []).map((activity, index) => (
                        <div key={activity.id || index} className="relative">
                          <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full bg-[#9f149f] border border-white" />
                          <p className="text-[10px] text-purple-300">{activity.time || activity.created_at || '-'}</p>
                          <p className="mt-0.5">{activity.description || activity.message || '-'}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Quick Actions grid */}
              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#434655]">Akses Cepat & Layanan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                     { title: 'Buat Surat Pengantar', icon: 'description', tab: 'surat', color: 'bg-white hover:bg-purple-50' },
                     { title: 'Kelola Data Master', icon: 'database', tab: 'data-master', color: 'bg-white hover:bg-yellow-50' },
                     { title: 'Ekspor Data (Excel)', icon: 'table_view', action: () => exportData('/admin/export/hasil-konversi', 'hasil-konversi.xlsx'), color: 'bg-white hover:bg-green-50' },
                     { title: 'Analisis Laporan', icon: 'insights', tab: 'laporan', color: 'bg-white hover:bg-blue-50' }
                   ].map((act, idx) => (

                    <button 
                      key={idx}
                       onClick={() => act.action ? act.action() : selectTab(act.tab)}

                      className={`p-6 rounded-2xl border-3 border-[#191b23] shadow-[4px_4px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all flex flex-col items-center text-center gap-3 ${act.color}`}
                    >
                      <div className="w-12 h-12 rounded-xl border-2 border-[#191b23] bg-purple-50 flex items-center justify-center">
                        <Icon className="text-2xl text-[#9f149f]">{act.icon}</Icon>
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider">{act.title}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Bar Chart Section */}
              <section className="rounded-2xl border-3 border-[#191b23] bg-white p-6 md:p-8 shadow-[6px_6px_0_#191b23]">
                <div className="flex flex-wrap justify-between items-end mb-8 gap-4">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight">Tren Pengajuan Magang Bulanan</h3>
                    <p className="text-[11px] text-[#737686] font-bold mt-1">Visualisasi jumlah mahasiswa yang mendaftar magang per bulan pada tahun 2026.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase">
                    <div className="w-4 h-4 bg-[#9f149f] border-2 border-[#191b23]" />
                    <span>Pengajuan</span>
                  </div>
                </div>

                <div className="flex items-end gap-3 md:gap-4 h-64 border-b-3 border-l-3 border-[#191b23] pb-2 pl-3 md:pl-4">
                  {Array.from({ length: 12 }, (_, index) => { const source = (dashboard.monthly_submissions || dashboard.tren_pengajuan || []).find(item => Number(item.month || item.m) === index + 1); return { month: index + 1, total: Number(source?.total ?? source?.value ?? source?.num ?? 0) } }).map((bar, i, bars) => (

                    <div key={i} className="group relative flex-1 flex flex-col justify-end h-full">
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#191b23] text-white px-2 py-1 rounded text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                         {bar.total}

                      </div>
                      <div 
                         style={{ height: `${bar.total ? Math.max(4, (bar.total / Math.max(...bars.map(item => item.total), 1)) * 90) : 0}%` }}

                        className="bg-purple-100 border-2 border-b-0 border-[#191b23] group-hover:bg-[#9f149f] transition-all"
                      />
                      <p className="mt-3 text-center text-[10px] font-black uppercase tracking-wider text-slate-700">
                         {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][bar.month - 1]}

                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* History logs section */}
              <section className="rounded-2xl border-3 border-[#191b23] bg-white shadow-[6px_6px_0_#191b23] overflow-hidden">
                <div className="p-5 border-b-3 border-[#191b23] bg-[#f8fafc]">
                  <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <Icon className="text-md text-[#9f149f]">fact_check</Icon>
                    Riwayat Verifikasi Terakhir
                  </h3>
                </div>
                <div className="divide-y-2 divide-[#191b23]/10 font-bold text-xs">
                   {(dashboard.history || dashboard.activities || []).map((log, idx) => (

                    <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[#9f149f]">{log.id}</span>
                        <span className="text-[#191b23]">{log.task}</span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <span className="text-gray-400 font-normal">{log.date}</span>
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase ${
                          log.success 
                            ? 'bg-[#e8f5e9] text-[#2e7d32] border-[#2e7d32]' 
                            : 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]'
                        }`}>
                          {log.success ? 'Berhasil' : 'Ditolak'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          )}

          {activeTab === 'pengajuan' && (
            <section className="rounded-2xl border-3 border-[#191b23] bg-white shadow-[6px_6px_0_#191b23] overflow-hidden">
<div className="flex flex-wrap items-center justify-between gap-3 border-b-3 border-[#191b23] p-5"><h2 className="text-xl font-black uppercase tracking-tight">Daftar Pengajuan</h2><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari mahasiswa, NIM, perusahaan" className="rounded-xl border-2 border-[#191b23] px-3 py-2 text-xs font-bold" /></div>
               <div className="overflow-x-auto"><table className="w-full text-left text-xs font-bold"><thead className="border-b-2 border-[#191b23] text-[10px] uppercase"><tr><th className="p-4">Mahasiswa</th><th className="p-4">Perusahaan</th><th className="p-4">DPL</th><th className="p-4 text-center">Status</th><th className="p-4 text-right">Aksi</th></tr></thead><tbody className="divide-y">{submissions.filter(sub => `${sub.nama} ${sub.nim} ${sub.perusahaan}`.toLowerCase().includes(search.toLowerCase())).map(sub => <tr key={sub.id}><td className="p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#191b23] bg-purple-100">{sub.avatar ? <img src={sub.avatar} alt={sub.nama} className="h-full w-full object-cover" /> : <Icon>account_circle</Icon>}</div><div>{sub.nama}<span className="block text-[10px] text-gray-500">NIM: {sub.nim}</span></div></div></td><td className="p-4">{sub.perusahaan}</td><td className="p-4">{sub.dpl}</td><td className="p-4 text-center"><span className="rounded-full border-2 border-green-700 bg-green-100 px-2 py-1 text-[9px] uppercase">{sub.status}</span></td><td className="p-4 text-right"><button onClick={() => setSelectedSubmission(sub)} className="rounded-lg border-2 border-[#191b23] p-2"><Icon className="text-sm">visibility</Icon></button>{sub.status === 'pending' && <div className="mt-2 flex justify-end gap-2"><button onClick={() => handleApprove(sub.id, sub.nama)} className="rounded-lg border-2 border-[#191b23] bg-[#9f149f] px-3 py-1 text-white">Setujui</button><button onClick={() => handleReject(sub.id, sub.nama)} className="rounded-lg border-2 border-[#191b23] bg-[#ba1a1a] px-3 py-1 text-white">Revisi</button></div>}</td></tr>)}</tbody></table></div>
            </section>
          )}

          {activeTab !== 'dashboard' && activeTab !== 'pengajuan' && (
            <section className="rounded-2xl border-3 border-[#191b23] bg-white p-6 shadow-[6px_6px_0_#191b23] space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#191b23] pb-4">
                <h2 className="text-xl font-black uppercase tracking-tight">{activeTab === 'data-master' ? 'Data Master Mata Kuliah' : activeTab === 'surat' ? 'Surat Pengantar' : activeTab === 'laporan' ? 'Laporan Dashboard' : activeTab === 'konversi-mk' ? 'Konversi Mata Kuliah' : 'Pengaturan'}</h2>
                {activeTab === 'laporan' && <button onClick={() => exportData('/admin/export/hasil-konversi', 'hasil-konversi.xlsx')} className="rounded-xl border-2 border-[#191b23] bg-[#9f149f] px-4 py-2 text-xs font-bold text-white shadow-[3px_3px_0_#191b23]"><Icon className="mr-1 align-middle text-sm">download</Icon> Ekspor</button>}
                {activeTab === 'konversi-mk' && <button onClick={() => exportData('/admin/export/hasil-konversi', 'hasil-konversi.xlsx')} className="rounded-xl border-2 border-[#191b23] bg-[#9f149f] px-4 py-2 text-xs font-bold text-white shadow-[3px_3px_0_#191b23]"><Icon className="mr-1 align-middle text-sm">download</Icon> Ekspor Hasil</button>}
              </div>
              {tabLoading && <p className="text-xs font-bold text-gray-500">Memuat data...</p>}
              {tabError && <p className="border-2 border-[#ba1a1a] bg-[#ffdad6] p-3 text-xs font-bold text-[#93000a]">{tabError}</p>}
              {activeTab === 'data-master' && !tabLoading && <div className="overflow-x-auto"><table className="w-full text-left text-xs font-bold"><thead className="border-b-2 border-[#191b23] text-[10px] uppercase"><tr><th className="p-3">Kode</th><th className="p-3">Mata Kuliah</th><th className="p-3">SKS</th><th className="p-3">Sumber</th></tr></thead><tbody className="divide-y">{tabData.courses.map(course => <tr key={course.id}><td className="p-3 font-mono">{course.kode_mk}</td><td className="p-3">{course.nama_mk}</td><td className="p-3">{course.sks}</td><td className="p-3">{course.sumber || '-'}</td></tr>)}</tbody></table></div>}
              {activeTab === 'surat' && !tabLoading && <div className="space-y-3">{tabData.letters.map(letter => <div key={letter.id} className="flex flex-wrap items-center justify-between gap-3 border-2 border-[#191b23] p-4 text-xs font-bold"><span>{letter.magang?.mahasiswa?.name || letter.magang?.mahasiswa?.nama || `Surat #${letter.id}`}</span><span className="uppercase">{letter.status}</span>{letter.status !== 'disetujui' && <label className="flex items-center gap-2"><input type="file" accept="application/pdf,.pdf" onChange={event => { const file = event.target.files?.[0]; if (file) issueLetter(letter, file) }} className="max-w-[180px] text-[10px]" /><span className="rounded-lg border-2 border-[#191b23] bg-[#9f149f] px-3 py-1 text-white">Pilih PDF & Terbitkan</span></label>}</div>)}</div>}
              {activeTab === 'laporan' && !tabLoading && <div className="grid gap-4 sm:grid-cols-3">{Object.entries(tabData.dashboard || {}).slice(0, 6).map(([key, value]) => <div key={key} className="border-2 border-[#191b23] p-4"><p className="text-[10px] font-black uppercase">{key.replaceAll('_', ' ')}</p><strong className="text-2xl">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</strong></div>)}</div>}
              {activeTab === 'konversi-mk' && <p className="text-sm font-bold">Gunakan ekspor hasil konversi untuk melihat pemetaan nilai terbaru.</p>}
              {activeTab === 'pengaturan' && <div className="grid gap-3 sm:grid-cols-2 text-sm font-bold">{[['Nama', user?.name || user?.nama], ['Email', user?.email], ['NIM/NIP', user?.nim_nip || user?.nim], ['Peran', user?.role]].map(([label, value]) => <div key={label} className="border-2 border-[#191b23] p-4"><span className="block text-[10px] uppercase text-gray-500">{label}</span>{value || '-'}</div>)}</div>}
            </section>
          )}

        </main>
        {selectedSubmission && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5"><div className="w-full max-w-md rounded-2xl border-3 border-[#191b23] bg-white p-6"><div className="mb-4 flex justify-between"><h2 className="font-black">Detail Berkas</h2><button onClick={() => setSelectedSubmission(null)} className="border-2 border-[#191b23] px-3 py-1 font-bold">Tutup</button></div><p className="mb-4 text-sm font-bold">{selectedSubmission.nama}</p><div className="grid gap-3"><button onClick={async () => { try { const { data } = await api.get(`/admin/magang/${selectedSubmission.id}/dokumen/proposal`); window.open(data.url, '_blank') } catch (e) { showToast(getApiError(e), 'error') } }} className="border-2 border-[#191b23] p-3 text-left font-bold">Buka Proposal</button><button onClick={async () => { try { const { data } = await api.get(`/admin/magang/${selectedSubmission.id}/dokumen/bukti_diterima`); window.open(data.url, '_blank') } catch (e) { showToast(getApiError(e), 'error') } }} className="border-2 border-[#191b23] p-3 text-left font-bold">Buka Bukti Diterima</button></div></div></div>}
      </div>

    </div>
  )
}
