<?php

namespace Database\Seeders;

use App\Models\MitraIndustri;
use Illuminate\Database\Seeder;

class MitraIndustriSeeder extends Seeder
{
    public function run(): void
    {
        MitraIndustri::updateOrCreate(
            ['nama_perusahaan' => 'PT Hackathon Industri'],
            [
                'alamat' => 'Yogyakarta',
                'bidang' => 'Teknologi Informasi',
            ],
        );
    }
}
