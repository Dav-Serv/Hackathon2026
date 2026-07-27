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
        Schema::create('nilai_akhirs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('klaim_konversi_id')->constrained();
            $table->foreignId('mata_kuliah_id')->constrained();
            $table->decimal('nilai_mitra', 5, 2);
            $table->decimal('nilai_dpl', 5, 2);
            $table->decimal('nilai_akhir', 5, 2);
            $table->string('nilai_huruf', 2);
            $table->unsignedTinyInteger('sks');
            $table->timestamp('generated_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nilai_akhirs');
    }
};
