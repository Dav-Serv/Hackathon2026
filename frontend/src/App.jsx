import { useState } from 'react'

const icons = {
  logo: 'grading',
  problems: ['inventory_2', 'timer_off', 'visibility_off'],
  features: ['cloud_upload', 'fact_check', 'query_stats', 'account_tree'],
  steps: ['person', 'school', 'apartment', 'admin_panel_settings', 'done_all'],
}

const problems = [
  ['Administrasi Rumit', 'Tumpukan berkas fisik dan formulir manual yang memakan ruang dan tenaga tim akademik.', 'inventory_2', 'bg-[#ffdad6] text-[#93000a] rotate-[-3deg]'],
  ['Proses Lambat', 'Waktu tunggu verifikasi yang tidak menentu menghambat kelulusan dan KRS mahasiswa.', 'timer_off', 'bg-[#64a8fe] text-[#003c70] rotate-[3deg]'],
  ['Transparansi Minim', 'Mahasiswa kesulitan memantau status pengajuan konversi mereka secara real-time.', 'visibility_off', 'bg-[#d5e4f8] text-[#3a4858] rotate-[-2deg]'],
]

const features = [
  ['Pengajuan Mandiri', 'Mahasiswa mengunggah logbook dan sertifikat magang secara digital melalui dashboard personal.', 'cloud_upload'],
  ['Verifikasi Instan', 'Dosen pembimbing melakukan review dan validasi kompetensi hanya dengan beberapa klik.', 'fact_check'],
  ['Penilaian OBE', 'Penilaian berdasarkan Capaian Pembelajaran Lulusan (CPL) yang terukur secara sistematis.', 'query_stats'],
  ['Konversi Nilai', 'Automasi pemetaan mata kuliah pilihan berdasarkan beban SKS magang yang telah divalidasi.', 'account_tree'],
]

const steps = [
  ['MAHASISWA', 'Submit Berkas & Logbook', 'person'],
  ['DOSEN', 'Validasi & Penilaian', 'school'],
  ['MITRA INDUSTRI', 'Feedback Kompetensi', 'apartment'],
  ['ADMIN', 'Verifikasi Kelayakan', 'admin_panel_settings'],
  ['KONVERSI NILAI', 'Nilai Masuk KHS', 'done_all'],
]

function Icon({ children, className = '' }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>
}

