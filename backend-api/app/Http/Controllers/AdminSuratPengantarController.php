<?php

namespace App\Http\Controllers;

use App\Models\Magang;
use App\Models\SuratPengantar;
use Illuminate\Http\Request;

class AdminSuratPengantarController extends Controller
{
    public function index(Request $request) { return response()->json(SuratPengantar::with('magang.mahasiswa')->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))->latest()->paginate(15)); }

    public function issue(Request $request, SuratPengantar $suratPengantar)
    {
        abort_unless($suratPengantar->magang->status === 'disetujui', 422, 'Pengajuan magang belum disetujui.');
        $data = $request->validate([
            'status' => 'required|in:diproses,disetujui,ditolak',
            'catatan' => 'nullable|string|max:5000',
            'file' => 'required_if:status,disetujui|file|mimes:pdf|max:10240',
        ]);
        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('surat-pengantar/'.$suratPengantar->magang->mahasiswa_id, 'supabase');
        }
        unset($data['file']);
        $suratPengantar->update($data);

        return response()->json($suratPengantar->fresh());
    }
}
