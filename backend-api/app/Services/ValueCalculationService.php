<?php

namespace App\Services;

use App\Models\KlaimKonversi;
use App\Models\NilaiAkhir;

class ValueCalculationService
{
    public function calculate(KlaimKonversi $claim): NilaiAkhir
    {
        $mitra = (float) $claim->penilaianMitra()->latest()->value('nilai');
        $dpl = (float) $claim->penilaianDpl()->latest()->value('nilai_akademik');
        abort_if($mitra < 1 || $dpl < 1, 422, 'Nilai mitra dan DPL wajib tersedia.');
        $akhir = round($mitra * .7 + $dpl * .3, 2);
        $details = $claim->load('usulanKonversi.details.mataKuliah')->usulanKonversi->details;
        abort_if($details->isEmpty(), 422, 'Mapping mata kuliah belum tersedia.');
        $result = null;
        foreach ($details->groupBy('mata_kuliah_id') as $mataKuliahId => $mappedDetails) {
            $sks = (int) ($mappedDetails->first()->mataKuliah?->sks ?? 0);
            $result = $claim->nilaiAkhirs()->updateOrCreate(['mata_kuliah_id' => $mataKuliahId], ['nilai_mitra' => $mitra, 'nilai_dpl' => $dpl, 'nilai_akhir' => $akhir, 'nilai_huruf' => $this->letter($akhir), 'sks' => $sks, 'generated_at' => now()]);
        }
        return $result;
    }

    private function letter(float $value): string
    {
        return match (true) {
            $value >= 85 => 'A', $value >= 80 => 'AB', $value >= 70 => 'B', $value >= 65 => 'BC', $value >= 55 => 'C', $value >= 40 => 'D', default => 'E'
        };
    }
}
