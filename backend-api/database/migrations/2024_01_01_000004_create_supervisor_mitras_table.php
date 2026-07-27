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
        Schema::create('supervisor_mitras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mitra_industri_id')->constrained()->cascadeOnDelete();
            $table->string('nama');
            $table->string('email');
            $table->string('no_hp')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supervisor_mitras');
    }
};
