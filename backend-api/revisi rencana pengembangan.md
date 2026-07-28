# Revisi Rencana Pengembangan
## Sistem Konversi Nilai Magang Berbasis OBE

Dokumen kerja ringkas untuk menentukan apa yang harus dibuat frontend dan backend.

---

## 1. Fokus Utama

Bangun satu alur digital berikut:

```text
Mahasiswa ajukan magang
  -> Admin verifikasi
  -> Mahasiswa membuat Usulan Konversi
  -> DPL menyetujui usulan
  -> Mahasiswa membuat Klaim Konversi setelah magang selesai
  -> Mitra memberi nilai melalui email
  -> DPL memberi nilai dan keputusan melalui email/link
  -> Sistem menghitung nilai akhir
  -> Admin export hasil
```

### Masalah yang diselesaikan

1. Mahasiswa tidak lagi mengisi banyak Google Form.
2. Usulan dan klaim dipisahkan menjadi dua tahap.
3. Status tidak bergantung pada sinkronisasi BIMA/SEMAR.
4. Dokumen tersimpan terpusat.
5. Aktivitas dapat ditelusuri ke CPMK dan mata kuliah.
6. Mitra dan DPL dapat memberi persetujuan tanpa login.
7. Prodi dan Kaprodi memiliki dashboard statistik.

### Prinsip MVP

- Selesaikan alur internal terlebih dahulu.
- Sistem baru menjadi sumber status utama.
- BIMA, SEMAR, Telegram, WhatsApp, dan integrasi SikurOBE penuh bukan prioritas awal.
- Setiap fitur harus mendukung demo end-to-end dari pengajuan sampai nilai akhir.

---

## 2. Aktor Sistem

### 2.1 Mahasiswa

**Tujuan:** mengajukan magang dan mengikuti proses konversi.

**Frontend:**

- Dashboard status dan timeline.
- Form Pengajuan Magang.
- Menu Surat Pengantar.
- Menu Usulan Konversi.
- Menu Klaim Konversi.
- Menu Hasil Konversi.
- Upload dan preview dokumen.
- Notifikasi, komentar revisi, serta histori proses.

**Backend:**

- CRUD draft dan pengajuan magang milik mahasiswa.
- Generate `nomor_magang`.
- Upload dokumen private.
- Pengajuan usulan dan klaim.
- Endpoint status, histori, dan hasil.
- Policy agar mahasiswa hanya mengakses datanya sendiri.

**Batas akses:** tidak dapat mengubah keputusan, nilai, atau status final.

### 2.2 Dosen Pembimbing Lapangan (DPL)

**Tujuan:** memeriksa kesesuaian aktivitas dengan CPMK serta memberi nilai akademik.

**Frontend:**

- Dashboard mahasiswa bimbingan.
- Daftar usulan menunggu review.
- Daftar klaim menunggu review.
- Detail aktivitas, CPMK, mata kuliah, dan dokumen.
- Form setuju, revisi, atau tolak.
- Form nilai akademik dan komentar.
- Review setiap bukti CPMK.

**Backend:**

- Endpoint daftar dan detail usulan/klaim DPL.
- Validasi bahwa DPL memang ditugaskan.
- Penyimpanan keputusan, nilai, komentar, dan timestamp.
- Signed link review tanpa login wajib.
- Notifikasi email dan audit log.

**Batas akses:** hanya mahasiswa yang ditugaskan; tidak dapat mengubah nilai mitra.

### 2.3 Mitra Industri / Supervisor

**Tujuan:** memberi nilai magang secara sederhana melalui email.

**Frontend:**

- Halaman publik dari signed link.
- Ringkasan mahasiswa, perusahaan, posisi, dan periode.
- Form nilai 1-100 dan komentar.
- Halaman sukses setelah submit.
- Pesan token expired, invalid, revoked, atau sudah digunakan.
- Tampilan mobile.

**Backend:**

