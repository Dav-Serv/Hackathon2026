<?php

namespace App\Http\Controllers;

use App\Models\Magang;
use App\Models\UsulanKonversi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class MahasiswaUsulanKonversiController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'magang_id' => ['required', 'exists:magangs,id'],
            'details' => ['required', 'array', 'min:1'],
            'details.*.mata_kuliah_id' => ['required', 'exists:mata_kuliahs,id'],
            'details.*.cpmk_id' => ['required', 'exists:cpmks,id'],
            'details.*.deskripsi_aktivitas_rencana' => ['required', 'string'],
        ]);
        foreach ($data['details'] as $detail) abort_unless(DB::table('cpmks')->where('id', $detail['cpmk_id'])->where('mata_kuliah_id', $detail['mata_kuliah_id'])->exists(), 422, 'CPMK tidak berasal dari mata kuliah yang dipilih.');
        $magang = Magang::whereKey($data['magang_id'])->where('mahasiswa_id', $request->user()->id)->where('status', 'disetujui')->firstOrFail();
        $usulan = DB::transaction(function () use ($data, $magang) {
            $usulan = $magang->usulanKonversis()->create();
            $usulan->details()->createMany($data['details']);

            return $usulan;
        });

        return response()->json($usulan->load('details'), 201);
    }

    public function show(Request $request, UsulanKonversi $usulanKonversi): JsonResponse
    {
        abort_unless($usulanKonversi->magang()->where('mahasiswa_id', $request->user()->id)->exists(), 403);

        return response()->json($usulanKonversi->load(['magang', 'details.mataKuliah', 'details.cpmk']));
    }

    public function update(Request $request, UsulanKonversi $usulanKonversi): JsonResponse
    {
        abort_unless($usulanKonversi->magang()->where('mahasiswa_id', $request->user()->id)->exists(), 403);
        abort_unless($usulanKonversi->status === 'revisi', 422);
        $data = $request->validate([
            'details' => ['required', 'array', 'min:1'],
            'details.*.mata_kuliah_id' => ['required', 'exists:mata_kuliahs,id'],
            'details.*.cpmk_id' => ['required', 'exists:cpmks,id'],
            'details.*.deskripsi_aktivitas_rencana' => ['required', 'string'],
        ]);
        foreach ($data['details'] as $detail) abort_unless(DB::table('cpmks')->where('id', $detail['cpmk_id'])->where('mata_kuliah_id', $detail['mata_kuliah_id'])->exists(), 422, 'CPMK tidak berasal dari mata kuliah yang dipilih.');
        DB::transaction(function () use ($data, $usulanKonversi) {
            $usulanKonversi->details()->delete();
            $usulanKonversi->details()->createMany($data['details']);
            $usulanKonversi->update(['status' => 'menunggu_persetujuan_dpl', 'catatan_dpl' => null]);
        });

        return response()->json($usulanKonversi->fresh()->load('details'));
    }
}
