function Icon({ children, className = '' }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>
}

function RegisterMahasiswa({ onBack, onLogin }) {
  const handleSubmit = (event) => {
    event.preventDefault()
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
              <h1 className="mb-2 text-4xl font-bold leading-tight md:text-[40px] md:leading-tight">
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
                  <input
                    required
                    minLength={6}
                    className="w-full rounded-xl border-[3px] border-[#191b23] bg-white px-4 py-3 text-base leading-[1.6] outline-none transition-all placeholder:text-[#737686]/50 focus:shadow-[4px_4px_0_#a862a8]"
                    id="password"
                    name="password"
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
                    className="w-full rounded-xl border-[3px] border-[#191b23] bg-white px-4 py-3 text-base leading-[1.6] outline-none transition-all placeholder:text-[#737686]/50 focus:shadow-[4px_4px_0_#a862a8]"
                    id="konfirmasi-password"
                    name="konfirmasiPassword"
                    placeholder="••••••••"
                    type="password"
                  />
                </div>
              </div>

              <button
                className="mt-2 w-full rounded-2xl border-[3px] border-[#191b23] bg-[#9f149f] py-4 text-xl font-semibold text-white shadow-[6px_6px_0_#191b23] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#861086] hover:shadow-[10px_10px_0_#191b23] active:translate-x-1 active:translate-y-1 active:shadow-none"
                type="submit"
              >
                Daftar Sekarang
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

        <footer className="mt-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#737686]">© 2024 OBE GradeSync System</p>
        </footer>
      </div>
    </main>
  )
}

export default RegisterMahasiswa
