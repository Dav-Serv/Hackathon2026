<?php

namespace App\Http\Controllers;

use App\Models\KlaimKonversi;
use App\Models\UsulanKonversi;
use App\Services\ValueCalculationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class DplReviewController extends Controller
{
    public function usulanIndex(Request $request): JsonResponse
    {
        $usulans = UsulanKonversi::query()
            ->with(['magang.mahasiswa', 'magang.mitraIndustri', 'magang.supervisorMitra', 'details.mataKuliah', 'details.cpmk'])
            ->whereIn('status', ['menunggu_persetujuan_dpl', 'disetujui', 'revisi', 'ditolak'])
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
            ->with(['magang.mahasiswa', 'magang.mitraIndustri', 'magang.supervisorMitra', 'usulanKonversi.details.mataKuliah', 'details', 'penilaianMitra', 'penilaianDpl'])
            ->where('status', 'menunggu_review_dpl')
            ->whereHas('magang', fn ($query) => $query->where('dpl_id', $request->user()->id))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($klaims);
    }

    public function document(Request $request, KlaimKonversi $klaimKonversi, string $jenis): JsonResponse
    {
        abort_unless($klaimKonversi->magang()->where('dpl_id', $request->user()->id)->exists(), 403);
        abort_unless(in_array($jenis, ['logbook_file', 'laporan_file', 'sertifikat_file'], true), 404);
        $path = $klaimKonversi->{$jenis};
        abort_unless($path, 404, 'Dokumen tidak tersedia.');

        return response()->json(['url' => Storage::disk('supabase')->temporaryUrl($path, now()->addMinutes(10))]);
    }

    public function reviewKlaim(Request $request, KlaimKonversi $klaimKonversi, ValueCalculationService $calculator): JsonResponse
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

            return $klaim->fresh()->load(['magang.mahasiswa', 'usulanKonversi.details.mataKuliah', 'details', 'penilaianMitra', 'penilaianDpl', 'penilaianDpl']);
        });

        if ($klaimKonversi->status === 'disetujui') $calculator->calculate($klaimKonversi->fresh());
        return response()->json($klaimKonversi->fresh()->load(['magang.mahasiswa', 'usulanKonversi.details.mataKuliah', 'details', 'penilaianMitra', 'penilaianDpl', 'penilaianDpl', 'nilaiAkhirs']));
    }
}
