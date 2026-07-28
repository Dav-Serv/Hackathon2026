<?php

namespace App\Http\Controllers;

use App\Models\KlaimKonversi;
use App\Models\UsulanKonversi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\ApprovalTokenService;
use Illuminate\Support\Facades\DB;

class MahasiswaKlaimKonversiController extends Controller
{
    public function store(Request $request, ApprovalTokenService $approvalTokens): JsonResponse
    {
        $data = $request->validate([
            'usulan_konversi_id' => ['required', 'exists:usulan_konversis,id'],
            'logbook_file' => ['required', 'file', 'mimes:pdf', 'max:20480'],
            'laporan_file' => ['required', 'file', 'mimes:pdf', 'max:20480'],
            'sertifikat_file' => ['required', 'file', 'mimes:pdf', 'max:10240'],
            'dokumen_lain_file' => ['nullable', 'file', 'max:20480'],
            'details' => ['required', 'array', 'min:1'],
            'details.*.usulan_konversi_detail_id' => ['required', 'exists:usulan_konversi_details,id'],
            'details.*.bukti_aktivitas_text' => ['required', 'string'],
            'details.*.bukti_file' => ['nullable', 'file', 'max:10240'],
        ]);
        $usulan = UsulanKonversi::with('magang')
            ->whereKey($data['usulan_konversi_id'])
            ->where('status', 'disetujui')
            ->whereHas('magang', fn ($q) => $q->where('mahasiswa_id', $request->user()->id))
            ->first();
        abort_if(! $usulan, 422, 'Usulan konversi tidak ditemukan atau belum disetujui DPL.');
        $base = 'klaim/'.$request->user()->id;
        $files = ['logbook_file', 'laporan_file', 'sertifikat_file', 'dokumen_lain_file'];
        foreach ($files as $file) {
            if ($request->hasFile($file)) {
                $data[$file] = $request->file($file)->store($base, 'supabase');
            }
        }
        $details = $data['details'];
        unset($data['details']);
        $claim = DB::transaction(function () use ($data, $details, $usulan) {
            $claim = $usulan->klaimKonversis()->create(['magang_id' => $usulan->magang_id, ...$data]);
            $claim->details()->createMany($details);

            return $claim;
        });

        $claim->load('details');
        $approvalTokens->issue($claim, 'mitra');

        return response()->json($claim, 201);
    }

    public function update(Request $request, KlaimKonversi $klaimKonversi): JsonResponse
    {
        abort_unless($klaimKonversi->magang()->where('mahasiswa_id', $request->user()->id)->exists(), 403);
        abort_unless(in_array($klaimKonversi->status, ['draft', 'revisi'], true), 422);
        $data = $request->validate(['logbook_file' => ['sometimes', 'file', 'mimes:pdf', 'max:20480'], 'laporan_file' => ['sometimes', 'file', 'mimes:pdf', 'max:20480'], 'sertifikat_file' => ['sometimes', 'file', 'mimes:pdf', 'max:10240']]);
        foreach (array_keys($data) as $field) {
            $data[$field] = $request->file($field)->store('klaim/'.$request->user()->id, 'supabase');
        }
        $klaimKonversi->update($data);

        return response()->json($klaimKonversi->fresh());
    }

    public function result(Request $request, KlaimKonversi $klaimKonversi): JsonResponse
    {
        abort_unless($klaimKonversi->magang()->where('mahasiswa_id', $request->user()->id)->exists(), 403);

        return response()->json($klaimKonversi->load('nilaiAkhirs'));
    }

    public function show(Request $request, KlaimKonversi $klaimKonversi): JsonResponse
    {
        abort_unless($klaimKonversi->magang()->where('mahasiswa_id', $request->user()->id)->exists(), 403);

        return response()->json($klaimKonversi->load(['usulanKonversi.details', 'details']));
    }
}
