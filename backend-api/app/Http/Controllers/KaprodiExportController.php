<?php

namespace App\Http\Controllers;

use App\Exports\HasilKonversiExport;
use App\Models\KlaimKonversi;
use App\Models\NilaiAkhir;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class KaprodiExportController extends Controller
{
    public function hasilKonversi(Request $request): BinaryFileResponse
    {
        $data = $request->validate([
            'jenis_program' => ['nullable', 'in:magang,studi_independen'],
            'status' => ['nullable', 'in:draft,menunggu_verifikasi,disetujui,ditolak'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'tahun_akademik' => ['nullable', 'integer', 'between:2000,2100'],
        ]);

        $query = NilaiAkhir::with(['klaimKonversi.magang.mahasiswa:id,name,nim_nip', 'mataKuliah'])
            ->whereHas('klaimKonversi', function ($claim) use ($data) {
                $claim->whereHas('magang', function ($magang) use ($data) {
                    $magang->when($data['jenis_program'] ?? null, fn ($query, $value) => $query->where('jenis_program', $value))
                        ->when($data['status'] ?? null, fn ($query, $value) => $query->where('status', $value))
                        ->when($data['from'] ?? null, fn ($query, $value) => $query->whereDate('periode_mulai', '>=', $value))
                        ->when($data['to'] ?? null, fn ($query, $value) => $query->whereDate('periode_selesai', '<=', $value));
                });
            })
            ->when($data['tahun_akademik'] ?? null, fn ($query, $year) => $query->whereYear('generated_at', $year))
            ->latest();

        return Excel::download(new HasilKonversiExport($query), 'laporan-kaprodi-'.now()->format('Ymd_His').'.xlsx');
    }
}
