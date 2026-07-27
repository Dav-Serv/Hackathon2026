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
        Schema::create('usulan_konversis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('magang_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['menunggu_persetujuan_dpl', 'disetujui', 'revisi', 'ditolak'])->default('menunggu_persetujuan_dpl');
            $table->text('catatan_dpl')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usulan_konversis');
    }
};
