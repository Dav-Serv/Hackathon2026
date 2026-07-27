# Rancangan Sistem Konversi Nilai Magang Berbasis OBE

> Pengganti BIMA — fokus: ID sync yang jelas, pemisahan tegas Usulan vs Klaim, approval tanpa login (email), dan dashboard Prodi/Kaprodi.

---

## 1. RANCANGAN DATABASE

### 1.1 Entity Relationship (ringkas)

```
users (1)───(N) magang (N)───(1) mitra_industri
users(dpl) (1)───(N) magang
magang (1)───(1) usulan_konversi (1)───(N) usulan_konversi_detail (N)───(1) cpmk (N)───(1) mata_kuliah
usulan_konversi (1)───(1) klaim_konversi (1)───(N) klaim_konversi_detail
klaim_konversi (1)───(1) penilaian_mitra
klaim_konversi (1)───(1) penilaian_dpl
klaim_konversi (1)───(N) nilai_akhir (per mata kuliah yang dikonversi)
klaim_konversi/magang (1)───(N) dokumen
klaim_konversi (1)───(N) token_approval
* (1)───(N) activity_log
```

### 1.2 Detail Tabel

**users**
| kolom | tipe | keterangan |
|---|---|---|
| id | uuid/PK | |
| nim_nip | varchar | unik |
| nama | varchar | |
| email | varchar | unik |
| password_hash | varchar | nullable utk role tanpa login |
| role | enum | mahasiswa, dpl, admin_prodi, kaprodi |
| prodi_id | FK | |
| created_at, updated_at | timestamp | |

**mitra_industri**
| id PK | nama_perusahaan | alamat | bidang | created_at |

**supervisor_mitra**
| id PK | mitra_id FK | nama | email | no_hp |
> Dipisah dari mitra_industri karena satu mitra bisa punya banyak supervisor di periode berbeda.

**mata_kuliah**
| id PK | kode_mk | nama_mk | sks | prodi_id | sumber (SikurOBE/manual) |

**cpmk**
| id PK | mata_kuliah_id FK | kode_cpmk | deskripsi | sumber (SikurOBE) |

**magang** (Tahap 1)
| id PK | mahasiswa_id FK | mitra_id FK | supervisor_id FK | dpl_id FK | posisi | periode_mulai | periode_selesai | proposal_file | bukti_diterima_file | status (draft/menunggu_verifikasi/disetujui/ditolak) | id_magang_eksternal (kalau perlu sync sistem lain) | created_at, updated_at |

> Catatan penting: `id_magang_eksternal` + `status` di sini **jadi satu-satunya sumber kebenaran**, supaya masalah "DPL sudah ACC tapi sistem tidak sinkron" di BIMA tidak terulang — status diupdate lewat transaksi (trigger/event), bukan sinkronisasi manual antar sistem.

**usulan_konversi** (Tahap 2 — diajukan SAAT magang berjalan)
| id PK | magang_id FK | status (menunggu_persetujuan_dpl/disetujui/revisi/ditolak) | catatan_dpl | reviewed_by FK | reviewed_at | created_at |

**usulan_konversi_detail** (mapping Aktivitas → CPMK → MK)
| id PK | usulan_id FK | mata_kuliah_id FK | cpmk_id FK | deskripsi_aktivitas_rencana |

**klaim_konversi** (Tahap 3 — diajukan SETELAH magang selesai, berdasarkan usulan yang disetujui)
| id PK | usulan_id FK | magang_id FK | logbook_file | laporan_file | sertifikat_file | dokumen_lain_file (nullable) | status (menunggu_penilaian_mitra/menunggu_review_dpl/revisi/disetujui/ditolak) | created_at, updated_at |

**klaim_konversi_detail** (bukti per CPMK yang diklaim)
| id PK | klaim_id FK | usulan_detail_id FK | bukti_aktivitas_text | bukti_file (opsional) |

**penilaian_mitra** (Tahap 4)
| id PK | klaim_id FK | nilai (1-100) | komentar | token_id FK | submitted_at |

**penilaian_dpl** (Tahap 5)
| id PK | klaim_id FK | nilai_akademik | keputusan (setuju/revisi/tolak) | komentar | token_id FK | submitted_at |

**nilai_akhir** (Tahap 6–7, per mata kuliah yang dikonversi)
| id PK | klaim_id FK | mata_kuliah_id FK | nilai_mitra | nilai_dpl | nilai_akhir (70% mitra + 30% dpl) | nilai_huruf | sks | generated_at |

**dokumen** (opsional, kalau ingin sentralisasi file & histori)
| id PK | referensi_tabel | referensi_id | jenis_dokumen | path_file | uploaded_at |

**token_approval** (kunci fitur "approval tanpa login")
| id PK | klaim_id FK | role (dpl/mitra) | token (random string) | expired_at | used_at |

