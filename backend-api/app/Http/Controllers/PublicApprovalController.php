<?php

namespace App\Http\Controllers;

use App\Services\ApprovalTokenService;
use App\Services\ValueCalculationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PublicApprovalController extends Controller
{
    public function show(string $token, ApprovalTokenService $service): JsonResponse
    {
        $approval = $service->resolve($token);

        return response()->json(array_merge($approval->klaimKonversi->load(['magang.mahasiswa', 'magang.mitraIndustri'])->toArray(), ['approval_role' => $approval->target_role, 'expires_at' => $approval->expires_at]));
    }

    public function submitMitra(Request $request, string $token, ApprovalTokenService $service, ValueCalculationService $calculator): JsonResponse
    {
        return $this->submit($request->merge(['role' => 'mitra']), $token, $service, $calculator);
    }

    public function submitDpl(Request $request, string $token, ApprovalTokenService $service, ValueCalculationService $calculator): JsonResponse
    {
        return $this->submit($request->merge(['role' => 'dpl']), $token, $service, $calculator);
    }

    public function submit(Request $request, string $token, ApprovalTokenService $service, ValueCalculationService $calculator): JsonResponse
    {
        $approval = $service->resolve($token);
        if ($request->filled('role')) abort_unless($approval->target_role === $request->string('role')->toString(), 403, 'Token tidak sesuai target approval.');
        $data = $request->validate(['nilai' => ['required', 'integer', 'between:1,100'], 'komentar' => ['nullable', 'string', 'max:5000'], 'keputusan' => ['nullable', 'in:setuju,revisi,tolak'], 'nilai_akademik' => ['nullable', 'integer', 'between:1,100']]);
        DB::transaction(function () use ($approval, $data, $request, $calculator) {
            $claim = $approval->klaimKonversi()->lockForUpdate()->first();
            if ($approval->role === 'mitra') {
                $claim->penilaianMitra()->create(['nilai' => $data['nilai'], 'komentar' => $data['komentar'] ?? null, 'submitted_at' => now()]);
                $claim->update(['status' => 'menunggu_review_dpl']);
            } else {
                $claim->penilaianDpl()->create(['nilai_akademik' => $data['nilai_akademik'] ?? $data['nilai'], 'keputusan' => $data['keputusan'] ?? 'setuju', 'komentar' => $data['komentar'] ?? null, 'submitted_at' => now()]);
                $claim->update(['status' => ($data['keputusan'] ?? 'setuju') === 'setuju' ? 'disetujui' : (($data['keputusan'] ?? '') === 'revisi' ? 'revisi' : 'ditolak')]);
                if ($claim->status === 'disetujui') {
                    $calculator->calculate($claim->fresh('usulanKonversi.details'));
                }
            }
            $approval->update(['used_at' => now(), 'used_ip' => $request->ip(), 'used_user_agent' => $request->userAgent()]);
        });

        return response()->json(['message' => 'Approval berhasil diproses.']);
    }
}
