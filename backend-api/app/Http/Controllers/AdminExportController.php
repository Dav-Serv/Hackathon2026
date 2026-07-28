<?php

namespace App\Http\Controllers;

use App\Exports\HasilKonversiExport;
use App\Models\NilaiAkhir;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminExportController extends Controller
{
    private function hasilKonversiQuery(Request $request)
    {
        $query = NilaiAkhir::with(['klaimKonversi.magang.mahasiswa:id,name,nim_nip', 'mataKuliah'])->latest();
        if ($request->filled('mata_kuliah_id')) $query->where('mata_kuliah_id', $request->integer('mata_kuliah_id'));
        if ($request->filled('from')) $query->whereDate('generated_at', '>=', $request->date('from'));
        if ($request->filled('to')) $query->whereDate('generated_at', '<=', $request->date('to'));
        return $query;
    }

    public function hasilKonversi(Request $request): BinaryFileResponse
    {
        return Excel::download(new HasilKonversiExport($this->hasilKonversiQuery($request)), 'hasil-konversi-'.now()->format('Ymd_His').'.xlsx');
    }

    public function hasilKonversiJson(Request $request)
    {
        $data = $this->hasilKonversiQuery($request)->get()->map(function ($row) {
            $mahasiswa = $row->klaimKonversi?->magang?->mahasiswa;
            return [
                'nim' => $mahasiswa?->nim_nip,
                'mahasiswa' => $mahasiswa?->name,
                'kode_mk' => $row->mataKuliah?->kode_mk,
                'mata_kuliah' => $row->mataKuliah?->nama_mk,
                'sks' => $row->sks,
                'nilai_mitra' => $row->nilai_mitra,
                'nilai_dpl' => $row->nilai_dpl,
                'nilai_akhir' => $row->nilai_akhir,
                'nilai_huruf' => $row->nilai_huruf,
                'generated_at' => $row->generated_at?->toISOString(),
            ];
        });
        return response()->json(['data' => $data, 'meta' => ['total' => $data->count()]]);
    }
}