- Generate token acak dan simpan hash token.
- Kirim email penilaian.
- Validasi token, expiry, target, dan one-time use.
- Simpan nilai, komentar, IP, user agent, dan timestamp.
- Ubah status klaim menjadi `menunggu_review_dpl`.

**Batas akses:** hanya dapat melihat klaim dari token miliknya; tidak perlu akun.

### 2.4 Admin Prodi

**Tujuan:** mengelola proses operasional dan hasil konversi tingkat prodi.

**Frontend:**

- Dashboard pengajuan dan klaim.
- Filter mahasiswa, status, periode, mitra, DPL, dan jenis program.
- Detail serta validasi dokumen.
- Aksi verifikasi, revisi, setuju, dan tolak.
- CRUD mata kuliah, CPMK, mitra, supervisor, dan penugasan DPL.
- Kelola surat pengantar.
- Kirim ulang/cabut token approval.
- Finalisasi dan export Excel.

**Backend:**

- Endpoint monitoring dan verifikasi.
- Endpoint master data.
- Endpoint surat pengantar.
- Endpoint approval token.
- Endpoint dashboard dan export.
- Policy sesuai lingkup prodi.
- Audit log semua aksi administratif.

**Batas akses:** tidak mengubah nilai akademik secara langsung tanpa proses koreksi resmi.

### 2.5 Kaprodi

Sistem dibatasi pada tingkat program studi. Seluruh tugas administrasi, verifikasi dokumen, surat pengantar, monitoring, master data, approval token, dan export dikerjakan oleh Admin Prodi.

**Tujuan:** memantau statistik dan hasil konversi.

**Frontend:**

- Dashboard read-only.
- Jumlah magang dan studi independen.
- Jumlah mitra.
- Grafik status proses.
- Statistik mata kuliah, CPMK, dan nilai.
- Filter periode, tahun akademik, jenis program, dan status.
- Rekap hasil serta export data melalui speadsheet

**Backend:**

- Endpoint statistik agregat.
- Endpoint laporan dan export read-only.
- Query berdasarkan periode dan tahun akademik.
- Policy tanpa hak mengubah transaksi.

---

## 3. Fitur Frontend yang Harus Dibuat

### Prioritas 1: alur utama

1. Routing dan layout berdasarkan role.
2. Login Google OAuth atau login lokal.
3. Dashboard mahasiswa.
4. Form Pengajuan Magang.
5. Upload dokumen.
6. Halaman verifikasi Admin.
7. Form Usulan Konversi.
8. Halaman review DPL.
9. Form Klaim Konversi.
10. Halaman approval mitra melalui signed link.
11. Halaman approval DPL melalui signed link.
12. Halaman Hasil Konversi.

### Prioritas 2: kelayakan penggunaan

1. Surat Pengantar.
2. Notifikasi dan inbox.
3. Histori status dan komentar.
4. Dashboard Admin Prodi dan Kaprodi.
5. Export/download hasil.
6. Validasi form dan upload.
7. Loading, error state, empty state, toast, dan modal konfirmasi.
8. Responsive mobile.

### Aturan UI penting

- Menu **Usulan Konversi** dan **Klaim Konversi** harus terpisah.
- Tombol klaim nonaktif sebelum usulan disetujui.
- Setiap status menampilkan arti dan tindakan berikutnya.
- Frontend tidak boleh menganggap status berhasil hanya dari aksi lokal; selalu membaca response backend.
- Error `401`, `403`, `409`, dan `422` harus memiliki pesan yang jelas.
- Dokumen menggunakan temporary URL, bukan URL publik permanen.

---

## 4. Fitur Backend yang Harus Dibuat

### Prioritas 1: API dan aturan bisnis

1. Migration dan seeder.
2. Model serta relasi Eloquent.
3. Auth Sanctum dan Google OAuth.
4. Middleware role dan Policy.
5. API pengajuan magang.
6. API verifikasi Admin.
7. API usulan konversi.
8. API review DPL.
9. API klaim konversi.
10. API approval mitra dan DPL.
11. Service perhitungan nilai.
12. API hasil konversi.

