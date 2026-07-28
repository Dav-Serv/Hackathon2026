<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MahasiswaDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $magangs = $user->magangsAsMahasiswa()
            ->with(['mitraIndustri', 'supervisorMitra', 'dpl'])
            ->latest()
            ->get();
        $usulans = $user->magangsAsMahasiswa()
            ->with(['usulanKonversis.details.mataKuliah', 'usulanKonversis.details.cpmk'])
            ->get()
            ->flatMap->usulanKonversis
            ->sortByDesc('created_at')
            ->values();
        $klaims = $user->magangsAsMahasiswa()
            ->with(['klaimKonversis.details', 'klaimKonversis.penilaianMitra', 'klaimKonversis.penilaianDpl', 'klaimKonversis.nilaiAkhirs.mataKuliah'])
            ->get()
            ->flatMap->klaimKonversis
            ->sortByDesc('created_at')
            ->values();
        $dpls = User::query()
            ->where('role', 'dpl')
            ->whereRaw('is_active IS TRUE')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return response()->json([
            'user' => $user,
            'dpls' => $dpls,
            'summary' => [
                'total_magang' => $magangs->count(),
                'total_usulan_konversi' => $usulans->count(),
                'total_klaim_konversi' => $klaims->count(),
                'total_nilai_akhir' => $klaims->sum(fn ($klaim) => $klaim->nilaiAkhirs->count()),
            ],
            'magangs' => $magangs,
            'usulan_konversis' => $usulans,
            'klaim_konversis' => $klaims,
        ]);
    }
}
