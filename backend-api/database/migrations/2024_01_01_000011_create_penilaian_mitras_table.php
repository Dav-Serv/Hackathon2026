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
        Schema::create('penilaian_mitras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('klaim_konversi_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('nilai');
            $table->text('komentar')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penilaian_mitras');
    }
};
