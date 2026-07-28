import { useEffect, useState } from 'react'
import api, { getApiError } from './lib/api'
import Loading from './components/Loading.jsx'

export default function ApprovalPage() {
  const token = window.location.pathname.split('/').filter(Boolean).pop()
  const [claim, setClaim] = useState(null)
  const [score, setScore] = useState('')
  const [comment, setComment] = useState('')
  const [decision, setDecision] = useState('setuju')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/public/approval/${token}`)
        setClaim(data.data || data)
       } catch (firstError) {
         try {
           const { data } = await api.get(`/approval/${token}`)
           setClaim(data.data || data)
         } catch (secondError) {
           setError(getApiError(secondError || firstError))
         }
       } finally { setLoading(false) }
     }

    load()
  }, [token])

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const role = claim?.role || claim?.approval_role || claim?.jenis_penilaian
      const endpoint = role === 'mitra' ? `/public/approval/${token}/mitra` : role === 'dpl' ? `/public/approval/${token}/dpl` : `/approval/${token}`
      await api.post(endpoint, { nilai: Number(score), komentar: comment, keputusan: decision, nilai_akademik: Number(score) })
      setMessage('Approval berhasil diproses. Token ini tidak dapat digunakan kembali.')
    } catch (e) { setError(getApiError(e)) } finally { setBusy(false) }
  }

  const mahasiswa = claim?.magang?.mahasiswa
  const mitra = claim?.magang?.mitra_industri || claim?.magang?.mitraIndustri
  const used = Boolean(claim?.used_at || claim?.usedAt)
  return <main className="flex min-h-screen items-center justify-center bg-[#faf8ff] p-5"><div className="w-full max-w-lg rounded-2xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_#191b23]"><h1 className="text-2xl font-bold">Approval Penilaian</h1>{loading && <Loading label="Memuat detail approval..." />}{error && <p className="mt-4 rounded-lg bg-red-100 p-3 text-red-800">{error}</p>}{message && <p className="mt-4 rounded-lg bg-green-100 p-3 text-green-800">{message}</p>}{used && !message && <p className="mt-4 rounded-lg bg-yellow-100 p-3 text-yellow-900">Token sudah digunakan atau kedaluwarsa.</p>}{claim && !message && !used && <><p className="mt-4">Mahasiswa: <b>{mahasiswa?.name || mahasiswa?.nama || '-'}</b></p><p>Nomor magang: {claim.magang?.nomor_magang || '-'}</p><p>Mitra: {mitra?.nama_perusahaan || mitra?.nama || '-'}</p><form onSubmit={submit} className="mt-5 space-y-3"><input required min="1" max="100" type="number" value={score} onChange={e => setScore(e.target.value)} placeholder="Nilai 1-100" className="w-full rounded-lg border-2 border-black p-3" /><select value={decision} onChange={e => setDecision(e.target.value)} className="w-full rounded-lg border-2 border-black p-3"><option value="setuju">Setuju</option><option value="revisi">Revisi</option><option value="tolak">Tolak</option></select><textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Komentar" className="min-h-24 w-full rounded-lg border-2 border-black p-3" /><button disabled={busy} className="w-full rounded-lg bg-[#9f149f] p-3 font-bold text-white">{busy ? 'Mengirim...' : 'Kirim penilaian'}</button></form></>}</div></main>
}
