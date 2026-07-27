<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            MataKuliah::class,
            MitraIndustriSeeder::class,
            SupervisorMitraSeeder::class,
        ]);

        $accounts = [
            [
                'name' => 'Mahasiswa',
                'nim_nip' => '24.11.6372',
                'email' => 'mahasiswa@students.amikom.ac.id',
                'role' => 'mahasiswa',
            ],
            [
                'name' => 'Dosen Pembimbing Lapangan',
                'nim_nip' => 'DPL001',
                'email' => 'dpl@amikom.ac.id',
                'role' => 'dpl',
            ],
            [
                'name' => 'Admin Prodi',
                'nim_nip' => 'ADMIN001',
                'email' => 'admin.prodi@amikom.ac.id',
                'role' => 'admin_prodi',
            ],
            [
                'name' => 'Kaprodi Informatika',
                'nim_nip' => 'KAPRODI001',
                'email' => 'kaprodi@amikom.ac.id',
                'role' => 'kaprodi',
            ],
        ];

        foreach ($accounts as $account) {
            User::updateOrCreate(
                ['email' => $account['email']],
                [
                    ...$account,
                    'no_hp' => '081234567890',
                    'alamat' => 'Universitas AMIKOM Yogyakarta',
                    'password' => Hash::make(env('SEEDER_DEFAULT_PASSWORD', 'Password123!')),
                    'email_verified_at' => now(),
                    ...($account['role'] === 'dpl' && Schema::hasColumn('users', 'is_active') ? ['is_active' => true] : []),
                ],
            );
        }
    }
}
