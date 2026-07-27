<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TokenApproval extends Model
{
    protected $fillable = ['klaim_konversi_id', 'role', 'expired_at', 'used_at'];

    protected function casts(): array
    {
        return ['expired_at' => 'datetime', 'used_at' => 'datetime'];
    }

    public function klaimKonversi(): BelongsTo
    {
        return $this->belongsTo(KlaimKonversi::class);
    }
}