**activity_log** (memenuhi syarat "seluruh aktivitas memiliki timestamp")
| id PK | user_id FK (nullable, bisa mitra/dpl via token) | aksi | entitas | entitas_id | timestamp |

### 1.3 Query dashboard (view, bukan tabel fisik)
- `v_statistik_magang`: jumlah mahasiswa magang vs studi independen per periode
- `v_statistik_mitra`: jumlah mahasiswa per mitra
- `v_progress_konversi`: jumlah usulan/klaim per status

---

## 2. FLOW APLIKASI

### 2.1 Flow utama (per tahap)

```
[Mahasiswa] Ajukan Magang
   └─ isi data + upload bukti diterima
   └─ status: draft → menunggu_verifikasi
[Admin Prodi/DPL] Verifikasi
   └─ status → disetujui / ditolak
        │
        ▼ (saat magang BERJALAN)
[Mahasiswa] Ajukan USULAN KONVERSI
   └─ pilih MK → pilih CPMK (dari SikurOBE) → isi rencana aktivitas
   └─ status: menunggu_persetujuan_dpl
[DPL] Review Usulan (via dashboard, WAJIB login karena masih tahap akademik awal)
   └─ Setuju → status: disetujui
   └─ Revisi → notifikasi ke mahasiswa, mahasiswa edit & submit ulang
   └─ Tolak → selesai (mahasiswa bisa ajukan usulan baru)
        │
        ▼ (saat magang SELESAI)
[Mahasiswa] Ajukan KLAIM KONVERSI (hanya bisa dari usulan yang sudah disetujui)
   └─ upload logbook, laporan, sertifikat
   └─ isi bukti aktivitas per CPMK yang diusulkan
   └─ status: menunggu_penilaian_mitra
[Sistem] Generate token_approval → kirim email ke Supervisor Mitra
[Mitra] Klik link email (TANPA LOGIN) → isi nilai (1-100) + komentar
   └─ status: menunggu_review_dpl
[Sistem] Generate token_approval → kirim email ke DPL
[DPL] Klik link email (TANPA LOGIN, bisa dari device apapun) → beri nilai akademik + keputusan
   └─ Setuju → lanjut hitung nilai akhir
   └─ Revisi → notifikasi ke mahasiswa
   └─ Tolak → status: ditolak
[Sistem] Hitung Nilai Akhir = 70%*NilaiMitra + 30%*NilaiDPL
[Sistem] Generate hasil konversi (per MK, SKS, nilai, riwayat CPMK)
[Admin Prodi] Export Excel (Kode MK, Mata Kuliah, NIM, Nama, Nilai Huruf, Nilai Angka)
[Kaprodi] Pantau dashboard statistik
```

### 2.2 Poin desain yang langsung menjawab kelemahan BIMA
1. **Istilah dipisah jelas di UI**: menu "Usulan Konversi" (step saat magang berjalan) dan "Klaim Konversi" (step setelah magang selesai) dibuat sebagai **dua halaman/menu berbeda**, bukan satu modal dengan radio button seperti BIMA — sehingga urutan pengerjaan terlihat otomatis dari status magang (klaim baru bisa diklik kalau usulan sudah `disetujui`).
2. **Sinkronisasi ID**: satu tabel `magang` sebagai single source of truth, status berubah lewat event/transaction di backend yang sama, jadi tidak ada dua sistem yang bisa "tidak sinkron".
3. **Approval tanpa login untuk DPL & Mitra** di tahap penilaian akhir (Tahap 4 & 5) memakai `token_approval` dengan expiry, supaya cepat dan tidak butuh akun.

### 2.3 Notifikasi
- Email/Telegram ke DPL saat ada usulan/klaim baru menunggu review.
- Email ke Mitra saat klaim menunggu penilaian.
- Notifikasi ke mahasiswa saat status berubah (revisi/disetujui/ditolak/nilai keluar).

---

## 3. FITUR YANG DIPERLUKAN

### Mahasiswa
- Ajukan data magang + upload dokumen
- Lihat status real-time (draft → ... → nilai akhir), termasuk alasan revisi/tolak dari DPL
- Ajukan Usulan Konversi (pilih MK & CPMK dari data SikurOBE, multi-CPMK/multi-MK)
- Ajukan Klaim Konversi (upload logbook/laporan/sertifikat, isi bukti per CPMK)
- Riwayat & unduh hasil konversi (PDF/bukti)

### DPL
- Dashboard daftar usulan/klaim yang perlu direview
- Review via web (login) untuk usulan; review via link email (tanpa login) untuk klaim final
- Approve / minta revisi / tolak + catatan
- Input nilai akademik

### Mitra Industri / Supervisor
- Terima email otomatis
- Isi form penilaian (nilai 1-100 + komentar) lewat link, tanpa login

