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
        Schema::create('klaim_konversi_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('klaim_konversi_id')->constrained()->cascadeOnDelete();
            $table->foreignId('usulan_konversi_detail_id')->constrained();
            $table->text('bukti_aktivitas_text');
            $table->string('bukti_file')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('klaim_konversi_details');
    }
};
