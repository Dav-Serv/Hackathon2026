<?php

namespace App\Services;

use App\Models\Dokumen;
use Illuminate\Support\Facades\Storage;

class PrivateDocumentService
{
    public function temporaryUrl(Dokumen $document, $user): string
    {
        $claim = $document->referensi_tabel === 'klaim_konversis' ? $document->klaimKonversi : null;
        abort_unless($claim && ($claim->magang->mahasiswa_id === $user->id || $claim->magang->dpl_id === $user->id || $user->role === 'admin_prodi'), 403);

        return Storage::disk('supabase')->temporaryUrl($document->path_file, now()->addMinutes(10));
    }
}
