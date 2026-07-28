<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Magang extends Model
{
    protected $fillable = ['nomor_magang', 'mahasiswa_id', 'mitra_industri_id', 'supervisor_mitra_id', 'dpl_id', 'jenis_program', 'posisi', 'periode_mulai', 'periode_selesai', 'proposal_file', 'bukti_diterima_file', 'status'];

    protected function casts(): array
    {
        return ['periode_mulai' => 'date', 'periode_selesai' => 'date'];
    }

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mahasiswa_id');
    }

    public function dpl(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dpl_id');
    }

    public function mitraIndustri(): BelongsTo
    {
        return $this->belongsTo(MitraIndustri::class);
    }

    public function supervisorMitra(): BelongsTo
    {
        return $this->belongsTo(SupervisorMitra::class);
    }

    public function dokumens(): HasMany
    {
        return $this->hasMany(Dokumen::class, 'referensi_id')->where('referensi_tabel', 'magangs');
    }

    public function usulanKonversis(): HasMany
    {
        return $this->hasMany(UsulanKonversi::class);
    }

    public function klaimKonversis(): HasMany
    {
        return $this->hasMany(KlaimKonversi::class);
    }
}