### Prioritas 2: keamanan dan operasional

1. Private storage dokumen.
2. Validasi MIME type, ukuran, dan checksum.
3. Signed token one-time dengan expiry dan revoke.
4. Queue email dan retry.
5. Audit log.
6. Dashboard statistik.
7. Export Excel.
8. Error response JSON yang konsisten.
9. Pagination, filter, search, dan sorting.
10. Rate limit endpoint publik.

### Prioritas 3: integrasi lanjutan

1. Adapter BIMA.
2. Adapter SEMAR.
3. Integrasi API SikurOBE.
4. Notifikasi Telegram.
5. Notifikasi WhatsApp.

---

## 5. Alur Bisnis dan Status

### Pengajuan Magang

Mahasiswa mengisi profil magang, mitra, supervisor, DPL, posisi, periode, proposal, dan bukti diterima.

```text
draft
-> menunggu_verifikasi
-> revisi
-> disetujui
-> berjalan
-> selesai
```

Pengajuan dapat `ditolak` dengan alasan wajib.

Sistem membuat `nomor_magang` internal, contoh:

```text
MAG-INF-2026-0001
```

### Usulan Konversi

Mahasiswa memilih MK, CPMK, dan aktivitas rencana. DPL memberi keputusan.

```text
menunggu_persetujuan_dpl
-> disetujui
-> revisi
-> ditolak
```

### Klaim Konversi

Mahasiswa mengunggah logbook, laporan, sertifikat, dan bukti setiap CPMK.

```text
draft
-> menunggu_penilaian_mitra
-> menunggu_review_dpl
-> disetujui
```

Cabang keputusan: `revisi`, `ditolak`, atau `dibatalkan`.

### Formula nilai

```text
Nilai Akhir = (70% x Nilai Mitra) + (30% x Nilai DPL)
```

Contoh: `(70% x 90) + (30% x 85) = 88,5`.

---

## 6. Database Minimum

### Tabel wajib MVP

1. `users`
2. `mitra_industris`
3. `supervisor_mitras`
4. `mata_kuliahs`
5. `cpmks`
6. `magangs`
7. `surat_pengantars`
8. `usulan_konversis`
9. `usulan_konversi_details`
10. `klaim_konversis`
11. `klaim_konversi_details`
12. `penilaian_mitras`
13. `penilaian_dpls`
14. `penilaian_cpmks`
15. `nilai_akhirs`
16. `dokumens`
17. `approval_tokens`
18. `activity_logs`

### Field penting

`magangs` wajib memiliki:

```text
nomor_magang unique
mahasiswa_id
mitra_industri_id
supervisor_mitra_id
dpl_id
jenis_program: magang | studi_independen
periode_mulai
periode_selesai
status
```

`approval_tokens` wajib memiliki:

```text
token_hash unique
target_role
recipient_email
expires_at
used_at nullable
revoked_at nullable
```

### Validasi database wajib

- Nilai mitra dan DPL antara 1-100.
- Periode selesai tidak boleh sebelum periode mulai.
- Supervisor harus berasal dari mitra yang dipilih.
- DPL harus role `dpl` dan aktif.
- CPMK harus berasal dari mata kuliah terkait.
- Satu klaim aktif untuk satu usulan.
- Data master yang sudah dipakai tidak boleh dihapus permanen.
- Timestamp tersimpan untuk semua aksi penting.

---

## 7. API Minimum

### Auth

```text
POST /api/register
POST /api/login
GET  /api/auth/google/redirect
GET  /api/auth/google/callback
GET  /api/me
POST /api/logout
```

### Mahasiswa

```text
GET  /api/magang
POST /api/magang
GET  /api/magang/{id}
PATCH /api/magang/{id}
POST /api/usulan-konversi
GET  /api/usulan-konversi/{id}
PUT  /api/usulan-konversi/{id}
POST /api/klaim-konversi
GET  /api/klaim-konversi/{id}
PUT  /api/klaim-konversi/{id}
GET  /api/klaim-konversi/{id}/hasil
```

