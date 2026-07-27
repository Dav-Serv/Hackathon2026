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
        abort_if(! $mitra || ! $dpl, 422, 'Nilai mitra dan DPL wajib tersedia.');
        $akhir = round($mitra * .7 + $dpl * .3, 2);

        return $claim->nilaiAkhirs()->updateOrCreate(['mata_kuliah_id' => $claim->usulanKonversi->details()->value('mata_kuliah_id')], ['nilai_mitra' => $mitra, 'nilai_dpl' => $dpl, 'nilai_akhir' => $akhir, 'nilai_huruf' => $this->letter($akhir), 'sks' => 0, 'generated_at' => now()]);
    }

    private function letter(float $value): string
    {
        return match (true) {
            $value >= 85 => 'A', $value >= 80 => 'AB', $value >= 70 => 'B', $value >= 65 => 'BC', $value >= 55 => 'C', $value >= 40 => 'D', default => 'E'
        };
    }
}
