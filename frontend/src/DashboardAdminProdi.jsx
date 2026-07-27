import React, { useState, useEffect } from 'react'

function Icon({ children, className = '' }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>
}

export default function DashboardAdminProdi({ user, onLogout }) {
  // Collapsible sidebar state (False = closed/hidden by default)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  // Notification helper
  const [toast, setToast] = useState(null)
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Interactive Task List State
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Verifikasi 5 berkas Andi Pratama', completed: false },
    { id: 2, text: 'Upload SK DPL Semester Genap', completed: true },
    { id: 3, text: 'Cetak laporan bulanan Maret', completed: false },
  ])

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
    showToast('Status tugas diperbarui!')
  }

  // Mock data for student submissions
  const [submissions, setSubmissions] = useState([
    {
      id: 'VR-9082',
      nama: 'Andi Pratama',
      nim: '220104001',
      perusahaan: 'PT Teknologi Nusantara',
      dpl: 'Dr. Sarah Wijaya',
      status: 'pending',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb-NLaOs9EmwjAY7nPv91LFFOm66J1cveQVrLcikYQFDEDaFzWqzibu_mOT1DI7HrA5jNeIU3-Kwpsdwvqa9ApM_B37eh7GPkkV-DTsv1Z3BETtNteJo8odItFRFZz2OIdYyMu7uyDTC9Rbe484NvfYNx3aDcEtgdlb_WdX2lh-zf4rOaIYCsaJZn0O3As0XZPfkqPT0CJbC_vnjjExyJcijHCpO-cNuD9m7Me9_wasw7vraz6FmIPqpA2srC8D3NcXkkjc7xF9LvK'
    },
    {
      id: 'VR-9081',
      nama: 'Bunga Lestari',
      nim: '220104022',
      perusahaan: 'Shopee Indonesia',
      dpl: 'Bambang S.T., M.Kom',
      status: 'revisi',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBURoEr1gDiLlYf_0JIzysHQuMGlvWg3OykJFAVUnWF2XDyNTwqLwACXbcI8sUKHuD71-JQUFnDL1Yw7f5ZO2GeentIS5FHfT4Vv3HN-E75URWH1Z1yCNgLOd7u_tsNbpgIDbW4zZlV5Wx4jZNDA4qsZ7cTdj-3iKM4Ie2Q43QQtIsm2cMyPudlzX3mjRza-tT12K5XlH7iBoXQooy5evDrvsfj9dvT5PRAFvOTJExnFXekXJF5Fh0hiUTGwGknMxSf8MDRHVyBBl9J'
    },
    {
      id: 'VR-9080',
      nama: 'Citra Kirana',
      nim: '220104055',
      perusahaan: 'Gojek Tech',
      dpl: 'Indah Sari Ph.D',
      status: 'approved',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDc0Pg9AoZGJqRbN-mWtjiSj2T1ooshFdb4znRcPv1Nn2XBauzEhInAwVzwtPM8CzXiSLk-PL3bhPv-dRnIIbLQcpE7kpaFObI30uCqTJR1r29-w7fuU7JAKCpPcTgCJv1_ed4Eobq-dSft-h7gcGtkSRWyg8SwntZazLcbrnhUmXORmt3xN-OsQihXN-q_jYqjx69vRNVfNeCtQP6udXOlYElSDmZXhlZ2kxwYK-2LsVOAdli-y16ZBLOE6wqO4bjw52Svjek0qoe8'
    }
  ])

  // Simple action handlers
  const handleApprove = (id, name) => {
    setSubmissions(prev => prev.map(sub => sub.id === id ? { ...sub, status: 'approved' } : sub))
    showToast(`Pengajuan ${name} berhasil disetujui!`)
  }

  const handleReject = (id, name) => {
    setSubmissions(prev => prev.map(sub => sub.id === id ? { ...sub, status: 'revisi' } : sub))
    showToast(`Pengajuan ${name} dikembalikan untuk revisi.`, 'error')
  }

  // Count helper
  const pendingCount = submissions.filter(s => s.status === 'pending').length

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
              { id: 'laporan', label: 'Laporan', icon: 'assessment' },
              { id: 'pengaturan', label: 'Pengaturan', icon: 'settings' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
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
              onClick={() => setActiveTab('pengaturan')}
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
                      onClick={() => setActiveTab('pengajuan')}
                      className="flex items-center gap-2 rounded-xl border-2 border-[#191b23] bg-[#9f149f] px-5 py-2.5 text-xs font-bold text-white shadow-[3px_3px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                    >
                      <Icon className="text-md">verified_user</Icon>
                      Verifikasi Pengajuan
                    </button>
                    <button 
                      onClick={() => setActiveTab('laporan')}
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
                  { title: 'Total Pengajuan', val: 142, icon: 'folder_shared', color: 'bg-white' },
                  { title: 'Menunggu Verifikasi', val: pendingCount, icon: 'pending_actions', color: 'bg-[#ffdad6] text-[#93000a] border-[#ba1a1a]', isWarning: true },
                  { title: 'Menunggu Review DPL', val: 28, icon: 'rate_review', color: 'bg-purple-50 text-[#9f149f]' },
                  { title: 'Konversi Selesai', val: 102, icon: 'task_alt', color: 'bg-[#e8f5e9] text-[#2e7d32]' }
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
                      <button onClick={() => showToast('Fitur filter akan datang!')} className="p-2 rounded-lg border-2 border-[#191b23] hover:bg-slate-50 transition-colors">
                        <Icon className="text-md">filter_list</Icon>
                      </button>
                      <button onClick={() => showToast('Ekspor data berhasil diunduh!')} className="p-2 rounded-lg border-2 border-[#191b23] hover:bg-slate-50 transition-colors">
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
                                  onClick={() => showToast(`Detail berkas ${sub.nama} terbuka.`)}
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
                      onClick={() => setActiveTab('pengajuan')}
                      className="text-xs font-black uppercase tracking-wider text-[#9f149f] hover:underline"
                    >
                      Lihat Semua Pengajuan (45+)
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
                      
                      <div className="relative">
                        <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full bg-[#9f149f] border border-white" />
                        <p className="text-[10px] text-purple-300">10 Menit Lalu</p>
                        <p className="mt-0.5">Verifikasi pengajuan <b>Budi Santoso</b> ditolak (Revisi).</p>
                      </div>

                      <div className="relative">
                        <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full bg-green-400 border border-white" />
                        <p className="text-[10px] text-green-300">1 Jam Lalu</p>
                        <p className="mt-0.5">Anda menyetujui konversi nilai <b>Siska Amalia</b>.</p>
                      </div>

                      <div className="relative">
                        <div className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full bg-yellow-400 border border-white" />
                        <p className="text-[10px] text-yellow-300">Kemarin</p>
                        <p className="mt-0.5">Admin Dekanat mengunggah data master mahasiswa baru.</p>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Quick Actions grid */}
              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#434655]">Akses Cepat & Layanan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: 'Buat Surat Pengantar', icon: 'description', color: 'bg-white hover:bg-purple-50' },
                    { title: 'Kelola Data Master', icon: 'database', color: 'bg-white hover:bg-yellow-50' },
                    { title: 'Ekspor Data (Excel)', icon: 'table_view', color: 'bg-white hover:bg-green-50' },
                    { title: 'Analisis Laporan', icon: 'insights', color: 'bg-white hover:bg-blue-50' }
                  ].map((act, idx) => (
                    <button 
                      key={idx}
                      onClick={() => showToast(`Membuka menu ${act.title}...`)}
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
                  {[
                    { m: 'Jan', val: '40%', num: 12 },
                    { m: 'Feb', val: '65%', num: 25 },
                    { m: 'Mar', val: '90%', num: 48 },
                    { m: 'Apr', val: '55%', num: 30 },
                    { m: 'Mei', val: '30%', num: 15 },
                    { m: 'Jun', val: '45%', num: 20 }
                  ].map((bar, i) => (
                    <div key={i} className="group relative flex-1 flex flex-col justify-end h-full">
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#191b23] text-white px-2 py-1 rounded text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        {bar.num}
                      </div>
                      <div 
                        style={{ height: bar.val }}
                        className="bg-purple-100 border-2 border-b-0 border-[#191b23] group-hover:bg-[#9f149f] transition-all"
                      />
                      <p className="mt-3 text-center text-[10px] font-black uppercase tracking-wider text-slate-700">
                        {bar.m}
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
                  {[
                    { id: '#VR-9082', task: 'Konversi Nilai: Dian Safitri', date: '24 Mar 2026, 14:20', success: true },
                    { id: '#VR-9081', task: 'Surat Pengantar: PT Maju Jaya', date: '24 Mar 2026, 11:05', success: true },
                    { id: '#VR-9080', task: 'Validasi Logbook: Eko Prasetyo', date: '23 Mar 2026, 16:45', success: false },
                    { id: '#VR-9079', task: 'Pendaftaran Magang: Reza Rahadian', date: '23 Mar 2026, 09:30', success: true },
                    { id: '#VR-9078', task: 'Konversi Nilai: Siti Aisyah', date: '22 Mar 2026, 15:10', success: true }
                  ].map((log, idx) => (
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

          {/* ============================================================== */}
          {/* PLACEHOLDER PAGES */}
          {/* ============================================================== */}
          {activeTab !== 'dashboard' && (
            <div className="rounded-2xl border-3 border-[#191b23] bg-white p-8 md:p-12 shadow-[6px_6px_0_#191b23] text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-3 border-[#191b23] bg-purple-50 text-[#9f149f] flex items-center justify-center mx-auto shadow-[3px_3px_0_#191b23]">
                <Icon className="text-3xl">build</Icon>
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">Halaman {activeTab} Dalam Pembangunan</h2>
              <p className="text-xs font-bold text-gray-500 max-w-sm mx-auto">
                Modul ini sedang disiapkan oleh tim pengembang GradeSync untuk integrasi Siakad akademik.
              </p>
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-[#191b23] bg-white px-5 py-2 font-bold text-[#191b23] shadow-[2.5px_2.5px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all text-xs"
              >
                <Icon className="text-sm">arrow_back</Icon>
                Kembali ke Dashboard
              </button>
            </div>
          )}

        </main>
      </div>

    </div>
  )
}
