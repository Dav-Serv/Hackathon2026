<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KlaimKonversiDetail extends Model
{
    protected $fillable = ['klaim_konversi_id', 'usulan_konversi_detail_id', 'bukti_aktivitas_text', 'bukti_file'];

    public function klaimKonversi(): BelongsTo
    {
        return $this->belongsTo(KlaimKonversi::class);
    }

    public function usulanKonversiDetail(): BelongsTo
    {
        return $this->belongsTo(UsulanKonversiDetail::class);
    }
}
