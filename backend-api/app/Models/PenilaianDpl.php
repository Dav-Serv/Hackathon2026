<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PenilaianDpl extends Model
{
    protected $fillable = ['klaim_konversi_id', 'nilai_akademik', 'keputusan', 'komentar', 'submitted_at'];

    protected function casts(): array
    {
        return ['nilai_akademik' => 'integer', 'submitted_at' => 'datetime'];
    }

    public function klaimKonversi(): BelongsTo
    {
        return $this->belongsTo(KlaimKonversi::class);
    }
}
