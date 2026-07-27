<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TokenApproval extends Model
{
    protected $fillable = ['klaim_konversi_id', 'role', 'target_role', 'recipient_email', 'token_hash', 'expired_at', 'expires_at', 'used_at', 'revoked_at', 'used_ip', 'used_user_agent'];

    protected function casts(): array
    {
        return ['expired_at' => 'datetime', 'expires_at' => 'datetime', 'used_at' => 'datetime', 'revoked_at' => 'datetime'];
    }

    public function klaimKonversi(): BelongsTo
    {
        return $this->belongsTo(KlaimKonversi::class);
    }
}
