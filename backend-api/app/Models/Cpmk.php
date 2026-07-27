<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cpmk extends Model
{
    protected $fillable = ['mata_kuliah_id', 'kode_cpmk', 'deskripsi'];

    public function mataKuliah(): BelongsTo
    {
        return $this->belongsTo(MataKuliah::class);
    }

    public function usulanKonversiDetails(): HasMany
    {
        return $this->hasMany(UsulanKonversiDetail::class);
    }
}
