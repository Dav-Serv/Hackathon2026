import React, { useState, useEffect } from 'react'
import { MASTER_MATA_KULIAH, MOCK_DPL_LIST, INITIAL_STATE } from '../src/services/mockData'

function Icon({ children, className = '' }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>
}

export default function DashboardDosen({ user, onLogout }) {
  // Load state from localStorage or initial state
  const [db, setDb] = useState(() => {
    const saved = localStorage.getItem('gradeSync_db')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse localStorage data, using initial state', e)
      }
    }
    return INITIAL_STATE
  })

  // Sync db to localStorage
  useEffect(() => {
    localStorage.setItem('gradeSync_db', JSON.stringify(db))
  }, [db])

  // Active tab inside lecturer dashboard: dashboard | students | internship-proposal | conversion-claim | assessment-history | profile
  const [activeTab, setActiveTab] = useState('dashboard')

  // Notification helper
  const [toast, setToast] = useState(null)
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Collapsible sidebar state (False = closed/hidden by default)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Current active review student
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Input states for reviews
  const [catatanDplInput, setCatatanDplInput] = useState('')
  const [nilaiAkademikInput, setNilaiAkademikInput] = useState('')
  const [evaluasiDplInput, setEvaluasiDplInput] = useState('')

  // Static Mock Students List (to populate the table and pages)
  const [mockStudents, setMockStudents] = useState([
    {
      id: 'std-02',
      nama: 'Aditya Pratama',
      nim: '2021008401',
      jurusan: 'Informatika',
      perusahaan: 'Gojek Tech Lab',
      bidang: 'Software Development',
      posisi: 'Backend Engineer',
      period: 'Aug 23 - Jan 24',
      statusMagang: 'disetujui',
      statusUsulan: 'menunggu_persetujuan_dpl',
      statusKlaim: 'belum_diajukan',
      catatanUsulan: '',
      proposalFile: 'proposal_aditya_pratama.pdf',
      buktiDiterimaFile: 'bukti_penerimaan_aditya.pdf',
      usulanDetails: [
        { mkId: 'mk-01', cpmkId: 'cpmk-101', deskripsiRencana: 'Membantu optimalisasi database query PostgreSQL untuk modul pembayaran.' },
        { mkId: 'mk-01', cpmkId: 'cpmk-102', deskripsiRencana: 'Mendeploy RESTful API dengan framework Golang untuk service notifikasi.' }
      ]
    },
    {
      id: 'std-03',
      nama: 'Siti Aminah',
      nim: '2021008455',
      jurusan: 'Informatika',
      perusahaan: 'Traveloka HQ',
      bidang: 'Software Development',
      posisi: 'Android Developer',
      period: 'Sep 23 - Feb 24',
      statusMagang: 'disetujui',
      statusUsulan: 'revisi',
      statusKlaim: 'belum_diajukan',
      catatanUsulan: 'Deskripsi rencana aktivitas pada CPMK-2 Pemrograman Mobile kurang detail.',
      proposalFile: 'proposal_siti_aminah.pdf',
      buktiDiterimaFile: 'bukti_penerimaan_siti.pdf',
      usulanDetails: [
        { mkId: 'mk-02', cpmkId: 'cpmk-201', deskripsiRencana: 'Mengembangkan layout Android untuk halaman checkout dengan Flutter.' }
      ]
    },
    {
      id: 'std-04',
      nama: 'Budi Santoso',
      nim: '2021008912',
      jurusan: 'Informatika',
      perusahaan: 'Bank Central Asia',
      bidang: 'Financial Technology',
      posisi: 'UI/UX Designer',
      period: 'Jul 23 - Dec 23',
      statusMagang: 'disetujui',
      statusUsulan: 'disetujui',
      statusKlaim: 'disetujui',
      catatanUsulan: '',
      proposalFile: 'proposal_budi_santoso.pdf',
      buktiDiterimaFile: 'bukti_penerimaan_budi.pdf',
      usulanDetails: [
        { mkId: 'mk-03', cpmkId: 'cpmk-301', deskripsiRencana: 'Membuat high-fidelity mockup dan user flow aplikasi BCA mobile.' },
        { mkId: 'mk-03', cpmkId: 'cpmk-302', deskripsiRencana: 'Melakukan usability testing prototipe UI baru dengan 10 user.' }
      ],
      penilaian: {
        mitra: { nilai: 95, komentar: 'Sangat mandiri, hasil mockup sangat rapi dan fungsional.' },
        dpl: { nilaiAkademik: 90, komentar: 'Laporan analisis usability testing terstruktur dan komprehensif.' }
      }
    }
  ])

  // Get active review counts
  const getCounts = () => {
    let pendingProposals = mockStudents.filter(s => s.statusUsulan === 'menunggu_persetujuan_dpl').length
    let pendingClaims = mockStudents.filter(s => s.statusKlaim === 'menunggu_review_dpl').length
    let completed = mockStudents.filter(s => s.statusKlaim === 'disetujui').length

    if (db.usulan.status === 'menunggu_persetujuan_dpl') {
      pendingProposals++
    }
    if (db.klaim.status === 'menunggu_review_dpl') {
      pendingClaims++
    }
    if (db.klaim.status === 'disetujui') {
      completed++
    }

    return {
      pendingProposals,
      pendingClaims,
      completed,
      totalStudents: 4 + 41 // 4 mock + 41 static background
    }
  }

  const counts = getCounts()

  // Reset Demo helper
  const resetAllDemo = () => {
    localStorage.removeItem('gradeSync_db')
    setDb(INITIAL_STATE)
    // Reset mock students
    setMockStudents([
      {
        id: 'std-02',
        nama: 'Aditya Pratama',
        nim: '2021008401',
        jurusan: 'Informatika',
        perusahaan: 'Gojek Tech Lab',
        bidang: 'Software Development',
        posisi: 'Backend Engineer',
        period: 'Aug 23 - Jan 24',
        statusMagang: 'disetujui',
        statusUsulan: 'menunggu_persetujuan_dpl',
        statusKlaim: 'belum_diajukan',
        catatanUsulan: '',
        proposalFile: 'proposal_aditya_pratama.pdf',
        buktiDiterimaFile: 'bukti_penerimaan_aditya.pdf',
        usulanDetails: [
          { mkId: 'mk-01', cpmkId: 'cpmk-101', deskripsiRencana: 'Membantu optimalisasi database query PostgreSQL untuk modul pembayaran.' },
          { mkId: 'mk-01', cpmkId: 'cpmk-102', deskripsiRencana: 'Mendeploy RESTful API dengan framework Golang untuk service notifikasi.' }
        ]
      },
      {
        id: 'std-03',
        nama: 'Siti Aminah',
        nim: '2021008455',
        jurusan: 'Informatika',
        perusahaan: 'Traveloka HQ',
        bidang: 'Software Development',
        posisi: 'Android Developer',
        period: 'Sep 23 - Feb 24',
        statusMagang: 'disetujui',
        statusUsulan: 'revisi',
        statusKlaim: 'belum_diajukan',
        catatanUsulan: 'Deskripsi rencana aktivitas pada CPMK-2 Pemrograman Mobile kurang detail.',
        proposalFile: 'proposal_siti_aminah.pdf',
        buktiDiterimaFile: 'bukti_penerimaan_siti.pdf',
        usulanDetails: [
          { mkId: 'mk-02', cpmkId: 'cpmk-201', deskripsiRencana: 'Mengembangkan layout Android untuk halaman checkout dengan Flutter.' }
        ]
      },
      {
        id: 'std-04',
        nama: 'Budi Santoso',
        nim: '2021008912',
        jurusan: 'Informatika',
        perusahaan: 'Bank Central Asia',
        bidang: 'Financial Technology',
        posisi: 'UI/UX Designer',
        period: 'Jul 23 - Dec 23',
        statusMagang: 'disetujui',
        statusUsulan: 'disetujui',
        statusKlaim: 'disetujui',
        catatanUsulan: '',
        proposalFile: 'proposal_budi_santoso.pdf',
        buktiDiterimaFile: 'bukti_penerimaan_budi.pdf',
        usulanDetails: [
          { mkId: 'mk-03', cpmkId: 'cpmk-301', deskripsiRencana: 'Membuat high-fidelity mockup dan user flow aplikasi BCA mobile.' },
          { mkId: 'mk-03', cpmkId: 'cpmk-302', deskripsiRencana: 'Melakukan usability testing prototipe UI baru dengan 10 user.' }
        ],
        penilaian: {
          mitra: { nilai: 95, komentar: 'Sangat mandiri, hasil mockup sangat rapi dan fungsional.' },
          dpl: { nilaiAkademik: 90, komentar: 'Laporan analisis usability testing terstruktur dan komprehensif.' }
        }
      }
    ])
    setSelectedStudent(null)
    setActiveTab('dashboard')
    showToast('Database Demo berhasil direset!', 'info')
  }

  // Approve / Revise Proposal logic
  const handleReviewProposal = (studentId, status, catatan) => {
    if (studentId === 'std-01') {
      // Dynamic Student (Arnanda Pratama)
      setDb(prev => ({
        ...prev,
        usulan: {
          ...prev.usulan,
          status: status,
          catatanDpl: catatan
        }
      }))
      showToast(status === 'disetujui' ? 'Usulan mahasiswa disetujui!' : 'Catatan revisi usulan berhasil dikirim.', status === 'disetujui' ? 'success' : 'info')
    } else {
      // Mock Students
      setMockStudents(prev => prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            statusUsulan: status,
            catatanUsulan: catatan
          }
        }
        return s
      }))
      showToast(status === 'disetujui' ? 'Usulan mahasiswa disetujui!' : 'Catatan revisi usulan berhasil dikirim.', status === 'disetujui' ? 'success' : 'info')
    }
    setCatatanDplInput('')
    setSelectedStudent(null)
  }

  // Grade Claim logic
  const handleGradeClaim = (studentId, nilai, komentar) => {
    if (nilai === '' || isNaN(nilai) || nilai < 0 || nilai > 100) {
      showToast('Masukkan nilai akademik yang valid (0 - 100)!', 'error')
      return
    }

    if (studentId === 'std-01') {
      // Dynamic Student (Arnanda Pratama)
      setDb(prev => ({
        ...prev,
        klaim: {
          ...prev.klaim,
          status: 'disetujui'
        },
        penilaian: {
          ...prev.penilaian,
          dpl: {
            nilaiAkademik: Number(nilai),
            keputusan: 'setuju',
            komentar: komentar,
            submittedAt: new Date().toLocaleString()
          }
        }
      }))
      showToast('Nilai akademik berhasil disubmit dan klaim disetujui!', 'success')
    } else {
      // Mock Students
      setMockStudents(prev => prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            statusKlaim: 'disetujui',
            penilaian: {
              mitra: s.penilaian?.mitra || { nilai: 85, komentar: 'Bekerja dengan baik.' },
              dpl: {
                nilaiAkademik: Number(nilai),
                komentar: komentar,
                submittedAt: new Date().toLocaleString()
              }
            }
          }
        }
        return s
      }))
      showToast('Nilai akademik berhasil disubmit!', 'success')
    }
    setNilaiAkademikInput('')
    setEvaluasiDplInput('')
    setSelectedStudent(null)
  }

  // Helper to format letter grade
  const getLetterGrade = (score) => {
    if (score >= 80) return 'A'
    if (score >= 75) return 'B+'
    if (score >= 70) return 'B'
    if (score >= 65) return 'C+'
    if (score >= 60) return 'C'
    return 'D'
  }

  // Combine dynamic student and mock students for list views
  const allStudents = [
    {
      id: 'std-01',
      nama: db.profile?.nama || 'Arnanda Pratama',
      nim: db.profile?.nim || '22.11.9876',
      jurusan: db.profile?.jurusan || 'Informatika',
      perusahaan: db.magang.mitraNama || 'PT Solusi Teknologi Nusantara',
      bidang: db.magang.mitraBidang || 'Software Development',
      posisi: db.magang.posisi || 'Fullstack Web Developer',
      period: `${db.magang.periodeMulai ? db.magang.periodeMulai.substring(0,7) : '2026-02'} s.d ${db.magang.periodeSelesai ? db.magang.periodeSelesai.substring(0,7) : '2026-07'}`,
      statusMagang: db.magang.status,
      statusUsulan: db.usulan.status,
      statusKlaim: db.klaim.status,
      proposalFile: db.magang.proposalFile,
      buktiDiterimaFile: db.magang.buktiDiterimaFile,
      usulanDetails: db.usulan.details,
      penilaian: db.penilaian,
      isDynamic: true
    },
    ...mockStudents
  ]

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
      <aside className={`w-64 shrink-0 border-r-3 border-[#191b23] bg-[#f8fafc] flex flex-col justify-between h-screen fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col flex-1">
          {/* Header Brand */}
          <div className="bg-[#9f149f] border-b-3 border-[#191b23] h-16 flex items-center px-6 text-white font-bold text-xl justify-between">
            <span className="tracking-tight uppercase">DPL Core</span>
            <button className="text-white hover:opacity-80 lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <Icon>close</Icon>
            </button>
          </div>

          {/* Navigation Sidebar Buttons */}
          <nav className="mt-8 flex flex-col gap-2 px-3">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
              { id: 'students', label: 'Daftar Mahasiswa', icon: 'groups' },
              { id: 'internship-proposal', label: 'Proposal & Usulan', icon: 'description' },
              { id: 'conversion-claim', label: 'Klaim & Penilaian', icon: 'swap_horiz' },
              { id: 'assessment-history', label: 'Riwayat Penilaian', icon: 'history' },
              { id: 'profile', label: 'Profil Dosen', icon: 'person' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setSelectedStudent(null)
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

        {/* Footer info in sidebar */}
        <div className="p-4 border-t-3 border-[#191b23] bg-purple-50/50">
          <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-wider text-[#9f149f]">
            <Icon className="text-base">verified_user</Icon>
            GradeSync DPL Portal
          </div>
          <div className="text-[9px] text-gray-500 mt-1">NIDN: 0628047901</div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MAIN VIEWPORT */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto w-full lg:pl-64">
        
        {/* Top Bar Header */}
        <header className="h-16 shrink-0 border-b-3 border-[#191b23] bg-white flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Toggle Menu Button */}
            <button 
              className="p-2 border-2 border-[#191b23] rounded-xl bg-purple-50 hover:bg-purple-100 shadow-[2.5px_2.5px_0_#9f149f] transition-all flex items-center justify-center lg:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Icon className="text-xl font-bold text-[#9f149f]">{isSidebarOpen ? 'menu_open' : 'menu'}</Icon>
            </button>
            
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-[#9f149f] tracking-widest leading-none">PORTAL DOSEN PEMBIMBING LAPANGAN</span>
              <h1 className="text-xl font-bold uppercase tracking-tight text-slate-800 mt-0.5">ACADEMIC SUPERVISOR DASHBOARD</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={resetAllDemo}
              className="flex items-center gap-1.5 rounded-xl border-2 border-[#191b23] bg-yellow-200 px-4 py-1.5 text-xs font-bold shadow-[2.5px_2.5px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <Icon className="text-base">restart_alt</Icon>
              Reset Demo
            </button>
            
            <button 
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-xl border-2 border-[#191b23] bg-[#191b23] px-4 py-1.5 text-xs font-bold text-white shadow-[2.5px_2.5px_0_#9f149f] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <Icon className="text-base">logout</Icon>
              Keluar
            </button>

            <div className="h-7 w-px bg-slate-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-[#191b23] bg-[#9f149f] flex items-center justify-center text-white text-xs font-black">
                DPL
              </div>
              <span className="text-xs font-black hidden sm:inline">Dr. Supervisor</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 md:p-8 space-y-8 flex-1 bg-[#faf8ff] [background-image:radial-gradient(#e1e2ed_1px,transparent_1px)] [background-size:24px_24px]">
          
          <div className="border-b-2 border-slate-200 pb-3 -mt-2">
            <p className="text-xs font-bold text-slate-500">
              Selamat datang kembali, <b>Dr. Supervisor</b> • Fakultas Ilmu Komputer • Prodi Informatika
            </p>
          </div>

          {/* ============================================================== */}
          {/* TAB: DASHBOARD (Overview) */}
          {/* ============================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn w-full">
              {/* Hero Info Header */}
              <section className="relative w-full overflow-hidden border-[3px] border-[#191b23] bg-white p-6 shadow-[6px_6px_0_#191b23]">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 border-[3px] border-[#191b23] rounded-full bg-[#f3dff3] opacity-30 flex items-center justify-center">
                  <div className="w-36 h-36 border-[3px] border-[#191b23] rounded-full bg-[#f3dff3]/20 animate-pulse"></div>
                </div>
                <div className="relative z-10">
                  <span className="font-bold text-[10px] text-[#9f149f] uppercase tracking-widest bg-purple-50 px-3 py-1 border-2 border-[#191b23] mb-4 inline-block">System Status: Active</span>
                  <h2 className="text-2xl md:text-3xl font-black uppercase mb-2">Welcome Back, <br/>Dr. Supervisor</h2>
                  <p className="text-sm text-[#434655] max-w-2xl mb-6 border-l-[4px] border-[#9f149f] pl-4">
                    Tahun Akademik 2025/2026 — Semester Genap. Anda memiliki <span className="font-bold text-[#191b23] underline decoration-[#9f149f] decoration-3">{counts.pendingProposals + counts.pendingClaims} pengajuan tertunda</span> yang memerlukan tinjauan Anda hari ini.
                  </p>
                  <div className="flex flex-wrap gap-8">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-[#434655]">Total Mahasiswa</span>
                      <span className="text-3xl font-black">{counts.totalStudents}</span>
                    </div>
                    <div className="w-0.5 bg-[#191b23] h-10 self-center hidden sm:block" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-[#434655]">Pending Review</span>
                      <span className="text-3xl font-black text-[#ba1a1a]">{counts.pendingProposals + counts.pendingClaims}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Statistics Cards */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Students */}
                <div className="bg-[#9f149f] text-white border-[3px] border-[#191b23] p-5 shadow-[4px_4px_0_#191b23] hover:-translate-y-0.5 transition-all cursor-pointer" onClick={() => setActiveTab('students')}>
                  <div className="flex justify-between items-start mb-2">
                    <Icon className="text-3xl">groups</Icon>
                    <span className="text-[10px] font-black uppercase tracking-wider">TOTAL</span>
                  </div>
                  <div className="text-4xl font-black leading-none mb-1">{counts.totalStudents}</div>
                  <div className="text-[10px] font-black uppercase">Mahasiswa Bimbingan</div>
                </div>
                {/* Pending Proposal */}
                <div className="bg-[#FACC15] text-[#191b23] border-[3px] border-[#191b23] p-5 shadow-[4px_4px_0_#191b23] hover:-translate-y-0.5 transition-all cursor-pointer" onClick={() => setActiveTab('internship-proposal')}>
                  <div className="flex justify-between items-start mb-2">
                    <Icon className="text-3xl">description</Icon>
                    <span className="text-[10px] font-black uppercase tracking-wider">PENDING</span>
                  </div>
                  <div className="text-4xl font-black leading-none mb-1">{counts.pendingProposals}</div>
                  <div className="text-[10px] font-black uppercase">Review Proposal & Usulan</div>
                </div>
                {/* Pending Claim */}
                <div className="bg-[#64a8fe] text-[#191b23] border-[3px] border-[#191b23] p-5 shadow-[4px_4px_0_#191b23] hover:-translate-y-0.5 transition-all cursor-pointer" onClick={() => setActiveTab('conversion-claim')}>
                  <div className="flex justify-between items-start mb-2">
                    <Icon className="text-3xl">swap_horiz</Icon>
                    <span className="text-[10px] font-black uppercase tracking-wider">KLAIM</span>
                  </div>
                  <div className="text-4xl font-black leading-none mb-1">{counts.pendingClaims}</div>
                  <div className="text-[10px] font-black uppercase">Klaim & Penilaian</div>
                </div>
                {/* Completed */}
                <div className="bg-[#22C55E] text-white border-[3px] border-[#191b23] p-5 shadow-[4px_4px_0_#191b23] hover:-translate-y-0.5 transition-all cursor-pointer" onClick={() => setActiveTab('assessment-history')}>
                  <div className="flex justify-between items-start mb-2">
                    <Icon className="text-3xl">verified_user</Icon>
                    <span className="text-[10px] font-black uppercase tracking-wider">SELESAI</span>
                  </div>
                  <div className="text-4xl font-black leading-none mb-1">{counts.completed}</div>
                  <div className="text-[10px] font-black uppercase">Selesai Konversi</div>
                </div>
              </section>

              {/* Main Grid Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Student Review Table */}
                <section className="lg:col-span-2 flex flex-col gap-6">
                  <div className="bg-white border-[3px] border-[#191b23] shadow-[6px_6px_0_#191b23] rounded-2xl overflow-hidden">
                    <div className="p-4 border-b-3 border-[#191b23] flex justify-between items-center bg-[#ededf9]">
                      <h3 className="font-black text-sm uppercase tracking-wider">Tabel Tinjauan Mahasiswa</h3>
                      <div className="flex gap-2">
                        <button className="p-1.5 border-2 border-[#191b23] bg-white rounded-lg hover:bg-slate-100 transition-all flex items-center justify-center">
                          <Icon className="text-sm">filter_list</Icon>
                        </button>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="bg-[#f8fafc] border-b-2 border-[#191b23]">
                            <th className="p-4 font-black uppercase">Mahasiswa</th>
                            <th className="p-4 font-black uppercase">Mitra / Perusahaan</th>
                            <th className="p-4 font-black uppercase">Periode</th>
                            <th className="p-4 font-black uppercase">Status Pengajuan</th>
                            <th className="p-4 font-black uppercase text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-[2px] divide-[#191b23]/10">
                          {allStudents.map(student => {
                            // Determine status label & color
                            let label = 'Belum Ada Pengajuan'
                            let colorClass = 'bg-slate-100 text-slate-500'
                            let tabTarget = 'students'

                            if (student.statusUsulan === 'menunggu_persetujuan_dpl') {
                              label = 'Review Usulan'
                              colorClass = 'bg-[#FACC15] text-[#191b23]'
                              tabTarget = 'internship-proposal'
                            } else if (student.statusUsulan === 'revisi') {
                              label = 'Revisi Usulan'
                              colorClass = 'bg-[#ffdad6] text-[#ba1a1a]'
                              tabTarget = 'internship-proposal'
                            } else if (student.statusKlaim === 'menunggu_review_dpl') {
                              label = 'Review Klaim & Nilai'
                              colorClass = 'bg-[#64a8fe] text-[#003c70]'
                              tabTarget = 'conversion-claim'
                            } else if (student.statusKlaim === 'disetujui') {
                              label = 'Approved / Selesai'
                              colorClass = 'bg-[#22C55E] text-white'
                              tabTarget = 'assessment-history'
                            } else if (student.statusMagang === 'menunggu_verifikasi') {
                              label = 'Verifikasi Pendaftaran'
                              colorClass = 'bg-purple-100 text-purple-800'
                              tabTarget = 'students'
                            }

                            return (
                              <tr key={student.id} className="hover:bg-purple-50/50 transition-colors">
                                <td className="p-4">
                                  <div className="font-black text-slate-800">{student.nama}</div>
                                  <div className="text-[10px] font-mono text-gray-500">NIM: {student.nim}</div>
                                </td>
                                <td className="p-4">
                                  <div className="font-bold">{student.perusahaan}</div>
                                  <div className="text-[10px] text-gray-500">{student.posisi}</div>
                                </td>
                                <td className="p-4 text-gray-600 font-semibold">{student.period || '2026-02 s.d 2026-07'}</td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 border border-[#191b23] text-[9px] font-extrabold uppercase rounded ${colorClass}`}>
                                    {label}
                                  </span>
                                </td>
                                <td className="p-4 text-center">
                                  <button 
                                    onClick={() => {
                                      setActiveTab(tabTarget)
                                      setSelectedStudent(student)
                                    }}
                                    className="mx-auto bg-[#9f149f] hover:-translate-y-0.5 active:translate-y-0 text-white border-2 border-[#191b23] px-3 py-1 text-[10px] font-bold uppercase rounded-lg shadow-[2px_2px_0_#191b23] transition-all flex items-center gap-1"
                                  >
                                    Tinjau <Icon className="text-xs">chevron_right</Icon>
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                {/* Right Column: Tasks & Charts */}
                <aside className="flex flex-col gap-6">
                  {/* Today's Tasks */}
                  <section className="bg-white border-[3px] border-[#191b23] p-5 shadow-[6px_6px_0_#191b23] rounded-2xl">
                    <h3 className="font-black text-sm uppercase mb-4 flex items-center gap-2">
                      <Icon className="text-green-600">task_alt</Icon>
                      Tugas Hari Ini
                    </h3>
                    <div className="space-y-3">
                      {counts.pendingProposals > 0 && (
                        <label className="flex items-start gap-3 p-3 border-2 border-[#191b23] bg-slate-50 hover:bg-purple-50 transition-all cursor-pointer rounded-xl">
                          <Icon className="text-md text-[#9f149f] mt-0.5">info</Icon>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-800">Review Usulan Konversi</span>
                            <span className="text-[9px] uppercase font-bold text-gray-500">Batas Waktu: Hari Ini</span>
                          </div>
                        </label>
                      )}
                      {counts.pendingClaims > 0 && (
                        <label className="flex items-start gap-3 p-3 border-2 border-[#191b23] bg-slate-50 hover:bg-purple-50 transition-all cursor-pointer rounded-xl">
                          <Icon className="text-md text-amber-500 mt-0.5">pending_actions</Icon>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-800">Penilaian Laporan Akhir</span>
                            <span className="text-[9px] uppercase font-bold text-gray-500">Menunggu Penilaian Akademik</span>
                          </div>
                        </label>
                      )}
                      <label className="flex items-start gap-3 p-3 border-2 border-[#191b23] bg-slate-50 hover:bg-purple-50 transition-all cursor-pointer rounded-xl opacity-60">
                        <Icon className="text-md text-green-600 mt-0.5">verified</Icon>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-800 line-through">Kumpulkan Rekap Nilai Bulanan</span>
                          <span className="text-[9px] uppercase font-bold text-gray-500">Selesai</span>
                        </div>
                      </label>
                    </div>
                  </section>

                  {/* SVG Circle Chart */}
                  <section className="bg-white border-[3px] border-[#191b23] p-5 shadow-[6px_6px_0_#191b23] rounded-2xl">
                    <h3 className="font-black text-sm uppercase mb-4">Distribusi Proposal</h3>
                    <div className="relative w-full aspect-square flex items-center justify-center bg-slate-50 p-4 border-2 border-[#191b23] rounded-xl">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                        {/* Circle Background */}
                        <circle className="text-slate-200" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="12" />
                        {/* Approved (60%) */}
                        <circle cx="50" cy="50" fill="transparent" r="40" stroke="#22C55E" strokeDasharray="251.2" strokeDashoffset="100.48" strokeWidth="12" strokeLinecap="round" />
                        {/* Revision (20%) */}
                        <circle cx="50" cy="50" fill="transparent" r="40" stroke="#FACC15" strokeDasharray="251.2" strokeDashoffset="200.96" strokeWidth="12" strokeLinecap="round" />
                        {/* Pending (20%) */}
                        <circle cx="50" cy="50" fill="transparent" r="40" stroke="#9f149f" strokeDasharray="251.2" strokeDashoffset="226.08" strokeWidth="12" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black">{counts.totalStudents}</span>
                        <span className="text-[9px] font-black uppercase text-gray-400">Mahasiswa</span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-[9px] font-bold uppercase">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#22C55E] border border-[#191b23]" />
                        <span>Selesai / Approved (60%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#FACC15] border border-[#191b23]" />
                        <span>Perlu Revisi (20%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#9f149f] border border-[#191b23]" />
                        <span>Menunggu Review (20%)</span>
                      </div>
                    </div>
                  </section>
                </aside>
              </div>

              {/* Recent Activity Timeline */}
              <section className="bg-white border-[3px] border-[#191b23] p-6 shadow-[6px_6px_0_#191b23] rounded-2xl mb-8">
                <h3 className="font-black text-sm uppercase mb-6 flex justify-between items-center">
                  <span>Aktivitas Terbaru</span>
                </h3>
                <div className="relative space-y-6">
                  {/* Timeline Vertical Line */}
                  <div className="absolute left-6 top-2 bottom-2 w-1 bg-[#191b23]" />
                  
                  {/* Activity 1 */}
                  <div className="relative flex gap-4 pl-12 items-start">
                    <div className="absolute left-3 w-7 h-7 rounded-full border-2 border-[#191b23] bg-[#22C55E] flex items-center justify-center text-white z-10">
                      <Icon className="text-sm font-bold">check_circle</Icon>
                    </div>
                    <div className="flex-1 p-4 border-2 border-[#191b23] bg-slate-50 rounded-xl">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-xs font-black uppercase text-[#191b23]">Proposal Disetujui: Budi Santoso</h4>
                        <span className="text-[10px] font-bold text-gray-500">10:45 AM</span>
                      </div>
                      <p className="text-xs text-[#434655]">Telah memverifikasi proposal dan dokumen konversi di Bank Central Asia.</p>
                    </div>
                  </div>
                  
                  {/* Activity 2 */}
                  <div className="relative flex gap-4 pl-12 items-start">
                    <div className="absolute left-3 w-7 h-7 rounded-full border-2 border-[#191b23] bg-[#ba1a1a] flex items-center justify-center text-white z-10">
                      <Icon className="text-sm font-bold">error</Icon>
                    </div>
                    <div className="flex-1 p-4 border-2 border-[#191b23] bg-slate-50 rounded-xl">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-xs font-black uppercase text-[#ba1a1a]">Permintaan Revisi: Siti Aminah</h4>
                        <span className="text-[10px] font-bold text-gray-500">Kemarin, 16:20</span>
                      </div>
                      <p className="text-xs text-[#434655]">Mengirimkan revisi usulan konversi mata kuliah pilihan ke mahasiswa.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: DAFTAR MAHASISWA */}
          {/* ============================================================== */}
          {activeTab === 'students' && (
            <div className="space-y-8 animate-fadeIn w-full">
              <div className="rounded-2xl border-[3px] border-[#191b23] bg-white p-6 shadow-[6px_6px_0_#191b23]">
                <h2 className="text-md font-bold uppercase tracking-tight mb-4">Mahasiswa Bimbingan Anda</h2>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {allStudents.map(student => (
                    <div key={student.id} className="border-2 border-[#191b23] rounded-xl p-4 bg-slate-50 shadow-[3px_3px_0_#191b23] flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-black text-sm text-slate-800">{student.nama}</h3>
                            <p className="text-[9px] font-mono text-gray-400">NIM: {student.nim}</p>
                          </div>
                          <span className={`px-2 py-0.5 border border-[#191b23] text-[9px] font-extrabold uppercase rounded ${
                            student.statusMagang === 'disetujui' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            Magang: {student.statusMagang}
                          </span>
                        </div>
                        <div className="mt-4 space-y-2 text-xs">
                          <div>
                            <span className="text-[9px] font-black uppercase text-gray-400 block">Mitra Magang</span>
                            <span className="font-bold">{student.perusahaan}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase text-gray-400 block">Posisi / Role</span>
                            <span className="font-bold text-[#9f149f]">{student.posisi}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-black uppercase text-gray-400 block">Program Studi</span>
                            <span className="font-semibold">{student.jurusan}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-3 border-t border-slate-200 flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedStudent(student)
                            if (student.statusUsulan === 'menunggu_persetujuan_dpl') {
                              setActiveTab('internship-proposal')
                            } else if (student.statusKlaim === 'menunggu_review_dpl') {
                              setActiveTab('conversion-claim')
                            } else {
                              // Fallback profile/info modal or view
                              showToast(`Detail Mahasiswa: ${student.nama}`, 'info')
                            }
                          }}
                          className="w-full bg-white hover:bg-slate-100 text-slate-800 border-2 border-[#191b23] py-2 text-[10px] font-bold uppercase rounded-lg shadow-[2px_2px_0_#191b23] transition-all flex items-center justify-center gap-1"
                        >
                          <Icon className="text-xs">visibility</Icon> Tinjau Progress
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: PROPOSAL & USULAN */}
          {/* ============================================================== */}
          {activeTab === 'internship-proposal' && (
            <div className="space-y-8 animate-fadeIn w-full">
              {selectedStudent ? (
                /* Detail Review Panel */
                <div className="rounded-2xl border-[3px] border-[#191b23] bg-white p-6 md:p-8 shadow-[6px_6px_0_#191b23] space-y-6">
                  <div className="flex justify-between items-start border-b-2 border-slate-100 pb-4">
                    <div>
                      <button 
                        onClick={() => setSelectedStudent(null)}
                        className="mb-2 inline-flex items-center gap-1.5 rounded-lg border-2 border-[#191b23] bg-white px-2 py-1 text-[10px] font-bold uppercase shadow-[2.5px_2.5px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0 transition-all"
                      >
                        <Icon className="text-xs">arrow_back</Icon> Kembali
                      </button>
                      <h2 className="text-md font-black uppercase text-slate-800">Review Usulan Konversi Mata Kuliah</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Mahasiswa: {selectedStudent.nama} ({selectedStudent.nim})</p>
                    </div>
                    <span className="font-mono text-[10px] text-gray-400">PROPOSAL REVIEW</span>
                  </div>

                  {/* Proposal Metadata */}
                  <div className="grid gap-4 md:grid-cols-2 text-xs border-b-2 border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase block">Tempat Magang / Posisi</span>
                      <p className="font-black text-slate-800 mt-0.5">{selectedStudent.perusahaan} — <span className="text-[#9f149f]">{selectedStudent.posisi}</span></p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase block font-mono">Dokumen Lampiran</span>
                      <div className="flex gap-2 mt-1">
                        <a 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); showToast(`Membuka file: ${selectedStudent.proposalFile}`, 'info') }}
                          className="inline-flex items-center gap-1 border-2 border-[#191b23] bg-slate-50 px-2.5 py-1 rounded font-bold hover:bg-slate-100"
                        >
                          <Icon className="text-xs text-red-500">picture_as_pdf</Icon> {selectedStudent.proposalFile}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Cpmk list */}
                  <div>
                    <h3 className="font-black text-xs uppercase text-[#9f149f] mb-4">Rincian Mata Kuliah & CPMK yang Diusulkan</h3>
                    
                    {selectedStudent.usulanDetails && selectedStudent.usulanDetails.length > 0 ? (
                      <div className="space-y-4">
                        {selectedStudent.usulanDetails.map((detail, idx) => {
                          const mk = MASTER_MATA_KULIAH.find(m => m.id === detail.mkId)
                          const cpmk = mk?.cpmk.find(c => c.id === detail.cpmkId)
                          return (
                            <div key={idx} className="border-2 border-[#191b23] rounded-xl p-4 bg-slate-50 shadow-[2px_2px_0_#191b23]">
                              <div className="flex justify-between items-start border-b border-[#191b23]/10 pb-2 mb-2">
                                <div>
                                  <span className="text-[10px] font-black uppercase text-gray-400 block">Mata Kuliah</span>
                                  <span className="font-black text-xs text-slate-800">{mk?.kode} - {mk?.nama} ({mk?.sks} SKS)</span>
                                </div>
                                <span className="text-[10px] font-extrabold uppercase bg-purple-100 text-[#9f149f] px-2 py-0.5 border border-[#191b23] rounded">{cpmk?.kode}</span>
                              </div>
                              <div className="text-xs space-y-2">
                                <div>
                                  <span className="text-[9px] font-black uppercase text-gray-400 block">Deskripsi Capaian Kompetensi (CPMK)</span>
                                  <p className="text-gray-600 font-semibold">{cpmk?.deskripsi}</p>
                                </div>
                                <div>
                                  <span className="text-[9px] font-black uppercase text-gray-400 block">Rencana Aktivitas Mahasiswa di Industri</span>
                                  <p className="text-slate-800 font-black">{detail.deskripsiRencana}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-xs italic text-gray-400">Belum ada rincian mata kuliah yang diusulkan oleh mahasiswa ini.</p>
                    )}
                  </div>

                  {/* Actions Form */}
                  <div className="border-t-2 border-slate-100 pt-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-800 block">Evaluasi / Catatan Feedback DPL</label>
                      <textarea
                        rows="3"
                        placeholder="Tulis masukan atau instruksi revisi untuk mahasiswa di sini..."
                        value={catatanDplInput}
                        onChange={(e) => setCatatanDplInput(e.target.value)}
                        className="w-full resize-none text-xs rounded-xl border-2 border-[#191b23] px-3 py-2 outline-none focus:shadow-[2px_2px_0_#9f149f]"
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleReviewProposal(selectedStudent.id, 'disetujui', catatanDplInput)}
                        className="flex-1 rounded-xl border-2 border-[#191b23] bg-[#22C55E] text-white font-bold py-3 shadow-[4px_4px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
                      >
                        <Icon className="text-base">check_circle</Icon> Setujui Usulan Konversi
                      </button>
                      <button 
                        onClick={() => {
                          if (catatanDplInput.trim() === '') {
                            showToast('Harap isi catatan evaluasi terlebih dahulu untuk mengembalikan usulan!', 'error')
                            return
                          }
                          handleReviewProposal(selectedStudent.id, 'revisi', catatanDplInput)
                        }}
                        className="flex-1 rounded-xl border-2 border-[#191b23] bg-yellow-200 text-slate-800 font-bold py-3 shadow-[4px_4px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
                      >
                        <Icon className="text-base">edit_document</Icon> Kembalikan untuk Revisi
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* List View */
                <div className="rounded-2xl border-[3px] border-[#191b23] bg-white p-6 shadow-[6px_6px_0_#191b23]">
                  <h2 className="text-md font-bold uppercase tracking-tight mb-4">Review Usulan Konversi (DPL)</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b-2 border-[#191b23]">
                          <th className="p-4 font-black uppercase">Mahasiswa</th>
                          <th className="p-4 font-black uppercase">Rencana Mitra</th>
                          <th className="p-4 font-black uppercase">Jumlah SKS Usulan</th>
                          <th className="p-4 font-black uppercase">Status Review</th>
                          <th className="p-4 font-black uppercase text-center">Tinjauan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-[2px] divide-[#191b23]/10">
                        {allStudents.filter(s => s.statusUsulan !== 'belum_diajukan').map(student => {
                          // Calculate SKS
                          const uniqueMks = [...new Set(student.usulanDetails?.map(d => d.mkId))]
                          const totalSks = uniqueMks.reduce((acc, mkId) => {
                            const mk = MASTER_MATA_KULIAH.find(m => m.id === mkId)
                            return acc + (mk?.sks || 0)
                          }, 0)

                          return (
                            <tr key={student.id} className="hover:bg-purple-50/50 transition-colors">
                              <td className="p-4">
                                <div className="font-black text-slate-800">{student.nama}</div>
                                <div className="text-[10px] font-mono text-gray-500">NIM: {student.nim}</div>
                              </td>
                              <td className="p-4">
                                <div className="font-bold">{student.perusahaan}</div>
                                <div className="text-[10px] text-gray-500">{student.posisi}</div>
                              </td>
                              <td className="p-4 font-black text-slate-700">{totalSks} SKS</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 border border-[#191b23] text-[9px] font-extrabold uppercase rounded ${
                                  student.statusUsulan === 'menunggu_persetujuan_dpl' ? 'bg-[#FACC15] text-[#191b23]' : student.statusUsulan === 'disetujui' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {student.statusUsulan}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <button 
                                  onClick={() => setSelectedStudent(student)}
                                  className="mx-auto bg-white hover:bg-slate-100 text-slate-800 border-2 border-[#191b23] px-3 py-1.5 text-[9px] font-bold uppercase rounded-lg shadow-[2px_2px_0_#191b23] transition-all flex items-center justify-center gap-1"
                                >
                                  <Icon className="text-xs">rate_review</Icon> Periksa Usulan
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                        {allStudents.filter(s => s.statusUsulan !== 'belum_diajukan').length === 0 && (
                          <tr>
                            <td colSpan="5" className="p-8 text-center text-gray-400 italic">Tidak ada usulan konversi yang sedang diajukan saat ini.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: KLAIM & PENILAIAN */}
          {/* ============================================================== */}
          {activeTab === 'conversion-claim' && (
            <div className="space-y-8 animate-fadeIn w-full">
              {selectedStudent ? (
                /* Assessment Panel */
                <div className="rounded-2xl border-[3px] border-[#191b23] bg-white p-6 md:p-8 shadow-[6px_6px_0_#191b23] space-y-6">
                  <div className="flex justify-between items-start border-b-2 border-slate-100 pb-4">
                    <div>
                      <button 
                        onClick={() => setSelectedStudent(null)}
                        className="mb-2 inline-flex items-center gap-1.5 rounded-lg border-2 border-[#191b23] bg-white px-2 py-1 text-[10px] font-bold uppercase shadow-[2.5px_2.5px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0 transition-all"
                      >
                        <Icon className="text-xs">arrow_back</Icon> Kembali
                      </button>
                      <h2 className="text-md font-black uppercase text-slate-800">Evaluasi & Input Nilai Akademik</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Mahasiswa: {selectedStudent.nama} ({selectedStudent.nim})</p>
                    </div>
                    <span className="font-mono text-[10px] text-gray-400">CLAIM GRADING</span>
                  </div>

                  {/* Files & Industry score */}
                  <div className="grid gap-6 md:grid-cols-2 text-xs bg-slate-50 border-2 border-[#191b23] p-4 rounded-xl">
                    <div className="space-y-3">
                      <h4 className="font-black text-xs uppercase text-[#9f149f] border-b border-purple-200 pb-1">1. Dokumen Bukti Magang</h4>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => showToast('Membuka file Logbook...', 'info')} className="inline-flex items-center gap-2 border border-[#191b23] bg-white px-2 py-1.5 rounded font-semibold hover:bg-slate-50 text-left">
                          <Icon className="text-xs text-purple-600">assignment</Icon> Logbook Harian / Mingguan.pdf
                        </button>
                        <button onClick={() => showToast('Membuka file Laporan Akhir...', 'info')} className="inline-flex items-center gap-2 border border-[#191b23] bg-white px-2 py-1.5 rounded font-semibold hover:bg-slate-50 text-left">
                          <Icon className="text-xs text-red-500">picture_as_pdf</Icon> Laporan Akhir Magang.pdf
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3 border-t-2 border-slate-200 pt-3 md:border-t-0 md:border-l-2 md:pl-6 md:pt-0">
                      <h4 className="font-black text-xs uppercase text-[#9f149f] border-b border-purple-200 pb-1">2. Nilai Supervisor Mitra (Industri)</h4>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-4xl font-black text-green-600">{selectedStudent.penilaian?.mitra?.nilai || '90'}</span>
                          <div>
                            <p className="font-bold">Nilai Rata-rata Industri</p>
                            <p className="text-[10px] text-gray-400">Bobot Penilaian: 70%</p>
                          </div>
                        </div>
                        <p className="mt-2 text-gray-500 italic">" {selectedStudent.penilaian?.mitra?.komentar || 'Mahasiswa menunjukkan adaptabilitas tinggi dan penguasaan materi yang baik.'} "</p>
                      </div>
                    </div>
                  </div>

                  {/* Rincian Aktivitas CPMK */}
                  <div>
                    <h3 className="font-black text-xs uppercase text-[#9f149f] mb-4">Keselarasan CPMK & Bukti Aktivitas</h3>
                    <div className="space-y-4">
                      {selectedStudent.usulanDetails?.map((detail, idx) => {
                        const mk = MASTER_MATA_KULIAH.find(m => m.id === detail.mkId)
                        const cpmk = mk?.cpmk.find(c => c.id === detail.cpmkId)
                        return (
                          <div key={idx} className="border-2 border-[#191b23] rounded-xl p-4 bg-white shadow-[2px_2px_0_#191b23] text-xs">
                            <div className="flex justify-between border-b border-slate-100 pb-2 mb-2">
                              <span className="font-bold text-slate-800">{mk?.nama} — {cpmk?.kode}</span>
                              <button onClick={() => showToast('Mengunduh lampiran bukti...', 'success')} className="text-[#9f149f] font-bold hover:underline flex items-center gap-1">
                                <Icon className="text-sm">download</Icon> Unduh Bukti.zip
                              </button>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-black uppercase text-gray-400 block">Klaim Bukti Kinerja Mahasiswa</span>
                              <p className="font-semibold text-slate-700 bg-slate-50 p-2 border border-slate-200 rounded">{detail.deskripsiRencana}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Grading Form */}
                  <div className="border-t-2 border-slate-100 pt-6 space-y-4">
                    <h3 className="font-black text-xs uppercase text-[#9f149f]">3. Penilaian Akademik (DPL)</h3>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 block">Nilai Akademik DPL (0 - 100)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          required
                          placeholder="Masukkan nilai (contoh: 85)"
                          value={nilaiAkademikInput}
                          onChange={(e) => setNilaiAkademikInput(e.target.value)}
                          className="w-full text-xs rounded-xl border-2 border-[#191b23] px-3 py-2 outline-none focus:shadow-[2px_2px_0_#9f149f]"
                        />
                        <p className="text-[9px] text-gray-400">Bobot Penilaian: 30%</p>
                      </div>
                      
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 block">Catatan / Komentar Evaluasi KHS</label>
                        <input
                          type="text"
                          required
                          placeholder="Tulis ulasan/komentar kesesuaian laporan mahasiswa..."
                          value={evaluasiDplInput}
                          onChange={(e) => setEvaluasiDplInput(e.target.value)}
                          className="w-full text-xs rounded-xl border-2 border-[#191b23] px-3 py-2 outline-none focus:shadow-[2px_2px_0_#9f149f]"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => handleGradeClaim(selectedStudent.id, nilaiAkademikInput, evaluasiDplInput)}
                      className="w-full rounded-xl border-2 border-[#191b23] bg-[#9f149f] text-white font-bold py-3 shadow-[4px_4px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
                    >
                      <Icon className="text-base">verified</Icon> Submit Penilaian & Terbitkan KHS
                    </button>
                  </div>
                </div>
              ) : (
                /* List View */
                <div className="rounded-2xl border-[3px] border-[#191b23] bg-white p-6 shadow-[6px_6px_0_#191b23]">
                  <h2 className="text-md font-bold uppercase tracking-tight mb-4">Penilaian Klaim & Laporan Akhir</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b-2 border-[#191b23]">
                          <th className="p-4 font-black uppercase">Mahasiswa</th>
                          <th className="p-4 font-black uppercase">Mitra Industri</th>
                          <th className="p-4 font-black uppercase">Nilai Industri</th>
                          <th className="p-4 font-black uppercase">Status Klaim</th>
                          <th className="p-4 font-black uppercase text-center">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-[2px] divide-[#191b23]/10">
                        {allStudents.filter(s => s.statusKlaim !== 'belum_diajukan').map(student => (
                          <tr key={student.id} className="hover:bg-purple-50/50 transition-colors">
                            <td className="p-4">
                              <div className="font-black text-slate-800">{student.nama}</div>
                              <div className="text-[10px] font-mono text-gray-500">NIM: {student.nim}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-bold">{student.perusahaan}</div>
                            </td>
                            <td className="p-4 font-black text-green-600 text-sm">
                              {student.penilaian?.mitra?.nilai || '85'}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 border border-[#191b23] text-[9px] font-extrabold uppercase rounded ${
                                student.statusKlaim === 'menunggu_review_dpl' ? 'bg-[#64a8fe] text-[#003c70]' : 'bg-green-100 text-green-800'
                              }`}>
                                {student.statusKlaim === 'menunggu_review_dpl' ? 'menunggu penilaian dpl' : student.statusKlaim}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button 
                                onClick={() => setSelectedStudent(student)}
                                className="mx-auto bg-[#9f149f] hover:-translate-y-0.5 active:translate-y-0 text-white border-2 border-[#191b23] px-3 py-1.5 text-[9px] font-bold uppercase rounded-lg shadow-[2px_2px_0_#191b23] transition-all flex items-center justify-center gap-1"
                              >
                                <Icon className="text-xs">rate_review</Icon> Beri Nilai
                              </button>
                            </td>
                          </tr>
                        ))}
                        {allStudents.filter(s => s.statusKlaim !== 'belum_diajukan').length === 0 && (
                          <tr>
                            <td colSpan="5" className="p-8 text-center text-gray-400 italic">Tidak ada klaim konversi yang diajukan oleh mahasiswa bimbingan Anda saat ini.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: ASSESSMENT HISTORY */}
          {/* ============================================================== */}
          {activeTab === 'assessment-history' && (
            <div className="space-y-8 animate-fadeIn w-full">
              <div className="rounded-2xl border-[3px] border-[#191b23] bg-white p-6 shadow-[6px_6px_0_#191b23]">
                <h2 className="text-md font-bold uppercase tracking-tight mb-4">Riwayat Penilaian & Hasil Konversi</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b-2 border-[#191b23]">
                        <th className="p-4 font-black uppercase">Mahasiswa</th>
                        <th className="p-4 font-black uppercase">Mitra Perusahaan</th>
                        <th className="p-4 font-black uppercase text-center">Nilai Industri (70%)</th>
                        <th className="p-4 font-black uppercase text-center">Nilai DPL (30%)</th>
                        <th className="p-4 font-black uppercase text-center">Nilai Akhir</th>
                        <th className="p-4 font-black uppercase text-center">Grade</th>
                        <th className="p-4 font-black uppercase">Tanggal Penilaian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-[2px] divide-[#191b23]/10">
                      {allStudents.filter(s => s.statusKlaim === 'disetujui').map(student => {
                        const scoreMitra = student.penilaian?.mitra?.nilai || 0
                        const scoreDpl = student.penilaian?.dpl?.nilaiAkademik || 0
                        const finalScore = Number((scoreMitra * 0.7 + scoreDpl * 0.3).toFixed(1))
                        const letterGrade = getLetterGrade(finalScore)

                        return (
                          <tr key={student.id} className="hover:bg-purple-50/50 transition-colors">
                            <td className="p-4">
                              <div className="font-black text-slate-800">{student.nama}</div>
                              <div className="text-[10px] font-mono text-gray-500">NIM: {student.nim}</div>
                            </td>
                            <td className="p-4 font-semibold text-slate-700">{student.perusahaan}</td>
                            <td className="p-4 text-center font-bold text-slate-600">{scoreMitra}</td>
                            <td className="p-4 text-center font-bold text-slate-600">{scoreDpl}</td>
                            <td className="p-4 text-center font-black text-[#9f149f] text-sm">{finalScore}</td>
                            <td className="p-4 text-center">
                              <span className="px-2 py-0.5 border-2 border-[#191b23] bg-purple-100 text-[#9f149f] font-black text-xs rounded">
                                {letterGrade}
                              </span>
                            </td>
                            <td className="p-4 text-gray-500 font-semibold">{student.penilaian?.dpl?.submittedAt?.substring(0,10) || '2026-07-27'}</td>
                          </tr>
                        )
                      })}
                      {allStudents.filter(s => s.statusKlaim === 'disetujui').length === 0 && (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-gray-400 italic">Belum ada mahasiswa yang menyelesaikan proses penilaian konversi.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: PROFILE */}
          {/* ============================================================== */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-fadeIn w-full">
              <div className="rounded-2xl border-[3px] border-[#191b23] bg-white p-6 md:p-8 shadow-[6px_6px_0_#191b23] max-w-xl mx-auto">
                <div className="flex flex-col items-center text-center border-b-2 border-slate-100 pb-6 mb-6">
                  <div className="w-20 h-20 rounded-full border-4 border-[#191b23] bg-[#9f149f] flex items-center justify-center text-white text-3xl font-black shadow-[4px_4px_0_#191b23] mb-4">
                    DPL
                  </div>
                  <h2 className="text-lg font-black text-slate-800 uppercase">Dr. Supervisor, M.Kom.</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase mt-0.5">Dosen Pembimbing Lapangan (DPL)</p>
                  <p className="text-[10px] font-mono text-gray-400 mt-1">NIDN: 0628047901</p>
                </div>

                <div className="space-y-4 text-xs font-bold">
                  <div>
                    <span className="text-[9px] font-black uppercase text-gray-400 block">Fakultas / Program Studi</span>
                    <span className="text-slate-800">Fakultas Ilmu Komputer / S1 Informatika</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-gray-400 block">Alamat Email</span>
                    <span className="text-slate-800">supervisor@amikom.ac.id</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-gray-400 block">Ruang Kantor</span>
                    <span className="text-slate-800">Gedung 4, Lantai 2, Ruang Dosen Informatika</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-gray-400 block">Jumlah Bimbingan Aktif</span>
                    <span className="text-slate-800">{counts.totalStudents} Mahasiswa</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
