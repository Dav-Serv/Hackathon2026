# Rencana Pengembangan Lengkap
## Sistem Konversi Nilai Magang Berbasis OBE (Laravel + React)

---

## 1. RINGKASAN SISTEM

| | |
|---|---|
| Backend | Laravel 11 (REST API) |
| Frontend | React + Vite |
| Auth | Laravel Sanctum + Google OAuth (Laravel Socialite) untuk mahasiswa, DPL, admin_prodi, kaprodi |
| Approval tanpa login | Signed URL Laravel (DPL tahap final & Mitra) |
| Database | MySQL/PostgreSQL |
| Role | Kolom `role` enum di tabel `users` (tanpa package tambahan) |
| Export | maatwebsite/excel |
| Log aktivitas | Tabel `activity_log` manual, diisi via Model Observer/Event |
| Queue email | Laravel Queue (database/redis driver) |

### Perubahan dari rencana sebelumnya
- ❌ Tidak pakai Spatie `laravel-permission` → role cukup kolom `enum` di tabel `users`, dicek pakai Middleware/Policy biasa.
- ❌ Tidak pakai Spatie `laravel-activitylog` → tabel `activity_log` diisi manual lewat Model Observer (`created`, `updated` event) atau dipanggil eksplisit di Service/Controller.
- ✅ Auth pakai **Sanctum** (untuk sesi/token API ke React) **+ Google OAuth** (Socialite) sebagai metode login, khusus untuk civitas kampus (bisa dibatasi domain email `@students.amikom.ac.id` / `@amikom.ac.id`).

---

## 2. DATABASE — MIGRATION LARAVEL

### 2.1 Daftar tabel & urutan migration
```
2024_01_01_000001_create_users_table.php               (default Laravel + kolom tambahan)
2024_01_01_000002_create_mitra_industris_table.php
2024_01_01_000003_create_supervisor_mitras_table.php
2024_01_01_000004_create_mata_kuliahs_table.php
2024_01_01_000005_create_cpmks_table.php
2024_01_01_000006_create_magangs_table.php
2024_01_01_000007_create_usulan_konversis_table.php
2024_01_01_000008_create_usulan_konversi_details_table.php
2024_01_01_000009_create_klaim_konversis_table.php
2024_01_01_000010_create_klaim_konversi_details_table.php
2024_01_01_000011_create_penilaian_mitras_table.php
2024_01_01_000012_create_penilaian_dpls_table.php
2024_01_01_000013_create_nilai_akhirs_table.php
2024_01_01_000014_create_dokumens_table.php
2024_01_01_000015_create_token_approvals_table.php
```

### 2.2 Skema migration (ringkas, siap ditulis ulang jadi file migration)

