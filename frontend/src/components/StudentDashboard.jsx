import React, { useState, useEffect } from 'react'
import { MASTER_MATA_KULIAH, MOCK_DPL_LIST, INITIAL_STATE } from '../services/mockData'

function Icon({ children, className = '' }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>
}

function StudentDashboard({ onLogout }) {
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

  // Active sub-tab inside student dashboard
  const [activeTab, setActiveTab] = useState('status')

  // Collapse sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Notification helper
  const [toast, setToast] = useState(null)
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // --- 1. Aksi Magang ---
  const [magangForm, setMagangForm] = useState({
    mitraNama: db.magang.mitraNama || '',
    mitraAlamat: db.magang.mitraAlamat || '',
    mitraBidang: db.magang.mitraBidang || '',
    posisi: db.magang.posisi || '',
    periodeMulai: db.magang.periodeMulai || '',
    periodeSelesai: db.magang.periodeSelesai || '',
    dplId: db.magang.dplId || MOCK_DPL_LIST[0].id,
    supervisorNama: db.magang.supervisorNama || '',
    supervisorEmail: db.magang.supervisorEmail || '',
    supervisorHp: db.magang.supervisorHp || '',
    proposalFile: db.magang.proposalFile || '',
    buktiDiterimaFile: db.magang.buktiDiterimaFile || ''
  })

  const handleMagangSubmit = (e) => {
    e.preventDefault()
    setDb(prev => ({
      ...prev,
      magang: {
        ...prev.magang,
        ...magangForm,
        status: 'menunggu_verifikasi'
      }
    }))
    showToast('Pendaftaran magang berhasil dikirim untuk verifikasi prodi!')
  }

  // Demo helper to simulate prodi approval
  const demoApproveMagang = (approve = true) => {
    setDb(prev => ({
      ...prev,
      magang: {
        ...prev.magang,
        status: approve ? 'disetujui' : 'ditolak',
        catatanAdmin: approve ? '' : 'File bukti penerimaan magang kurang jelas.'
      }
    }))
    showToast(approve ? 'Magang DISETUJUI oleh Admin Prodi (Simulasi)' : 'Magang DITOLAK oleh Admin Prodi (Simulasi)', approve ? 'success' : 'error')
  }

  // --- 2. Aksi Usulan Konversi ---
  const [selectedMkId, setSelectedMkId] = useState('')
  const [tempSelectedCpmk, setTempSelectedCpmk] = useState([]) // array of cpmkId
  const [tempRencanaAktivitas, setTempRencanaAktivitas] = useState({}) // cpmkId -> text
  const [draftUsulanDetails, setDraftUsulanDetails] = useState(db.usulan.details || [])

  // Update draftUsulanDetails when db changes (e.g. from reset)
  useEffect(() => {
    setDraftUsulanDetails(db.usulan.details || [])
  }, [db.usulan.details])

  const handleAddMkToUsulan = () => {
    if (!selectedMkId) return
    const mk = MASTER_MATA_KULIAH.find(m => m.id === selectedMkId)
    if (!mk) return

    // Check if any checked CPMK is already in draftUsulanDetails
    const alreadyExists = tempSelectedCpmk.some(cpmkId => 
      draftUsulanDetails.some(detail => detail.cpmkId === cpmkId)
    )
    if (alreadyExists) {
      showToast('Salah satu CPMK sudah ditambahkan sebelumnya!', 'error')
      return
    }

    if (tempSelectedCpmk.length === 0) {
      showToast('Pilih minimal satu CPMK!', 'error')
      return
    }

    const newDetails = tempSelectedCpmk.map(cpmkId => ({
      mkId: selectedMkId,
      cpmkId: cpmkId,
      deskripsiRencana: tempRencanaAktivitas[cpmkId] || 'Melaksanakan tugas relevan dengan kompetensi ini.'
    }))

    setDraftUsulanDetails(prev => [...prev, ...newDetails])
    
    // Reset forms
    setSelectedMkId('')
    setTempSelectedCpmk([])
    setTempRencanaAktivitas({})
    showToast('Mata kuliah berhasil ditambahkan ke daftar usulan!')
  }

  const handleRemoveUsulanDetail = (indexToRemove) => {
    setDraftUsulanDetails(prev => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSubmitUsulan = () => {
    if (draftUsulanDetails.length === 0) {
      showToast('Tambahkan minimal satu mata kuliah & CPMK ke dalam usulan!', 'error')
      return
    }

    setDb(prev => ({
      ...prev,
      usulan: {
        ...prev.usulan,
        status: 'menunggu_persetujuan_dpl',
        details: draftUsulanDetails
      }
    }))
    showToast('Usulan konversi berhasil diajukan ke DPL!')
  }

  // Demo helper to simulate DPL approval for usulan
  const demoApproveUsulan = (approve = true) => {
    setDb(prev => ({
      ...prev,
      usulan: {
        ...prev.usulan,
        status: approve ? 'disetujui' : 'revisi',
        catatanDpl: approve ? '' : 'Deskripsi rencana aktivitas pada CPMK-1 Proyek Web kurang detail.'
      }
    }))
    showToast(approve ? 'Usulan disetujui oleh DPL! (Simulasi)' : 'Usulan dikembalikan untuk revisi oleh DPL (Simulasi)', approve ? 'success' : 'error')
  }

  // --- 3. Aksi Klaim Konversi ---
  const [klaimGeneral, setKlaimGeneral] = useState({
    logbookFile: 'logbook_magang_final.pdf',
    laporanFile: 'laporan_akhir_magang.pdf',
    sertifikatFile: 'sertifikat_industri.pdf'
  })
  
  const [klaimDetailsInput, setKlaimDetailsInput] = useState({}) // index -> text

  // Initialize/sync claim details input based on approved usulan
  useEffect(() => {
    const inputs = {}
    db.usulan.details.forEach((_, idx) => {
      const existingKlaimDetail = db.klaim.details.find(k => k.usulanDetailIndex === idx)
      inputs[idx] = existingKlaimDetail ? existingKlaimDetail.buktiAktivitasText : ''
    })
    setKlaimDetailsInput(inputs)
  }, [db.usulan.details, db.klaim.details])

  const handleSubmitKlaim = (e) => {
    e.preventDefault()
    // Prepare details
    const details = db.usulan.details.map((_, idx) => ({
      usulanDetailIndex: idx,
      buktiAktivitasText: klaimDetailsInput[idx] || 'Telah diselesaikan selama periode magang dengan baik.',
      buktiFile: `bukti_cpmk_${idx + 1}.zip`
    }))

    setDb(prev => ({
      ...prev,
      klaim: {
        ...prev.klaim,
        status: 'menunggu_penilaian_mitra',
        logbookFile: klaimGeneral.logbookFile,
        laporanFile: klaimGeneral.laporanFile,
        sertifikatFile: klaimGeneral.sertifikatFile,
        details: details
      }
    }))
    showToast('Klaim konversi berhasil diajukan! Menunggu penilaian mitra.')
  }

  // Demo helper to submit mitra evaluation
  const demoMitraEvaluation = (score = 90) => {
    setDb(prev => ({
      ...prev,
      klaim: {
        ...prev.klaim,
        status: 'menunggu_review_dpl'
      },
      penilaian: {
        ...prev.penilaian,
        mitra: {
          nilai: Number(score),
          komentar: 'Sangat disiplin, hasil kerjanya melebihi ekspektasi tim frontend.',
          submittedAt: new Date().toLocaleString()
        }
      }
    }))
    showToast(`Penilaian supervisor mitra masuk dengan nilai ${score}! (Simulasi)`)
  }

  // Demo helper to submit DPL evaluation & complete conversion
  const demoDplEvaluation = (score = 85) => {
    setDb(prev => ({
      ...prev,
      klaim: {
        ...prev.klaim,
        status: 'disetujui'
      },
      penilaian: {
        ...prev.penilaian,
        dpl: {
          nilaiAkademik: Number(score),
          keputusan: 'setuju',
          komentar: 'Laporan tersusun rapi, keselarasan CPMK terbukti dengan baik.',
          submittedAt: new Date().toLocaleString()
        }
      }
    }))
    showToast(`Penilaian DPL masuk dengan nilai ${score}! Konversi nilai selesai. (Simulasi)`)
  }

  const resetAllDemo = () => {
    localStorage.removeItem('gradeSync_db')
    setDb(INITIAL_STATE)
    setActiveTab('status')
    setMagangForm({
      mitraNama: INITIAL_STATE.magang.mitraNama,
      mitraAlamat: INITIAL_STATE.magang.mitraAlamat,
      mitraBidang: INITIAL_STATE.magang.mitraBidang,
      posisi: INITIAL_STATE.magang.posisi,
      periodeMulai: INITIAL_STATE.magang.periodeMulai,
      periodeSelesai: INITIAL_STATE.magang.periodeSelesai,
      dplId: INITIAL_STATE.magang.dplId,
      supervisorNama: INITIAL_STATE.magang.supervisorNama,
      supervisorEmail: INITIAL_STATE.magang.supervisorEmail,
      supervisorHp: INITIAL_STATE.magang.supervisorHp,
      proposalFile: INITIAL_STATE.magang.proposalFile,
      buktiDiterimaFile: INITIAL_STATE.magang.buktiDiterimaFile
    })
    setDraftUsulanDetails([])
    showToast('Database Demo direset ke kondisi awal!', 'info')
  }

  // Utility to map score to letter grade
  const getLetterGrade = (score) => {
    if (score >= 80) return 'A'
    if (score >= 75) return 'B+'
    if (score >= 70) return 'B'
    if (score >= 65) return 'C+'
    if (score >= 60) return 'C'
    return 'D'
  }

  // Calculate final conversion values
  const getConversionSummary = () => {
    const details = db.usulan.details || []
    const rawMitra = db.penilaian.mitra.nilai || 0
    const rawDpl = db.penilaian.dpl.nilaiAkademik || 0
    const finalScore = Number((rawMitra * 0.7 + rawDpl * 0.3).toFixed(1))

    // Group items by mata kuliah ID
    const mkMap = {}
    details.forEach(detail => {
      const mk = MASTER_MATA_KULIAH.find(m => m.id === detail.mkId)
      if (!mk) return
      if (!mkMap[mk.id]) {
        mkMap[mk.id] = {
          kode: mk.kode,
          nama: mk.nama,
          sks: mk.sks,
          cpmkCount: 0
        }
      }
      mkMap[mk.id].cpmkCount++
    })

    const coursesArray = Object.values(mkMap)
    const totalSks = coursesArray.reduce((acc, c) => acc + c.sks, 0)

    return {
      finalScore,
      gradeLetter: getLetterGrade(finalScore),
      courses: coursesArray,
      totalSks
    }
  }

  const summary = getConversionSummary()

  // Track progress steps
  const stepsList = [
    { key: 'magang', title: 'Pendaftaran Magang', active: true, done: ['disetujui'].includes(db.magang.status) },
    { key: 'usulan', title: 'Usulan Konversi', active: ['disetujui'].includes(db.magang.status), done: ['disetujui'].includes(db.usulan.status) },
    { key: 'klaim', title: 'Klaim Konversi', active: ['disetujui'].includes(db.usulan.status), done: ['disetujui'].includes(db.klaim.status) && db.penilaian.mitra.nilai !== null && db.penilaian.dpl.nilaiAkademik !== null },
    { key: 'grade', title: 'Hasil Konversi', active: db.klaim.status === 'disetujui', done: db.klaim.status === 'disetujui' }
  ]

  return (
    <div className="min-h-screen bg-[#faf8ff] font-['Space_Grotesk',sans-serif] text-[#191b23] pb-16 [background-image:radial-gradient(#e1e2ed_1px,transparent_1px)] [background-size:24px_24px]">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-24 right-5 z-50 flex items-center gap-3 border-[3px] border-[#191b23] p-4 font-bold shadow-[4px_4px_0_#191b23] transition-all transform animate-bounce ${
          toast.type === 'error' ? 'bg-[#ffdad6] text-[#93000a]' : toast.type === 'info' ? 'bg-[#dbe1ff] text-[#004ac6]' : 'bg-[#e8f5e9] text-[#2e7d32]'
        }`}>
          <Icon>{toast.type === 'error' ? 'error' : toast.type === 'info' ? 'info' : 'check_circle'}</Icon>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 pt-28">
        
        {/* Header Dashboard */}
        <div className="mb-10 flex flex-col justify-between gap-6 border-b-4 border-[#191b23] pb-8 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#004ac6]">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></span>
              Portal Mahasiswa Aktif
            </div>
            <h1 className="text-4xl font-bold uppercase tracking-tight md:text-5xl">Dashboard Konversi</h1>
            <p className="mt-1 text-[#434655] font-medium">Selamat datang, <b>Arnanda (NIM: 22.11.9876)</b> • Informatika</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={resetAllDemo}
              className="flex items-center gap-2 rounded-xl border-[3px] border-[#191b23] bg-yellow-200 px-5 py-3 font-bold shadow-[4px_4px_0_#191b23] transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Icon className="text-xl">restart_alt</Icon>
              Reset Demo
            </button>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 rounded-xl border-[3px] border-[#191b23] bg-[#191b23] px-5 py-3 font-bold text-white shadow-[4px_4px_0_#004ac6] transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Icon className="text-xl">logout</Icon>
              Keluar
            </button>
          </div>
        </div>

        {/* Alur Progress Tracker */}
        <div className="mb-12 rounded-2xl border-4 border-[#191b23] bg-white p-6 shadow-[8px_8px_0_#191b23]">
          <h2 className="mb-6 text-xl font-bold uppercase tracking-wide">Tahapan Proses Konversi Anda</h2>
          <div className="grid gap-6 md:grid-cols-4">
            {stepsList.map((step, idx) => (
              <div 
                key={step.key} 
                className={`relative flex flex-col rounded-xl border-3 border-[#191b23] p-4 shadow-[4px_4px_0_#191b23] ${
                  step.done 
                    ? 'bg-green-100 text-green-800' 
                    : step.active 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-400 opacity-65'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider">Tahap 0{idx + 1}</span>
                  {step.done ? (
                    <Icon className="text-green-600 font-bold">check_circle</Icon>
                  ) : step.active ? (
                    <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping"></span>
                  ) : (
                    <Icon className="text-gray-400">lock</Icon>
                  )}
                </div>
                <h3 className="font-bold leading-tight">{step.title}</h3>
                <span className="mt-1 text-[11px] font-bold uppercase">
                  {step.key === 'magang' && `Status: ${db.magang.status}`}
                  {step.key === 'usulan' && `Status: ${db.usulan.status}`}
                  {step.key === 'klaim' && `Status: ${db.klaim.status}`}
                  {step.key === 'grade' && `Status: ${db.klaim.status === 'disetujui' ? 'Selesai' : 'Belum Mulai'}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Tabs & Content */}
        <div className="relative flex items-start">
          
          {/* Sidebar Menu */}
          <div 
            className={`transition-all duration-300 ease-in-out z-30 shrink-0 ${
              isSidebarOpen 
                ? 'w-80 mr-8 opacity-100 translate-x-0' 
                : 'w-0 mr-0 opacity-0 -translate-x-full overflow-hidden pointer-events-none'
            }`}
          >
            <div className="sticky top-28 flex flex-col gap-3 w-80">
              {[
                { id: 'status', label: 'Data & Status Magang', icon: 'business_center' },
                { id: 'usulan', label: 'Usulan Konversi', icon: 'history_edu', disabled: db.magang.status !== 'disetujui' },
                { id: 'klaim', label: 'Klaim Konversi', icon: 'fact_check', disabled: db.usulan.status !== 'disetujui' },
                { id: 'hasil', label: 'Hasil Konversi (KHS)', icon: 'workspace_premium', disabled: db.klaim.status !== 'disetujui' }
              ].map(item => (
                <button
                  key={item.id}
                  disabled={item.disabled}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 w-full rounded-2xl border-[3px] border-[#191b23] p-4 text-left font-bold transition-all duration-200 ${
                    item.disabled 
                      ? 'bg-[#f1f3f9] text-[#8e91a1] border-dashed cursor-not-allowed'
                      : activeTab === item.id 
                        ? 'bg-[#004ac6] text-white shadow-[4px_4px_0_#191b23] -translate-x-1 -translate-y-1' 
                        : 'bg-white text-[#191b23] hover:shadow-[4px_4px_0_#191b23] hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 active:shadow-none'
                  }`}
                >
                  <Icon className={`text-xl ${item.disabled ? 'text-[#8e91a1]' : activeTab === item.id ? 'text-white' : 'text-[#191b23]'}`}>{item.icon}</Icon>
                  <span className="text-sm">{item.label}</span>
                  {item.disabled && <Icon className="ml-auto text-base text-[#8e91a1]">lock</Icon>}
                </button>
              ))}

              {/* Demo Tools Sidepanel */}
              <div className="mt-8 rounded-2xl border-[3px] border-dashed border-[#191b23] bg-[#fffbeb] p-5 shadow-[6px_6px_0_#191b23]">
                <div className="mb-3 flex items-center gap-2 font-black text-xs uppercase tracking-wider text-[#854d0e]">
                  <Icon className="text-lg">construction</Icon>
                  Simulasi Workflow
                </div>
                <p className="mb-4 text-xs font-semibold text-[#854d0e]/90 leading-normal">Gunakan tombol berikut untuk mensimulasikan persetujuan Dosen / Mitra / Admin secara instan:</p>
                <div className="flex flex-col gap-2.5">
                  {db.magang.status === 'menunggu_verifikasi' && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-gray-500">1. Verifikasi Magang (Admin)</div>
                      <div className="flex gap-2">
                        <button onClick={() => demoApproveMagang(true)} className="flex-1 rounded-lg border-2 border-[#191b23] bg-green-300 py-1.5 text-xs font-bold shadow-[2px_2px_0_#191b23] hover:translate-y-0.5">Setujui</button>
                        <button onClick={() => demoApproveMagang(false)} className="flex-1 rounded-lg border-2 border-[#191b23] bg-red-300 py-1.5 text-xs font-bold shadow-[2px_2px_0_#191b23] hover:translate-y-0.5">Tolak</button>
                      </div>
                    </div>
                  )}

                  {db.usulan.status === 'menunggu_persetujuan_dpl' && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-gray-500">2. Review Usulan MK (DPL)</div>
                      <div className="flex gap-2">
                        <button onClick={() => demoApproveUsulan(true)} className="flex-1 rounded-lg border-2 border-[#191b23] bg-green-300 py-1.5 text-xs font-bold shadow-[2px_2px_0_#191b23] hover:translate-y-0.5">Setujui</button>
                        <button onClick={() => demoApproveUsulan(false)} className="flex-1 rounded-lg border-2 border-[#191b23] bg-amber-300 py-1.5 text-xs font-bold shadow-[2px_2px_0_#191b23] hover:translate-y-0.5">Revisi</button>
                      </div>
                    </div>
                  )}

                  {db.klaim.status === 'menunggu_penilaian_mitra' && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-gray-500">3. Penilaian (Supervisor Mitra)</div>
                      <button onClick={() => demoMitraEvaluation(92)} className="w-full rounded-lg border-2 border-[#191b23] bg-blue-300 py-1.5 text-xs font-bold shadow-[2px_2px_0_#191b23] hover:translate-y-0.5">Kirim Nilai Mitra: 92</button>
                    </div>
                  )}

                  {db.klaim.status === 'menunggu_review_dpl' && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-gray-500">4. Penilaian Akhir (DPL)</div>
                      <button onClick={() => demoDplEvaluation(88)} className="w-full rounded-lg border-2 border-[#191b23] bg-green-300 py-1.5 text-xs font-bold shadow-[2px_2px_0_#191b23] hover:translate-y-0.5">Kirim Nilai DPL: 88</button>
                    </div>
                  )}

                  {db.magang.status === 'draft' && <span className="text-[11px] italic text-amber-700">Silakan submit pendaftaran magang terlebih dahulu.</span>}
                  {db.klaim.status === 'disetujui' && <span className="text-[11px] italic text-green-700 font-bold flex items-center gap-1"><Icon className="text-sm">done_all</Icon> Alur simulasi selesai!</span>}
                </div>
              </div>

            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="flex-1 min-w-0 transition-all duration-300">
            
            {/* Sidebar Toggle Button */}
            <div className="mb-6 flex items-center">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex items-center gap-2 rounded-xl border-[3px] border-[#191b23] bg-white px-4 py-2.5 text-xs font-bold shadow-[3px_3px_0_#191b23] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#191b23] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-150"
              >
                <Icon className="text-lg font-bold">{isSidebarOpen ? 'menu_open' : 'menu'}</Icon>
                <span>{isSidebarOpen ? 'Sembunyikan Menu' : 'Tampilkan Menu'}</span>
              </button>
            </div>

            {/* TAB 1: DATA & STATUS MAGANG */}
            {activeTab === 'status' && (
              <div className="space-y-8">
                
                {/* Status Notice Block */}
                <div className={`rounded-2xl border-4 border-[#191b23] p-6 shadow-[8px_8px_0_#191b23] ${
                  db.magang.status === 'disetujui' ? 'bg-green-50' : db.magang.status === 'menunggu_verifikasi' ? 'bg-blue-50' : db.magang.status === 'ditolak' ? 'bg-red-50' : 'bg-amber-50'
                }`}>
                  <div className="flex gap-4 items-start">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border-3 border-[#191b23] ${
                      db.magang.status === 'disetujui' ? 'bg-green-400' : db.magang.status === 'menunggu_verifikasi' ? 'bg-blue-400' : db.magang.status === 'ditolak' ? 'bg-red-400' : 'bg-amber-400'
                    }`}>
                      <Icon className="text-2xl font-bold">{
                        db.magang.status === 'disetujui' ? 'verified' : db.magang.status === 'menunggu_verifikasi' ? 'hourglass_top' : db.magang.status === 'ditolak' ? 'gpp_bad' : 'edit_document'
                      }</Icon>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-lg font-black uppercase tracking-tight">Status Pendaftaran Magang</h3>
                        <span className={`inline-block border-2 border-[#191b23] px-2 py-0.5 text-xs font-extrabold uppercase rounded ${
                          db.magang.status === 'disetujui' ? 'bg-green-300' : db.magang.status === 'menunggu_verifikasi' ? 'bg-blue-300' : db.magang.status === 'ditolak' ? 'bg-red-300' : 'bg-amber-300'
                        }`}>{db.magang.status}</span>
                      </div>
                      <p className="mt-2 text-sm text-[#434655] font-semibold leading-relaxed">
                        {db.magang.status === 'draft' && 'Lengkapi form pendaftaran di bawah dan klik "Ajukan Pendaftaran Magang" untuk diverifikasi oleh prodi.'}
                        {db.magang.status === 'menunggu_verifikasi' && 'Berkas Anda sedang diperiksa oleh Admin Program Studi. Estimasi waktu verifikasi 1-2 hari kerja.'}
                        {db.magang.status === 'disetujui' && 'Selamat! Magang Anda telah disetujui. Anda sekarang dapat mengisi dan mengajukan rancangan "Usulan Konversi".'}
                        {db.magang.status === 'ditolak' && `Pendaftaran Anda ditolak. Catatan: "${db.magang.catatanAdmin}". Silakan perbaiki form di bawah dan ajukan kembali.`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form or Info View */}
                {db.magang.status !== 'draft' && db.magang.status !== 'ditolak' ? (
                  /* Info View mode (internship locked after submit) */
                  <div className="rounded-2xl border-4 border-[#191b23] bg-white p-8 shadow-[8px_8px_0_#191b23]">
                    <div className="mb-6 flex items-center justify-between border-b-2 border-slate-100 pb-4">
                      <h2 className="text-xl font-bold uppercase tracking-tight">Rincian Informasi Magang</h2>
                      <span className="font-mono text-xs text-gray-400">ID MAGANG: {db.magang.dplId ? 'OBE-M-81729' : 'Belum Sync'}</span>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-black uppercase text-gray-400">Nama Perusahaan / Mitra</label>
                          <p className="text-base font-bold">{db.magang.mitraNama}</p>
                        </div>
                        <div>
                          <label className="text-xs font-black uppercase text-gray-400">Bidang Usaha & Alamat</label>
                          <p className="text-sm font-semibold">{db.magang.mitraBidang}</p>
                          <p className="text-xs text-gray-500">{db.magang.mitraAlamat}</p>
                        </div>
                        <div>
                          <label className="text-xs font-black uppercase text-gray-400">Posisi Magang</label>
                          <p className="text-base font-bold text-[#004ac6]">{db.magang.posisi}</p>
                        </div>
                        <div>
                          <label className="text-xs font-black uppercase text-gray-400">Periode Magang</label>
                          <p className="text-sm font-bold flex items-center gap-1">
                            <Icon className="text-sm">calendar_month</Icon>
                            {db.magang.periodeMulai} s.d {db.magang.periodeSelesai}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 border-t-2 border-slate-100 pt-4 md:border-t-0 md:border-l-2 md:pl-6 md:pt-0">
                        <div>
                          <label className="text-xs font-black uppercase text-gray-400">Dosen Pembimbing Lapangan (DPL)</label>
                          <p className="text-base font-bold">{MOCK_DPL_LIST.find(d => d.id === db.magang.dplId)?.nama || 'Belum Ditugaskan'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-black uppercase text-gray-400">Supervisor Lapangan (Mitra)</label>
                          <p className="text-base font-bold">{db.magang.supervisorNama}</p>
                          <p className="text-xs font-mono font-semibold text-gray-500">{db.magang.supervisorEmail} | {db.magang.supervisorHp}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="rounded-lg border-2 border-[#191b23] bg-slate-50 p-2 text-center shadow-[2px_2px_0_#191b23]">
                            <Icon className="text-lg text-red-500">picture_as_pdf</Icon>
                            <div className="text-[10px] font-bold truncate">{db.magang.proposalFile}</div>
                          </div>
                          <div className="rounded-lg border-2 border-[#191b23] bg-slate-50 p-2 text-center shadow-[2px_2px_0_#191b23]">
                            <Icon className="text-lg text-green-500">description</Icon>
                            <div className="text-[10px] font-bold truncate">{db.magang.buktiDiterimaFile}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Form mode (when draft or rejected) */
                  <form onSubmit={handleMagangSubmit} className="rounded-2xl border-4 border-[#191b23] bg-white p-8 shadow-[8px_8px_0_#191b23] space-y-6">
                    <div>
                      <h2 className="text-xl font-bold uppercase tracking-tight">Formulir Pendaftaran Magang</h2>
                      <p className="text-xs text-[#737686] mt-1 font-semibold">Harap isi data tempat magang secara detail agar memudahkan prodi melakukan verifikasi.</p>
                    </div>

                    <div className="border-t-2 border-slate-100 pt-4 space-y-4">
                      <h3 className="font-extrabold text-sm uppercase text-[#004ac6]">A. Rincian Tempat Magang</h3>
                      
                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-wider">Nama Perusahaan / Mitra</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Contoh: PT Solusi Teknologi Nusantara"
                            value={magangForm.mitraNama}
                            onChange={(e) => setMagangForm({...magangForm, mitraNama: e.target.value})}
                            className="w-full rounded-xl border-[3px] border-[#191b23] px-4 py-3 text-sm font-semibold outline-none focus:shadow-[3px_3px_0_#004ac6]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-wider">Bidang Usaha Mitra</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Contoh: Software House / Telekomunikasi"
                            value={magangForm.mitraBidang}
                            onChange={(e) => setMagangForm({...magangForm, mitraBidang: e.target.value})}
                            className="w-full rounded-xl border-[3px] border-[#191b23] px-4 py-3 text-sm font-semibold outline-none focus:shadow-[3px_3px_0_#004ac6]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-wider">Alamat Kantor Mitra</label>
                        <textarea 
                          rows="2" 
                          required
                          placeholder="Masukkan alamat lengkap kantor mitra tempat Anda magang"
                          value={magangForm.mitraAlamat}
                          onChange={(e) => setMagangForm({...magangForm, mitraAlamat: e.target.value})}
                          className="w-full resize-none rounded-xl border-[3px] border-[#191b23] px-4 py-3 text-sm font-semibold outline-none focus:shadow-[3px_3px_0_#004ac6]"
                        />
                      </div>

                      <div className="grid gap-5 md:grid-cols-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-wider">Posisi / Role Kerja</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Contoh: Frontend Developer"
                            value={magangForm.posisi}
                            onChange={(e) => setMagangForm({...magangForm, posisi: e.target.value})}
                            className="w-full rounded-xl border-[3px] border-[#191b23] px-4 py-3 text-sm font-semibold outline-none focus:shadow-[3px_3px_0_#004ac6]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-wider">Periode Mulai</label>
                          <input 
                            type="date" 
                            required
                            value={magangForm.periodeMulai}
                            onChange={(e) => setMagangForm({...magangForm, periodeMulai: e.target.value})}
                            className="w-full rounded-xl border-[3px] border-[#191b23] px-4 py-3 text-sm font-semibold outline-none focus:shadow-[3px_3px_0_#004ac6]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-wider">Periode Selesai</label>
                          <input 
                            type="date" 
                            required
                            value={magangForm.periodeSelesai}
                            onChange={(e) => setMagangForm({...magangForm, periodeSelesai: e.target.value})}
                            className="w-full rounded-xl border-[3px] border-[#191b23] px-4 py-3 text-sm font-semibold outline-none focus:shadow-[3px_3px_0_#004ac6]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t-2 border-slate-100 pt-4 space-y-4">
                      <h3 className="font-extrabold text-sm uppercase text-[#004ac6]">B. Pendamping & Supervisor Mitra</h3>
                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-wider">Dosen Pembimbing (DPL)</label>
                          <select 
                            value={magangForm.dplId}
                            onChange={(e) => setMagangForm({...magangForm, dplId: e.target.value})}
                            className="w-full rounded-xl border-[3px] border-[#191b23] bg-white px-4 py-3 text-sm font-semibold outline-none focus:shadow-[3px_3px_0_#004ac6]"
                          >
                            {MOCK_DPL_LIST.map(dpl => (
                              <option key={dpl.id} value={dpl.id}>{dpl.nama}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-wider">Nama Supervisor Mitra</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Contoh: Budi Santoso"
                            value={magangForm.supervisorNama}
                            onChange={(e) => setMagangForm({...magangForm, supervisorNama: e.target.value})}
                            className="w-full rounded-xl border-[3px] border-[#191b23] px-4 py-3 text-sm font-semibold outline-none focus:shadow-[3px_3px_0_#004ac6]"
                          />
                        </div>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-wider">Email Supervisor Mitra</label>
                          <input 
                            type="email" 
                            required
                            placeholder="Contoh: supervisor@mitra.com"
                            value={magangForm.supervisorEmail}
                            onChange={(e) => setMagangForm({...magangForm, supervisorEmail: e.target.value})}
                            className="w-full rounded-xl border-[3px] border-[#191b23] px-4 py-3 text-sm font-semibold outline-none focus:shadow-[3px_3px_0_#004ac6]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-wider">No. HP/WA Supervisor Mitra</label>
                          <input 
                            type="tel" 
                            required
                            placeholder="Contoh: 0812xxxxxxxx"
                            value={magangForm.supervisorHp}
                            onChange={(e) => setMagangForm({...magangForm, supervisorHp: e.target.value})}
                            className="w-full rounded-xl border-[3px] border-[#191b23] px-4 py-3 text-sm font-semibold outline-none focus:shadow-[3px_3px_0_#004ac6]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t-2 border-slate-100 pt-4 space-y-4">
                      <h3 className="font-extrabold text-sm uppercase text-[#004ac6]">C. Dokumen Lampiran (Format PDF)</h3>
                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="rounded-xl border-3 border-dashed border-[#191b23] p-4 text-center bg-slate-50">
                          <Icon className="text-3xl text-[#004ac6] mb-1">upload_file</Icon>
                          <div className="text-xs font-bold">Proposal Magang</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">proposal_magang_arnanda.pdf</div>
                        </div>
                        <div className="rounded-xl border-3 border-dashed border-[#191b23] p-4 text-center bg-slate-50">
                          <Icon className="text-3xl text-green-600 mb-1">task_alt</Icon>
                          <div className="text-xs font-bold">Bukti Diterima Magang</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">bukti_penerimaan_arnanda.pdf</div>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full rounded-2xl border-[3px] border-[#191b23] bg-[#004ac6] py-4 text-lg font-bold text-white shadow-[6px_6px_0_#191b23] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[10px_10px_0_#191b23] active:translate-y-0.5 active:shadow-none"
                    >
                      Ajukan Pendaftaran Magang
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 2: USULAN KONVERSI */}
            {activeTab === 'usulan' && (
              <div className="space-y-8">
                
                {/* Status Notice Block */}
                <div className={`rounded-2xl border-4 border-[#191b23] p-6 shadow-[8px_8px_0_#191b23] ${
                  db.usulan.status === 'disetujui' ? 'bg-green-50' : db.usulan.status === 'menunggu_persetujuan_dpl' ? 'bg-blue-50' : db.usulan.status === 'revisi' ? 'bg-amber-50' : 'bg-slate-50'
                }`}>
                  <div className="flex gap-4 items-start">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border-3 border-[#191b23] ${
                      db.usulan.status === 'disetujui' ? 'bg-green-400' : db.usulan.status === 'menunggu_persetujuan_dpl' ? 'bg-blue-400' : db.usulan.status === 'revisi' ? 'bg-amber-400' : 'bg-gray-400'
                    }`}>
                      <Icon className="text-2xl font-bold">{
                        db.usulan.status === 'disetujui' ? 'verified' : db.usulan.status === 'menunggu_persetujuan_dpl' ? 'hourglass_top' : db.usulan.status === 'revisi' ? 'error_med' : 'draw'
                      }</Icon>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-lg font-black uppercase tracking-tight">Status Usulan Konversi</h3>
                        <span className={`inline-block border-2 border-[#191b23] px-2 py-0.5 text-xs font-extrabold uppercase rounded ${
                          db.usulan.status === 'disetujui' ? 'bg-green-300' : db.usulan.status === 'menunggu_persetujuan_dpl' ? 'bg-blue-300' : db.usulan.status === 'revisi' ? 'bg-amber-300' : 'bg-gray-300'
                        }`}>{db.usulan.status === 'belum_diajukan' ? 'Draft/Belum Diajukan' : db.usulan.status}</span>
                      </div>
                      <p className="mt-2 text-sm text-[#434655] font-semibold leading-relaxed">
                        {db.usulan.status === 'belum_diajukan' && 'Ajukan usulan pemetaan Mata Kuliah pilihan dengan Capaian Pembelajaran (CPMK) yang relevan dengan tugas magang Anda.'}
                        {db.usulan.status === 'menunggu_persetujuan_dpl' && 'Usulan pemetaan Anda sedang direview oleh DPL Akademik. DPL akan memvalidasi kesesuaian rencana aktivitas dengan CPMK.'}
                        {db.usulan.status === 'disetujui' && 'Usulan pemetaan disetujui! Ketika magang berakhir, silakan masuk ke tab "Klaim Konversi" untuk memasukkan laporan akhir dan bukti.'}
                        {db.usulan.status === 'revisi' && `DPL meminta revisi usulan. Catatan: "${db.usulan.catatanDpl}". Silakan perbaiki rencana aktivitas di bawah dan ajukan kembali.`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form to Build Usulan */}
                {db.usulan.status === 'belum_diajukan' || db.usulan.status === 'revisi' ? (
                  <div className="space-y-8">
                    
                    {/* Add Mata Kuliah Selector Box */}
                    <div className="rounded-2xl border-4 border-[#191b23] bg-white p-6 shadow-[8px_8px_0_#191b23] space-y-4">
                      <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                        <Icon className="text-[#004ac6]">add_box</Icon>
                        Hubungkan Mata Kuliah & CPMK
                      </h2>
                      <div className="h-0.5 bg-slate-100 w-full" />
                      
                      <div className="space-y-4">
                        {/* Mata kuliah select */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase tracking-wider text-gray-500">Pilih Mata Kuliah Pilihan (dari SikurOBE)</label>
                          <select 
                            value={selectedMkId}
                            onChange={(e) => {
                              setSelectedMkId(e.target.value)
                              setTempSelectedCpmk([])
                              setTempRencanaAktivitas({})
                            }}
                            className="w-full rounded-xl border-[3px] border-[#191b23] bg-white px-4 py-3 text-sm font-bold outline-none"
                          >
                            <option value="">-- Pilih Mata Kuliah --</option>
                            {MASTER_MATA_KULIAH.map(mk => (
                              <option key={mk.id} value={mk.id}>{mk.kode} - {mk.nama} ({mk.sks} SKS)</option>
                            ))}
                          </select>
                        </div>

                        {/* If MK selected, show CPMKs checkboxes */}
                        {selectedMkId && (
                          <div className="space-y-4 rounded-xl border-3 border-[#191b23] bg-slate-50 p-5 animate-fadeIn">
                            <h3 className="text-xs font-black uppercase tracking-wider text-[#004ac6]">Pilih Target CPMK yang Relevan:</h3>
                            <div className="space-y-3">
                              {MASTER_MATA_KULIAH.find(m => m.id === selectedMkId)?.cpmk.map(cpmk => (
                                <div key={cpmk.id} className="space-y-2 border-b border-slate-200/60 pb-3 last:border-b-0 last:pb-0">
                                  <label className="flex items-start gap-3 cursor-pointer">
                                    <input 
                                      type="checkbox"
                                      checked={tempSelectedCpmk.includes(cpmk.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setTempSelectedCpmk(prev => [...prev, cpmk.id])
                                        } else {
                                          setTempSelectedCpmk(prev => prev.filter(id => id !== cpmk.id))
                                          const newRencana = { ...tempRencanaAktivitas }
                                          delete newRencana[cpmk.id]
                                          setTempRencanaAktivitas(newRencana)
                                        }
                                      }}
                                      className="mt-1 h-4 w-4 rounded border-2 border-[#191b23] text-[#004ac6]"
                                    />
                                    <div className="text-xs">
                                      <span className="font-extrabold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded mr-2">{cpmk.kode}</span>
                                      <span className="font-semibold text-slate-800">{cpmk.deskripsi}</span>
                                    </div>
                                  </label>

                                  {/* If checkbox active, show input area for deskripsi_rencana */}
                                  {tempSelectedCpmk.includes(cpmk.id) && (
                                    <div className="ml-7 space-y-1 animate-fadeIn">
                                      <label className="text-[10px] font-black uppercase text-[#004ac6]">Rencana Aktivitas / Tugas untuk CPMK ini:</label>
                                      <textarea
                                        rows="2"
                                        required
                                        placeholder="Contoh: Saya akan membuat UI mockups, merancang alur admin, dan menguji halaman login dengan React."
                                        value={tempRencanaAktivitas[cpmk.id] || ''}
                                        onChange={(e) => setTempRencanaAktivitas({
                                          ...tempRencanaAktivitas,
                                          [cpmk.id]: e.target.value
                                        })}
                                        className="w-full resize-none rounded-lg border-2 border-[#191b23] bg-white p-2 text-xs font-semibold outline-none focus:shadow-[2px_2px_0_#004ac6]"
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={handleAddMkToUsulan}
                              className="mt-4 rounded-xl border-2 border-[#191b23] bg-[#004ac6] px-4 py-2 text-xs font-bold text-white shadow-[3px_3px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
                            >
                              Tambahkan ke Daftar Usulan
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Table List of Draft Usulan */}
                    <div className="rounded-2xl border-4 border-[#191b23] bg-white p-6 shadow-[8px_8px_0_#191b23] space-y-4">
                      <h2 className="text-xl font-bold uppercase tracking-tight">Rancangan Usulan Konversi Anda</h2>
                      <div className="h-0.5 bg-slate-100 w-full" />
                      
                      {draftUsulanDetails.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                          <Icon className="text-5xl mb-2">playlist_remove</Icon>
                          <p className="text-sm font-bold">Belum ada mata kuliah yang diusulkan.</p>
                          <p className="text-xs text-gray-400 mt-1">Gunakan form di atas untuk memetakan MK & CPMK.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="overflow-x-auto rounded-xl border-3 border-[#191b23]">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-100 border-b-3 border-[#191b23] text-xs font-black uppercase tracking-wider text-slate-700">
                                  <th className="p-4">Mata Kuliah</th>
                                  <th className="p-4">CPMK</th>
                                  <th className="p-4">Rencana Tugas / Aktivitas</th>
                                  <th className="p-4 text-center">Aksi</th>
                                </tr>
                              </thead>
                              <tbody>
                                {draftUsulanDetails.map((detail, idx) => {
                                  const mk = MASTER_MATA_KULIAH.find(m => m.id === detail.mkId)
                                  const cpmk = mk?.cpmk.find(c => c.id === detail.cpmkId)
                                  return (
                                    <tr key={idx} className="border-b-2 border-slate-100 last:border-b-0 hover:bg-slate-50 text-xs font-semibold">
                                      <td className="p-4 font-bold">
                                        <div className="text-[#004ac6]">{mk?.kode}</div>
                                        <div>{mk?.nama}</div>
                                        <span className="inline-block bg-slate-200 text-slate-700 font-extrabold px-1 rounded mt-1">{mk?.sks} SKS</span>
                                      </td>
                                      <td className="p-4">
                                        <span className="font-extrabold bg-[#dbe1ff] text-[#004ac6] px-1.5 py-0.5 rounded block w-max mb-1">{cpmk?.kode}</span>
                                        <div className="text-[11px] text-gray-500 max-w-xs">{cpmk?.deskripsi}</div>
                                      </td>
                                      <td className="p-4 font-mono text-gray-600 max-w-sm whitespace-pre-wrap">{detail.deskripsiRencana}</td>
                                      <td className="p-4 text-center">
                                        <button 
                                          type="button"
                                          onClick={() => handleRemoveUsulanDetail(idx)}
                                          className="rounded-lg border-2 border-[#191b23] bg-red-100 p-1.5 text-red-600 shadow-[2px_2px_0_#191b23] hover:translate-y-0.5 active:shadow-none"
                                        >
                                          <Icon className="text-base font-bold">delete</Icon>
                                        </button>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>

                          <div className="flex justify-end pt-4">
                            <button
                              type="button"
                              onClick={handleSubmitUsulan}
                              className="rounded-2xl border-[3px] border-[#191b23] bg-[#004ac6] px-8 py-3 text-sm font-extrabold text-white shadow-[4px_4px_0_#191b23] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#191b23] active:translate-y-0.5 active:shadow-none"
                            >
                              Ajukan Usulan Konversi Ke DPL
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Info Mode for Active/Approved Usulan */
                  <div className="rounded-2xl border-4 border-[#191b23] bg-white p-8 shadow-[8px_8px_0_#191b23] space-y-6">
                    <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                      <h2 className="text-xl font-bold uppercase tracking-tight">Rancangan Usulan Konversi Aktif</h2>
                      <span className="font-mono text-xs text-gray-400">STATUS: APPROVED BY DPL</span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border-3 border-[#191b23]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 border-b-3 border-[#191b23] text-xs font-black uppercase tracking-wider text-slate-700">
                            <th className="p-4">Mata Kuliah</th>
                            <th className="p-4">CPMK</th>
                            <th className="p-4">Rencana Tugas / Aktivitas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {db.usulan.details.map((detail, idx) => {
                            const mk = MASTER_MATA_KULIAH.find(m => m.id === detail.mkId)
                            const cpmk = mk?.cpmk.find(c => c.id === detail.cpmkId)
                            return (
                              <tr key={idx} className="border-b-2 border-slate-100 last:border-b-0 text-xs font-semibold">
                                <td className="p-4 font-bold">
                                  <div className="text-[#004ac6]">{mk?.kode}</div>
                                  <div>{mk?.nama}</div>
                                  <span className="inline-block bg-slate-200 text-slate-700 font-extrabold px-1 rounded mt-1">{mk?.sks} SKS</span>
                                </td>
                                <td className="p-4">
                                  <span className="font-extrabold bg-[#dbe1ff] text-[#004ac6] px-1.5 py-0.5 rounded block w-max mb-1">{cpmk?.kode}</span>
                                  <div className="text-[11px] text-gray-500 max-w-xs">{cpmk?.deskripsi}</div>
                                </td>
                                <td className="p-4 font-mono text-gray-600 whitespace-pre-wrap">{detail.deskripsiRencana}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: KLAIM KONVERSI */}
            {activeTab === 'klaim' && (
              <div className="space-y-8">
                
                {/* Status Notice Block */}
                <div className={`rounded-2xl border-4 border-[#191b23] p-6 shadow-[8px_8px_0_#191b23] ${
                  db.klaim.status === 'disetujui' ? 'bg-green-50' : db.klaim.status === 'menunggu_penilaian_mitra' || db.klaim.status === 'menunggu_review_dpl' ? 'bg-blue-50' : db.klaim.status === 'revisi' ? 'bg-amber-50' : 'bg-slate-50'
                }`}>
                  <div className="flex gap-4 items-start">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border-3 border-[#191b23] ${
                      db.klaim.status === 'disetujui' ? 'bg-green-400' : db.klaim.status === 'menunggu_penilaian_mitra' || db.klaim.status === 'menunggu_review_dpl' ? 'bg-blue-400' : db.klaim.status === 'revisi' ? 'bg-amber-400' : 'bg-gray-400'
                    }`}>
                      <Icon className="text-2xl font-bold">{
                        db.klaim.status === 'disetujui' ? 'verified' : db.klaim.status === 'menunggu_penilaian_mitra' || db.klaim.status === 'menunggu_review_dpl' ? 'hourglass_top' : db.klaim.status === 'revisi' ? 'error_med' : 'draw'
                      }</Icon>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-lg font-black uppercase tracking-tight">Status Klaim Konversi</h3>
                        <span className={`inline-block border-2 border-[#191b23] px-2 py-0.5 text-xs font-extrabold uppercase rounded ${
                          db.klaim.status === 'disetujui' ? 'bg-green-300' : db.klaim.status === 'menunggu_penilaian_mitra' || db.klaim.status === 'menunggu_review_dpl' ? 'bg-blue-300' : db.klaim.status === 'revisi' ? 'bg-amber-300' : 'bg-gray-300'
                        }`}>{db.klaim.status === 'belum_diajukan' ? 'Draft/Belum Diajukan' : db.klaim.status === 'menunggu_penilaian_mitra' ? 'Menunggu Penilaian Mitra' : db.klaim.status === 'menunggu_review_dpl' ? 'Menunggu Review DPL' : db.klaim.status}</span>
                      </div>
                      <p className="mt-2 text-sm text-[#434655] font-semibold leading-relaxed">
                        {db.klaim.status === 'belum_diajukan' && 'Unggah laporan akhir magang, logbook, dan sertifikat, serta cantumkan bukti pencapaian tugas untuk masing-masing CPMK yang diusulkan.'}
                        {db.klaim.status === 'menunggu_penilaian_mitra' && 'Sistem telah mengirimkan token penilaian otomatis ke email supervisor industri. Harap menunggu penilaian masuk.'}
                        {db.klaim.status === 'menunggu_review_dpl' && 'Supervisor mitra telah memasukkan penilaian. Sekarang menunggu DPL memberikan penilaian akademis akhir.'}
                        {db.klaim.status === 'disetujui' && 'Selamat! Seluruh penilaian selesai dimasukkan. Silakan ke tab "Hasil Konversi" untuk mengunduh transkrip nilai Anda.'}
                        {db.klaim.status === 'revisi' && `Klaim Anda dikembalikan oleh DPL. Catatan: "${db.klaim.catatanDpl || 'Lengkapi deskripsi bukti aktivitas'}"`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form to submit Klaim */}
                {db.klaim.status === 'belum_diajukan' || db.klaim.status === 'revisi' ? (
                  <form onSubmit={handleSubmitKlaim} className="space-y-8">
                    
                    {/* General Documents Upload */}
                    <div className="rounded-2xl border-4 border-[#191b23] bg-white p-8 shadow-[8px_8px_0_#191b23] space-y-6">
                      <h2 className="text-xl font-bold uppercase tracking-tight">Dokumen Laporan Akhir</h2>
                      <div className="h-0.5 bg-slate-100 w-full" />
                      
                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="rounded-xl border-3 border-dashed border-[#191b23] p-4 text-center bg-slate-50">
                          <Icon className="text-3xl text-red-500 mb-1">picture_as_pdf</Icon>
                          <div className="text-xs font-extrabold uppercase">Logbook Magang (PDF)</div>
                          <div className="text-[10px] text-gray-400 mt-1 truncate">{klaimGeneral.logbookFile}</div>
                        </div>

                        <div className="rounded-xl border-3 border-dashed border-[#191b23] p-4 text-center bg-slate-50">
                          <Icon className="text-3xl text-blue-500 mb-1">picture_as_pdf</Icon>
                          <div className="text-xs font-extrabold uppercase">Laporan Akhir (PDF)</div>
                          <div className="text-[10px] text-gray-400 mt-1 truncate">{klaimGeneral.laporanFile}</div>
                        </div>

                        <div className="rounded-xl border-3 border-dashed border-[#191b23] p-4 text-center bg-slate-50">
                          <Icon className="text-3xl text-green-600 mb-1">workspace_premium</Icon>
                          <div className="text-xs font-extrabold uppercase">Sertifikat Magang (PDF)</div>
                          <div className="text-[10px] text-gray-400 mt-1 truncate">{klaimGeneral.sertifikatFile}</div>
                        </div>
                      </div>
                    </div>

                    {/* CPMK Evidences Input */}
                    <div className="rounded-2xl border-4 border-[#191b23] bg-white p-8 shadow-[8px_8px_0_#191b23] space-y-6">
                      <h2 className="text-xl font-bold uppercase tracking-tight">Detail Bukti Kompetensi Per CPMK</h2>
                      <p className="text-xs font-semibold text-gray-500 mt-1">Berikan uraian konkret (hasil/task) untuk membuktikan bahwa Anda telah memenuhi CPMK ini di tempat magang.</p>
                      <div className="h-0.5 bg-slate-100 w-full" />

                      <div className="space-y-6">
                        {db.usulan.details.map((detail, idx) => {
                          const mk = MASTER_MATA_KULIAH.find(m => m.id === detail.mkId)
                          const cpmk = mk?.cpmk.find(c => c.id === detail.cpmkId)
                          return (
                            <div key={idx} className="rounded-xl border-3 border-[#191b23] bg-slate-50 p-5 space-y-4">
                              <div className="flex flex-wrap justify-between items-start gap-2">
                                <div>
                                  <span className="text-[10px] font-black uppercase text-[#004ac6] block">{mk?.kode} - {mk?.nama}</span>
                                  <span className="font-extrabold text-sm">{cpmk?.kode}: {cpmk?.deskripsi}</span>
                                </div>
                                <span className="bg-blue-200 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded border border-[#191b23]">RENCANA: {detail.deskripsiRencana}</span>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-wider text-gray-500">Uraian Bukti Pencapaian Kompetensi & Hasil Kerja:</label>
                                <textarea
                                  rows="3"
                                  required
                                  placeholder="Tuliskan bukti konkret, contoh: Saya merancang skema ERD 10 tabel, membuat migrasi database, dan mengimplementasikannya di PostgreSQL."
                                  value={klaimDetailsInput[idx] || ''}
                                  onChange={(e) => setKlaimDetailsInput({
                                    ...klaimDetailsInput,
                                    [idx]: e.target.value
                                  })}
                                  className="w-full resize-none rounded-xl border-2 border-[#191b23] bg-white p-3 text-xs font-semibold outline-none focus:shadow-[2px_2px_0_#004ac6]"
                                />
                              </div>

                              <div className="flex items-center gap-2 text-xs font-bold text-[#004ac6] bg-white p-2.5 rounded-lg border-2 border-[#191b23] w-max">
                                <Icon className="text-base">attachment</Icon>
                                <span>bukti_kompetensi_{idx + 1}.zip</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <button 
                        type="submit"
                        className="w-full rounded-2xl border-[3px] border-[#191b23] bg-[#004ac6] py-4 text-lg font-bold text-white shadow-[6px_6px_0_#191b23] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[10px_10px_0_#191b23] active:translate-y-0.5 active:shadow-none"
                      >
                        Ajukan Klaim Konversi Nilai Magang
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Info Mode for Pending/Approved Claim */
                  <div className="space-y-8">
                    
                    {/* General Documents Upload */}
                    <div className="rounded-2xl border-4 border-[#191b23] bg-white p-8 shadow-[8px_8px_0_#191b23] space-y-4">
                      <h2 className="text-xl font-bold uppercase tracking-tight">Dokumen Klaim Terlampir</h2>
                      <div className="h-0.5 bg-slate-100 w-full" />
                      <div className="grid gap-4 grid-cols-3">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 border-2 border-[#191b23] rounded-lg">
                          <Icon className="text-red-500">picture_as_pdf</Icon>
                          <div className="overflow-hidden">
                            <div className="text-xs font-bold uppercase">Logbook</div>
                            <div className="text-[10px] text-gray-400 truncate">{db.klaim.logbookFile}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 border-2 border-[#191b23] rounded-lg">
                          <Icon className="text-blue-500">picture_as_pdf</Icon>
                          <div className="overflow-hidden">
                            <div className="text-xs font-bold uppercase">Laporan</div>
                            <div className="text-[10px] text-gray-400 truncate">{db.klaim.laporanFile}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 border-2 border-[#191b23] rounded-lg">
                          <Icon className="text-green-600">workspace_premium</Icon>
                          <div className="overflow-hidden">
                            <div className="text-xs font-bold uppercase">Sertifikat</div>
                            <div className="text-[10px] text-gray-400 truncate">{db.klaim.sertifikatFile}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Evidences list */}
                    <div className="rounded-2xl border-4 border-[#191b23] bg-white p-8 shadow-[8px_8px_0_#191b23] space-y-6">
                      <h2 className="text-xl font-bold uppercase tracking-tight">Detail Uraian Klaim CPMK</h2>
                      <div className="h-0.5 bg-slate-100 w-full" />

                      <div className="space-y-4">
                        {db.klaim.details.map((detail, idx) => {
                          const usulanDetail = db.usulan.details[detail.usulanDetailIndex]
                          const mk = MASTER_MATA_KULIAH.find(m => m.id === usulanDetail?.mkId)
                          const cpmk = mk?.cpmk.find(c => c.id === usulanDetail?.cpmkId)
                          return (
                            <div key={idx} className="rounded-xl border-2 border-[#191b23] bg-slate-50 p-4">
                              <div className="text-[10px] font-black text-gray-400 uppercase">{mk?.kode} - {mk?.nama}</div>
                              <div className="font-extrabold text-sm text-slate-800">{cpmk?.kode}: {cpmk?.deskripsi}</div>
                              <div className="mt-3 border-t border-slate-200 pt-2 font-mono text-xs text-slate-600">
                                <b>Uraian Bukti Mahasiswa:</b> <br />{detail.buktiAktivitasText}
                              </div>
                              <div className="mt-2 text-[10px] font-bold text-[#004ac6] flex items-center gap-1">
                                <Icon className="text-sm">attachment</Icon>
                                {detail.buktiFile}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: HASIL KONVERSI (KHS) */}
            {activeTab === 'hasil' && (
              <div className="space-y-8">
                
                {/* Grading Summary Block */}
                <div className="grid gap-6 md:grid-cols-3">
                  
                  <div className="rounded-2xl border-4 border-[#191b23] bg-white p-6 shadow-[6px_6px_0_#191b23] text-center space-y-1">
                    <div className="text-xs font-black uppercase text-gray-400">Nilai Supervisor Mitra (70%)</div>
                    <div className="text-4xl font-extrabold text-[#004ac6]">{db.penilaian.mitra.nilai || '0'}</div>
                    <div className="text-[10px] text-gray-500 italic mt-1">Submitted: {db.penilaian.mitra.submittedAt || '-'}</div>
                  </div>

                  <div className="rounded-2xl border-4 border-[#191b23] bg-white p-6 shadow-[6px_6px_0_#191b23] text-center space-y-1">
                    <div className="text-xs font-black uppercase text-gray-400">Nilai DPL Akademis (30%)</div>
                    <div className="text-4xl font-extrabold text-[#004ac6]">{db.penilaian.dpl.nilaiAkademik || '0'}</div>
                    <div className="text-[10px] text-gray-500 italic mt-1">Submitted: {db.penilaian.dpl.submittedAt || '-'}</div>
                  </div>

                  <div className="relative rounded-2xl border-4 border-[#191b23] bg-[#004ac6] p-6 shadow-[6px_6px_0_#191b23] text-center text-white flex flex-col justify-center items-center">
                    <div className="text-xs font-black uppercase text-white/70">Nilai Akhir Konversi</div>
                    <div className="text-5xl font-black">{summary.finalScore}</div>
                    <div className="acc-stamp absolute -bottom-1 -right-2 bg-yellow-300 text-[#191b23] border-[#191b23]">GRADE {summary.gradeLetter}</div>
                  </div>
                </div>

                {/* Neo-brutalist KHS / Transcript */}
                <div className="rounded-2xl border-4 border-[#191b23] bg-white p-8 shadow-[10px_10px_0_#191b23] space-y-8 print:border-none print:shadow-none">
                  
                  {/* KHS Header */}
                  <div className="text-center space-y-2 border-b-4 border-[#191b23] pb-6">
                    <div className="text-xl font-bold flex items-center justify-center gap-2">
                      <span className="bg-[#004ac6] border-2 border-[#191b23] text-white p-1 rounded-full"><Icon className="text-base font-bold">school</Icon></span>
                      UNIVERSITAS AMIKOM YOGYAKARTA
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">KARTU HASIL SINKRONISASI KONVERSI NILAI OBE</h2>
                    <p className="text-xs font-mono text-[#434655]">Sertifikat Elektronik Hash ID: 22119876-003-7B1A</p>
                  </div>

                  {/* Student & Mitra Info */}
                  <div className="grid gap-6 md:grid-cols-2 text-xs font-bold">
                    <div className="space-y-2.5">
                      <div className="flex border-b border-slate-100 pb-1.5"><span className="w-24 text-gray-400">NIM</span><span className="text-[#191b23]">: 22.11.9876</span></div>
                      <div className="flex border-b border-slate-100 pb-1.5"><span className="w-24 text-gray-400">NAMA</span><span className="text-[#191b23]">: ARNANDA</span></div>
                      <div className="flex border-b border-slate-100 pb-1.5"><span className="w-24 text-gray-400">PRODI</span><span className="text-[#191b23]">: INFORMATIKA</span></div>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex border-b border-slate-100 pb-1.5"><span className="w-24 text-gray-400">MITRA</span><span className="text-[#191b23]">: {db.magang.mitraNama}</span></div>
                      <div className="flex border-b border-slate-100 pb-1.5"><span className="w-24 text-gray-400">DPL</span><span className="text-[#191b23]">: {MOCK_DPL_LIST.find(d => d.id === db.magang.dplId)?.nama}</span></div>
                      <div className="flex border-b border-slate-100 pb-1.5"><span className="w-24 text-gray-400">PERIODE</span><span className="text-[#191b23]">: {db.magang.periodeMulai} s.d {db.magang.periodeSelesai}</span></div>
                    </div>
                  </div>

                  {/* Courses List */}
                  <div className="overflow-hidden rounded-xl border-3 border-[#191b23]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b-3 border-[#191b23] text-xs font-black uppercase text-slate-700">
                          <th className="p-4">KODE MK</th>
                          <th className="p-4">NAMA MATA KULIAH</th>
                          <th className="p-4 text-center">SKS</th>
                          <th className="p-4 text-center">NILAI MITRA (70%)</th>
                          <th className="p-4 text-center">NILAI DPL (30%)</th>
                          <th className="p-4 text-center">NILAI AKHIR</th>
                          <th className="p-4 text-center">HURUF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.courses.map((course, idx) => (
                          <tr key={idx} className="border-b-2 border-slate-100 last:border-b-0 text-xs font-bold">
                            <td className="p-4 font-mono text-[#004ac6]">{course.kode}</td>
                            <td className="p-4">
                              <div>{course.nama}</div>
                              <span className="text-[10px] text-gray-400 italic">Terpetakan ({course.cpmkCount} CPMK)</span>
                            </td>
                            <td className="p-4 text-center font-bold">{course.sks}</td>
                            <td className="p-4 text-center text-slate-500">{db.penilaian.mitra.nilai}</td>
                            <td className="p-4 text-center text-slate-500">{db.penilaian.dpl.nilaiAkademik}</td>
                            <td className="p-4 text-center font-extrabold text-[#004ac6]">{summary.finalScore}</td>
                            <td className="p-4 text-center"><span className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-2 py-0.5 rounded font-black">{summary.gradeLetter}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Footer */}
                  <div className="flex flex-wrap justify-between items-center bg-slate-50 border-3 border-[#191b23] p-5 rounded-xl text-xs font-black uppercase">
                    <div>TOTAL SKS TERKONVERSI: <span className="text-[#004ac6] text-sm ml-1">{summary.totalSks} SKS</span></div>
                    <div>INDEKS PRESTASI (IP): <span className="text-green-600 text-sm ml-1">{summary.gradeLetter === 'A' ? '4.00' : summary.gradeLetter === 'B+' ? '3.50' : '3.00'}</span></div>
                  </div>

                  {/* Signatures */}
                  <div className="flex justify-between gap-10 pt-10 text-xs font-bold text-center">
                    <div className="space-y-16">
                      <div>Dosen Pembimbing Lapangan</div>
                      <div className="space-y-1 border-t-2 border-dashed border-[#191b23]/50 pt-2">
                        <div>{MOCK_DPL_LIST.find(d => d.id === db.magang.dplId)?.nama}</div>
                        <div className="text-[10px] font-mono text-gray-400">NIP: 198701022019032001</div>
                      </div>
                    </div>
                    
                    <div className="space-y-16">
                      <div>Kepala Program Studi</div>
                      <div className="space-y-1 border-t-2 border-dashed border-[#191b23]/50 pt-2">
                        <div>Sudarmawan, M.T.</div>
                        <div className="text-[10px] font-mono text-gray-400">NIP: 197410122002121002</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center pt-8 border-t border-slate-100 print:hidden">
                    <button 
                      onClick={() => window.print()}
                      className="flex items-center gap-2 rounded-xl border-[3px] border-[#191b23] bg-[#004ac6] px-8 py-3.5 font-bold text-white shadow-[4px_4px_0_#191b23] transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      <Icon className="text-xl">print</Icon>
                      Cetak KHS Konversi (PDF)
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  )
}

export default StudentDashboard
