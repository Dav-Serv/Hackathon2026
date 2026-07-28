import { useState } from 'react'
import api, { getApiError } from './lib/api'
import CursorGrid from './components/CursorGrid'

function Icon({ children, className = '' }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>
}


function RegisterMahasiswa({ onBack, onLogin, onRegisterSuccess }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const name = formData.get('namaLengkap')
    const nim_nip = formData.get('nimNip')
    const no_hp = formData.get('nomorHp')
    const email = formData.get('email')
    const alamat = formData.get('alamat')
    const password = formData.get('password')
    const password_confirmation = formData.get('konfirmasiPassword')

    if (password !== password_confirmation) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.')
      setIsLoading(false)
      return
    }

    api.post('/register', {
      name,
      nim_nip,
      no_hp,
      alamat,
      email,
      password,
      password_confirmation
    })
      .then(({ data }) => {
        localStorage.setItem('auth_token', data.access_token)
        if (onRegisterSuccess) {
          onRegisterSuccess(data.user)
        }
      })
      .catch((error) => {
        setErrorMessage(getApiError(error))
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#faf8ff] p-4 font-['Space_Grotesk',sans-serif] text-[#191b23] md:p-8">
      <div className="pointer-events-auto absolute inset-0 z-0 opacity-70" aria-hidden="true">
        <CursorGrid
          cellSize={70}
          color="#a862a8"
          radius={140}
          falloff="smooth"
          holdTime={400}
          fadeDuration={800}
          lineWidth={1.2}
          maxOpacity={1}
          fillOpacity={0}
          gridOpacity={0.08}
          cellRadius={0}
          clickPulse
          pulseSpeed={600}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg className="absolute left-10 top-10 h-32 w-32 text-[#9f149f] opacity-20" viewBox="0 0 100 100"><path d="M0 50 Q25 0 50 50 T100 50" fill="none" stroke="currentColor" strokeDasharray="8 4" strokeWidth="4" /></svg>
        <svg className="absolute bottom-20 right-10 h-24 w-48 text-[#a862a8] opacity-25" viewBox="0 0 200 100"><path d="M10 90 L50 10 L90 90 L130 10 L170 90" fill="none" stroke="currentColor" strokeDasharray="12 6" strokeWidth="6" /></svg>
        <Icon className="absolute right-[10%] top-[15%] rotate-12 text-8xl opacity-20">school</Icon>
        <Icon className="absolute bottom-[20%] left-[5%] -rotate-12 text-7xl opacity-20">auto_stories</Icon>
        <div className="absolute left-12 top-1/4 flex h-24 w-24 rotate-[-5deg] items-center justify-center border-2 border-[#191b23] bg-[#a862a8] p-2 text-center text-xs font-bold opacity-40 shadow-[4px_4px_0_#191b23]">OBE READY?</div>
        <div className="absolute bottom-1/3 right-16 flex h-20 w-20 rotate-[8deg] items-center justify-center border-2 border-[#191b23] bg-[#f3dff3] p-2 text-center text-xs font-bold opacity-50 shadow-[4px_4px_0_#191b23]">SYNC IT</div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="overflow-hidden rounded-[32px] border-[4px] border-[#191b23] bg-[#faf8ff] shadow-[8px_8px_0_#191b23]">
          <div className="flex flex-col gap-6 p-8 pb-0">
            <div>
              <button
                className="inline-flex items-center gap-2 rounded-lg border-[2px] border-[#191b23] bg-[#faf8ff] px-3 py-1.5 text-xs font-bold tracking-[0.05em] shadow-[3px_3px_0_#191b23] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_#191b23] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                onClick={onBack}
                type="button"
              >
                <Icon className="text-base">arrow_back</Icon>
                <span>Kembali ke Beranda</span>
              </button>
            </div>

            <div>
              <h1 className="mb-2 text-4xl font-bold leading-tight md:text-[40px] md:leading-tight">
                Registrasi Mahasiswa
              </h1>
              <p className="text-base leading-[1.6] text-[#434655]">
                Lengkapi data diri Anda untuk memulai perjalanan akademik di OBE Informatics.
              </p>
            </div>
          </div>

          <div className="p-8 pt-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="ml-1 block text-sm font-bold tracking-[0.05em]" htmlFor="nama-lengkap">
                   Nama Lengkap
                </label>
                <input
                  required
                  className="w-full rounded-xl border-[3px] border-[#191b23] bg-white px-4 py-3 text-base leading-[1.6] outline-none transition-all placeholder:text-[#737686]/50 focus:shadow-[4px_4px_0_#a862a8]"
                  id="nama-lengkap"
                  name="namaLengkap"
                  placeholder="Masukkan nama lengkap Anda"
                  type="text"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="ml-1 block text-sm font-bold tracking-[0.05em]" htmlFor="nim-nip">
                    NIM/NIP
                  </label>
                  <input
                    required
                    className="w-full rounded-xl border-[3px] border-[#191b23] bg-white px-4 py-3 text-base leading-[1.6] outline-none transition-all placeholder:text-[#737686]/50 focus:shadow-[4px_4px_0_#a862a8]"
                    id="nim-nip"
                    name="nimNip"
                    placeholder="Nomor Induk"
                    type="text"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="ml-1 block text-sm font-bold tracking-[0.05em]" htmlFor="nomor-hp">
                    Nomor HP
                  </label>
                  <input
                    required
                    className="w-full rounded-xl border-[3px] border-[#191b23] bg-white px-4 py-3 text-base leading-[1.6] outline-none transition-all placeholder:text-[#737686]/50 focus:shadow-[4px_4px_0_#a862a8]"
                    id="nomor-hp"
                    name="nomorHp"
                    placeholder="0812xxxx"
                    type="tel"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="ml-1 block text-sm font-bold tracking-[0.05em]" htmlFor="email">
                  Email
                </label>
                <input
                  required
                  className="w-full rounded-xl border-[3px] border-[#191b23] bg-white px-4 py-3 text-base leading-[1.6] outline-none transition-all placeholder:text-[#737686]/50 focus:shadow-[4px_4px_0_#a862a8]"
                  id="email"
                  name="email"
                  placeholder="nama@email.com"
                  type="email"
                />
              </div>

              <div className="space-y-1.5">
                <label className="ml-1 block text-sm font-bold tracking-[0.05em]" htmlFor="alamat">
                  Alamat
                </label>
                <textarea
                  required
                  className="w-full resize-none rounded-xl border-[3px] border-[#191b23] bg-white px-4 py-3 text-base leading-[1.6] outline-none transition-all placeholder:text-[#737686]/50 focus:shadow-[4px_4px_0_#a862a8]"
                  id="alamat"
                  name="alamat"
                  placeholder="Masukkan alamat lengkap"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="ml-1 block text-sm font-bold tracking-[0.05em]" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      required
                      minLength={6}
                      className="w-full rounded-xl border-[3px] border-[#191b23] bg-white pl-4 pr-12 py-3 text-base leading-[1.6] outline-none transition-all placeholder:text-[#737686]/50 focus:shadow-[4px_4px_0_#a862a8]"
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#737686] hover:text-[#9f149f] transition-colors"
                    >
                      <Icon className="text-xl">{showPassword ? 'visibility_off' : 'visibility'}</Icon>
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="ml-1 block text-sm font-bold tracking-[0.05em]" htmlFor="konfirmasi-password">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      required
                      minLength={6}
                      className="w-full rounded-xl border-[3px] border-[#191b23] bg-white pl-4 pr-12 py-3 text-base leading-[1.6] outline-none transition-all placeholder:text-[#737686]/50 focus:shadow-[4px_4px_0_#a862a8]"
                      id="konfirmasi-password"
                      name="konfirmasiPassword"
                      placeholder="••••••••"
                      type={showConfirmPassword ? 'text' : 'password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#737686] hover:text-[#9f149f] transition-colors"
                    >
                      <Icon className="text-xl">{showConfirmPassword ? 'visibility_off' : 'visibility'}</Icon>
                    </button>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <p role="alert" className="border-2 border-[#ba1a1a] bg-[#ffdad6] p-3 text-sm font-semibold text-[#93000a]">
                  {errorMessage}
                </p>
              )}

              <button
                disabled={isLoading}
                className="mt-2 w-full rounded-2xl border-[3px] border-[#191b23] bg-[#9f149f] py-4 text-xl font-semibold text-white shadow-[6px_6px_0_#191b23] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#861086] hover:shadow-[10px_10px_0_#191b23] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-wait disabled:opacity-85"
                type="submit"
              >
                {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
              </button>
            </form>

            <div className="mt-8 pb-2 text-center">
              <p className="text-base leading-[1.6] text-[#434655]">
                Sudah punya akun?{' '}
                <button
                  className="font-bold text-[#9f149f] underline decoration-2 underline-offset-4 transition-colors hover:text-[#191b23]"
                  onClick={onLogin}
                  type="button"
                >
                  Masuk di sini
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between px-4 text-[10px] font-bold uppercase tracking-widest text-[#737686]">
          <span>[ Status Sistem: Optimal ]</span>
          <span>v2.4.0_stable</span>
        </div>
      </div>
    </main>
  )
}

export default RegisterMahasiswa
