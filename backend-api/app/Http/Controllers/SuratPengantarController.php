<?php

namespace App\Http\Controllers;

use App\Models\Magang;
use App\Models\SuratPengantar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SuratPengantarController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(SuratPengantar::with('magang')->whereHas('magang', fn ($q) => $q->where('mahasiswa_id', $request->user()->id))->latest()->get());
    }

    public function store(Request $request, Magang $magang): JsonResponse
    {
        abort_unless($magang->mahasiswa_id === $request->user()->id, 403);
        abort_unless($magang->status === 'disetujui', 422, 'Surat pengantar hanya dapat diproses setelah pengajuan magang disetujui admin.');

        $surat = SuratPengantar::firstOrCreate(
            ['magang_id' => $magang->id],
            ['status' => 'diajukan']
        );

        return response()->json($surat->fresh(), $surat->wasRecentlyCreated ? 201 : 200);
    }

    public function update(Request $request, SuratPengantar $suratPengantar): JsonResponse
    {
        abort_unless($suratPengantar->magang->mahasiswa_id === $request->user()->id, 403);
        abort(403, 'Status surat pengantar hanya dapat diubah admin.');
    }

    public function download(Request $request, SuratPengantar $suratPengantar): JsonResponse
    {
        abort_unless($suratPengantar->magang->mahasiswa_id === $request->user()->id || $request->user()->role === 'admin_prodi', 403);

        return response()->json(['url' => Storage::disk('supabase')->temporaryUrl($suratPengantar->file_path, now()->addMinutes(10))]);
    }
}
