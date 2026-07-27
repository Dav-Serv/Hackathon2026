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
        $data = $request->validate(['file' => ['required', 'file', 'mimes:pdf', 'max:10240']]);
        $surat = SuratPengantar::updateOrCreate(['magang_id' => $magang->id], ['file_path' => $data['file']->store('surat-pengantar/'.$request->user()->id, 'supabase'), 'status' => 'diajukan']);

        return response()->json($surat, 201);
    }

    public function update(Request $request, SuratPengantar $suratPengantar): JsonResponse
    {
        abort_unless($suratPengantar->magang->mahasiswa_id === $request->user()->id, 403);
        $data = $request->validate(['status' => ['required', 'in:diproses,disetujui,ditolak'], 'catatan' => ['nullable', 'string', 'max:5000']]);
        $suratPengantar->update($data);

        return response()->json($suratPengantar->fresh());
    }

    public function download(Request $request, SuratPengantar $suratPengantar): JsonResponse
    {
        abort_unless($suratPengantar->magang->mahasiswa_id === $request->user()->id || $request->user()->role === 'admin_prodi', 403);

        return response()->json(['url' => Storage::disk('supabase')->temporaryUrl($suratPengantar->file_path, now()->addMinutes(10))]);
    }
}
