<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MataKuliah extends Model
{
    protected $fillable = ['kode_mk', 'nama_mk', 'sks', 'sumber'];

    protected function casts(): array
    {
        return ['sks' => 'integer'];
    }

    public function cpmks(): HasMany
    {
        return $this->hasMany(Cpmk::class);
    }

    public function usulanKonversiDetails(): HasMany
    {
        return $this->hasMany(UsulanKonversiDetail::class);
    }

    public function nilaiAkhirs(): HasMany
    {
        return $this->hasMany(NilaiAkhir::class);
    }
}
