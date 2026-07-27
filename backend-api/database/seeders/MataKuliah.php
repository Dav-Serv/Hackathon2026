<?php

namespace Database\Seeders;

use App\Models\Cpmk;
use App\Models\MataKuliah as MataKuliahModel;
use Illuminate\Database\Seeder;
use RuntimeException;

class MataKuliah extends Seeder
{
    public function run(): void
    {
        $sources = [
            base_path('dataDummy/Copy of BIMA1.0.13-Konversi SKS MBKM Genap 25_26 - matkulmbkm-ganjil.csv'),
            base_path('dataDummy/Copy of BIMA1.0.13-Konversi SKS MBKM Genap 25_26 - matkulmbkm.csv'),
        ];
        $rows = [];

        foreach ($sources as $source) {
            if (! is_file($source)) {
                throw new RuntimeException('File dummy mata kuliah tidak ditemukan: '.$source);
            }

            $handle = fopen($source, 'rb');
            $headers = fgetcsv($handle);

            if ($handle === false || $headers === false) {
                throw new RuntimeException('File CSV mata kuliah tidak dapat dibaca: '.$source);
            }

            $headers = array_map(fn (string $header): string => trim($header), $headers);

            while (($row = fgetcsv($handle)) !== false) {
                if (count($row) !== count($headers)) {
                    continue;
                }

                $item = array_combine($headers, $row);
                $kode = trim((string) ($item['kode'] ?? ''));
                $kodeCpmk = trim((string) ($item['kode_cpmk'] ?? ''));
                $deskripsi = trim((string) ($item['deskripsi_cpmk'] ?? ''));

                if ($kode === '' || $kodeCpmk === '' || $deskripsi === '') {
                    continue;
                }

                $rows[$kode]['nama_mk'] = trim((string) $item['matkul']);
                $rows[$kode]['sks'] = (int) $item['sks'];
                $rows[$kode]['cpmks'][$kodeCpmk] = $deskripsi;
            }

            fclose($handle);
        }

        foreach ($rows as $kode => $item) {
            $mataKuliah = MataKuliahModel::updateOrCreate(
                ['kode_mk' => $kode],
                [
                    'nama_mk' => $item['nama_mk'],
                    'sks' => $item['sks'],
                    'sumber' => 'BIMA MBKM',
                ],
            );

            $mataKuliah->cpmks()->delete();

            foreach ($item['cpmks'] as $kodeCpmk => $deskripsi) {
                Cpmk::create([
                    'mata_kuliah_id' => $mataKuliah->id,
                    'kode_cpmk' => $kodeCpmk,
                    'deskripsi' => $deskripsi,
                ]);
            }
        }
    }
}