### Admin Prodi
- Verifikasi pengajuan magang
- Monitoring seluruh proses (usulan, klaim, penilaian)
- Kelola master data Mata Kuliah & CPMK (atau sinkron dari SikurOBE)
- Export hasil konversi ke Excel (format sesuai template)
- Kelola ulang token approval jika expired/gagal terkirim

### Kaprodi
- Dashboard statistik: jumlah mahasiswa magang vs studi independen, daftar mitra, distribusi nilai, progress per status

### Sistem (otomatis)
- Generate & kirim token approval via email
- Hitung nilai akhir otomatis (70/30)
- Logging semua aktivitas dengan timestamp
- Penyimpanan dokumen otomatis terorganisasi (per mahasiswa/per magang)
- Generate laporan/export Excel

---

## 4. Implementasi dengan Laravel (API) + React (Frontend)

### 4.1 Stack
- **Backend**: Laravel 11 + PostgreSQL/MySQL
- **Auth mahasiswa/DPL/admin/kaprodi**: Laravel Sanctum (SPA token auth ke React)
- **Approval tanpa login (DPL & Mitra)**: **Signed URL bawaan Laravel** (`URL::temporarySignedRoute`) — ini pas banget menggantikan tabel `token_approval` manual, karena Laravel sudah handle expiry + verifikasi signature otomatis. Tabel `token_approval` cukup dipakai untuk log/histori, bukan validasi utama.
- **Email**: Laravel Notification + Mailable, dikirim lewat Queue (`database` atau `redis` driver) supaya submit klaim tidak nunggu proses kirim email
- **Role & permission**: Spatie `laravel-permission` untuk role mahasiswa/dpl/admin_prodi/kaprodi
- **Upload file**: Laravel Storage (disk `public`/`s3`), validasi lewat Form Request
- **Export Excel**: `maatwebsite/excel`
- **Aktivitas & timestamp**: Spatie `laravel-activitylog` untuk isi tabel `activity_log` otomatis
- **Frontend**: React + Vite + Axios (Sanctum cookie-based) + Recharts untuk dashboard Kaprodi

### 4.2 Struktur folder API (ringkas)
```
app/
 ├─ Models/ (User, Magang, MataKuliah, Cpmk, UsulanKonversi, UsulanKonversiDetail,
 │            KlaimKonversi, KlaimKonversiDetail, PenilaianMitra, PenilaianDpl, NilaiAkhir)
 ├─ Http/Controllers/Api/ (MagangController, UsulanKonversiController,
 │            KlaimKonversiController, PenilaianController, DashboardController, ExportController)
 ├─ Http/Requests/ (StoreMagangRequest, StoreUsulanRequest, StoreKlaimRequest, ...)
 ├─ Notifications/ (KlaimMenungguPenilaianMitra, KlaimMenungguReviewDpl, UsulanDireview, ...)
 ├─ Jobs/ (KirimEmailPenilaianMitra, KirimEmailReviewDpl)
 └─ Services/ (NilaiAkhirService -> hitung 70/30, KonversiExportService)
routes/
 ├─ api.php        (rute berlogin, pakai Sanctum middleware)
 └─ web.php        (rute signed untuk mitra & DPL: /penilaian/mitra/{klaim}, /review/dpl/{klaim})
```

### 4.3 Contoh alur signed route (pengganti login DPL/Mitra)
```php
// generate saat klaim masuk tahap "menunggu_penilaian_mitra"
$url = URL::temporarySignedRoute(
    'penilaian.mitra.form',
    now()->addDays(7),
    ['klaim' => $klaim->id]
);
// dikirim via Notification -> Mailable, mitra tinggal klik, tanpa perlu akun
```
Route publik divalidasi otomatis oleh middleware `signed`, jadi tidak perlu bikin sistem token manual — cukup pastikan route-nya menampilkan form React sederhana (bisa Blade+Inertia ringan atau halaman React terpisah yang fetch klaim via signed API).

### 4.4 Penyesuaian relasi Eloquent (contoh)
```php
// Magang.php
public function mahasiswa() { return $this->belongsTo(User::class, 'mahasiswa_id'); }
public function dpl() { return $this->belongsTo(User::class, 'dpl_id'); }
public function usulanKonversi() { return $this->hasOne(UsulanKonversi::class); }

// UsulanKonversi.php
public function details() { return $this->hasMany(UsulanKonversiDetail::class); }
public function klaimKonversi() { return $this->hasOne(KlaimKonversi::class); }

// KlaimKonversi.php
public function penilaianMitra() { return $this->hasOne(PenilaianMitra::class); }
public function penilaianDpl() { return $this->hasOne(PenilaianDpl::class); }
public function nilaiAkhir() { return $this->hasMany(NilaiAkhir::class); }
```