```php
// users (tambahan dari default Laravel)
Schema::table('users', function (Blueprint $table) {
    $table->string('nim_nip')->unique()->nullable();
    $table->enum('role', ['mahasiswa','dpl','admin_prodi','kaprodi']);
    $table->string('google_id')->nullable()->unique(); // dari Socialite
    $table->string('avatar')->nullable();
    $table->string('password')->nullable()->change(); // nullable, karena login via Google
});
// Catatan: tidak ada kolom/tabel prodi. Platform ini khusus untuk
// S1 Informatika saja (hardcode di config, bukan data dinamis),
// jadi tidak perlu relasi prodi_id di manapun.

// mitra_industris
Schema::create('mitra_industris', function (Blueprint $table) {
    $table->id();
    $table->string('nama_perusahaan');
    $table->text('alamat')->nullable();
    $table->string('bidang')->nullable();
    $table->timestamps();
});

// supervisor_mitras
Schema::create('supervisor_mitras', function (Blueprint $table) {
    $table->id();
    $table->foreignId('mitra_industri_id')->constrained()->cascadeOnDelete();
    $table->string('nama');
    $table->string('email');
    $table->string('no_hp')->nullable();
    $table->timestamps();
});

// mata_kuliahs
Schema::create('mata_kuliahs', function (Blueprint $table) {
    $table->id();
    $table->string('kode_mk')->unique();
    $table->string('nama_mk');
    $table->unsignedTinyInteger('sks');
    $table->string('sumber')->default('SikurOBE'); // atau manual
    $table->timestamps();
});

// cpmks
Schema::create('cpmks', function (Blueprint $table) {
    $table->id();
    $table->foreignId('mata_kuliah_id')->constrained()->cascadeOnDelete();
    $table->string('kode_cpmk');
    $table->text('deskripsi');
    $table->timestamps();
});

// magangs
Schema::create('magangs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('mahasiswa_id')->constrained('users')->cascadeOnDelete();
    $table->foreignId('mitra_industri_id')->constrained();
    $table->foreignId('supervisor_mitra_id')->constrained();
    $table->foreignId('dpl_id')->constrained('users');
    $table->string('posisi');
    $table->date('periode_mulai');
    $table->date('periode_selesai');
    $table->string('proposal_file');
    $table->string('bukti_diterima_file');
    $table->enum('status', ['draft','menunggu_verifikasi','disetujui','ditolak'])->default('draft');
    $table->timestamps();
});

// usulan_konversis
Schema::create('usulan_konversis', function (Blueprint $table) {
    $table->id();
    $table->foreignId('magang_id')->constrained()->cascadeOnDelete();
    $table->enum('status', ['menunggu_persetujuan_dpl','disetujui','revisi','ditolak'])
          ->default('menunggu_persetujuan_dpl');
    $table->text('catatan_dpl')->nullable();
    $table->foreignId('reviewed_by')->nullable()->constrained('users');
    $table->timestamp('reviewed_at')->nullable();
    $table->timestamps();
});

// usulan_konversi_details
Schema::create('usulan_konversi_details', function (Blueprint $table) {
    $table->id();
    $table->foreignId('usulan_konversi_id')->constrained()->cascadeOnDelete();
    $table->foreignId('mata_kuliah_id')->constrained();
    $table->foreignId('cpmk_id')->constrained();
    $table->text('deskripsi_aktivitas_rencana');
    $table->timestamps();
});

// klaim_konversis
Schema::create('klaim_konversis', function (Blueprint $table) {
    $table->id();
    $table->foreignId('usulan_konversi_id')->constrained();
    $table->foreignId('magang_id')->constrained();
    $table->string('logbook_file');
    $table->string('laporan_file');
    $table->string('sertifikat_file');
    $table->string('dokumen_lain_file')->nullable();
    $table->enum('status', [
        'menunggu_penilaian_mitra','menunggu_review_dpl','revisi','disetujui','ditolak'
    ])->default('menunggu_penilaian_mitra');
    $table->timestamps();
});

// klaim_konversi_details
Schema::create('klaim_konversi_details', function (Blueprint $table) {
    $table->id();
    $table->foreignId('klaim_konversi_id')->constrained()->cascadeOnDelete();
    $table->foreignId('usulan_konversi_detail_id')->constrained();
    $table->text('bukti_aktivitas_text');
    $table->string('bukti_file')->nullable();
    $table->timestamps();
});

// penilaian_mitras
Schema::create('penilaian_mitras', function (Blueprint $table) {
    $table->id();
    $table->foreignId('klaim_konversi_id')->constrained()->cascadeOnDelete();
    $table->unsignedTinyInteger('nilai'); // 1-100
    $table->text('komentar')->nullable();
    $table->timestamp('submitted_at')->nullable();
    $table->timestamps();
});

// penilaian_dpls
Schema::create('penilaian_dpls', function (Blueprint $table) {
    $table->id();
    $table->foreignId('klaim_konversi_id')->constrained()->cascadeOnDelete();
    $table->unsignedTinyInteger('nilai_akademik');
    $table->enum('keputusan', ['setuju','revisi','tolak']);
    $table->text('komentar')->nullable();
    $table->timestamp('submitted_at')->nullable();
    $table->timestamps();
});

// nilai_akhirs
Schema::create('nilai_akhirs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('klaim_konversi_id')->constrained();
    $table->foreignId('mata_kuliah_id')->constrained();
    $table->decimal('nilai_mitra', 5, 2);
    $table->decimal('nilai_dpl', 5, 2);
    $table->decimal('nilai_akhir', 5, 2); // 70% mitra + 30% dpl
    $table->string('nilai_huruf', 2);
    $table->unsignedTinyInteger('sks');
    $table->timestamp('generated_at');
    $table->timestamps();
});

// dokumens (opsional, sentralisasi histori file)
Schema::create('dokumens', function (Blueprint $table) {
    $table->id();
    $table->string('referensi_tabel');
    $table->unsignedBigInteger('referensi_id');
    $table->string('jenis_dokumen');
    $table->string('path_file');
    $table->timestamps();
});

// token_approvals (histori/log signed url, bukan validasi utama)
Schema::create('token_approvals', function (Blueprint $table) {
    $table->id();
    $table->foreignId('klaim_konversi_id')->constrained();
    $table->enum('role', ['dpl','mitra']);
    $table->timestamp('expired_at');
    $table->timestamp('used_at')->nullable();
    $table->timestamps();
});
```

---

## 3. API ROUTES (routes/api.php & routes/web.php)

### 3.1 Rute berlogin (Sanctum + Google OAuth, prefix `/api`)
```
GET    /auth/google/redirect        arahkan ke consent screen Google
GET    /auth/google/callback        terima callback, cari/buat user by google_id/email,
                                     role default 'mahasiswa' jika user baru (role lain
                                     di-assign manual oleh admin_prodi), lalu buatkan
                                     Sanctum token
POST   /logout
GET    /me
```
> Pengecekan role tidak pakai package — cukup Middleware kecil (`EnsureRole`) yang membaca `$request->user()->role`, dipasang di route group, mis. `Route::middleware(['auth:sanctum','role:dpl'])->group(...)`.

