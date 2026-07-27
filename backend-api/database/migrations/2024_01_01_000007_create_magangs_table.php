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
        Schema::create('magangs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mahasiswa_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('mitra_industri_id')->constrained();
            $table->foreignId('supervisor_mitra_id')->constrained();
            $table->foreignId('dpl_id')->constrained('users');
            $table->string('posisi');
            $table->date('periode_mulai');
            $table->date('periode_selesai');
            $table->string('proposal_file');
            $table->string('bukti_diterima_file');
            $table->enum('status', ['draft', 'menunggu_verifikasi', 'disetujui', 'ditolak'])->default('draft');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('magangs');
    }
};