function LoginPage({ onBack }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleSubmit = (event) => {
    event.preventDefault()
    setIsLoading(true)
    window.setTimeout(() => setIsLoading(false), 2000)
  }

  const handleMouseMove = (event) => {
    if (window.innerWidth < 768) return
    setTilt({
      x: (window.innerWidth / 2 - event.clientX) / 80,
      y: (window.innerHeight / 2 - event.clientY) / 80,
    })
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#faf8ff] px-5 py-16 font-['Space_Grotesk',sans-serif] text-[#191b23]" onMouseMove={handleMouseMove}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg className="absolute left-10 top-10 h-32 w-32 text-[#004ac6] opacity-20" viewBox="0 0 100 100"><path d="M0 50 Q25 0 50 50 T100 50" fill="none" stroke="currentColor" strokeDasharray="8 4" strokeWidth="4" /></svg>
        <svg className="absolute bottom-20 right-10 h-24 w-48 text-[#0060ac] opacity-20" viewBox="0 0 200 100"><path d="M10 90 L50 10 L90 90 L130 10 L170 90" fill="none" stroke="currentColor" strokeDasharray="12 6" strokeWidth="6" /></svg>
        <Icon className="absolute right-[10%] top-[15%] rotate-12 text-8xl opacity-20">school</Icon>
        <Icon className="absolute bottom-[20%] left-[5%] -rotate-12 text-7xl opacity-20">auto_stories</Icon>
        <div className="absolute left-12 top-1/4 flex h-24 w-24 rotate-[-5deg] items-center justify-center border-2 border-[#191b23] bg-[#64a8fe] p-2 text-center text-xs font-bold opacity-40 shadow-[4px_4px_0_#191b23]">OBE READY?</div>
        <div className="absolute bottom-1/3 right-16 flex h-20 w-20 rotate-[8deg] items-center justify-center border-2 border-[#191b23] bg-[#dbe1ff] p-2 text-center text-xs font-bold opacity-40 shadow-[4px_4px_0_#191b23]">SYNC IT</div>
      </div>

      <div className="relative z-10 w-full max-w-md" style={{ perspective: '1000px' }}>
        <div className="rounded-xl border-4 border-[#191b23] bg-white p-8 shadow-[12px_12px_0_#191b23] transition-transform duration-300" style={{ transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` }}>
          <button type="button" onClick={onBack} className="mb-6 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#004ac6] hover:underline"><Icon className="text-base">arrow_back</Icon> Kembali</button>
          <div className="mb-8"><h1 className="mb-2 text-4xl font-bold">OBE GradeSync</h1><p className="leading-relaxed text-[#434655]">Tingkatkan perjalanan akademik Anda dengan sinkronisasi presisi.</p></div>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-bold uppercase tracking-wider">Email atau NIM
              <div className="relative"><input required value={identifier} onChange={(event) => setIdentifier(event.target.value)} className="w-full border-[3px] border-[#191b23] bg-white p-4 pr-12 outline-none transition focus:border-[#004ac6] focus:shadow-[4px_4px_0_#2563eb]" placeholder="mhs.12345@univ.ac.id" type="text" /><Icon className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737686]">alternate_email</Icon></div>
            </label>
            <label className="flex flex-col gap-2 text-sm font-bold uppercase tracking-wider">Kata Sandi
              <div className="relative"><input required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border-[3px] border-[#191b23] bg-white p-4 pr-24 outline-none transition focus:border-[#004ac6] focus:shadow-[4px_4px_0_#2563eb]" placeholder="••••••••" type={showPassword ? 'text' : 'password'} /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#004ac6]">{showPassword ? 'SEMBUNYIKAN' : 'LIHAT'}</button></div>
            </label>
            <div className="flex justify-end"><button type="button" className="text-xs font-bold uppercase text-[#004ac6] hover:underline">Lupa?</button></div>
            <button disabled={isLoading} className="group flex items-center justify-center gap-2 border-[3px] border-[#191b23] bg-[#004ac6] px-8 py-4 text-xl font-semibold text-white shadow-[8px_8px_0_#191b23] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_#191b23] disabled:cursor-wait disabled:opacity-80" type="submit">{isLoading ? <><span className="h-6 w-6 animate-spin rounded-full border-4 border-white/30 border-t-white" /> MEMPROSES...</> : <>MASUK <Icon className="transition-transform group-hover:translate-x-1">arrow_forward</Icon></>}</button>
          </form>
          <div className="mt-10 flex flex-col items-center gap-4 border-t-[3px] border-[#191b23] pt-6"><p className="text-[#434655]">Belum punya akun? <button type="button" onClick={onBack} className="ml-1 font-bold text-[#004ac6] hover:underline">DAFTAR</button></p><div className="flex gap-4"><button type="button" aria-label="Google" className="border-2 border-[#191b23] p-3 hover:bg-[#e7e7f3]"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#191b23] text-xs font-bold text-white">G</span></button><button type="button" aria-label="Hub" className="border-2 border-[#191b23] p-3 hover:bg-[#e7e7f3]"><Icon className="flex h-6 w-6 items-center justify-center rounded-full bg-[#191b23] text-base text-white">hub</Icon></button></div></div>
        </div>
        <div className="mt-4 flex justify-between px-4 text-[10px] font-bold uppercase tracking-widest text-[#737686]"><span>[ Status Sistem: Optimal ]</span><span>v2.4.0_stable</span></div>
      </div>
    </main>
  )
}

function App() {
  const [selectedStage, setSelectedStage] = useState(null)
  const [page, setPage] = useState('landing')

  if (page === 'login') return <LoginPage onBack={() => setPage('landing')} />

  const stageClass = (stage) => `absolute z-20 cursor-pointer opacity-60 transition duration-300 hover:z-50 hover:scale-110 hover:opacity-100 ${selectedStage === stage ? 'z-50 !opacity-100 !border-[#004ac6] shadow-[0_0_20px_rgba(0,74,198,.4),12px_12px_0_#191b23]' : ''}`

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#faf8ff] font-['Space_Grotesk',sans-serif] text-[#191b23] [background-image:radial-gradient(#e1e2ed_1px,transparent_1px)] [background-size:24px_24px]">
      <header className="fixed left-0 top-8 z-50 flex w-full justify-center px-4">
        <nav className="flex h-14 items-center gap-5 rounded-full border-2 border-[#191b23]/10 bg-white/80 px-4 shadow-xl backdrop-blur-md transition hover:border-[#191b23]/30 sm:gap-8 sm:px-6">
          <a href="#beranda" className="group flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#191b23] bg-[#004ac6] text-white transition group-hover:scale-110"><Icon className="text-[14px]">{icons.logo}</Icon></span>
            <span className="text-[11px] font-bold uppercase tracking-[.18em]">GradeFlow</span>
          </a>
          <div className="hidden items-center gap-1 md:flex">
            <a href="#beranda" className="rounded-full border-2 border-[#191b23] bg-[#004ac6] px-4 py-1.5 text-xs font-bold text-white shadow-[3px_3px_0_#191b23]">Beranda</a>
            <a href="#fitur" className="rounded-full px-4 py-1.5 text-xs font-bold hover:bg-[#e7e7f3]">Fitur</a>
            <a href="#alur" className="rounded-full px-4 py-1.5 text-xs font-bold hover:bg-[#e7e7f3]">Alur</a>
          </div>
          <button type="button" onClick={() => setPage('login')} className="rounded-full bg-[#191b23] px-4 py-1.5 text-xs font-bold text-white transition hover:bg-[#004ac6] sm:px-5">Login</button>
        </nav>
      </header>

      <main>
        <section id="beranda" className="journey-map-bg relative flex min-h-[860px] items-center justify-center overflow-hidden border-b-4 border-[#191b23] px-5 py-36 md:px-16">
          <div className="pointer-events-none absolute inset-0 opacity-10"><svg className="h-full w-full" viewBox="0 0 1440 900" fill="none"><path d="M250 220Q400 200 550 280M850 250Q1050 280 1150 450M1150 600Q1100 750 850 780M550 780Q350 780 250 650" stroke="#191b23" strokeDasharray="8 8" strokeWidth="3" /></svg></div>
          <div onClick={() => setSelectedStage('submit')} className={`${stageClass('submit')} animate-float left-[4%] top-[130px] rotate-[-5deg] md:left-[8%]`}><div className="w-48 border-[3px] border-[#191b23] bg-yellow-200 p-4 shadow-[6px_6px_0_#191b23]"><h4 className="text-xs font-bold uppercase">Step 01</h4><p className="mt-1 text-base font-semibold leading-tight">Pengajuan Magang</p><div className="mt-4 flex items-center gap-2 border-t-2 border-[#191b23]/20 pt-2 text-[10px] font-bold"><Icon className="text-xs text-green-600">check_circle</Icon> Uploaded</div></div></div>
          <div onClick={() => setSelectedStage('dosen')} className={`${stageClass('dosen')} animate-float-delayed right-[4%] top-[150px] rotate-[3deg] md:right-[8%]`}><div className="relative w-56 border-4 border-[#191b23] bg-white p-6 shadow-[8px_8px_0_#2563eb]"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#191b23] bg-[#2563eb] text-white"><Icon>how_to_reg</Icon></div><p className="text-lg font-semibold leading-tight">Validasi Dosen</p><span className="acc-stamp absolute -bottom-4 -right-2">Approved</span></div></div>
          <div onClick={() => setSelectedStage('industri')} className={`${stageClass('industri')} animate-float bottom-[170px] right-[2%] rotate-[-2deg] md:right-[5%]`}><div className="relative w-44 border-4 border-[#191b23] bg-white p-4 pb-12 shadow-[10px_10px_0_#191b23]"><img className="mb-3 aspect-square w-full border-2 border-[#191b23] object-cover grayscale contrast-125" alt="Worksite" src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=400&q=80" /><p className="text-center text-[11px] font-bold">Penilaian Industri</p><span className="absolute bottom-4 right-4 font-bold text-xl text-[#004ac6]">A</span></div></div>
          <div onClick={() => setSelectedStage('admin')} className={`${stageClass('admin')} animate-float-reverse bottom-[150px] left-[2%] rotate-[4deg] md:left-[5%]`}><div className="w-60 border-[3px] border-[#191b23] bg-blue-600 p-5 text-white shadow-[8px_8px_0_#191b23]"><div className="mb-4 flex justify-between text-[10px] font-bold uppercase opacity-70">Verification System <Icon className="text-lg">verified_user</Icon></div><h4 className="mb-3 text-lg font-semibold">Verifikasi Admin</h4><div className="space-y-2"><div className="h-1 bg-white/20" /><div className="h-1 w-4/5 bg-white/20" /><div className="h-1 w-[95%] bg-white/60" /></div><div className="mt-4 flex items-center gap-2 text-[10px] font-bold"><i className="h-2 w-2 animate-pulse rounded-full bg-green-400" /> READY TO CONVERT</div></div></div>
          <div className="relative z-40 flex w-full max-w-4xl flex-col items-center text-center"><span className="mb-8 rotate-[-1deg] rounded-full border-[3px] border-[#191b23] bg-[#64a8fe] px-5 py-2 text-xs font-bold uppercase tracking-[.18em] shadow-[4px_4px_0_#191b23]">OBE STANDARD 2.0 READY</span><h1 className="text-[42px] font-bold uppercase leading-[.92] tracking-tighter md:text-[76px]">Permudah Konversi<br /><span className="inline-block rotate-1 bg-[#dbe1ff] px-4 text-[#004ac6]">Nilai Magang</span><br />Berbasis OBE.</h1><p className="mt-8 max-w-xl border-l-4 border-[#004ac6] bg-white/60 p-4 text-lg leading-relaxed text-[#434655] backdrop-blur-sm">Platform eksklusif Universitas AMIKOM Yogyakarta untuk efisiensi pengajuan, verifikasi, dan otomasi pemetaan mata kuliah pilihan secara visual.</p><div className="relative mt-10 flex flex-col gap-5 rounded-[28px] border-4 border-[#191b23] bg-[#ededf9] p-7 shadow-[12px_12px_0_#191b23] sm:flex-row"><span className="absolute -top-5 left-7 border-[3px] border-[#191b23] bg-[#004ac6] px-4 py-1 text-xs font-bold uppercase tracking-widest text-white">Konversi Nilai</span><a href="#daftar" className="flex items-center justify-center gap-3 rounded-2xl border-4 border-[#191b23] bg-[#004ac6] px-8 py-4 text-lg font-bold text-white shadow-[6px_6px_0_#191b23] transition hover:-translate-x-1 hover:-translate-y-1">MULAI SEKARANG <Icon>trending_flat</Icon></a><a href="#fitur" className="rounded-2xl border-4 border-[#191b23] bg-white px-8 py-4 text-lg font-bold shadow-[6px_6px_0_#191b23] transition hover:-translate-x-1 hover:-translate-y-1">LIHAT DEMO</a></div></div>
        </section>

        <section className="bg-[#f3f3fe] px-5 py-20 md:px-16"><div className="mx-auto max-w-7xl"><div className="mb-14 flex items-end gap-8"><div><span className="text-xs font-bold uppercase tracking-widest text-[#004ac6]">// IDENTIFIKASI MASALAH</span><h2 className="mt-2 text-3xl font-bold uppercase md:text-5xl">Kendala Konversi<br />Nilai Saat Ini</h2></div><div className="mb-4 hidden h-1 flex-grow bg-[#191b23] md:block" /></div><div className="grid gap-8 md:grid-cols-3">{problems.map(([title, text, icon, color]) => <article key={title} className="group rounded-2xl border-4 border-[#191b23] bg-white p-8 shadow-[8px_8px_0_#191b23] transition hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[16px_16px_0_#004ac6]"><div className={`mb-6 flex h-16 w-16 items-center justify-center border-[3px] border-[#191b23] transition group-hover:rotate-0 ${color}`}><Icon className="text-[40px]">{icon}</Icon></div><h3 className="mb-4 text-2xl font-semibold uppercase">{title}</h3><p className="leading-relaxed text-[#434655]">{text}</p></article>)}</div></div></section>

        <section className="bg-[#191b23] px-5 py-20 text-white md:px-16"><div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2"><div className="order-2 lg:order-1"><div className="relative"><div className="absolute -left-4 -top-4 h-full w-full rounded-2xl border-4 border-white bg-[#004ac6]" /><img alt="Dashboard visualization" className="relative z-10 w-full rounded-2xl border-4 border-white shadow-[20px_20px_0_rgba(0,74,198,.3)]" src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80" /></div></div><div className="order-1 flex flex-col gap-6 lg:order-2"><span className="text-xs font-bold uppercase tracking-widest text-[#a4c9ff]">Solusi Terintegrasi</span><h2 className="text-4xl font-bold leading-tight md:text-6xl">Satu Pintu Untuk<br /><span className="text-[#64a8fe]">Masa Depan Akademik.</span></h2><p className="text-lg leading-relaxed text-[#e1e2ed]">Sistem GradeFlow mengotomatisasi alur kerja konversi nilai dengan prinsip <strong>Outcome-Based Education (OBE)</strong>. Kami memangkas birokrasi dan menghadirkan transparansi penuh bagi civitas akademika.</p><ul className="mt-2 space-y-4 text-sm font-bold">{['Pemetaan CPL Otomatis', 'Digital Signature Verifikasi', 'Sinkronisasi Data Siakad'].map((item) => <li key={item} className="flex items-center gap-4"><Icon className="text-[#b4c5ff]">check_circle</Icon>{item}</li>)}</ul></div></div></section>

        <section id="fitur" className="bg-[#faf8ff] px-5 py-20 md:px-16"><div className="mx-auto max-w-7xl"><div className="mb-14 text-center"><h2 className="text-4xl font-bold md:text-6xl">Fitur Utama</h2><div className="mx-auto mt-6 h-2 w-32 border-2 border-[#191b23] bg-[#004ac6]" /></div><div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{features.map(([title, text, icon], index) => <article key={title} className={`flex flex-col rounded-2xl border-4 border-[#191b23] p-8 shadow-[8px_8px_0_#191b23] transition hover:-translate-y-2 ${index === 2 ? 'bg-[#004ac6] text-white' : 'bg-white'}`}><span className={`mb-4 text-5xl font-bold leading-none ${index === 2 ? 'text-white/20' : 'text-[#004ac6]/20'}`}>0{index + 1}</span><h3 className="mb-2 text-2xl font-semibold">{title}</h3><p className={`flex-grow leading-relaxed ${index === 2 ? 'text-white/80' : 'text-[#434655]'}`}>{text}</p><Icon className={`mt-6 text-3xl ${index === 2 ? 'text-white' : 'text-[#004ac6]'}`}>{icon}</Icon></article>)}<article className="flex flex-col rounded-2xl border-4 border-[#191b23] bg-white p-8 shadow-[8px_8px_0_#191b23] transition hover:-translate-y-2 lg:col-span-2"><span className="mb-4 text-5xl font-bold leading-none text-[#004ac6]/20">05</span><div className="flex h-full flex-col items-center gap-8 md:flex-row"><div className="flex-grow"><h3 className="mb-2 text-2xl font-semibold">Monitoring Progres</h3><p className="leading-relaxed text-[#434655]">Pantau grafik capaian magang seluruh mahasiswa secara real-time untuk kebutuhan akreditasi program studi.</p></div><div className="flex h-32 w-full items-center border-[3px] border-[#191b23] bg-[#64a8fe] p-4 md:w-48"><div className="h-4 w-full overflow-hidden rounded-full bg-[#191b23]/20"><div className="h-full w-3/4 bg-[#004ac6]" /></div></div></div></article></div></div></section>

        <section id="alur" className="bg-[#e1e2ed] px-5 py-20 md:px-16"><div className="mx-auto max-w-7xl"><h2 className="mb-14 text-center text-3xl font-bold uppercase italic md:text-5xl">Alur Sistem Konversi</h2><div className="relative flex flex-col items-center justify-between gap-8 md:flex-row"><div className="absolute left-0 top-10 hidden w-full border-t-4 border-dashed border-[#191b23] md:block" />{steps.map(([title, text, icon], index) => <div key={title} className="relative z-10 flex w-full flex-col items-center text-center md:w-1/5"><div className={`mb-5 flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#191b23] shadow-[4px_4px_0_#191b23] ${index === 4 ? 'bg-[#2563eb] text-white' : 'bg-white'} transition hover:bg-[#004ac6] hover:text-white`}><Icon className="text-3xl">{icon}</Icon></div><div className={`rounded-lg border-[3px] border-[#191b23] p-4 shadow-[4px_4px_0_#191b23] ${index === 4 ? 'bg-[#004ac6] text-white' : 'bg-white'}`}><h4 className="text-xs font-bold tracking-wide">{title}</h4><p className="mt-2 text-xs opacity-70">{text}</p></div></div>)}</div></div></section>

        <section id="daftar" className="flex items-center justify-center bg-[#004ac6] px-5 py-24 md:px-16"><div className="relative w-full max-w-4xl overflow-hidden rounded-[36px] border-[6px] border-[#191b23] bg-white p-10 text-center shadow-[16px_16px_0_#191b23] md:p-20"><div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-4 border-[#191b23] bg-[#64a8fe] opacity-50" /><div className="relative z-10"><h2 className="text-4xl font-bold md:text-6xl">Siap Mengelola Konversi Nilai Secara Digital?</h2><p className="mx-auto mb-10 mt-6 max-w-2xl text-lg leading-relaxed text-[#434655]">Bergabunglah dengan ratusan mahasiswa AMIKOM lainnya yang telah merasakan kemudahan konversi nilai berbasis OBE.</p><div className="flex flex-col justify-center gap-5 sm:flex-row"><button type="button" onClick={() => setPage('login')} className="rounded-full border-4 border-[#191b23] bg-[#004ac6] px-10 py-4 text-lg font-bold text-white shadow-[8px_8px_0_#191b23] transition hover:-translate-x-1 hover:-translate-y-1">DAFTAR SEKARANG</button><button type="button" className="rounded-full border-4 border-[#191b23] bg-[#faf8ff] px-10 py-4 text-lg font-bold shadow-[8px_8px_0_#191b23] transition hover:-translate-x-1 hover:-translate-y-1">HUBUNGI KAMI</button></div></div></div></section>
      </main>

      <footer className="border-t-4 border-[#191b23] bg-[#ededf9] px-5 py-16 md:px-16"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row"><div className="max-w-md"><div className="mb-5 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#191b23] bg-[#004ac6] text-white"><Icon>school</Icon></span><span className="text-2xl font-semibold">GradeFlow OBE</span></div><p className="leading-relaxed text-[#434655]">Platform manajemen Outcome-Based Education terpadu untuk efisiensi penilaian akademik dan pelaporan capaian lulusan secara presisi.</p></div><div className="grid grid-cols-2 gap-10"><div className="flex flex-col gap-3"><b className="text-xs uppercase tracking-widest">Kontak</b><a className="text-[#434655] hover:text-[#004ac6]" href="mailto:info@amikom.ac.id">info@amikom.ac.id</a><a className="text-[#434655] hover:text-[#004ac6]" href="tel:+62274884201">+62 274 884201</a></div><div className="flex flex-col gap-3"><b className="text-xs uppercase tracking-widest">Alamat</b><span className="text-[#434655]">Jl. Ring Road Utara,<br />Condongcatur, Yogyakarta 55283</span></div></div></div><div className="mx-auto mt-12 flex max-w-7xl flex-col justify-between gap-4 border-t-2 border-[#191b23]/20 pt-5 text-sm text-[#434655] md:flex-row"><span>© 2024 Universitas AMIKOM Yogyakarta. All rights reserved.</span><div className="flex gap-5"><a href="#daftar">Privacy Policy</a><a href="#daftar">Terms of Service</a></div></div></footer>
    </div>
  )
}

export default App
