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
        Schema::create('usulan_konversi_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usulan_konversi_id')->constrained()->cascadeOnDelete();
            $table->foreignId('mata_kuliah_id')->constrained();
            $table->foreignId('cpmk_id')->constrained();
            $table->text('deskripsi_aktivitas_rencana');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usulan_konversi_details');
    }
};
