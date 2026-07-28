import React, { useState, useEffect, useCallback } from 'react'
import api, { getApiError } from '../lib/api'

function Icon({ children, className = '' }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>
}

const VALID_TABS = ['status', 'history', 'surat', 'usulan', 'klaim', 'hasil', 'profile']
const EMPTY_STATE = { dpls: [], magang: {}, usulan: { details: [], status: 'belum_diajukan' }, klaim: { details: [], status: 'belum_diajukan' }, penilaian: { mitra: {}, dpl: {} } }

function StudentDashboard({ user, onLogout }) {
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // Keep the local state shape while the API response is normalized into it.
  const emptyState = EMPTY_STATE
  const [db, setDb] = useState(emptyState)

  const normalizeDashboard = useCallback((data) => {
    const magang = data.magangs?.[0]
    const usulan = data.usulan_konversis?.[0]
    const klaim = data.klaim_konversis?.[0]
    const mitra = klaim?.penilaian_mitra || klaim?.penilaianMitra
    const dpl = klaim?.penilaian_dpl || klaim?.penilaianDpl

    return {
      dpls: data.dpls || [],
      magang: {
        ...magang,
        mitraNama: magang?.mitra_industri?.nama || magang?.mitraIndustri?.nama || '',
        mitraBidang: magang?.mitra_industri?.bidang || magang?.mitraIndustri?.bidang || '',
        mitraAlamat: magang?.mitra_industri?.alamat || magang?.mitraIndustri?.alamat || '',
        supervisorNama: magang?.supervisor_mitra?.nama || magang?.supervisorMitra?.nama || '',
        supervisorEmail: magang?.supervisor_mitra?.email || magang?.supervisorMitra?.email || '',
        supervisorHp: magang?.supervisor_mitra?.no_hp || magang?.supervisorMitra?.no_hp || '',
        dplNama: magang?.dpl?.name || '',
        dplId: magang?.dpl_id || magang?.dplId || '',
        periodeMulai: magang?.periode_mulai || magang?.periodeMulai || '',
        periodeSelesai: magang?.periode_selesai || magang?.periodeSelesai || '',
        status: magang?.status || 'draft',
      },
      usulan: {
        ...emptyState.usulan,
        ...usulan,
        details: usulan?.details || [],
        status: usulan?.status || emptyState.usulan.status,
        catatanDpl: usulan?.catatan_dpl || usulan?.catatanDpl || '',
      },
      klaim: {
        ...emptyState.klaim,
        ...klaim,
        details: klaim?.details || [],
        status: klaim?.status || emptyState.klaim.status,
      },
      penilaian: {
        mitra: {
          ...emptyState.penilaian.mitra,
          ...mitra,
          nilai: mitra?.nilai ?? null,
        },
        dpl: {
          ...emptyState.penilaian.dpl,
          ...dpl,
          nilaiAkademik: dpl?.nilai_akademik ?? dpl?.nilaiAkademik ?? null,
        },
      },
    }
  }, [emptyState])

  const [masterMataKuliah, setMasterMataKuliah] = useState([])

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const { data } = await api.get('/mahasiswa/dashboard')
      setDb(normalizeDashboard(data))
      const masterResponse = await api.get('/admin/mata-kuliah').catch(() => ({ data: [] }))
      setMasterMataKuliah(masterResponse.data?.data || masterResponse.data || [])
    } catch (error) {
      setLoadError(getApiError(error))
    } finally {
      setIsLoading(false)
    }
  }, [normalizeDashboard])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const validTabs = VALID_TABS
  const tabFromUrl = useCallback(() => {
    const tab = new URLSearchParams(window.location.search).get('tab')
    return validTabs.includes(tab) ? tab : 'status'
  }, [validTabs])
  const [activeTab, setActiveTab] = useState(tabFromUrl)
  const changeTab = (tab, replace = false) => {
    if (!validTabs.includes(tab)) return
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    window.history[replace ? 'replaceState' : 'pushState']({}, '', url)
  }
  useEffect(() => {
    const handlePopState = () => setActiveTab(tabFromUrl())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [tabFromUrl])
  const [showNotifications, setShowNotifications] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState({})
  const [avatarFile, setAvatarFile] = useState(null)

  const notifications = []

  const statusLabels = {
    draft: 'Draft',
    belum_diajukan: 'Belum diajukan',
    menunggu_verifikasi: 'Menunggu verifikasi',
    menunggu_persetujuan_dpl: 'Menunggu persetujuan DPL',
    menunggu_penilaian_mitra: 'Menunggu penilaian mitra',
    menunggu_review_dpl: 'Menunggu review DPL',
    disetujui: 'Disetujui',
    berjalan: 'Sedang berjalan',
    selesai: 'Selesai',
    revisi: 'Perlu revisi',
    ditolak: 'Ditolak',
    dibatalkan: 'Dibatalkan',
  }

  const getStatusLabel = (status) => statusLabels[status] || status || 'Belum tersedia'

  const handleFileSelect = (event, field) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFiles(prev => ({ ...prev, [field]: file }))
    showToast(`${file.name} siap diunggah.`)
  }

  // Notification helper
  const [toast, setToast] = useState(null)
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // --- Profile State (synced from logged-in user account) ---
  const [profileForm, setProfileForm] = useState({
    nama: user?.name || '',
    nim: user?.nim_nip || user?.nim || '',
    email: user?.email || '',
    noHp: user?.no_hp || '',
    alamat: user?.alamat || '',
    jurusan: 'S1 Informatika',
    ipk: user?.ipk || '',
    semester: user?.semester || '',
    avatar: user?.avatar || ''
  })

  // Sync profile details when user prop changes
  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        nama: user.name || user.nama || prev.nama,
        nim: user.nim_nip || user.nim || prev.nim,
        email: user.email || prev.email,
        noHp: user.no_hp ?? prev.noHp,
        alamat: user.alamat ?? prev.alamat,
        avatar: user.avatar ?? prev.avatar,
        ipk: user.ipk ?? prev.ipk,
        jurusan: 'S1 Informatika',
        semester: user.semester || prev.semester || ''
      }))
    }
  }, [user])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = new FormData()
      payload.append('_method', 'PUT')
      payload.append('name', profileForm.nama)
      payload.append('nim_nip', profileForm.nim)
      if (profileForm.ipk) payload.append('ipk', profileForm.ipk)
      if (profileForm.semester) payload.append('semester', profileForm.semester)
      payload.append('no_hp', profileForm.noHp)
      payload.append('alamat', profileForm.alamat)
      if (avatarFile) payload.append('avatar', avatarFile)
      const { data } = await api.post('/profile', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
      setDb(prev => ({ ...prev, profile: data.user || profileForm }))
      if (data.user?.avatar) setProfileForm(prev => ({ ...prev, avatar: data.user.avatar }))
      setAvatarFile(null)
      showToast('Profil Anda berhasil diperbarui!')
    } catch (error) { showToast(getApiError(error), 'error') }
  }

  // --- 1. Aksi Magang ---
  const [magangForm, setMagangForm] = useState({
    jenisProgram: db.magang.jenisProgram || 'magang',
    mitraIndustriId: db.magang.mitra_industri_id || '',
    mitraNama: db.magang.mitraNama || '',
    mitraAlamat: db.magang.mitraAlamat || '',
    mitraBidang: db.magang.mitraBidang || '',
    posisi: db.magang.posisi || '',
    periodeMulai: db.magang.periodeMulai || '',
    periodeSelesai: db.magang.periodeSelesai || '',
    dplId: db.magang.dplId || '',
    dplNama: db.magang.dplNama || '',
    supervisorMitraId: db.magang.supervisor_mitra_id || '',
    supervisorNama: db.magang.supervisorNama || '',
    supervisorEmail: db.magang.supervisorEmail || '',
    supervisorHp: db.magang.supervisorHp || '',
    proposalFile: db.magang.proposal_file || '',
    buktiDiterimaFile: db.magang.bukti_diterima_file || ''
  })

  useEffect(() => {
    const magang = db.magang
    const hasMagang = Boolean(magang.id)
    setMagangForm((current) => ({
      ...current,
      jenisProgram: hasMagang ? (magang.jenis_program || magang.jenisProgram || 'magang') : 'magang',
      mitraIndustriId: hasMagang ? magang.mitra_industri_id || '' : '',
      mitraNama: hasMagang ? magang.mitraNama || '' : '',
      mitraAlamat: hasMagang ? magang.mitraAlamat || '' : '',
      mitraBidang: hasMagang ? magang.mitraBidang || '' : '',
      posisi: hasMagang ? magang.posisi || '' : '',
      periodeMulai: hasMagang ? magang.periode_mulai || magang.periodeMulai || '' : '',
      periodeSelesai: hasMagang ? magang.periode_selesai || magang.periodeSelesai || '' : '',
      dplId: hasMagang ? magang.dpl_id || magang.dplId || '' : '',
      dplNama: hasMagang ? magang.dpl?.name || magang.dplNama || '' : '',
      supervisorMitraId: hasMagang ? magang.supervisor_mitra_id || '' : '',
      supervisorNama: hasMagang ? magang.supervisorNama || '' : '',
      supervisorEmail: hasMagang ? magang.supervisorEmail || '' : '',
      supervisorHp: hasMagang ? magang.supervisorHp || '' : '',
      proposalFile: hasMagang ? magang.proposal_file || '' : '',
      buktiDiterimaFile: hasMagang ? magang.bukti_diterima_file || '' : '',
    }))
  }, [db.magang])

  const processHistory = [
    { date: db.magang.updated_at || db.magang.created_at, title: 'Pengajuan magang', status: getStatusLabel(db.magang.status), note: db.magang.catatanAdmin || 'Data pengajuan tersimpan di dashboard.' },
    { date: db.usulan.updated_at || db.usulan.created_at, title: 'Usulan konversi', status: getStatusLabel(db.usulan.status), note: db.usulan.catatanDpl || 'Pemetaan mata kuliah dan CPMK.' },
    { date: db.klaim.updated_at || db.klaim.created_at, title: 'Klaim konversi', status: getStatusLabel(db.klaim.status), note: 'Bukti kegiatan dan dokumen akhir.' },
    { date: db.penilaian.dpl.submittedAt, title: 'Penilaian akhir', status: db.klaim.status === 'disetujui' ? 'Selesai' : 'Menunggu', note: db.penilaian.dpl.komentar || 'Menunggu seluruh pihak menyelesaikan penilaian.' },
  ].filter(item => item.date || item.title === 'Pengajuan magang')

  const handleMagangSubmit = async (e) => {
    e.preventDefault()
    const proposal = selectedFiles.proposal
    const buktiDiterima = selectedFiles.buktiDiterima

    if (!magangForm.dplId) {
      showToast('Pilih DPL dari data backend.', 'error')
      return
    }
    if (!proposal || !buktiDiterima) {
      showToast('Proposal dan bukti diterima wajib dipilih.', 'error')
      return
    }

    const payload = new FormData()
    if (magangForm.mitraIndustriId) payload.append('mitra_industri_id', magangForm.mitraIndustriId)
    payload.append('mitra_nama', magangForm.mitraNama)
    payload.append('mitra_bidang', magangForm.mitraBidang)
    payload.append('mitra_alamat', magangForm.mitraAlamat)
    if (magangForm.supervisorMitraId) payload.append('supervisor_mitra_id', magangForm.supervisorMitraId)
    payload.append('supervisor_nama', magangForm.supervisorNama)
    payload.append('supervisor_email', magangForm.supervisorEmail)
    payload.append('supervisor_hp', magangForm.supervisorHp)
    payload.append('dpl_id', magangForm.dplId)
    payload.append('jenis_program', magangForm.jenisProgram)
    payload.append('posisi', magangForm.posisi)
    payload.append('periode_mulai', magangForm.periodeMulai)
    payload.append('periode_selesai', magangForm.periodeSelesai)
    payload.append('proposal_file', proposal)
    payload.append('bukti_diterima_file', buktiDiterima)

    try {
      await api.post('/magang', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
      await loadDashboard()
      showToast('Pendaftaran magang berhasil dikirim untuk verifikasi prodi!')
    } catch (error) {
      showToast(getApiError(error), 'error')
    }
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
    const mk = masterMataKuliah.find(m => m.id === selectedMkId)
    if (!mk) return

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
    
    setSelectedMkId('')
    setTempSelectedCpmk([])
    setTempRencanaAktivitas({})
    showToast('Mata kuliah berhasil ditambahkan ke daftar usulan!')
  }

  const handleRemoveUsulanDetail = (indexToRemove) => {
    setDraftUsulanDetails(prev => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSubmitUsulan = async () => {
    if (!db.magang.id || draftUsulanDetails.length === 0) {
      showToast('Magang harus disetujui dan minimal satu CPMK dipilih.', 'error')
      return
    }
    try {
      const details = draftUsulanDetails.map(detail => ({
        mata_kuliah_id: detail.mata_kuliah_id || detail.mkId,
        cpmk_id: detail.cpmk_id || detail.cpmkId,
        deskripsi_aktivitas_rencana: detail.deskripsi_aktivitas_rencana || detail.deskripsiRencana,
      }))
      if (db.usulan.id) await api.put(`/usulan-konversi/${db.usulan.id}`, { details })
      else await api.post('/usulan-konversi', { magang_id: db.magang.id, details })
      await loadDashboard()
      showToast('Usulan konversi berhasil diajukan ke DPL!')
    } catch (error) { showToast(getApiError(error), 'error') }
  }

  // --- 3. Aksi Klaim Konversi ---
  const [klaimGeneral] = useState({
    logbookFile: 'logbook_magang_final.pdf',
    laporanFile: 'laporan_akhir_magang.pdf',
    sertifikatFile: 'sertifikat_industri.pdf'
  })
  
  const [klaimDetailsInput, setKlaimDetailsInput] = useState({}) // index -> text

  useEffect(() => {
    const inputs = {}
    db.usulan.details.forEach((_, idx) => {
      const existingKlaimDetail = db.klaim.details.find(k => k.usulanDetailIndex === idx)
      inputs[idx] = existingKlaimDetail ? existingKlaimDetail.buktiAktivitasText : ''
    })
    setKlaimDetailsInput(inputs)
  }, [db.usulan.details, db.klaim.details])

  const handleSubmitKlaim = async (e) => {
    e.preventDefault()
    const files = selectedFiles
    if (!files.logbook || !files.laporan || !files.sertifikat) { showToast('Logbook, laporan, dan sertifikat wajib dipilih.', 'error'); return }
    try {
      const payload = new FormData()
      payload.append('usulan_konversi_id', db.usulan.id)
      payload.append('logbook_file', files.logbook)
      payload.append('laporan_file', files.laporan)
      payload.append('sertifikat_file', files.sertifikat)
      db.usulan.details.forEach((detail, idx) => {
        payload.append(`details[${idx}][usulan_konversi_detail_id]`, detail.id)
        payload.append(`details[${idx}][bukti_aktivitas_text]`, klaimDetailsInput[idx] || '')
        const evidence = files[`cpmk-${idx}`]
        if (evidence) payload.append(`details[${idx}][bukti_file]`, evidence)
      })
      await api.post('/klaim-konversi', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
      await loadDashboard()
      showToast('Klaim konversi berhasil diajukan! Menunggu penilaian mitra.')
    } catch (error) { showToast(getApiError(error), 'error') }
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

  const getConversionSummary = () => {
    const details = db.usulan.details || []
    const rawMitra = db.penilaian.mitra.nilai || 0
    const rawDpl = db.penilaian.dpl.nilaiAkademik || 0
    const finalScore = Number((rawMitra * 0.7 + rawDpl * 0.3).toFixed(1))

    const mkMap = {}
    details.forEach(detail => {
      const mk = masterMataKuliah.find(m => m.id === detail.mkId)
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
  const magangApproved = ['disetujui', 'berjalan', 'selesai'].includes(db.magang.status)
  const usulanApproved = db.usulan.status === 'disetujui'
  const klaimApproved = db.klaim.status === 'disetujui'
  const stepsList = [
    { key: 'magang', title: 'Pengajuan magang', unlocked: true, done: magangApproved, active: !magangApproved },
    { key: 'usulan', title: 'Usulan konversi', unlocked: magangApproved, done: usulanApproved, active: magangApproved && !usulanApproved },
    { key: 'klaim', title: 'Klaim konversi', unlocked: usulanApproved, done: klaimApproved, active: usulanApproved && !klaimApproved },
    { key: 'grade', title: 'Hasil konversi', unlocked: klaimApproved, done: klaimApproved, active: klaimApproved }
  ]

  // Collapsible sidebar state (False = closed/hidden by default)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
      {/* COLLAPSIBLE LEFT SIDEBAR (Disappears to the left) */}
      {/* ============================================================== */}
      <aside className={`w-64 shrink-0 border-r-3 border-[#191b23] bg-[#f8fafc] flex flex-col justify-between h-screen fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col flex-1">
          {/* Header Brand */}
          <div className="bg-[#9f149f] border-b-3 border-[#191b23] h-16 flex items-center px-6 text-white font-bold text-xl justify-between">
            <span className="tracking-tight uppercase">GradeSync</span>
            <button className="text-white hover:opacity-80" onClick={() => setIsSidebarOpen(false)}>
              <Icon>close</Icon>

            </button>
          </div>

          {/* Navigation Sidebar Buttons */}
          <nav className="mt-8 flex flex-col gap-2 px-3">
            {[
              { id: 'status', label: 'Data & Status Magang', icon: 'business_center', disabled: false },
              { id: 'history', label: 'Histori Proses', icon: 'history', disabled: false },
              { id: 'surat', label: 'Surat Pengantar', icon: 'mail', disabled: false },
              { id: 'usulan', label: 'Usulan Konversi', icon: 'history_edu', disabled: db.magang.status !== 'disetujui' },
              { id: 'klaim', label: 'Klaim Konversi', icon: 'fact_check', disabled: db.usulan.status !== 'disetujui' },
              { id: 'hasil', label: 'Hasil Konversi (KHS)', icon: 'workspace_premium', disabled: db.klaim.status !== 'disetujui' },
              { id: 'profile', label: 'Profil Saya', icon: 'person', disabled: false }
            ].map(item => (
              <button
                key={item.id}
                disabled={item.disabled}
                onClick={() => {
                  changeTab(item.id)
                  setIsSidebarOpen(false) // Close sidebar after selecting tab
                }}
                className={`flex items-center gap-3 w-full rounded-2xl border-2 p-3 text-left font-bold transition-all duration-150 ${
                  item.disabled
                    ? 'border-dashed border-[#191b23]/30 bg-slate-100 text-gray-400 cursor-not-allowed opacity-60'
                    : activeTab === item.id
                      ? 'border-[#191b23] bg-[#9f149f] text-white shadow-[4px_4px_0_#191b23] -translate-y-0.5'
                      : 'border-transparent text-[#191b23] hover:bg-purple-50 hover:border-[#191b23]'
                }`}
              >
                <Icon className={`text-xl ${item.disabled ? 'text-gray-400' : activeTab === item.id ? 'text-white' : 'text-[#191b23]'}`}>{item.icon}</Icon>
                <span className="text-xs uppercase tracking-wider">{item.label}</span>
                {item.disabled && <Icon className="ml-auto text-base text-gray-400">lock</Icon>}
              </button>
            ))}
          </nav>
        </div>

        {/* Logout Button (Moved to bottom of sidebar) */}
        <div className="p-4 border-t-3 border-[#191b23] bg-purple-50/50">
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-[#191b23] bg-[#191b23] py-2.5 text-xs font-bold text-white shadow-[3px_3px_0_#9f149f] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-150"
          >
            <Icon className="text-base text-white">logout</Icon>
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MAIN VIEWPORT (Occupies 100% width since Sidebar is fixed/floating) */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto w-full">
        
        {/* Top Bar Header with Toggle Sidebar and controls */}
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
              <span className="text-[10px] font-black uppercase text-[#9f149f] tracking-widest leading-none">PORTAL MAHASISWA AKTIF</span>
              <h1 className="text-xl font-bold uppercase tracking-tight text-slate-800 mt-0.5">DASHBOARD KONVERSI</h1>
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifikasi"
              onClick={() => setShowNotifications(prev => !prev)}
              className="relative rounded-xl border-2 border-[#191b23] bg-white p-2 shadow-[2px_2px_0_#9f149f] hover:bg-purple-50"
            >
              <Icon className="text-xl text-[#9f149f]">notifications</Icon>
              {notifications.length > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-[#191b23] bg-red-500 px-1 text-[9px] font-black text-white">{notifications.length}</span>}
            </button>
            {showNotifications && (
              <div className="absolute right-14 top-12 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border-2 border-[#191b23] bg-white p-3 shadow-[5px_5px_0_#191b23]">
                <div className="mb-2 flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-black uppercase">Notifikasi</span>
                  <span className="text-[10px] font-bold text-[#9f149f]">1 belum dibaca</span>
                </div>
                <div className="space-y-2">
                  {notifications.map(notification => (
                    <div key={notification.id} className={`rounded-lg border p-2 ${notification.unread ? 'border-purple-200 bg-purple-50' : 'border-slate-200 bg-slate-50'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[11px] font-black">{notification.title}</p>
                        <span className="shrink-0 text-[9px] font-bold text-slate-400">{notification.time}</span>
                      </div>
                      <p className="mt-1 text-[10px] font-semibold text-slate-600">{notification.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div 
              onClick={() => changeTab('profile')}
              className="flex items-center gap-2 cursor-pointer hover:opacity-85"
            >
              {profileForm.avatar ? <img src={profileForm.avatar} alt="Avatar" className="h-8 w-8 rounded-full border-2 border-[#191b23] object-cover" /> : <Icon className="text-2xl text-[#9f149f]">account_circle</Icon>}
               <span className="text-xs font-black hidden sm:inline">{profileForm.nama.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 md:p-8 space-y-8 flex-1 bg-[#faf8ff] [background-image:radial-gradient(#e1e2ed_1px,transparent_1px)] [background-size:24px_24px]">
          
          {/* Welcome User Info Header Subtitle */}
          <div className="border-b-2 border-slate-200 pb-3 -mt-2">
            <p className="text-xs font-bold text-slate-500">
              Selamat datang, <b>{profileForm.nama} (NIM: {profileForm.nim})</b> • {profileForm.jurusan}
            </p>
          </div>

          {isLoading && (
            <div className="rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-500">
              Memuat data dashboard terbaru...
            </div>
          )}

          {loadError && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
              <span>{loadError}</span>
              <button
                type="button"
                onClick={loadDashboard}
                className="rounded-lg border-2 border-red-700 bg-white px-3 py-1.5 font-black hover:bg-red-100"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* Ringkasan tahap dibuat ringkas agar tidak mengganggu pekerjaan utama mahasiswa. */}
          {activeTab !== 'profile' && (
            <div className="rounded-xl border-2 border-slate-200 bg-white px-4 py-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="text-[11px] font-black uppercase tracking-wide text-slate-600">Tahapan proses</h2>
                <button type="button" onClick={loadDashboard} className="text-[10px] font-bold text-[#9f149f] hover:underline">
                  Perbarui status
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {stepsList.map((step, idx) => (
                  <div
                    key={step.key}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${
                      !step.unlocked
                        ? 'border-slate-200 bg-slate-50 text-slate-400'
                        : step.done
                        ? 'border-green-200 bg-green-50 text-green-800'
                        : step.active
                          ? 'border-purple-200 bg-purple-50 text-purple-900'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <Icon className={`text-base ${!step.unlocked ? 'text-slate-400' : step.done ? 'text-green-600' : 'text-[#9f149f]'}`}>
                      {!step.unlocked ? 'lock' : step.done ? 'check_circle' : 'radio_button_unchecked'}
                    </Icon>
                    <span className="min-w-0 truncate">{idx + 1}. {step.title}</span>
                  </div>
                ))}
              </div>
            </div>

          )}

          {/* ============================================================== */}
          {/* TAB 1: DATA & STATUS MAGANG */}
          {/* ============================================================== */}
          {activeTab === 'status' && (
            <div className="space-y-8 animate-fadeIn w-full">
              
              {/* Status Notice Block */}
              <div className={`rounded-2xl border-[3px] border-[#191b23] p-5 shadow-[6px_6px_0_#191b23] ${
                db.magang.status === 'disetujui' ? 'bg-green-50/50' : db.magang.status === 'menunggu_verifikasi' ? 'bg-purple-50/50' : db.magang.status === 'ditolak' ? 'bg-red-50/50' : 'bg-amber-50/50'
              }`}>
                <div className="flex gap-4 items-start">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#191b23] ${
                    db.magang.status === 'disetujui' ? 'bg-green-400' : db.magang.status === 'menunggu_verifikasi' ? 'bg-purple-400' : db.magang.status === 'ditolak' ? 'bg-red-400' : 'bg-amber-400'
                  }`}>
                    <Icon className="text-xl font-bold">{
                      db.magang.status === 'disetujui' ? 'verified' : db.magang.status === 'menunggu_verifikasi' ? 'hourglass_top' : db.magang.status === 'ditolak' ? 'gpp_bad' : 'edit_document'
                    }</Icon>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-black uppercase tracking-tight">Status Pendaftaran Magang</h3>
                      <span className={`inline-block border border-[#191b23] px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded ${
                        db.magang.status === 'disetujui' ? 'bg-green-200' : db.magang.status === 'menunggu_verifikasi' ? 'bg-purple-200' : db.magang.status === 'ditolak' ? 'bg-red-200' : 'bg-amber-200'
                       }`}>{getStatusLabel(db.magang.status)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 font-semibold leading-relaxed">
                      {db.magang.status === 'draft' && 'Lengkapi form pendaftaran di bawah dan klik "Ajukan Pendaftaran Magang" untuk diverifikasi oleh prodi.'}
                      {db.magang.status === 'menunggu_verifikasi' && 'Berkas Anda sedang diperiksa oleh Admin Program Studi. Estimasi waktu verifikasi 1-2 hari kerja.'}
                      {db.magang.status === 'disetujui' && 'Selamat! Magang Anda telah disetujui. Anda sekarang dapat mengisi dan mengajukan rancangan "Usulan Konversi".'}
                      {db.magang.status === 'ditolak' && `Pendaftaran Anda ditolak. Catatan: "${db.magang.catatanAdmin}". Silakan perbaiki form di bawah dan ajukan kembali.`}
                    </p>
                  </div>
                </div>
              </div>

              {db.magang.status !== 'draft' && db.magang.status !== 'ditolak' ? (
                /* Locked Info View */
                <div className="rounded-2xl border-[3px] border-[#191b23] bg-white p-6 shadow-[6px_6px_0_#191b23] space-y-6">
                  <div className="mb-4 flex items-center justify-between border-b-2 border-slate-100 pb-3">
                    <h2 className="text-md font-bold uppercase tracking-tight">Rincian Informasi Magang</h2>
                    <span className="font-mono text-[10px] text-gray-400">ID MAGANG: {db.magang.nomor_magang || 'Belum dibuat'}</span>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 text-xs">
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400">Nama Perusahaan / Mitra</label>
                        <p className="font-bold">{db.magang.mitraNama}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400">Bidang Usaha & Alamat</label>
                        <p className="font-semibold">{db.magang.mitraBidang}</p>
                        <p className="text-[11px] text-gray-500">{db.magang.mitraAlamat}</p>

                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400">Posisi Magang</label>
                        <p className="font-bold text-[#9f149f]">{db.magang.posisi}</p>
                      </div>
                      <div>

                        <label className="text-[10px] font-black uppercase text-gray-400">Periode Magang</label>
                        <p className="font-bold flex items-center gap-1 mt-0.5">
                          <Icon className="text-sm text-[#9f149f]">calendar_month</Icon>
                          {db.magang.periodeMulai} s.d {db.magang.periodeSelesai}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 border-t-2 border-slate-100 pt-3 md:border-t-0 md:border-l-2 md:pl-6 md:pt-0">
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400">Dosen Pembimbing Lapangan (DPL)</label>
                        <p className="font-bold">{db.magang.dpl?.name || db.magang.dplNama || 'Belum Ditugaskan'}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-gray-400">Supervisor Lapangan (Mitra)</label>
                        <p className="font-bold">{db.magang.supervisorNama}</p>
                        <p className="text-[11px] font-mono text-gray-500">{db.magang.supervisorEmail} | {db.magang.supervisorHp}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="rounded-lg border-2 border-[#191b23] bg-slate-50 p-2 text-center shadow-[1.5px_1.5px_0_#191b23]">
                          <Icon className="text-md text-red-500">picture_as_pdf</Icon>
                          <div className="text-[9px] font-bold truncate">{db.magang.proposalFile}</div>
                        </div>
                        <div className="rounded-lg border-2 border-[#191b23] bg-slate-50 p-2 text-center shadow-[1.5px_1.5px_0_#191b23]">
                          <Icon className="text-md text-green-500">description</Icon>
                          <div className="text-[9px] font-bold truncate">{db.magang.buktiDiterimaFile}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Editable Form */
                <form onSubmit={handleMagangSubmit} className="rounded-2xl border-[3px] border-[#191b23] bg-white p-6 md:p-8 shadow-[6px_6px_0_#191b23] space-y-6">
                  <div>
                    <h2 className="text-md font-bold uppercase tracking-tight">Formulir Pendaftaran Magang</h2>
                    <p className="text-[10px] text-gray-400 mt-0.5">Harap isi data tempat magang secara detail agar memudahkan prodi melakukan verifikasi.</p>
                  </div>

                  <div className="border-t-2 border-slate-100 pt-4 space-y-4 text-xs font-bold">
                    <h3 className="font-black text-xs uppercase text-[#9f149f]">A. Rincian Tempat Magang</h3>

                    <div className="space-y-1.5">
                      <label>Jenis Program</label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {[
                          ['magang', 'Magang'],
                          ['studi_independen', 'Studi Independen'],
                        ].map(([value, label]) => (
                          <label key={value} className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2 ${magangForm.jenisProgram === value ? 'border-[#9f149f] bg-purple-50 text-[#9f149f]' : 'border-[#191b23] bg-white'}`}>
                            <input
                              type="radio"
                              name="jenisProgram"
                              value={value}
                              checked={magangForm.jenisProgram === value}
                              onChange={(e) => setMagangForm({ ...magangForm, jenisProgram: e.target.value })}
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label>Nama Perusahaan / Mitra</label>
                        <input 
                          type="text" 
                          required
                          readOnly={Boolean(magangForm.mitraIndustriId)}
                          placeholder="Nama perusahaan mitra"
                          value={magangForm.mitraNama}
                          onChange={(e) => setMagangForm({...magangForm, mitraNama: e.target.value})}
                          className="w-full rounded-xl border-2 border-[#191b23] px-3 py-2 outline-none focus:shadow-[2px_2px_0_#9f149f]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label>Bidang Usaha Mitra</label>
                        <input 
                          type="text" 
                          required
                          readOnly={Boolean(magangForm.mitraIndustriId)}
                          placeholder="Contoh: Software House"
                          value={magangForm.mitraBidang}
                          onChange={(e) => setMagangForm({...magangForm, mitraBidang: e.target.value})}
                          className="w-full rounded-xl border-2 border-[#191b23] px-3 py-2 outline-none focus:shadow-[2px_2px_0_#9f149f]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label>Alamat Kantor Mitra</label>
                      <textarea 
                        rows="2" 
                        required
                        readOnly={Boolean(magangForm.mitraIndustriId)}
                        placeholder="Masukkan alamat lengkap kantor mitra"
                        value={magangForm.mitraAlamat}
                        onChange={(e) => setMagangForm({...magangForm, mitraAlamat: e.target.value})}
                        className="w-full resize-none rounded-xl border-2 border-[#191b23] px-3 py-2 outline-none focus:shadow-[2px_2px_0_#9f149f]"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-1.5">
                        <label>Posisi / Role Kerja</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Contoh: Frontend Developer"
                          value={magangForm.posisi}
                          onChange={(e) => setMagangForm({...magangForm, posisi: e.target.value})}
                          className="w-full rounded-xl border-2 border-[#191b23] px-3 py-2 outline-none focus:shadow-[2px_2px_0_#9f149f]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label>Periode Mulai</label>
                        <input 
                          type="date" 
                          required
                          value={magangForm.periodeMulai}
                          onChange={(e) => setMagangForm({...magangForm, periodeMulai: e.target.value})}
                          className="w-full rounded-xl border-2 border-[#191b23] px-3 py-2 outline-none focus:shadow-[2px_2px_0_#9f149f]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label>Periode Selesai</label>
                        <input 
                          type="date" 
                          required
                          value={magangForm.periodeSelesai}
                          onChange={(e) => setMagangForm({...magangForm, periodeSelesai: e.target.value})}
                          className="w-full rounded-xl border-2 border-[#191b23] px-3 py-2 outline-none focus:shadow-[2px_2px_0_#9f149f]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t-2 border-slate-100 pt-4 space-y-4 text-xs font-bold">
                    <h3 className="font-black text-xs uppercase text-[#9f149f]">B. Pendamping & Supervisor Mitra</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label>Dosen Pembimbing (DPL)</label>
                         <select
                           required
                           value={magangForm.dplId}
                           onChange={(e) => {
                             const dpl = db.dpls?.find((item) => String(item.id) === e.target.value)
                             setMagangForm({ ...magangForm, dplId: e.target.value, dplNama: dpl?.name || '' })
                           }}
                           className="w-full rounded-xl border-2 border-[#191b23] bg-white px-3 py-2 outline-none focus:shadow-[2px_2px_0_#9f149f]"
                         >
                           <option value="">Pilih DPL</option>
                           {(db.dpls || []).map((dpl) => (
                             <option key={dpl.id} value={dpl.id}>{dpl.name} ({dpl.email})</option>
                           ))}
                         </select>
                      </div>
                      <div className="space-y-1.5">
                        <label>Nama Supervisor Mitra</label>
                        <input 
                          type="text" 
                          required
                          readOnly={Boolean(magangForm.supervisorMitraId)}
                          placeholder="Contoh: Budi Santoso"
                          value={magangForm.supervisorNama}
                          onChange={(e) => setMagangForm({...magangForm, supervisorNama: e.target.value})}
                          className="w-full rounded-xl border-2 border-[#191b23] px-3 py-2 outline-none focus:shadow-[2px_2px_0_#9f149f]"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label>Email Supervisor Mitra</label>
                        <input 
                          type="email" 
                          required
                          readOnly={Boolean(magangForm.supervisorMitraId)}
                          placeholder="Contoh: supervisor@mitra.com"
                          value={magangForm.supervisorEmail}
                          onChange={(e) => setMagangForm({...magangForm, supervisorEmail: e.target.value})}
                          className="w-full rounded-xl border-2 border-[#191b23] px-3 py-2 outline-none focus:shadow-[2px_2px_0_#9f149f]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label>No. HP Supervisor Mitra</label>
                        <input 
                          type="tel" 
                          required
                          readOnly={Boolean(magangForm.supervisorMitraId)}
                          placeholder="Contoh: 0812xxxxxxxx"
                          value={magangForm.supervisorHp}
                          onChange={(e) => setMagangForm({...magangForm, supervisorHp: e.target.value})}
                          className="w-full rounded-xl border-2 border-[#191b23] px-3 py-2 outline-none focus:shadow-[2px_2px_0_#9f149f]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t-2 border-slate-100 pt-4 space-y-4 text-xs font-bold">
                    <h3 className="font-black text-xs uppercase text-[#9f149f]">C. Dokumen Lampiran (Format PDF)</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="cursor-pointer rounded-xl border-2 border-dashed border-[#191b23] p-3 text-center bg-slate-50 hover:bg-purple-50">
                        <Icon className="text-2xl text-[#9f149f] mb-1">upload_file</Icon>
                        <div className="text-xs">Proposal Magang</div>
                        <div className="text-[9px] text-gray-400 mt-0.5 truncate">{selectedFiles.proposal?.name || magangForm.proposalFile || 'Pilih file PDF'}</div>
                        <input className="sr-only" type="file" accept="application/pdf,.pdf" onChange={(e) => handleFileSelect(e, 'proposal')} />
                      </label>
                      <label className="cursor-pointer rounded-xl border-2 border-dashed border-[#191b23] p-3 text-center bg-slate-50 hover:bg-purple-50">
                        <Icon className="text-2xl text-green-600 mb-1">task_alt</Icon>
                        <div className="text-xs">Bukti Diterima Magang</div>
                        <div className="text-[9px] text-gray-400 mt-0.5 truncate">{selectedFiles.buktiDiterima?.name || magangForm.buktiDiterimaFile || 'Pilih file PDF'}</div>
                        <input className="sr-only" type="file" accept="application/pdf,.pdf" onChange={(e) => handleFileSelect(e, 'buktiDiterima')} />
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full rounded-xl border-2 border-[#191b23] bg-[#9f149f] py-3 text-white font-bold shadow-[4px_4px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    Ajukan Pendaftaran Magang
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="rounded-2xl border-[3px] border-[#191b23] bg-white p-6 shadow-[6px_6px_0_#191b23]">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-md font-black uppercase">Histori Proses</h2>
                    <p className="mt-1 text-xs font-semibold text-slate-500">Pantau perubahan status dan catatan pada setiap tahap pengajuan.</p>
                  </div>
                  <Icon className="text-2xl text-[#9f149f]">history</Icon>
                </div>
                <div className="space-y-4">
                  {processHistory.map((item, index) => (
                    <div key={`${item.title}-${index}`} className="relative flex gap-3">
                      {index < processHistory.length - 1 && <span className="absolute left-[9px] top-6 h-full w-px bg-purple-200" />}
                      <span className="relative z-10 mt-1 h-5 w-5 shrink-0 rounded-full border-2 border-[#191b23] bg-[#f3dff3]" />
                      <div className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 bg-slate-50 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-xs font-black">{item.title}</h3>
                          <span className="rounded border border-[#191b23] bg-white px-2 py-0.5 text-[9px] font-black uppercase text-[#9f149f]">{item.status}</span>
                        </div>
                        <p className="mt-1 text-[10px] font-semibold text-slate-600">{item.note}</p>
                        {item.date && <p className="mt-2 text-[9px] font-bold text-slate-400">{item.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'surat' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="rounded-2xl border-[3px] border-[#191b23] bg-white p-6 shadow-[6px_6px_0_#191b23]">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-slate-100 pb-4">
                  <div>
                    <h2 className="text-md font-black uppercase">Surat Pengantar</h2>
                    <p className="mt-1 text-xs font-semibold text-slate-500">Kelola dan pantau penerbitan surat pengantar magang Anda.</p>
                  </div>
                  <span className="rounded-full border-2 border-[#191b23] bg-amber-100 px-3 py-1 text-[10px] font-black uppercase">Menunggu penerbitan</span>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {[
                    ['description', 'Proposal tervalidasi', db.magang.status === 'disetujui'],
                    ['edit_document', 'Surat sedang diproses', db.magang.status === 'disetujui'],
                    ['download', 'Surat siap diunduh', false],
                  ].map(([icon, label, done]) => (
                    <div key={label} className={`rounded-xl border-2 p-4 ${done ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
                      <Icon className={`text-2xl ${done ? 'text-green-600' : 'text-slate-400'}`}>{done ? 'check_circle' : icon}</Icon>
                      <p className="mt-2 text-xs font-black">{label}</p>
                      <p className="mt-1 text-[10px] font-semibold text-slate-500">{done ? 'Selesai' : 'Belum tersedia'}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-xl border-2 border-dashed border-slate-300 p-5 text-center">
                  <Icon className="text-4xl text-slate-300">mail_lock</Icon>
                  <p className="mt-2 text-xs font-black">Surat pengantar belum tersedia</p>
                  <p className="mt-1 text-[10px] font-semibold text-slate-500">Tombol preview dan unduh akan tersedia setelah surat diterbitkan oleh admin.</p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: USULAN FORM */}
          {/* ============================================================== */}
          {activeTab === 'usulan' && (
            <div className="space-y-8 animate-fadeIn w-full">
              
              <div className={`rounded-2xl border-[3px] border-[#191b23] p-5 shadow-[6px_6px_0_#191b23] ${
                db.usulan.status === 'disetujui' ? 'bg-green-50/50' : db.usulan.status === 'menunggu_persetujuan_dpl' ? 'bg-purple-50/50' : db.usulan.status === 'revisi' ? 'bg-amber-50/50' : 'bg-slate-50/50'
              }`}>
                <div className="flex gap-4 items-start">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#191b23] ${
                    db.usulan.status === 'disetujui' ? 'bg-green-400' : db.usulan.status === 'menunggu_persetujuan_dpl' ? 'bg-purple-400' : db.usulan.status === 'revisi' ? 'bg-amber-400' : 'bg-gray-400'
                  }`}>
                    <Icon className="text-xl font-bold">{
                      db.usulan.status === 'disetujui' ? 'verified' : db.usulan.status === 'menunggu_persetujuan_dpl' ? 'hourglass_top' : db.usulan.status === 'revisi' ? 'error_med' : 'draw'
                    }</Icon>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-black uppercase tracking-tight">Status Usulan Konversi</h3>
                      <span className={`inline-block border border-[#191b23] px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded ${
                        db.usulan.status === 'disetujui' ? 'bg-green-200' : db.usulan.status === 'menunggu_persetujuan_dpl' ? 'bg-purple-200' : db.usulan.status === 'revisi' ? 'bg-amber-200' : 'bg-gray-200'
                       }`}>{getStatusLabel(db.usulan.status)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 font-semibold leading-relaxed">
                      {db.usulan.status === 'belum_diajukan' && 'Ajukan usulan pemetaan Mata Kuliah pilihan dengan Capaian Pembelajaran (CPMK) yang relevan dengan tugas magang Anda.'}
                      {db.usulan.status === 'menunggu_persetujuan_dpl' && 'Usulan pemetaan Anda sedang direview oleh DPL Akademik.'}
                      {db.usulan.status === 'disetujui' && 'Usulan pemetaan disetujui! Ketika magang berakhir, silakan masuk ke tab "Klaim Konversi" untuk memasukkan laporan akhir dan bukti.'}
                      {db.usulan.status === 'revisi' && `DPL meminta revisi usulan. Catatan: "${db.usulan.catatanDpl}". Silakan perbaiki rencana aktivitas di bawah dan ajukan kembali.`}
                    </p>
                  </div>
                </div>
              </div>

              {db.usulan.status === 'belum_diajukan' || db.usulan.status === 'revisi' ? (
                <div className="space-y-8">
                  <div className="rounded-2xl border-[3px] border-[#191b23] bg-white p-6 shadow-[6px_6px_0_#191b23] space-y-4">
                    <h2 className="text-md font-bold uppercase tracking-tight flex items-center gap-2 text-slate-800">
                      <Icon className="text-[#9f149f]">add_box</Icon>
                      Hubungkan Mata Kuliah & CPMK
                    </h2>
                    
                    <div className="space-y-4 text-xs font-bold">
                      <div className="space-y-1.5">
                        <label className="text-gray-500">Pilih Mata Kuliah Pilihan</label>
                        <select 
                          value={selectedMkId}
                          onChange={(e) => {
                            setSelectedMkId(e.target.value)
                            setTempSelectedCpmk([])
                            setTempRencanaAktivitas({})
                          }}
                          className="w-full rounded-xl border-2 border-[#191b23] bg-white px-3 py-2.5 outline-none"
                        >
                          <option value="">-- Pilih Mata Kuliah --</option>
                          {masterMataKuliah.map(mk => (
                            <option key={mk.id} value={mk.id}>{mk.kode} - {mk.nama} ({mk.sks} SKS)</option>
                          ))}
                        </select>
                      </div>

                      {selectedMkId && (
                        <div className="space-y-4 rounded-xl border-2 border-[#191b23] bg-slate-50 p-5">
                          <h3 className="text-xs font-black uppercase text-[#9f149f]">Pilih Target CPMK yang Relevan:</h3>
                          <div className="space-y-3">
                            {masterMataKuliah.find(m => m.id === selectedMkId)?.cpmk.map(cpmk => (
                              <div key={cpmk.id} className="space-y-2 border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
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
                                    className="mt-0.5 h-4 w-4 rounded border-2 border-[#191b23] text-[#9f149f]"
                                  />
                                  <div>
                                    <span className="font-black bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded mr-2">{cpmk.kode}</span>
                                    <span>{cpmk.deskripsi}</span>
                                  </div>
                                </label>

                                {tempSelectedCpmk.includes(cpmk.id) && (
                                  <div className="ml-7 space-y-1">
                                    <label className="text-[10px] font-black text-[#9f149f] uppercase">Rencana Aktivitas / Tugas untuk CPMK ini:</label>
                                    <textarea
                                      rows="2"
                                      required
                                      placeholder="Contoh: Saya akan membuat API backend user, auth, dan endpoint data master."
                                      value={tempRencanaAktivitas[cpmk.id] || ''}
                                      onChange={(e) => setTempRencanaAktivitas({
                                        ...tempRencanaAktivitas,
                                        [cpmk.id]: e.target.value
                                      })}
                                      className="w-full resize-none rounded-lg border-2 border-[#191b23] bg-white p-2 text-xs font-bold outline-none"
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={handleAddMkToUsulan}
                            className="rounded-lg border-2 border-[#191b23] bg-[#9f149f] px-4 py-2 text-xs font-bold text-white shadow-[2px_2px_0_#191b23] hover:translate-y-0.5"
                          >
                            Tambahkan ke Daftar Usulan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* List Draft Usulan */}
                  <div className="rounded-2xl border-[3px] border-[#191b23] bg-white p-6 shadow-[6px_6px_0_#646464] space-y-4">
                    <h2 className="text-md font-bold uppercase tracking-tight">Rancangan Usulan Konversi Anda</h2>
                    
                    {draftUsulanDetails.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Icon className="text-4xl mb-2">playlist_remove</Icon>
                        <p className="text-xs font-bold">Belum ada mata kuliah yang diusulkan.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="overflow-x-auto rounded-xl border-2 border-[#191b23]">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b-2 border-[#191b23] text-[10px] font-black uppercase text-slate-700">
                                <th className="p-3">Mata Kuliah</th>
                                <th className="p-3">CPMK</th>
                                <th className="p-3">Rencana Tugas / Aktivitas</th>
                                <th className="p-3 text-center">Aksi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {draftUsulanDetails.map((detail, idx) => {
                                const mk = masterMataKuliah.find(m => m.id === detail.mkId)
                                const cpmk = mk?.cpmk.find(c => c.id === detail.cpmkId)
                                return (
                                  <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 text-xs font-bold">
                                    <td className="p-3">
                                      <div className="text-[#9f149f]">{mk?.kode}</div>
                                      <div>{mk?.nama}</div>
                                      <span className="inline-block bg-slate-200 text-slate-700 font-extrabold px-1 rounded mt-0.5">{mk?.sks} SKS</span>
                                    </td>
                                    <td className="p-3">
                                      <span className="font-extrabold bg-purple-100 text-[#9f149f] px-1.5 py-0.5 rounded">{cpmk?.kode}</span>
                                    </td>
                                    <td className="p-3 font-mono text-gray-500 max-w-xs whitespace-pre-wrap">{detail.deskripsiRencana}</td>
                                    <td className="p-3 text-center">
                                      <button 
                                        type="button"
                                        onClick={() => handleRemoveUsulanDetail(idx)}
                                        className="rounded-lg border-2 border-[#191b23] bg-red-100 p-1.5 text-red-600 shadow-[1.5px_1.5px_0_#191b23] hover:translate-y-0.5 active:shadow-none"
                                      >
                                        <Icon className="text-sm font-bold">delete</Icon>
                                      </button>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={handleSubmitUsulan}
                            className="rounded-xl border-2 border-[#191b23] bg-[#9f149f] px-6 py-2.5 text-xs font-bold text-white shadow-[3px_3px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                          >
                            Ajukan Usulan Konversi Ke DPL
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Submitted active list */
                <div className="rounded-2xl border-[3px] border-[#191b23] bg-white p-6 shadow-[6px_6px_0_#191b23] space-y-4">
                  <h2 className="text-md font-bold uppercase tracking-tight">Rancangan Usulan Konversi Aktif</h2>
                  <div className="overflow-x-auto rounded-xl border-2 border-[#191b23]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b-2 border-[#191b23] text-[10px] font-black uppercase text-slate-700">
                          <th className="p-3">Mata Kuliah</th>
                          <th className="p-3">CPMK</th>
                          <th className="p-3">Rencana Tugas / Aktivitas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {db.usulan.details.map((detail, idx) => {
                          const mk = masterMataKuliah.find(m => m.id === detail.mkId)
                          const cpmk = mk?.cpmk.find(c => c.id === detail.cpmkId)
                          return (
                            <tr key={idx} className="border-b border-slate-100 last:border-0 text-xs font-bold">
                              <td className="p-3">
                                <div className="text-[#9f149f]">{mk?.kode}</div>
                                <div>{mk?.nama}</div>
                                <span className="inline-block bg-slate-200 text-slate-700 font-extrabold px-1 rounded mt-0.5">{mk?.sks} SKS</span>
                              </td>
                              <td className="p-3">
                                <span className="font-extrabold bg-purple-100 text-[#9f149f] px-1.5 py-0.5 rounded">{cpmk?.kode}</span>
                              </td>
                              <td className="p-3 font-mono text-gray-500 whitespace-pre-wrap">{detail.deskripsiRencana}</td>
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

          {/* ============================================================== */}
          {/* TAB 3: KLAIM FORM */}
          {/* ============================================================== */}
          {activeTab === 'klaim' && (
            <div className="space-y-8 animate-fadeIn w-full">
              
              <div className={`rounded-2xl border-[3px] border-[#191b23] p-5 shadow-[6px_6px_0_#191b23] ${
                db.klaim.status === 'disetujui' ? 'bg-green-50/50' : db.klaim.status === 'menunggu_penilaian_mitra' || db.klaim.status === 'menunggu_review_dpl' ? 'bg-purple-50/50' : db.klaim.status === 'revisi' ? 'bg-amber-50/50' : 'bg-slate-50/50'
              }`}>
                <div className="flex gap-4 items-start">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#191b23] ${
                    db.klaim.status === 'disetujui' ? 'bg-green-400' : db.klaim.status === 'menunggu_penilaian_mitra' || db.klaim.status === 'menunggu_review_dpl' ? 'bg-purple-400' : db.klaim.status === 'revisi' ? 'bg-amber-400' : 'bg-gray-400'
                  }`}>
                    <Icon className="text-xl font-bold">{
                      db.klaim.status === 'disetujui' ? 'verified' : db.klaim.status === 'menunggu_penilaian_mitra' || db.klaim.status === 'menunggu_review_dpl' ? 'hourglass_top' : db.klaim.status === 'revisi' ? 'error_med' : 'draw'
                    }</Icon>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-black uppercase tracking-tight">Status Klaim Konversi</h3>
                      <span className={`inline-block border border-[#191b23] px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded ${
                        db.klaim.status === 'disetujui' ? 'bg-green-200' : db.klaim.status === 'menunggu_penilaian_mitra' || db.klaim.status === 'menunggu_review_dpl' ? 'bg-purple-200' : db.klaim.status === 'revisi' ? 'bg-amber-200' : 'bg-gray-200'
                       }`}>{getStatusLabel(db.klaim.status)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 font-semibold leading-relaxed">
                      {db.klaim.status === 'belum_diajukan' && 'Unggah laporan akhir magang, logbook, dan sertifikat, serta cantumkan bukti pencapaian tugas untuk masing-masing CPMK yang diusulkan.'}
                      {db.klaim.status === 'menunggu_penilaian_mitra' && 'Sistem telah mengirimkan token penilaian otomatis ke email supervisor industri. Harap menunggu penilaian masuk.'}
                      {db.klaim.status === 'menunggu_review_dpl' && 'Supervisor mitra telah memasukkan penilaian. Sekarang menunggu DPL memberikan penilaian akademis akhir.'}
                      {db.klaim.status === 'disetujui' && 'Selamat! Seluruh penilaian selesai dimasukkan. Silakan ke tab "Hasil Konversi" untuk mengunduh transkrip nilai Anda.'}
                      {db.klaim.status === 'revisi' && `Klaim Anda dikembalikan oleh DPL. Catatan: "${db.klaim.catatanDpl || 'Lengkapi deskripsi bukti aktivitas'}"`}
                    </p>
                  </div>
                </div>
              </div>

              {db.klaim.status === 'belum_diajukan' || db.klaim.status === 'revisi' ? (
                <form onSubmit={handleSubmitKlaim} className="space-y-8">
                  <div className="rounded-2xl border-[3px] border-[#191b23] bg-white p-6 shadow-[6px_6px_0_#191b23] space-y-4">
                    <h2 className="text-md font-bold uppercase tracking-tight">Dokumen Laporan Akhir</h2>
                    <div className="grid gap-4 md:grid-cols-3 text-xs font-bold">
                      <label className="cursor-pointer rounded-xl border-2 border-dashed border-[#191b23] p-4 text-center bg-slate-50 hover:bg-purple-50">
                        <Icon className="text-3xl text-red-500 mb-1">picture_as_pdf</Icon>
                        <div className="text-[10px]">Logbook Magang (PDF)</div>
                        <div className="text-[9px] text-gray-400 mt-1 truncate">{selectedFiles.logbook?.name || klaimGeneral.logbookFile || 'Pilih file PDF'}</div>
                        <input className="sr-only" type="file" accept="application/pdf,.pdf" onChange={(e) => handleFileSelect(e, 'logbook')} />

                      </label>
                      <label className="cursor-pointer rounded-xl border-2 border-dashed border-[#191b23] p-4 text-center bg-slate-50 hover:bg-purple-50">
                        <Icon className="text-3xl text-blue-500 mb-1">picture_as_pdf</Icon>
                        <div className="text-[10px]">Laporan Akhir (PDF)</div>
                        <div className="text-[9px] text-gray-400 mt-1 truncate">{selectedFiles.laporan?.name || klaimGeneral.laporanFile || 'Pilih file PDF'}</div>
                        <input className="sr-only" type="file" accept="application/pdf,.pdf" onChange={(e) => handleFileSelect(e, 'laporan')} />
                      </label>
                      <label className="cursor-pointer rounded-xl border-2 border-dashed border-[#191b23] p-4 text-center bg-slate-50 hover:bg-purple-50">

                        <Icon className="text-3xl text-green-600 mb-1">workspace_premium</Icon>
                        <div className="text-[10px]">Sertifikat Magang (PDF)</div>
                        <div className="text-[9px] text-gray-400 mt-1 truncate">{selectedFiles.sertifikat?.name || klaimGeneral.sertifikatFile || 'Pilih file PDF'}</div>
                        <input className="sr-only" type="file" accept="application/pdf,.pdf" onChange={(e) => handleFileSelect(e, 'sertifikat')} />
                      </label>
                    </div>
                  </div>

                  <div className="rounded-2xl border-[3px] border-[#191b23] bg-white p-6 md:p-8 shadow-[6px_6px_0_#191b23] space-y-6">
                    <div>
                      <h2 className="text-md font-bold uppercase tracking-tight">Detail Bukti Kompetensi Per CPMK</h2>
                      <p className="text-[10px] text-gray-400 mt-0.5">Uraikan secara detail tugas/aktivitas yang telah Anda selesaikan untuk membuktikan target CPMK terpenuhi.</p>
                    </div>
                    <div className="h-0.5 bg-slate-100 w-full" />

                    <div className="space-y-4">
                      {db.usulan.details.map((detail, idx) => {
                        const mk = masterMataKuliah.find(m => m.id === detail.mkId)
                        const cpmk = mk?.cpmk.find(c => c.id === detail.cpmkId)
                        return (
                          <div key={idx} className="rounded-xl border-2 border-[#191b23] bg-slate-50/50 p-4 space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="text-[9px] font-black text-[#9f149f] uppercase">{mk?.kode} • {mk?.nama}</span>
                                <h4 className="font-bold text-xs text-slate-800">{cpmk?.kode}: {cpmk?.deskripsi}</h4>
                              </div>
                              <span className="bg-purple-50 border border-[#191b23]/30 text-[#9f149f] text-[9px] px-1.5 py-0.5 rounded font-black max-w-[200px] truncate">Rencana: {detail.deskripsiRencana}</span>
                            </div>

                            <div className="space-y-1.5 text-xs font-bold">
                              <label className="text-gray-500">Uraian Bukti Pencapaian Kompetensi & Hasil Kerja:</label>
                              <textarea
                                rows="2"
                                required
                                placeholder="Contoh: Saya berhasil merancang UI mockup di Figma dan mengimplementasikannya ke JSX React."
                                value={klaimDetailsInput[idx] || ''}
                                onChange={(e) => setKlaimDetailsInput({
                                  ...klaimDetailsInput,
                                  [idx]: e.target.value
                                })}
                                className="w-full resize-none rounded-xl border-2 border-[#191b23] bg-white p-3 text-xs font-bold outline-none"
                              />
                              <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white px-3 py-2 text-[10px] font-black text-slate-500 hover:border-[#9f149f] hover:text-[#9f149f]">
                                <Icon className="text-base">attach_file</Icon>
                                {selectedFiles[`cpmk-${idx}`]?.name || 'Lampirkan bukti CPMK'}
                                <input className="sr-only" type="file" accept=".pdf,.zip,.rar,image/*" onChange={(e) => handleFileSelect(e, `cpmk-${idx}`)} />
                              </label>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <button 
                      type="submit"
                      className="w-full rounded-xl border-2 border-[#191b23] bg-[#9f149f] py-3 text-white font-bold shadow-[4px_4px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                    >
                      Kirim Berkas Klaim Konversi Nilai Magang
                    </button>
                  </div>
                </form>
              ) : (
                /* Locked view */
                <div className="space-y-6">
                  <div className="rounded-2xl border-[3px] border-[#191b23] bg-white p-6 shadow-[6px_6px_0_#191b23] space-y-4">
                    <h2 className="text-md font-bold uppercase tracking-tight">Berkas Laporan Terlampir</h2>
                    <div className="grid gap-3 grid-cols-3 text-xs font-bold">
                      <div className="flex items-center gap-2 p-2 bg-slate-50 border-2 border-[#191b23] rounded-lg">
                        <Icon className="text-red-500">picture_as_pdf</Icon>
                        <div className="truncate text-[10px]">{db.klaim.logbookFile}</div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-slate-50 border-2 border-[#191b23] rounded-lg">
                        <Icon className="text-blue-500">picture_as_pdf</Icon>
                        <div className="truncate text-[10px]">{db.klaim.laporanFile}</div>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-slate-50 border-2 border-[#191b23] rounded-lg">
                        <Icon className="text-green-600">workspace_premium</Icon>
                        <div className="truncate text-[10px]">{db.klaim.sertifikatFile}</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border-[3px] border-[#191b23] bg-white p-6 shadow-[6px_6px_0_#191b23] space-y-4">
                    <h2 className="text-md font-bold uppercase tracking-tight">Detail Uraian Klaim CPMK</h2>
                    <div className="space-y-3">
                      {db.klaim.details.map((detail, idx) => {
                        const usulanDetail = db.usulan.details[detail.usulanDetailIndex]
                        const mk = masterMataKuliah.find(m => m.id === usulanDetail?.mkId)
                        const cpmk = mk?.cpmk.find(c => c.id === usulanDetail?.cpmkId)
                        return (
                          <div key={idx} className="rounded-xl border-2 border-[#191b23] bg-slate-50 p-4 text-xs font-bold">
                            <div className="text-[10px] font-black text-gray-400 uppercase">{mk?.kode} - {mk?.nama}</div>
                            <div className="text-slate-800 font-extrabold mt-0.5">{cpmk?.kode}: {cpmk?.deskripsi}</div>
                            <div className="mt-2 border-t border-slate-200 pt-2 font-mono text-[11px] text-slate-600 whitespace-pre-wrap font-medium">
                              <b>Uraian Bukti Mahasiswa:</b> <br />{detail.buktiAktivitasText}
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

          {/* ============================================================== */}
          {/* TAB 4: HASIL (KHS) */}
          {/* ============================================================== */}
          {activeTab === 'hasil' && (
            <div className="space-y-8 animate-fadeIn w-full">
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border-[3px] border-[#191b23] bg-white p-4 shadow-[4px_4px_0_#191b23] text-center">
                  <div className="text-[10px] font-black text-slate-400 uppercase">NILAI MITRA (70%)</div>
                  <div className="text-3xl font-black text-[#9f149f] mt-1">{db.penilaian.mitra.nilai || '0'}</div>
                  <div className="text-[9px] text-gray-500 italic mt-0.5">Submitted: {db.penilaian.mitra.submittedAt || '-'}</div>
                </div>
                <div className="rounded-xl border-[3px] border-[#191b23] bg-white p-4 shadow-[4px_4px_0_#191b23] text-center">
                  <div className="text-[10px] font-black text-slate-400 uppercase">NILAI DPL (30%)</div>
                  <div className="text-3xl font-black text-[#9f149f] mt-1">{db.penilaian.dpl.nilaiAkademik || '0'}</div>
                  <div className="text-[9px] text-gray-500 italic mt-0.5">Submitted: {db.penilaian.dpl.submittedAt || '-'}</div>
                </div>
                <div className="relative rounded-xl border-[3px] border-[#191b23] bg-[#9f149f] p-4 shadow-[4px_4px_0_#191b23] text-center text-white flex flex-col justify-center items-center overflow-hidden">
                  <div className="text-[10px] font-black text-white/70 uppercase">NILAI AKHIR SINKRONISASI</div>
                  <div className="text-4xl font-black">{summary.finalScore}</div>
                  <span className="absolute -bottom-1 -right-1 bg-yellow-300 text-slate-900 border border-[#191b23] px-2 py-0.5 text-[10px] font-black rounded-tl-lg">
                    GRADE: {summary.gradeLetter}
                  </span>
                </div>
              </div>

              {/* Printable KHS Certificate card */}
              <div className="rounded-2xl border-[3px] border-[#191b23] bg-white p-6 md:p-8 shadow-[8px_8px_0_#191b23] space-y-6 print:border-none print:shadow-none">
                
                <div className="text-center space-y-2 border-b-4 border-[#191b23] pb-5">
                  <div className="text-lg font-bold flex items-center justify-center gap-2">
                    <span className="bg-[#9f149f] border border-[#191b23] text-white p-1 rounded-full"><Icon className="text-xs">school</Icon></span>
                    UNIVERSITAS AMIKOM YOGYAKARTA
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight">KARTU HASIL SINKRONISASI KONVERSI NILAI OBE</h2>
                  <p className="text-[10px] font-mono text-gray-400">ID Sertifikat Hash: 25116577-003-8A2D</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 text-xs font-bold">
                  <div className="space-y-1"><span className="text-gray-400">NAMA:</span> {profileForm.nama}</div>
                  <div className="space-y-1"><span className="text-gray-400">NIM:</span> {profileForm.nim}</div>
                  <div className="space-y-1"><span className="text-gray-400">MITRA:</span> {db.magang.mitraNama}</div>
                  <div className="space-y-1"><span className="text-gray-400">DPL:</span> {db.magang.dpl?.name || db.magang.dplNama || 'Belum ditugaskan'}</div>
                  <div className="space-y-1"><span className="text-gray-400">PERIODE:</span> {db.magang.periodeMulai} s.d {db.magang.periodeSelesai}</div>
                </div>

                <div className="overflow-x-auto rounded-xl border-2 border-[#191b23]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b-2 border-[#191b23] text-[10px] font-black uppercase text-slate-700">
                        <th className="p-3">KODE MK</th>
                        <th className="p-3">NAMA MATA KULIAH</th>
                        <th className="p-3 text-center">SKS</th>
                        <th className="p-3 text-center">NILAI MITRA (70%)</th>
                        <th className="p-3 text-center">NILAI DPL (30%)</th>
                        <th className="p-3 text-center">NILAI AKHIR</th>
                        <th className="p-3 text-center">HURUF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.courses.map((course, idx) => (
                        <tr key={idx} className="border-b border-slate-100 last:border-0 text-xs font-bold">
                          <td className="p-3 font-mono text-[#9f149f]">{course.kode}</td>
                          <td className="p-3">
                            <div>{course.nama}</div>
                            <span className="text-[9px] text-gray-400 italic">Terpetakan ({course.cpmkCount} CPMK)</span>
                          </td>
                          <td className="p-3 text-center">{course.sks}</td>
                          <td className="p-3 text-center text-slate-400">{db.penilaian.mitra.nilai}</td>
                          <td className="p-3 text-center text-slate-400">{db.penilaian.dpl.nilaiAkademik}</td>
                          <td className="p-3 text-center font-black text-[#9f149f]">{summary.finalScore}</td>
                          <td className="p-3 text-center"><span className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-1.5 py-0.5 rounded font-black">{summary.gradeLetter}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap justify-between items-center bg-slate-50 border-2 border-[#191b23] p-4 rounded-xl text-xs font-bold">
                  <div>TOTAL SKS TERKONVERSI: <span className="text-[#9f149f] text-sm ml-1">{summary.totalSks} SKS</span></div>
                  <div>IPK KONVERSI: <span className="text-green-600 text-sm ml-1">{summary.gradeLetter === 'A' ? '4.00' : '3.50'}</span></div>
                </div>

                <div className="flex justify-center pt-4 print:hidden">
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 rounded-xl border-2 border-[#191b23] bg-[#9f149f] px-6 py-2.5 font-bold text-white shadow-[3px_3px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    <Icon className="text-md">print</Icon>
                    Cetak KHS Konversi (PDF)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: PROFILE FORM */}
          {/* ============================================================== */}
          {activeTab === 'profile' && (
            <div className="w-full space-y-8 animate-fadeIn">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Profile Avatar Card */}
                <div className="w-full md:w-72 shrink-0 space-y-6">
                  <div className="rounded-2xl border-[3px] border-[#191b23] bg-white p-6 shadow-[6px_6px_0_#191b23] text-center space-y-4">

                    <div className="relative mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-[#191b23] bg-purple-100 shadow-[3px_3px_0_#191b23]">
                      {profileForm.avatar ? <img src={profileForm.avatar} alt="Avatar profil" className="h-full w-full object-cover" /> : <Icon className="text-5xl text-[#9f149f]">account_circle</Icon>}
                    </div>
                    <div>
                      <h2 className="text-base font-bold">{profileForm.nama}</h2>
                      <p className="text-xs font-mono text-[#9f149f]">NIM: {profileForm.nim}</p>
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full border-2 border-[#191b23] bg-purple-50 text-[#9f149f] font-extrabold text-[9px] uppercase">
                      Semester {profileForm.semester} • {profileForm.jurusan}
                    </span>
                  </div>

                  {/* Change Password Form */}
                  <div className="rounded-2xl border-[3px] border-[#191b23] bg-white p-5 shadow-[6px_6px_0_#191b23] space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Ganti Password</h3>
                    <div className="space-y-3 text-xs font-bold">
                      <div className="space-y-1">
                        <label>Password Lama</label>
                        <input className="w-full rounded-lg border-2 border-[#191b23] p-2" type="password" placeholder="••••••••" />
                      </div>
                      <div className="space-y-1">
                        <label>Password Baru</label>
                        <input className="w-full rounded-lg border-2 border-[#191b23] p-2" type="password" placeholder="••••••••" />
                      </div>
                      <button type="button" onClick={() => showToast('Password berhasil diperbarui!')} className="w-full rounded-lg border-2 border-[#191b23] bg-[#191b23] text-white py-2 font-bold shadow-[2px_2px_0_#9f149f] hover:-translate-y-0.5">Update Password</button>
                    </div>
                  </div>
                </div>

                {/* Personal Information Form */}
                <div className="flex-1 rounded-2xl border-[3px] border-[#191b23] bg-white p-6 md:p-8 shadow-[6px_6px_0_#191b23] space-y-6">
                  <div>
                    <h2 className="text-md font-bold uppercase tracking-tight">Data Personal Mahasiswa</h2>
                    <p className="text-[10px] text-gray-400 mt-0.5">Lengkapi data profil Anda untuk sinkronisasi Siakad OBE.</p>
                  </div>
                  <div className="h-0.5 bg-slate-100 w-full" />
                  
                  <div className="mb-4 flex items-center gap-4">
                     {(avatarFile || profileForm.avatar) && <img src={avatarFile ? URL.createObjectURL(avatarFile) : profileForm.avatar} alt="Avatar profil" className="h-16 w-16 rounded-full border-2 border-[#191b23] object-cover" />}
                     <label className="cursor-pointer rounded-xl border-2 border-[#191b23] bg-white px-4 py-2 text-xs font-bold hover:bg-[#f3dff3]">Pilih Avatar<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} /></label>
                     {avatarFile && <span className="text-xs text-gray-500">{avatarFile.name}</span>}
                   </div>
                   <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs font-bold">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label>Nama Lengkap</label>
                        <input 
                          type="text" 
                          required
                          value={profileForm.nama}
                          onChange={(e) => setProfileForm({ ...profileForm, nama: e.target.value })}
                          className="w-full rounded-xl border-2 border-[#191b23] px-3 py-2.5 outline-none focus:shadow-[2px_2px_0_#9f149f]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label>NIM (Nomor Induk Mahasiswa)</label>
                        <input 
                          type="text" 
                           value={profileForm.nim}
                           onChange={(e) => setProfileForm({ ...profileForm, nim: e.target.value })}
                           className="w-full rounded-xl border-2 border-[#191b23] px-3 py-2.5 outline-none focus:shadow-[2px_2px_0_#9f149f]"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label>Email Akademik</label>
                        <input 
                           type="email" 
                           required
                           disabled
                           value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full rounded-xl border-2 border-[#191b23]/30 px-3 py-2.5 outline-none cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label>Nomor HP (WhatsApp)</label>
                        <input 
                          type="tel" 
                          required
                          value={profileForm.noHp}
                          onChange={(e) => setProfileForm({ ...profileForm, noHp: e.target.value })}
                          className="w-full rounded-xl border-2 border-[#191b23] px-3 py-2.5 outline-none focus:shadow-[2px_2px_0_#9f149f]"
                        />
                      </div>
                    </div>

<div className="grid gap-4 md:grid-cols-3">
                       <div className="space-y-1.5">
                         <label>Program Studi</label>
                        <input 
                          type="text" 
                          disabled
                          value={profileForm.jurusan}
                          className="w-full rounded-xl border-2 border-[#191b23]/30 bg-slate-50 px-3 py-2.5 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label>IPK</label>
                        <input
                          type="number"
                          min="0"
                          max="4"
                          step="0.01"
                          value={profileForm.ipk}
                          onChange={(e) => setProfileForm({ ...profileForm, ipk: e.target.value })}
                          className="w-full rounded-xl border-2 border-[#191b23] px-3 py-2.5 outline-none focus:shadow-[2px_2px_0_#9f149f]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label>Semester</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="14"
                          value={profileForm.semester}
                          onChange={(e) => setProfileForm({ ...profileForm, semester: e.target.value })}
                          className="w-full rounded-xl border-2 border-[#191b23] px-3 py-2.5 outline-none focus:shadow-[2px_2px_0_#9f149f]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label>Alamat Rumah</label>
                      <textarea 
                        rows="2" 
                        required
                        value={profileForm.alamat}
                        onChange={(e) => setProfileForm({ ...profileForm, alamat: e.target.value })}
                        className="w-full resize-none rounded-xl border-2 border-[#191b23] px-3 py-2.5 outline-none focus:shadow-[2px_2px_0_#9f149f]"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full rounded-xl border-2 border-[#191b23] bg-[#9f149f] py-3 text-white font-bold shadow-[4px_4px_0_#191b23] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                    >
                      Simpan Perubahan Profil
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  )
}

export default StudentDashboard
