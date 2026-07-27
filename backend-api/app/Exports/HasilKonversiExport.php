<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class HasilKonversiExport implements FromCollection, WithHeadings
{
    public function __construct(private $query) {}

    public function collection()
    {
        return $this->query->get()->map(function ($row) {
            $mahasiswa = $row->klaimKonversi?->magang?->mahasiswa;

            return [$mahasiswa?->nim_nip, $mahasiswa?->name, $row->mataKuliah?->kode_mk, $row->mataKuliah?->nama_mk, $row->sks, $row->nilai_mitra, $row->nilai_dpl, $row->nilai_akhir, $row->nilai_huruf, $row->generated_at?->toISOString()];
        });
    }

    public function headings(): array
    {
        return ['NIM', 'Mahasiswa', 'Kode MK', 'Mata Kuliah', 'SKS', 'Nilai Mitra', 'Nilai DPL', 'Nilai Akhir', 'Nilai Huruf', 'Generated At'];
    }
}
