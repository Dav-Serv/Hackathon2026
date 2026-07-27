import { useState } from 'react'
import api, { getApiError } from '../lib/api'

function Icon({ children, className = '' }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>
}

function RegisterMahasiswa({ onBack, onLogin }) {
  const [form, setForm] = useState({
    name: '',
    nim_nip: '',
    no_hp: '',
    email: '',
    alamat: '',
    password: '',
    password_confirmation: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)
    api.post('/register', form)
      .then(({ data }) => {
        localStorage.setItem('auth_token', data.access_token)
        onLogin()
      })
      .catch((error) => setErrorMessage(getApiError(error)))
      .finally(() => setIsLoading(false))
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8ff] p-4 font-['Space_Grotesk',sans-serif] text-[#191b23] md:p-8">
      <div className="w-full max-w-lg">
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
              <h1 className="mb-2 text-[32px] font-bold leading-tight md:text-[40px] md:leading-tight">
                Registrasi Mahasiswa
              </h1>
              <p className="text-base leading-[1.6] text-[#434655]">
                Lengkapi data diri Anda untuk memulai perjalanan akademik di OBE GradeSync.
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
                  className="w-full rounded-xl border-[3px] border-[#191b23] bg-white px-4 py-3 text-base leading-[1.6] outline-none transition-all placeholder:text-[#737686]/50 focus:shadow-[4px_4px_0_#004ac6]"
                  id="nama-lengkap"
                   name="name"
                   onChange={updateField}
                   value={form.name}
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
                    className="w-full rounded-xl border-[3px] border-[#191b23] bg-white px-4 py-3 text-base leading-[1.6] outline-none transition-all placeholder:text-[#737686]/50 focus:shadow-[4px_4px_0_#004ac6]"
                    id="nim-nip"
                     name="nim_nip"
                     onChange={updateField}
                     value={form.nim_nip}
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
                    className="w-full rounded-xl border-[3px] border-[#191b23] bg-white px-4 py-3 text-base leading-[1.6] outline-none transition-all placeholder:text-[#737686]/50 focus:shadow-[4px_4px_0_#004ac6]"
                    id="nomor-hp"
                     name="no_hp"
                     onChange={updateField}
                     value={form.no_hp}
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
                  className="w-full rounded-xl border-[3px] border-[#191b23] bg-white px-4 py-3 text-base leading-[1.6] outline-none transition-all placeholder:text-[#737686]/50 focus:shadow-[4px_4px_0_#004ac6]"
                  id="email"
                   name="email"
                   onChange={updateField}
                   value={form.email}
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
                  className="w-full resize-none rounded-xl border-[3px] border-[#191b23] bg-white px-4 py-3 text-base leading-[1.6] outline-none transition-all placeholder:text-[#737686]/50 focus:shadow-[4px_4px_0_#004ac6]"
                  id="alamat"
                   name="alamat"
                   onChange={updateField}
                   value={form.alamat}
                  placeholder="Masukkan alamat lengkap"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="ml-1 block text-sm font-bold tracking-[0.05em]" htmlFor="password">
                    Password
                  </label>
                  <input
                    required
                    minLength={6}
                    className="w-full rounded-xl border-[3px] border-[#191b23] bg-white px-4 py-3 text-base leading-[1.6] outline-none transition-all placeholder:text-[#737686]/50 focus:shadow-[4px_4px_0_#004ac6]"
                    id="password"
                     name="password"
                     onChange={updateField}
                     value={form.password}
                    placeholder="••••••••"
                    type="password"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="ml-1 block text-sm font-bold tracking-[0.05em]" htmlFor="konfirmasi-password">
                    Konfirmasi Password
                  </label>
                  <input
                    required
                    minLength={6}
                    className="w-full rounded-xl border-[3px] border-[#191b23] bg-white px-4 py-3 text-base leading-[1.6] outline-none transition-all placeholder:text-[#737686]/50 focus:shadow-[4px_4px_0_#004ac6]"
                    id="konfirmasi-password"
                     name="password_confirmation"
                     onChange={updateField}
                     value={form.password_confirmation}
                    placeholder="••••••••"
                    type="password"
                  />
                </div>
              </div>

              {errorMessage && <p role="alert" className="border-2 border-[#ba1a1a] bg-[#ffdad6] p-3 text-sm font-semibold text-[#93000a]">{errorMessage}</p>}
              <button
                disabled={isLoading}
                className="mt-2 w-full rounded-2xl border-[3px] border-[#191b23] bg-[#004ac6] py-4 text-xl font-semibold text-white shadow-[6px_6px_0_#191b23] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[10px_10px_0_#191b23] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-wait disabled:opacity-80"
                type="submit"
              >
                {isLoading ? 'MEMPROSES...' : 'Daftar Sekarang'}
              </button>
            </form>

            <div className="mt-8 pb-2 text-center">
              <p className="text-base leading-[1.6] text-[#434655]">
                Sudah punya akun?{' '}
                <button
                  className="font-bold text-[#004ac6] underline decoration-2 underline-offset-4 transition-colors hover:text-[#191b23]"
                  onClick={onLogin}
                  type="button"
                >
                  Masuk di sini
                </button>
              </p>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#737686]">© 2024 OBE GradeSync System</p>
        </footer>
      </div>
    </main>
  )
}

export default RegisterMahasiswa