```
# Mahasiswa
POST   /magang                          store pengajuan magang
GET    /magang/{id}                     detail + status
POST   /usulan-konversi                 ajukan usulan konversi
GET    /usulan-konversi/{id}
POST   /klaim-konversi                  ajukan klaim konversi
GET    /klaim-konversi/{id}

# DPL
GET    /dpl/usulan-konversi             daftar usulan menunggu review
POST   /dpl/usulan-konversi/{id}/review approve/revisi/tolak

# Admin Prodi
GET    /admin/magang                    verifikasi magang
POST   /admin/magang/{id}/verifikasi
GET    /admin/mata-kuliah, /admin/cpmk  CRUD master data
GET    /admin/export/hasil-konversi     export Excel

# Kaprodi
GET    /kaprodi/dashboard               statistik agregat
```

### 3.2 Rute publik signed (tanpa login, prefix `/public`, middleware `signed`)
```
GET    /public/penilaian-mitra/{klaim}      tampil form (validasi signature)
POST   /public/penilaian-mitra/{klaim}      submit nilai mitra
GET    /public/review-dpl/{klaim}           tampil form review final
POST   /public/review-dpl/{klaim}           submit keputusan + nilai DPL
```

---

## 4. FLOW APLIKASI (end-to-end)

```
1. Mahasiswa ajukan Magang → Admin Prodi verifikasi → status disetujui
2. (saat magang berjalan) Mahasiswa ajukan Usulan Konversi → DPL login & review
   → disetujui / revisi / ditolak
3. (saat magang selesai) Mahasiswa ajukan Klaim Konversi (dari usulan disetujui)
4. Sistem kirim signed link ke Mitra → Mitra isi nilai (tanpa login)
5. Sistem kirim signed link ke DPL → DPL approve/revisi/tolak + nilai (tanpa login)
6. Sistem hitung Nilai Akhir = 70%*Mitra + 30%*DPL
7. Sistem generate hasil konversi per MK
8. Admin Prodi export Excel; Kaprodi pantau dashboard
```

---

## 5. FITUR PER ROLE (checklist)

**Mahasiswa**
- [ ] Form pengajuan magang + upload dokumen
- [ ] Tracking status real-time
- [ ] Form usulan konversi (multi MK/CPMK)
- [ ] Form klaim konversi + upload logbook/laporan/sertifikat
- [ ] Riwayat & unduh hasil konversi

**DPL**
- [ ] Dashboard daftar usulan/klaim
- [ ] Review usulan (login)
- [ ] Review & nilai klaim final (via signed link, tanpa login)

**Mitra/Supervisor**
- [ ] Terima email otomatis
- [ ] Form penilaian via signed link (tanpa login)

**Admin Prodi**
- [ ] Verifikasi pengajuan magang
- [ ] CRUD master data MK & CPMK
- [ ] Monitoring seluruh proses
- [ ] Export Excel hasil konversi

**Kaprodi**
- [ ] Dashboard statistik (jumlah magang vs studi independen, mitra, progress status)

**Sistem**
- [ ] Notification + Queue kirim email otomatis
- [ ] Generate signed URL (expiry, mis. 7 hari)
- [ ] Hitung nilai akhir otomatis
- [ ] Log aktivitas otomatis (Model Observer → tabel `activity_log`)
- [ ] Export Excel (maatwebsite/excel)

---

## 6. ROADMAP HACKATHON (contoh 5 hari kerja)

| Hari | Fokus |
|---|---|
| 1 | Setup project Laravel+React, migration semua tabel, seeder dummy MK/CPMK/dosen, auth Sanctum + Google OAuth (Socialite) + middleware role |
| 2 | Modul Magang (pengajuan + verifikasi) & Usulan Konversi (mahasiswa + DPL review) |
| 3 | Modul Klaim Konversi + signed URL untuk Mitra & DPL, Notification/Mailable, Queue |
| 4 | Perhitungan nilai akhir, generate hasil konversi, export Excel, dashboard Kaprodi (Recharts) |
| 5 | Testing end-to-end, perbaikan UX (istilah usulan vs klaim dipisah jelas di UI), polish, siapkan demo/video |

---

## 7. Hal yang wajib ditekankan saat presentasi (sesuai poin kelemahan BIMA di brief)
1. Usulan & Klaim dipisah jadi 2 menu berbeda, tombol Klaim baru aktif kalau Usulan sudah `disetujui` — jadi mahasiswa tidak akan bingung urutan.
2. Status magang satu sumber data (`magangs.status`), tidak ada proses sinkronisasi manual antar sistem yang bisa gagal.
3. Approval DPL & Mitra pakai signed URL Laravel — cepat, aman, dan sesuai requirement "tanpa login".
4. Dashboard Kaprodi yang sebelumnya tidak ada di BIMA.
