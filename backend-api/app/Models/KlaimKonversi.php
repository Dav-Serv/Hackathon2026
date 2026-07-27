<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KlaimKonversi extends Model
{
    protected $fillable = ['usulan_konversi_id', 'magang_id', 'logbook_file', 'laporan_file', 'sertifikat_file', 'dokumen_lain_file', 'status'];

    public function usulanKonversi(): BelongsTo
    {
        return $this->belongsTo(UsulanKonversi::class);
    }

    public function magang(): BelongsTo
    {
        return $this->belongsTo(Magang::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(KlaimKonversiDetail::class);
    }

    public function penilaianMitra(): HasMany
    {
        return $this->hasMany(PenilaianMitra::class);
    }

    public function penilaianDpl(): HasMany
    {
        return $this->hasMany(PenilaianDpl::class);
    }

    public function nilaiAkhirs(): HasMany
    {
        return $this->hasMany(NilaiAkhir::class);
    }

    public function tokenApprovals(): HasMany
    {
        return $this->hasMany(TokenApproval::class);
    }
}
