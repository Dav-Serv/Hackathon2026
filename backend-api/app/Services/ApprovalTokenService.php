<?php

namespace App\Services;

use App\Jobs\SendApprovalRequestEmail;
use App\Models\KlaimKonversi;
use App\Models\TokenApproval;
use Illuminate\Support\Str;

class ApprovalTokenService
{
    public function issue(KlaimKonversi $claim, string $role, ?string $email = null): string
    {
        if ($role === 'mitra' && ! $email) {
            $email = $claim->loadMissing('magang.supervisorMitra')->magang->supervisorMitra->email;
        }
        $plain = Str::random(64);
        $approval = TokenApproval::create(['klaim_konversi_id' => $claim->id, 'role' => $role, 'target_role' => $role, 'recipient_email' => $email, 'token_hash' => hash('sha256', $plain), 'expired_at' => now()->addDays(7), 'expires_at' => now()->addDays(7)]);
        if ($email) {
            SendApprovalRequestEmail::dispatch($approval, $plain);
        }

        return $plain;
    }

    public function resolve(string $plain): TokenApproval
    {
        $token = TokenApproval::where('token_hash', hash('sha256', $plain))->firstOrFail();
        abort_if($token->revoked_at || $token->used_at || ($token->expires_at ?? $token->expired_at)->isPast(), 410);

        return $token;
    }
}
