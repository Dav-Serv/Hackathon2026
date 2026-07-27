<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('klaim_konversis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usulan_konversi_id')->constrained();
            $table->foreignId('magang_id')->constrained();
            $table->string('logbook_file');
            $table->string('laporan_file');
            $table->string('sertifikat_file');
            $table->string('dokumen_lain_file')->nullable();
            $table->enum('status', ['menunggu_penilaian_mitra', 'menunggu_review_dpl', 'revisi', 'disetujui', 'ditolak'])->default('menunggu_penilaian_mitra');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('klaim_konversis');
    }
};
