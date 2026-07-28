<?php

namespace App\Http\Controllers;

use App\Models\KlaimKonversi;
use App\Models\Magang;
use App\Models\MitraIndustri;
use App\Models\NilaiAkhir;
use App\Models\User;
use App\Models\UsulanKonversi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class KaprodiDashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $program = $request->string('jenis_program')->toString();
        $status = $request->string('status')->toString();
        $magangQuery = Magang::query()->when($program, fn ($q) => $q->where('jenis_program', $program))->when($status, fn ($q) => $q->where('status', $status));
        $magangIds = (clone $magangQuery)->pluck('id');
        $roleCounts = User::query()
            ->selectRaw('role, COUNT(*) as total')
            ->groupBy('role')
            ->pluck('total', 'role');

        $magangStatus = $this->statusDistribution((clone $magangQuery), [
            'draft',
            'menunggu_verifikasi',
            'disetujui',
            'ditolak',
        ]);
        $usulanQuery = UsulanKonversi::query()->whereIn('magang_id', $magangIds);
        $usulanStatus = $this->statusDistribution((clone $usulanQuery), [
            'menunggu_persetujuan_dpl',
            'disetujui',
            'revisi',
            'ditolak',
        ]);
        $klaimQuery = KlaimKonversi::query()->whereIn('magang_id', $magangIds);
        $klaimStatus = $this->statusDistribution((clone $klaimQuery), [
            'menunggu_penilaian_mitra',
            'menunggu_review_dpl',
            'revisi',
            'disetujui',
            'ditolak',
        ]);

        $nilai = NilaiAkhir::query()->whereHas('klaimKonversi', fn ($query) => $query->whereIn('magang_id', $magangIds));

        return response()->json([
            'summary' => [
                'total_users' => User::count(),
                'users_by_role' => $roleCounts,
                'total_magang' => (clone $magangQuery)->count(),
                'total_mitra' => MitraIndustri::count(),
                'total_usulan_konversi' => (clone $usulanQuery)->count(),
                'total_klaim_konversi' => (clone $klaimQuery)->count(),
                'total_nilai_akhir' => (clone $nilai)->count(),
            ],
            'magang' => [
                'total' => (clone $magangQuery)->count(),
                'status_distribution' => $magangStatus,
            ],
            'usulan_konversi' => [
                'total' => (clone $usulanQuery)->count(),
                'status_distribution' => $usulanStatus,
            ],
            'klaim_konversi' => [
                'total' => (clone $klaimQuery)->count(),
                'status_distribution' => $klaimStatus,
            ],
            'nilai_akhir' => [
                'total' => (clone $nilai)->count(),
                'rata_rata' => (clone $nilai)->avg('nilai_akhir'),
                'nilai_akhir_minimum' => (clone $nilai)->min('nilai_akhir'),
                'nilai_akhir_maksimum' => (clone $nilai)->max('nilai_akhir'),
                'total_sks' => (clone $nilai)->sum('sks'),
                'nilai_huruf_distribution' => (clone $nilai)
                    ->selectRaw('nilai_huruf, COUNT(*) as total')
                    ->groupBy('nilai_huruf')
                    ->pluck('total', 'nilai_huruf'),
            ],
            'directory' => [
                'pengguna' => User::query()->select('id', 'name', 'email', 'role')->orderBy('name')->limit(50)->get(),
                'magang' => (clone $magangQuery)->with('mahasiswa:id,name,nim_nip')->latest()->limit(50)->get(['id', 'mahasiswa_id', 'nomor_magang', 'jenis_program', 'status']),
                'mitra' => MitraIndustri::query()->orderBy('nama_perusahaan')->limit(50)->get(['id', 'nama_perusahaan', 'bidang']),
                'usulan' => (clone $usulanQuery)->with('magang.mahasiswa:id,name,nim_nip')->latest()->limit(50)->get(),
                'klaim' => (clone $klaimQuery)->with('magang.mahasiswa:id,name,nim_nip')->latest()->limit(50)->get(),
                'nilai' => (clone $nilai)->with(['klaimKonversi.magang.mahasiswa:id,name,nim_nip', 'mataKuliah:id,kode_mk,nama_mk'])->latest()->limit(50)->get(),
            ],
            'recent' => [
                'magang' => (clone $magangQuery)->with(['mahasiswa:id,name,nim_nip', 'mitraIndustri:id,nama_perusahaan'])
                    ->latest()->limit(5)->get(),
                'usulan_konversi' => (clone $usulanQuery)->with(['magang.mahasiswa:id,name,nim_nip'])
                    ->latest()->limit(5)->get(),
                'klaim_konversi' => (clone $klaimQuery)->with(['magang.mahasiswa:id,name,nim_nip'])
                    ->latest()->limit(5)->get(),
                'nilai_akhir' => (clone $nilai)->with(['klaimKonversi.magang.mahasiswa:id,name,nim_nip', 'mataKuliah:id,kode_mk,nama_mk'])
                    ->latest()->limit(5)->get(),
            ],
        ]);
    }

    private function statusDistribution($query, array $statuses): Collection
    {
        $counts = $query
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return collect($statuses)->mapWithKeys(fn (string $status) => [$status => (int) ($counts[$status] ?? 0)]);
    }
}