### DPL

```text
GET  /api/dpl/usulan-konversi
POST /api/dpl/usulan-konversi/{id}/review
GET  /api/dpl/klaim-konversi
POST /api/dpl/klaim-konversi/{id}/review
```

### Admin

```text
GET  /api/admin/magang
POST /api/admin/magang/{id}/verifikasi
POST /api/admin/surat-pengantar/{id}/terbitkan
GET  /api/admin/dashboard
GET  /api/admin/export/hasil-konversi
```

### Approval publik

```text
GET  /api/public/approval/{token}
POST /api/public/approval/{token}/mitra
POST /api/public/approval/{token}/dpl
```

---

## 8. Koreksi Project Saat Ini

1. `backend-api/routes/api.php` baru memiliki auth; tambahkan route domain di atas.
2. Tambahkan controller, Form Request, Resource, Service, dan Policy.
3. Tambahkan migration `surat_pengantars`, `penilaian_cpmks`, dan `activity_logs`.
4. Perbaiki timestamp migration yang duplikat.
5. Pastikan kolom model `users` sama dengan migration.
6. Implementasikan private storage.
7. Samakan enum status antara backend dan frontend.
8. Hilangkan ketergantungan halaman utama pada mock data setelah API siap.
9. Tambahkan test untuk auth, role, status, approval token, nilai, upload, dan export.

---

## 9. Roadmap Pengerjaan

### Hari 1 — Fondasi

- Bersihkan migration.
- Seed MK, CPMK, user, DPL, mitra, dan supervisor.
- Selesaikan auth, role, dan Policy.
- Buat layout dan routing frontend.

### Hari 2 — Pengajuan

- Buat form pengajuan mahasiswa.
- Buat upload dokumen.
- Buat nomor magang.
- Buat verifikasi Admin.
- Buat surat pengantar minimum.

### Hari 3 — Konversi

- Buat Usulan Konversi.
- Buat review DPL.
- Buat Klaim Konversi.
- Buat bukti aktivitas per CPMK.

### Hari 4 — Nilai

- Buat signed link mitra.
- Buat signed link DPL.
- Buat queue email.
- Buat perhitungan nilai.
- Buat hasil konversi.

### Hari 5 — Demo

- Buat dashboard Admin dan Kaprodi.
- Buat export Excel.
- Tambahkan audit log.
- Test happy path end-to-end.
- Perbaiki UX dan error handling.

---

## 10. Checklist Selesai

### Wajib demo

- [ ] Mahasiswa login.
- [ ] Mahasiswa membuat pengajuan.
- [ ] Sistem membuat nomor magang.
- [ ] Admin memverifikasi.
- [ ] Mahasiswa membuat usulan.
- [ ] DPL menyetujui usulan.
- [ ] Mahasiswa membuat klaim.
- [ ] Mitra memberi nilai melalui email/link.
- [ ] DPL memberi nilai dan keputusan.
- [ ] Sistem menghitung nilai akhir.
- [ ] Mahasiswa melihat hasil.
- [ ] Admin mengunduh export.
- [ ] Kaprodi melihat dashboard.

### Wajib aman

- [ ] Mahasiswa tidak dapat melihat data mahasiswa lain.
- [ ] Role tidak dapat diubah dari profil.
- [ ] Token approval memiliki expiry.
- [ ] Token approval hanya dapat digunakan sekali.
- [ ] File tidak tersimpan sebagai URL publik.
- [ ] Nilai hanya dapat diisi oleh pihak yang berwenang.
- [ ] Semua perubahan penting tercatat di audit log.

### Fase setelah MVP

- Integrasi BIMA.
- Integrasi SEMAR.
- Integrasi SikurOBE API.
- Telegram.
- WhatsApp.
- SSO kampus.
