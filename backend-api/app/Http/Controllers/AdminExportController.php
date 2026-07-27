<?php

namespace App\Http\Controllers;

use App\Exports\HasilKonversiExport;
use App\Models\NilaiAkhir;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminExportController extends Controller
{
    public function hasilKonversi(Request $request): BinaryFileResponse
    {
        $query = NilaiAkhir::with(['klaimKonversi.magang.mahasiswa:id,name,nim_nip', 'mataKuliah'])->latest();
        if ($request->filled('mata_kuliah_id')) {
            $query->where('mata_kuliah_id', $request->integer('mata_kuliah_id'));
        }
        if ($request->filled('from')) {
            $query->whereDate('generated_at', '>=', $request->date('from'));
        }
        if ($request->filled('to')) {
            $query->whereDate('generated_at', '<=', $request->date('to'));
        }

        return Excel::download(new HasilKonversiExport($query), 'hasil-konversi-'.now()->format('Ymd_His').'.xlsx');
    }
}
