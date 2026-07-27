import React, { useState } from 'react'

function Icon({ children, className = '' }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>
}

export default function DashboardKaprodi({ user, onLogout }) {
  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Interactive filters
  const [academicYear, setAcademicYear] = useState('2025/2026')
  const [semester, setSemester] = useState('Genap')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Notification Toast Helper
  const [toast, setToast] = useState(null)
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Selected student for details modal
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Mock database that responds to academicYear and semester filters
  const dataDb = {
    '2025/2026': {
      'Genap': {
        kpis: {
          totalMahasiswa: 156,
          konversiSelesai: 142,
          mitraIndustri: 48,
          avgNilaiAkhir: 89.4,
          avgNilaiDpl: 91.2,
          successRate: '98%',
        },
        chartPengajuan: [
          { month: 'Jan', val: 42, height: '40%', active: false },
          { month: 'Feb', val: 68, height: '65%', active: false },
          { month: 'Mar', val: 94, height: '85%', active: false },
          { month: 'Apr', val: 112, height: '95%', active: true },
          { month: 'Mei', val: 58, height: '55%', active: false }
        ],
        statusDistribution: {
          approved: 110,
          revision: 24,
          rejected: 12,
          waiting: 10
        },
        prodiPerformance: [
          { name: 'Teknik Informatika', score: 92.4, width: '92.4%' },
          { name: 'Sistem Informasi', score: 88.1, width: '88.1%' },
          { name: 'Desain Komunikasi Visual', score: 94.8, width: '94.8%' }
        ],
        submissions: [
          { nim: '20230012', nama: 'Aditya Pratama', perusahaan: 'Gojek Indonesia', program: 'Software Eng.', nilai: 94, status: 'APPROVED', detail: 'Membangun microservice payment menggunakan Go dan PostgreSQL.' },
          { nim: '20230456', nama: 'Siti Rahmawati', perusahaan: 'Traveloka', program: 'Data Analyst', nilai: 88, status: 'REVISION', detail: 'Menganalisis retensi pengguna aplikasi menggunakan Python.' },
          { nim: '20230112', nama: 'Budi Santoso', perusahaan: 'PT Telkom Indonesia', program: 'Network Admin', nilai: 91, status: 'APPROVED', detail: 'Konfigurasi routing dinamis dan monitoring jaringan lokal.' },
          { nim: '20230890', nama: 'Dewi Lestari', perusahaan: 'Shopee Indonesia', program: 'UI/UX Designer', nilai: 95, status: 'APPROVED', detail: 'Mendesain ulang alur checkout dan uji ketergunaan prototipe.' },
          { nim: '20230554', nama: 'Fajar Nugroho', perusahaan: 'GOTO Financial', program: 'Backend Dev', nilai: 87, status: 'WAITING', detail: 'Mengoptimalkan endpoint API untuk pemrosesan transaksi cepat.' }
        ]
      },
      'Ganjil': {
        kpis: {
          totalMahasiswa: 124,
          konversiSelesai: 120,
          mitraIndustri: 35,
          avgNilaiAkhir: 87.2,
          avgNilaiDpl: 89.5,
          successRate: '96%',
        },
        chartPengajuan: [
          { month: 'Jul', val: 30, height: '30%' },
          { month: 'Agu', val: 55, height: '55%' },
          { month: 'Sep', val: 80, height: '80%' },
          { month: 'Okt', val: 95, height: '95%' },
          { month: 'Nov', val: 40, height: '40%' }
        ],
        statusDistribution: {
          approved: 102,
          revision: 12,
          rejected: 6,
          waiting: 4
        },
        prodiPerformance: [
          { name: 'Teknik Informatika', score: 89.8, width: '89.8%' },
          { name: 'Sistem Informasi', score: 85.5, width: '85.5%' },
          { name: 'Desain Komunikasi Visual', score: 91.2, width: '91.2%' }
        ],
        submissions: [
          { nim: '20220199', nama: 'Chandra Wijaya', perusahaan: 'Astra International', program: 'IT Support', nilai: 85, status: 'APPROVED', detail: 'Maintenance server dan troubleshooting workstation karyawan.' },
          { nim: '20220234', nama: 'Eka Putri', perusahaan: 'Tokopedia', program: 'QA Engineer', nilai: 90, status: 'APPROVED', detail: 'Membuat script automated testing menggunakan Selenium.' },
          { nim: '20220311', nama: 'Rian Hidayat', perusahaan: 'Mitra Integrasi', program: 'Network Eng.', nilai: 82, status: 'APPROVED', detail: 'Instalasi jaringan nirkabel pada gedung kantor cabang.' }
        ]
      }
    },
    '2024/2025': {
      'Genap': {
        kpis: {
          totalMahasiswa: 110,
          konversiSelesai: 108,
          mitraIndustri: 30,
          avgNilaiAkhir: 86.8,
          avgNilaiDpl: 88.9,
          successRate: '98%',
        },
        chartPengajuan: [
          { month: 'Jan', val: 25, height: '25%' },
          { month: 'Feb', val: 50, height: '50%' },
          { month: 'Mar', val: 75, height: '75%' },
          { month: 'Apr', val: 90, height: '90%' },
          { month: 'Mei', val: 45, height: '45%' }
        ],
        statusDistribution: {
          approved: 95,
          revision: 8,
          rejected: 5,
          waiting: 2
        },
        prodiPerformance: [
          { name: 'Teknik Informatika', score: 88.0, width: '88%' },
          { name: 'Sistem Informasi', score: 84.2, width: '84.2%' },
          { name: 'Desain Komunikasi Visual', score: 90.5, width: '90.5%' }
        ],
        submissions: [
          { nim: '20210043', nama: 'Agus Setiawan', perusahaan: 'Inovasi Digital', program: 'Web Developer', nilai: 88, status: 'APPROVED', detail: 'Mengembangkan frontend landing page menggunakan React JS.' }
        ]
      },
      'Ganjil': {
        kpis: {
          totalMahasiswa: 98,
          konversiSelesai: 95,
          mitraIndustri: 25,
          avgNilaiAkhir: 85.5,
          avgNilaiDpl: 87.2,
          successRate: '97%',
        },
        chartPengajuan: [
          { month: 'Jul', val: 20, height: '20%' },
          { month: 'Agu', val: 40, height: '40%' },
          { month: 'Sep', val: 65, height: '65%' },
          { month: 'Okt', val: 85, height: '85%' },
          { month: 'Nov', val: 35, height: '35%' }
        ],
        statusDistribution: {
          approved: 82,
          revision: 10,
          rejected: 3,
          waiting: 3
        },
        prodiPerformance: [
          { name: 'Teknik Informatika', score: 86.5, width: '86.5%' },
          { name: 'Sistem Informasi', score: 83.0, width: '83%' },
          { name: 'Desain Komunikasi Visual', score: 88.0, width: '88%' }
        ],
        submissions: [
          { nim: '20200871', nama: 'Riana Sari', perusahaan: 'Media Kreatif', program: 'Graphic Designer', nilai: 89, status: 'APPROVED', detail: 'Mendesain aset media sosial untuk promosi produk mitra.' }
        ]
      }
    }
  }

  // Fallback to default if selected filters do not exist in db
  const yearData = dataDb[academicYear] || dataDb['2025/2026']
  const currentData = yearData[semester] || yearData['Genap']

  // Handle Search and Status Filter
  const filteredSubmissions = currentData.submissions.filter(sub => {
    const matchesSearch = sub.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.nim.includes(searchQuery) ||
                          sub.perusahaan.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (statusFilter === 'all') return matchesSearch
    return matchesSearch && sub.status === statusFilter
  })

  return (
    <div className="flex h-screen overflow-hidden bg-[#faf8ff] font-['Space_Grotesk',sans-serif] text-[#191b23]">
      
      {/* Toast Alert Notification */}
      {toast && (
        <div className={`fixed top-20 right-5 z-50 flex items-center gap-3 border-[3px] border-[#191b23] p-4 font-bold shadow-[4px_4px_0_#191b23] transition-all transform animate-bounce ${
          toast.type === 'error' ? 'bg-[#ffdad6] text-[#93000a]' : toast.type === 'info' ? 'bg-[#fbf0fb] text-[#9f149f]' : 'bg-[#e8f5e9] text-[#2e7d32]'
        }`}>
          <Icon>{toast.type === 'error' ? 'error' : toast.type === 'info' ? 'info' : 'check_circle'}</Icon>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Backdrop overlay for sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#191b23]/30 z-30 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ============================================================== */}
      {/* COLLAPSIBLE / RESPONSIVE SIDEBAR */}
      {/* ============================================================== */}
      <aside className={`w-64 shrink-0 border-r-[3px] border-[#191b23] bg-[#f8fafc] flex flex-col justify-between h-screen fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col flex-1">
          {/* Header Brand */}
          <div className="bg-[#9f149f] border-b-[3px] border-[#191b23] h-16 flex items-center px-6 text-white font-bold text-xl justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white text-[#9f149f]"><Icon className="text-[18px]">school</Icon></span>
              <span className="tracking-tight uppercase">Kaprodi Portal</span>
            </div>
            <button className="text-white hover:opacity-80" onClick={() => setIsSidebarOpen(false)}>
              <Icon>close</Icon>
            </button>
          </div>

          {/* Navigation Sidebar Buttons */}
          <nav className="mt-8 flex flex-col gap-3 px-3">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
              { id: 'statistics', label: 'Statistik', icon: 'leaderboard' },
              { id: 'reports', label: 'Laporan', icon: 'description' },
              { id: 'profile', label: 'Profil Kaprodi', icon: 'person' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setIsSidebarOpen(false)
                }}
                className={`flex items-center gap-3 w-full rounded-2xl border-2 p-3.5 text-left font-bold transition-all duration-150 ${
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
        <div className="p-4 border-t-[3px] border-[#191b23] bg-purple-50/50 space-y-3">
          <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-wider text-[#9f149f]">
            <Icon className="text-base">verified_user</Icon>
            Kaprodi Informatika
          </div>
          <div className="text-[9px] text-gray-500 mt-1 font-bold">NIDN: 0524097401</div>
          
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
            <button 
              onClick={onLogout}
              className="flex items-center justify-center gap-1.5 w-full rounded-xl border-2 border-[#191b23] bg-[#191b23] py-2.5 text-xs font-bold text-white shadow-[2.5px_2.5px_0_#9f149f] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all"
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
        <header className="h-16 shrink-0 border-b-[3px] border-[#191b23] bg-white flex items-center justify-between px-6 md:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Toggle Menu Button */}
            <button 
              className="p-2 border-2 border-[#191b23] rounded-xl bg-purple-50 hover:bg-purple-100 shadow-[2.5px_2.5px_0_#9f149f] transition-all flex items-center justify-center"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Icon className="text-xl font-bold text-[#9f149f]">{isSidebarOpen ? 'menu_open' : 'menu'}</Icon>
            </button>
            
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-[#9f149f] tracking-widest leading-none">PORTAL KETUA PROGRAM STUDI</span>
              <h1 className="text-lg md:text-xl font-bold uppercase tracking-tight text-slate-800 mt-0.5">KAPRODI DASHBOARD</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Academic Filters */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="font-bold text-[10px] uppercase text-gray-500">Tahun Akademik</label>
                <select 
                  value={academicYear} 
                  onChange={(e) => {
                    setAcademicYear(e.target.value)
                    showToast(`Tahun Akademik diubah ke ${e.target.value}`, 'info')
                  }}
                  className="bg-white border-2 border-[#191b23] px-3 py-1.5 font-bold text-xs outline-none rounded-xl focus:shadow-[2px_2px_0_#9f149f] transition-all"
                >
                  <option value="2025/2026">2025/2026</option>
                  <option value="2024/2025">2024/2025</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="font-bold text-[10px] uppercase text-gray-500">Semester</label>
                <select 
                  value={semester} 
                  onChange={(e) => {
                    setSemester(e.target.value)
                    showToast(`Semester diubah ke ${e.target.value}`, 'info')
                  }}
                  className="bg-white border-2 border-[#191b23] px-3 py-1.5 font-bold text-xs outline-none rounded-xl focus:shadow-[2px_2px_0_#9f149f] transition-all"
                >
                  <option value="Genap">Genap</option>
                  <option value="Ganjil">Ganjil</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4 pl-4 border-l-2 border-[#191b23]/20">
              <div className="text-right hidden sm:block">
                <p className="font-bold text-xs text-on-surface leading-tight">{user?.name || 'Dr. Aris Sudarsono'}</p>
                <p className="text-[10px] text-gray-500 font-medium">Study Program Head</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#9f149f] border-2 border-[#191b23] flex items-center justify-center text-white text-xs font-black">
                KPR
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 md:p-8 space-y-8 flex-1 bg-[#faf8ff] [background-image:radial-gradient(#e1e2ed_1px,transparent_1px)] [background-size:24px_24px]">
          
          {/* Mobile Filter view */}
          <div className="flex md:hidden flex-wrap items-center gap-3 bg-white p-4 border-2 border-[#191b23] rounded-2xl shadow-[3px_3px_0_#191b23]">
            <div className="flex-1 min-w-[120px]">
              <label className="font-bold text-[9px] uppercase text-gray-400 block mb-1">Tahun Akademik</label>
              <select 
                value={academicYear} 
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full bg-white border-2 border-[#191b23] px-2 py-1 font-bold text-xs outline-none rounded-lg"
              >
                <option value="2025/2026">2025/2026</option>
                <option value="2024/2025">2024/2025</option>
              </select>
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="font-bold text-[9px] uppercase text-gray-400 block mb-1">Semester</label>
              <select 
                value={semester} 
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-white border-2 border-[#191b23] px-2 py-1 font-bold text-xs outline-none rounded-lg"
              >
                <option value="Genap">Genap</option>
                <option value="Ganjil">Ganjil</option>
              </select>
            </div>
          </div>

          {/* ============================================================== */}
          {/* TAB: DASHBOARD (Overview) */}
          {/* ============================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              
              {/* Header Section */}
              <section className="relative w-full border-b-[4px] border-[#191b23] pb-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-3">
                    <div className="inline-block bg-[#f1d7f1] text-[#9f149f] px-4 py-1.5 border-[3px] border-[#191b23] font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0_#191b23] rounded-xl">
                      Executive Overview
                    </div>
                    <h1 className="font-bold text-4xl md:text-5xl text-on-surface leading-none uppercase tracking-tight">
                      Selamat Datang,<br/>Kaprodi
                    </h1>
                    <p className="text-sm font-bold text-gray-500 max-w-xl">
                      Ringkasan performa konversi magang semester ini dengan metrik keberhasilan akademik mahasiswa Informatika yang terstandarisasi.
                    </p>
                  </div>
                  <div className="flex flex-col md:items-end bg-white border-2 border-[#191b23] p-3 rounded-2xl shadow-[3px_3px_0_#191b23]">
                    <span className="font-bold text-gray-400 text-[10px] uppercase">Terakhir Diperbarui</span>
                    <span className="font-bold text-sm text-on-surface font-mono">27 Jul 2026 — 14:20</span>
                  </div>
                </div>
              </section>

              {/* KPI Cards Grid - 3 cols on tablet, 6 on XL to prevent squeezing, with larger gaps */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 md:gap-8">
                {[
                  { title: 'Total Mahasiswa', val: currentData.kpis.totalMahasiswa, icon: 'groups', sub: 'TOTAL INTERNS', color: 'bg-white text-slate-800' },
                  { title: 'Konversi Selesai', val: currentData.kpis.konversiSelesai, icon: 'check_circle', sub: 'PROCESSED', color: 'bg-[#e8f5e9] text-[#2e7d32] border-[#2e7d32]' },
                  { title: 'Mitra Industri', val: currentData.kpis.mitraIndustri, icon: 'corporate_fare', sub: 'ACTIVE PARTNERS', color: 'bg-white text-slate-800' },
                  { title: 'Avg. Nilai Akhir', val: currentData.kpis.avgNilaiAkhir, icon: 'grade', sub: 'GRADE AVG', color: 'bg-purple-50 text-[#9f149f] border-[#9f149f]' },
                  { title: 'Avg. Nilai DPL', val: currentData.kpis.avgNilaiDpl, icon: 'supervisor_account', sub: 'MENTOR SCORE', color: 'bg-white text-slate-800' },
                  { title: 'Success Rate', val: currentData.kpis.successRate, icon: 'trending_up', sub: 'CONVERSION RATE', color: 'bg-[#e9f2ff] text-[#0060ac] border-[#0060ac]' }
                ].map((kpi, idx) => (
                  <div key={idx} className={`border-[3px] border-[#191b23] p-6 shadow-[5px_5px_0_#191b23] rounded-2xl hover:-translate-y-1 transition-all flex flex-col justify-between ${kpi.color}`}>
                    <div>
                      <p className="font-bold text-[10px] uppercase opacity-75 tracking-wider">{kpi.title}</p>
                      <h3 className="text-3xl font-black mt-3 mb-4 leading-none">{kpi.val}</h3>
                    </div>
                    <div className="flex items-center gap-2 border-t border-[#191b23]/10 pt-2 text-[9px] font-black uppercase tracking-wide opacity-80">
                      <Icon className="text-md">{kpi.icon}</Icon>
                      <span>{kpi.sub}</span>
                    </div>
                  </div>
                ))}
              </section>

              {/* Main Content Grid: Split left/right */}
              <div className="grid grid-cols-12 gap-8 mt-4">
                
                {/* Left: Charts and Table */}
                <div className="col-span-12 lg:col-span-9 space-y-8">
                  
                  {/* Charts Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Tren Pengajuan Chart */}
                    <div className="bg-white border-[3px] border-[#191b23] p-8 shadow-[6px_6px_0_#191b23] rounded-3xl">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="font-bold text-lg uppercase tracking-tight text-[#191b23]">Tren Pengajuan</h4>
                          <p className="text-[10px] font-bold text-gray-400">JUMLAH REGISTRASI PER BULAN</p>
                        </div>
                        <span className="font-bold text-[10px] bg-slate-100 px-3 py-1.5 border-2 border-[#191b23] rounded-xl uppercase">Grafik Batang</span>
                      </div>
                      <div className="h-60 flex items-end gap-4 px-2 pb-2">
                        {currentData.chartPengajuan.map((bar, i) => (
                          <div key={i} className="flex-1 flex flex-col justify-end h-full group relative cursor-pointer">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#191b23] text-white px-2 py-1 rounded-lg text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-10">
                              {bar.val} Mhs
                            </div>
                            <div 
                              style={{ height: bar.height }} 
                              className={`w-full rounded-t-lg border-2 border-b-0 border-[#191b23] transition-all duration-300 ${
                                bar.active ? 'bg-[#9f149f]' : 'bg-[#64a8fe] hover:bg-[#9f149f]'
                              }`}
                            />
                            <div className="text-center font-bold text-[10px] text-gray-500 uppercase mt-2 pt-2 border-t-2 border-[#191b23]/10">
                              {bar.month}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Distribusi Status Chart */}
                    <div className="bg-white border-[3px] border-[#191b23] p-8 shadow-[6px_6px_0_#191b23] rounded-3xl">
                      <h4 className="font-bold text-lg uppercase tracking-tight text-[#191b23] mb-2">Status Konversi</h4>
                      <p className="text-[10px] font-bold text-gray-400 mb-6">DISTRIBUSI STATUS PENILAIAN MAHASISWA</p>
                      
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        {/* Circular Donut style representation */}
                        <div className="relative w-36 h-36 flex items-center justify-center bg-slate-50 border-2 border-[#191b23] rounded-full p-2">
                          <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                            <circle className="text-slate-100" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="12" />
                            {/* Approved Segment */}
                            <circle cx="50" cy="50" fill="transparent" r="40" stroke="#2563eb" strokeDasharray="251.2" strokeDashoffset="50.24" strokeWidth="12" strokeLinecap="round" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black leading-none">{currentData.kpis.totalMahasiswa}</span>
                            <span className="text-[9px] font-bold uppercase text-gray-400">Total</span>
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="flex-1 space-y-2.5 w-full">
                          {[
                            { label: 'APPROVED', val: currentData.statusDistribution.approved, color: 'bg-primary' },
                            { label: 'REVISION', val: currentData.statusDistribution.revision, color: 'bg-secondary-container' },
                            { label: 'REJECTED', val: currentData.statusDistribution.rejected, color: 'bg-error' },
                            { label: 'WAITING', val: currentData.statusDistribution.waiting, color: 'bg-slate-300' }
                          ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`w-3.5 h-3.5 border border-[#191b23] ${item.color} rounded-md`} />
                                <span className="font-bold text-[10px] tracking-wide text-gray-600">{item.label}</span>
                              </div>
                              <span className="font-black text-xs">{item.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Program Performance Chart */}
                  <div className="bg-white border-[3px] border-[#191b23] p-8 shadow-[6px_6px_0_#191b23] rounded-3xl">
                    <h4 className="font-bold text-lg uppercase tracking-tight text-[#191b23] mb-2">Nilai Akhir Rerata per Prodi</h4>
                    <p className="text-[10px] font-bold text-gray-400 mb-6">STANDAR KELULUSAN DENGAN RERATA KOMPETENSI INDIKATOR</p>
                    
                    <div className="space-y-6">
                      {currentData.prodiPerformance.map((prodi, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between font-bold text-xs uppercase text-slate-700">
                            <span>{prodi.name}</span>
                            <span className="font-mono bg-purple-50 text-[#9f149f] px-2 py-0.5 border border-[#191b23]/10 rounded font-black">{prodi.score}</span>
                          </div>
                          <div className="w-full h-7 bg-slate-100 border-[2.5px] border-[#191b23] rounded-xl overflow-hidden shadow-inner">
                            <div 
                              style={{ width: prodi.width }} 
                              className="h-full bg-[#9f149f] border-r-2 border-[#191b23] transition-all duration-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Table Section */}
                  <div className="bg-white border-[3px] border-[#191b23] shadow-[6px_6px_0_#191b23] rounded-3xl overflow-hidden">
                    <div className="p-6 border-b-[3px] border-[#191b23] flex flex-wrap justify-between items-center bg-[#191b23] gap-4">
                      <div>
                        <h4 className="font-bold text-base text-white uppercase tracking-tight">Hasil Konversi Terbaru</h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-1">Daftar pengajuan magang yang telah terverifikasi akademik</p>
                      </div>
                      
                      {/* Search and Filters */}
                      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-60">
                          <input 
                            type="text" 
                            placeholder="Cari mahasiswa, NIM, atau mitra..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border-2 border-white px-3 py-1.5 pl-9 font-bold text-xs outline-none rounded-xl focus:border-[#9f149f] focus:text-[#191b23] text-[#191b23] transition-all"
                          />
                          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</Icon>
                        </div>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="bg-white border-2 border-white text-[#191b23] px-3 py-1.5 font-bold text-xs outline-none rounded-xl"
                        >
                          <option value="all">Semua Status</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REVISION">Revision</option>
                          <option value="WAITING">Waiting</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b-2 border-[#191b23] text-gray-500 font-bold">
                            <th className="p-5 uppercase font-bold">Mahasiswa</th>
                            <th className="p-5 uppercase font-bold">Perusahaan / Mitra</th>
                            <th className="p-5 uppercase font-bold">Program</th>
                            <th className="p-5 uppercase font-bold text-center">Nilai Akhir</th>
                            <th className="p-5 uppercase font-bold">Status</th>
                            <th className="p-5 uppercase font-bold text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-[2px] divide-[#191b23]/10 font-bold">
                          {filteredSubmissions.length > 0 ? (
                            filteredSubmissions.map((sub, i) => (
                              <tr key={i} className="hover:bg-purple-50/20 transition-colors">
                                <td className="p-5">
                                  <p className="font-bold text-sm text-on-surface">{sub.nama}</p>
                                  <p className="text-[10px] text-gray-400 font-mono">NIM: {sub.nim}</p>
                                </td>
                                <td className="p-5 text-[#434655] font-semibold">{sub.perusahaan}</td>
                                <td className="p-5 text-[#434655] italic">{sub.program}</td>
                                <td className="p-5 text-center">
                                  <span className="text-lg font-black text-[#9f149f]">{sub.nilai}</span>
                                </td>
                                <td className="p-5">
                                  <span className={`px-3 py-1 border-[2.5px] border-[#191b23] font-bold text-[9px] uppercase rounded-xl ${
                                    sub.status === 'APPROVED' ? 'bg-[#e8f5e9] text-[#2e7d32] border-[#2e7d32]' : 
                                    sub.status === 'REVISION' ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]' : 
                                    'bg-amber-100 text-amber-800 border-amber-500'
                                  }`}>
                                    {sub.status}
                                  </span>
                                </td>
                                <td className="p-5 text-right">
                                  <button 
                                    onClick={() => setSelectedStudent(sub)}
                                    className="p-1.5 border-2 border-[#191b23] bg-white rounded-lg hover:bg-slate-50 shadow-[2px_2px_0_#191b23] active:translate-y-0.5 active:shadow-none transition-all"
                                  >
                                    <Icon className="text-sm">visibility</Icon>
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="p-8 text-center text-gray-400 font-bold">
                                Tidak ada data hasil konversi yang cocok.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

                {/* Right Panel: Summary & Quick Actions */}
                <aside className="col-span-12 lg:col-span-3 space-y-8">
                  
                  {/* Summary Card */}
                  <div className="bg-[#191b23] text-white border-[3px] border-[#191b23] p-8 shadow-[6px_6px_0_#9f149f] rounded-3xl">
                    <h4 className="font-bold text-base uppercase tracking-tight mb-6 border-b-2 border-white/20 pb-4 text-white">Ringkasan</h4>
                    <div className="space-y-6">
                      <div className="group">
                        <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Mahasiswa Aktif Magang</p>
                        <div className="flex items-end gap-2">
                          <span className="text-4xl font-black text-yellow-300 leading-none">14</span>
                          <span className="text-[10px] font-black text-gray-400 mb-1 uppercase">STUDENTS</span>
                        </div>
                      </div>
                      <div className="group">
                        <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Mahasiswa Selesai</p>
                        <div className="flex items-end gap-2">
                          <span className="text-4xl font-black text-green-400 leading-none">142</span>
                          <span className="text-[10px] font-black text-gray-400 mb-1 uppercase">PROCESSED</span>
                        </div>
                      </div>
                      <div className="group">
                        <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Konversi Menunggu</p>
                        <div className="flex items-end gap-2">
                          <span className="text-4xl font-black text-[#ff8b8b] leading-none">02</span>
                          <span className="text-[10px] font-black text-gray-400 mb-1 uppercase">PENDING</span>
                        </div>
                      </div>
                      <div className="pt-6 border-t-2 border-white/10">
                        <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Rata-rata Durasi Magang</p>
                        <div className="flex items-end gap-2">
                          <span className="text-4xl font-black text-slate-300 leading-none">5.2</span>
                          <span className="text-[10px] font-black text-gray-400 mb-1 uppercase">MONTHS</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Asset Trend */}
                  <div className="relative bg-[#f1d7f1] border-[3px] border-[#191b23] rounded-3xl p-6 shadow-[6px_6px_0_#191b23] overflow-hidden group">
                    <div className="absolute inset-0 bg-[#9f149f]/5 opacity-10" style={{ backgroundImage: 'radial-gradient(#191b23 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
                    <div className="relative z-10 flex flex-col items-center justify-center text-center py-4">
                      <div className="w-14 h-14 bg-white border-2 border-[#191b23] rounded-2xl flex items-center justify-center text-[#9f149f] mb-4 shadow-[3px_3px_0_#191b23] group-hover:rotate-6 transition-all duration-300">
                        <Icon className="text-3xl">insights</Icon>
                      </div>
                      <p className="font-bold text-xs text-[#191b23] leading-tight uppercase">Analisis Tren Prediktif Semester Depan</p>
                      <p className="text-[9px] font-black text-[#9f149f] mt-2 bg-white px-2 py-0.5 border border-[#191b23] rounded">+15% PERTUMBUHAN MITRA</p>
                    </div>
                  </div>
                </aside>
              </div>

              {/* Bottom Section: Academic Insights */}
              <section className="mt-8 space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="font-bold text-2xl uppercase tracking-tight text-slate-800">Academic Insights</h2>
                  <div className="flex-1 h-[3px] bg-[#191b23]" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {/* Insight 1 */}
                  <div className="bg-white border-[3px] border-[#191b23] p-8 shadow-[5px_5px_0_#191b23] rounded-2xl relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#9f149f]/5 rounded-full border-2 border-[#191b23] group-hover:scale-110 transition-transform"></div>
                    <h5 className="font-bold text-sm uppercase text-[#9f149f] mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                      <Icon className="text-lg">stars</Icon>
                      Top Industry Partners
                    </h5>
                    <ul className="space-y-4 text-xs font-bold">
                      {[
                        { name: 'Tech Giant Corp', val: '24 MHS' },
                        { name: 'Innovate Lab', val: '18 MHS' },
                        { name: 'Global Finance', val: '12 MHS' }
                      ].map((item, i) => (
                        <li key={i} className="flex items-center justify-between border-b border-dashed border-gray-200 pb-1.5">
                          <span className="text-slate-700">{item.name}</span>
                          <span className="bg-[#9f149f] text-white px-3 py-1 border-2 border-[#191b23] text-[9px] rounded-lg shadow-[2px_2px_0_#191b23]">
                            {item.val}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Insight 2 */}
                  <div className="bg-white border-[3px] border-[#191b23] p-8 shadow-[5px_5px_0_#191b23] rounded-2xl relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#64a8fe]/10 rounded-full border-2 border-[#191b23] group-hover:scale-110 transition-transform"></div>
                    <h5 className="font-bold text-sm uppercase text-[#0060ac] mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                      <Icon className="text-lg">menu_book</Icon>
                      Most Selected Courses
                    </h5>
                    <ul className="space-y-4 text-xs font-bold">
                      {[
                        { name: 'PPL II', val: '85% CONVERSION' },
                        { name: 'Manajemen Proyek', val: '78% CONVERSION' },
                        { name: 'Basis Data Lanjut', val: '72% CONVERSION' }
                      ].map((item, i) => (
                        <li key={i} className="flex items-center justify-between border-b border-dashed border-gray-200 pb-1.5">
                          <span className="text-slate-700">{item.name}</span>
                          <span className="text-[9px] font-mono text-gray-500">{item.val}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Insight 3 */}
                  <div className="bg-white border-[3px] border-[#191b23] p-8 shadow-[5px_5px_0_#191b23] rounded-2xl relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#22C55E]/5 rounded-full border-2 border-[#191b23] group-hover:scale-110 transition-transform"></div>
                    <h5 className="font-bold text-sm uppercase text-[#2e7d32] mb-6 flex items-center gap-2 border-b border-gray-100 pb-2">
                      <Icon className="text-lg">emoji_events</Icon>
                      Most Achieved CPMK
                    </h5>
                    <ul className="space-y-4 text-xs font-bold">
                      {[
                        { num: '01', val: 'Teamwork & Leadership' },
                        { num: '02', val: 'Problem Solving' },
                        { num: '03', val: 'Technical Writing' }
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-4 border-b border-dashed border-gray-200 pb-1.5">
                          <span className="text-lg font-black text-[#9f149f]">{item.num}</span>
                          <div className="flex-1 h-[2px] bg-slate-200" />
                          <span className="text-[10px] uppercase text-right text-slate-700">{item.val}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: STATISTICS (Deeper info) */}
          {/* ============================================================== */}
          {activeTab === 'statistics' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="rounded-3xl border-[3px] border-[#191b23] bg-white p-8 shadow-[6px_6px_0_#191b23]">
                <h2 className="text-xl font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
                  <Icon className="text-[#9f149f]">leaderboard</Icon>
                  Statistik Detail Akademik Magang
                </h2>
                <p className="text-xs font-bold text-gray-500 mb-6">
                  Analisis sebaran nilai, lama durasi magang, dan pencapaian CPMK per mahasiswa program studi Informatika.
                </p>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Sebaran Nilai Card */}
                  <div className="border-2 border-[#191b23] rounded-2xl p-6 bg-slate-50">
                    <h3 className="font-bold text-xs uppercase text-gray-400 mb-4">Sebaran Indeks Kelulusan</h3>
                    <div className="space-y-3 font-bold text-xs">
                      <div className="flex justify-between items-center">
                        <span>Nilai A (Sangat Baik)</span>
                        <span>74 Mahasiswa (47.4%)</span>
                      </div>
                      <div className="w-full bg-white h-3.5 border-2 border-[#191b23] rounded-full overflow-hidden">
                        <div className="bg-[#22C55E] h-full" style={{ width: '47.4%' }}></div>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <span>Nilai B (Baik)</span>
                        <span>68 Mahasiswa (43.6%)</span>
                      </div>
                      <div className="w-full bg-white h-3.5 border-2 border-[#191b23] rounded-full overflow-hidden">
                        <div className="bg-[#2563eb] h-full" style={{ width: '43.6%' }}></div>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <span>Nilai C (Cukup)</span>
                        <span>14 Mahasiswa (9.0%)</span>
                      </div>
                      <div className="w-full bg-white h-3.5 border-2 border-[#191b23] rounded-full overflow-hidden">
                        <div className="bg-[#FACC15] h-full" style={{ width: '9%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Rincian Konversi SKS */}
                  <div className="border-2 border-[#191b23] rounded-2xl p-6 bg-slate-50">
                    <h3 className="font-bold text-xs uppercase text-gray-400 mb-4">Rerata Bobot Konversi Mata Kuliah</h3>
                    <div className="space-y-4 font-bold text-xs">
                      {[
                        { label: 'Matakuliah Pilihan Bebas', val: '9.2 SKS' },
                        { label: 'Kerja Praktik / Magang Mandiri', val: '4.0 SKS' },
                        { label: 'Proyek Pembelajaran Lapangan (PPL)', val: '6.8 SKS' }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-gray-200 pb-2">
                          <span>{item.label}</span>
                          <span className="bg-purple-100 text-[#9f149f] px-3 py-1 border border-[#191b23] rounded-lg">
                            {item.val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: REPORTS */}
          {/* ============================================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="rounded-3xl border-[3px] border-[#191b23] bg-white p-8 shadow-[6px_6px_0_#191b23]">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                      <Icon className="text-[#9f149f]">description</Icon>
                      Pusat Unduhan Laporan
                    </h2>
                    <p className="text-xs font-bold text-gray-500 mt-1">
                      Unduh berkas rekapitulasi nilai konversi akademik mahasiswa program studi untuk akreditasi BAN-PT.
                    </p>
                  </div>
                </div>

                <div className="grid gap-6">
                  {[
                    { title: 'Laporan Rekapitulasi Konversi Magang Semester Genap', date: 'Diunggah: 26 Jul 2026', size: '1.4 MB' },
                    { title: 'Laporan Rerata Pencapaian CPMK OBE Program Studi', date: 'Diunggah: 20 Jul 2026', size: '890 KB' },
                    { title: 'Daftar Log Kerja Sama Industri & Perusahaan Aktif', date: 'Diunggah: 15 Jul 2026', size: '420 KB' }
                  ].map((rep, idx) => (
                    <div key={idx} className="border-2 border-[#191b23] rounded-2xl p-5 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-[3px_3px_0_#191b23] transition-all">
                      <div>
                        <h4 className="font-bold text-sm text-[#191b23]">{rep.title}</h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase font-mono">{rep.date} • {rep.size}</p>
                      </div>
                      <div className="flex gap-2.5">
                        <button 
                          onClick={() => showToast('Mulai mengunduh laporan PDF...', 'success')}
                          className="flex items-center gap-1.5 rounded-xl border-2 border-[#191b23] bg-[#9f149f] px-4 py-2 text-xs font-bold text-white shadow-[2px_2px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
                        >
                          <Icon className="text-xs">download</Icon>
                          <span>PDF</span>
                        </button>
                        <button 
                          onClick={() => showToast('Mencetak rekap data ke Excel...', 'success')}
                          className="flex items-center gap-1.5 rounded-xl border-2 border-[#191b23] bg-white px-4 py-2 text-xs font-bold text-[#191b23] shadow-[2px_2px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
                        >
                          <Icon className="text-xs">table_view</Icon>
                          <span>XLSX</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: PROFILE */}
          {/* ============================================================== */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="rounded-3xl border-[3px] border-[#191b23] bg-white p-8 shadow-[6px_6px_0_#191b23]">
                <h2 className="text-xl font-bold uppercase tracking-tight mb-6 flex items-center gap-2">
                  <Icon className="text-[#9f149f]">person</Icon>
                  Profil Kaprodi
                </h2>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-32 h-32 rounded-3xl border-3 border-[#191b23] bg-[#9f149f] flex items-center justify-center text-white text-4xl font-black shadow-[4px_4px_0_#191b23] shrink-0">
                    KPR
                  </div>
                  
                  <div className="flex-1 space-y-6 w-full">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Nama Lengkap</label>
                        <input 
                          type="text" 
                          readOnly 
                          value={user?.name || 'Dr. Aris Sudarsono'} 
                          className="w-full bg-slate-50 border-2 border-[#191b23] rounded-xl px-4 py-2.5 font-bold text-sm outline-none cursor-default"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">NIDN</label>
                        <input 
                          type="text" 
                          readOnly 
                          value="0524097401" 
                          className="w-full bg-slate-50 border-2 border-[#191b23] rounded-xl px-4 py-2.5 font-bold text-sm outline-none cursor-default"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Email Akademik</label>
                        <input 
                          type="text" 
                          readOnly 
                          value={user?.email || 'kaprodi@amikom.ac.id'} 
                          className="w-full bg-slate-50 border-2 border-[#191b23] rounded-xl px-4 py-2.5 font-bold text-sm outline-none cursor-default"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Program Studi</label>
                        <input 
                          type="text" 
                          readOnly 
                          value="Informatika (S1)" 
                          className="w-full bg-slate-50 border-2 border-[#191b23] rounded-xl px-4 py-2.5 font-bold text-sm outline-none cursor-default"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                      <button 
                        onClick={() => showToast('Fitur edit profil terkunci sementara.', 'error')}
                        className="rounded-xl border-2 border-[#191b23] bg-[#9f149f] px-6 py-2.5 text-xs font-bold text-white shadow-[3px_3px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
                      >
                        Ubah Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ============================================================== */}
      {/* DETAIL STUDENT MODAL */}
      {/* ============================================================== */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#191b23]/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border-[3px] border-[#191b23] rounded-[24px] shadow-[8px_8px_0_#191b23] overflow-hidden animate-zoomIn">
            <div className="bg-[#9f149f] border-b-[3px] border-[#191b23] p-5 text-white flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black uppercase bg-white/20 px-2 py-0.5 rounded">Detail Konversi</span>
                <h3 className="font-bold text-lg mt-1">{selectedStudent.nama}</h3>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="text-white hover:opacity-85"
              >
                <Icon className="text-xl">close</Icon>
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs font-bold">
              <div>
                <span className="text-[9px] font-bold text-gray-400 block uppercase mb-1">NIM</span>
                <p className="text-sm font-mono text-slate-800">{selectedStudent.nim}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 block uppercase mb-1">Mitra Industri</span>
                  <p className="text-sm text-slate-800">{selectedStudent.perusahaan}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 block uppercase mb-1">Program / Jalur</span>
                  <p className="text-sm text-slate-800">{selectedStudent.program}</p>
                </div>
              </div>
              <div>
                <span className="text-[9px] font-bold text-gray-400 block uppercase mb-1">Nilai Akhir Konversi</span>
                <p className="text-xl font-black text-[#9f149f]">{selectedStudent.nilai} / 100</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-gray-400 block uppercase mb-1">Deskripsi Kegiatan</span>
                <p className="text-xs font-semibold text-slate-600 bg-slate-50 p-3 border-2 border-[#191b23]/10 rounded-xl leading-relaxed">
                  {selectedStudent.detail || 'Mahasiswa melakukan pengembangan aplikasi berskala besar serta mengikuti evaluasi berkala bersama mentor lapangan.'}
                </p>
              </div>
            </div>
            <div className="p-5 border-t-2 border-[#191b23]/10 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="rounded-xl border-2 border-[#191b23] bg-white px-5 py-2 text-xs font-bold text-[#191b23] shadow-[2px_2px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
