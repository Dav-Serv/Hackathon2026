<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NilaiAkhir extends Model
{
    protected $fillable = ['klaim_konversi_id', 'mata_kuliah_id', 'nilai_mitra', 'nilai_dpl', 'nilai_akhir', 'nilai_huruf', 'sks', 'generated_at'];

    protected function casts(): array
    {
        return ['nilai_mitra' => 'decimal:2', 'nilai_dpl' => 'decimal:2', 'nilai_akhir' => 'decimal:2', 'sks' => 'integer', 'generated_at' => 'datetime'];
    }

    public function klaimKonversi(): BelongsTo
    {
        return $this->belongsTo(KlaimKonversi::class);
    }

    public function mataKuliah(): BelongsTo
    {
        return $this->belongsTo(MataKuliah::class);
    }
}
