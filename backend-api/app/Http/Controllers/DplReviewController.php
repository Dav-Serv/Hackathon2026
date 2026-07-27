<?php

namespace App\Http\Controllers;

use App\Models\KlaimKonversi;
use App\Models\UsulanKonversi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class DplReviewController extends Controller
{
    public function usulanIndex(Request $request): JsonResponse
    {
        $usulans = UsulanKonversi::query()
            ->with(['magang.mahasiswa', 'details.mataKuliah', 'details.cpmk'])
            ->where('status', 'menunggu_persetujuan_dpl')
            ->whereHas('magang', fn ($query) => $query->where('dpl_id', $request->user()->id))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($usulans);
    }

    public function reviewUsulan(Request $request, UsulanKonversi $usulanKonversi): JsonResponse
    {
        abort_unless($usulanKonversi->magang()->where('dpl_id', $request->user()->id)->exists(), 403);

        $data = $request->validate([
            'keputusan' => ['required', Rule::in(['approve', 'revisi', 'tolak'])],
            'catatan' => ['nullable', 'string', 'max:5000', Rule::requiredIf(fn () => in_array($request->input('keputusan'), ['revisi', 'tolak'], true))],
        ]);

        $usulanKonversi = DB::transaction(function () use ($data, $request, $usulanKonversi) {
            $usulan = UsulanKonversi::query()->lockForUpdate()->findOrFail($usulanKonversi->id);
            abort_unless($usulan->status === 'menunggu_persetujuan_dpl', 422);
            $usulan->update([
                'status' => ['approve' => 'disetujui', 'revisi' => 'revisi', 'tolak' => 'ditolak'][$data['keputusan']],
                'catatan_dpl' => $data['catatan'] ?? null,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);

            return $usulan->fresh()->load(['magang.mahasiswa', 'details.mataKuliah', 'details.cpmk']);
        });

        return response()->json($usulanKonversi);
    }

    public function klaimIndex(Request $request): JsonResponse
    {
        $klaims = KlaimKonversi::query()
            ->with(['magang.mahasiswa', 'usulanKonversi.details.mataKuliah', 'details', 'penilaianMitra'])
            ->where('status', 'menunggu_review_dpl')
            ->whereHas('magang', fn ($query) => $query->where('dpl_id', $request->user()->id))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($klaims);
    }

    public function reviewKlaim(Request $request, KlaimKonversi $klaimKonversi): JsonResponse
    {
        abort_unless($klaimKonversi->magang()->where('dpl_id', $request->user()->id)->exists(), 403);

        $data = $request->validate([
            'keputusan' => ['required', Rule::in(['setuju', 'revisi', 'tolak'])],
            'nilai_akademik' => ['required', 'integer', 'between:0,100'],
            'komentar' => ['nullable', 'string', 'max:5000', Rule::requiredIf(fn () => in_array($request->input('keputusan'), ['revisi', 'tolak'], true))],
        ]);

        $klaimKonversi = DB::transaction(function () use ($data, $klaimKonversi) {
            $klaim = KlaimKonversi::query()->lockForUpdate()->findOrFail($klaimKonversi->id);
            abort_unless($klaim->status === 'menunggu_review_dpl', 422);
            $klaim->penilaianDpl()->create([
                'nilai_akademik' => $data['nilai_akademik'],
                'keputusan' => $data['keputusan'],
                'komentar' => $data['komentar'] ?? null,
                'submitted_at' => now(),
            ]);
            $klaim->update(['status' => ['setuju' => 'disetujui', 'revisi' => 'revisi', 'tolak' => 'ditolak'][$data['keputusan']]]);

            return $klaim->fresh()->load(['magang.mahasiswa', 'usulanKonversi.details.mataKuliah', 'details', 'penilaianMitra', 'penilaianDpl']);
        });

        return response()->json($klaimKonversi);
    }
}
