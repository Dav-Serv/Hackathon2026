<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UsulanKonversiDetail extends Model
{
    protected $fillable = ['usulan_konversi_id', 'mata_kuliah_id', 'cpmk_id', 'deskripsi_aktivitas_rencana'];

    public function usulanKonversi(): BelongsTo
    {
        return $this->belongsTo(UsulanKonversi::class);
    }

    public function mataKuliah(): BelongsTo
    {
        return $this->belongsTo(MataKuliah::class);
    }

    public function cpmk(): BelongsTo
    {
        return $this->belongsTo(Cpmk::class);
    }

    public function klaimKonversiDetails(): HasMany
    {
        return $this->hasMany(KlaimKonversiDetail::class);
    }
}
