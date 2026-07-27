<?php

namespace Database\Seeders;

use App\Models\MitraIndustri;
use App\Models\SupervisorMitra;
use Illuminate\Database\Seeder;

class SupervisorMitraSeeder extends Seeder
{
    public function run(): void
    {
        $mitra = MitraIndustri::where('nama_perusahaan', 'PT Hackathon Industri')->firstOrFail();

        SupervisorMitra::updateOrCreate(
            ['email' => 'supervisor@hackathon.test'],
            [
                'mitra_industri_id' => $mitra->id,
                'nama' => 'Supervisor Mitra',
                'no_hp' => '081234567891',
            ],
        );
    }
}
