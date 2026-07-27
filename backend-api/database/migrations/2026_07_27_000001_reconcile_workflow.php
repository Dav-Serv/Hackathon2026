<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('mahasiswa')->change();
            $table->boolean('is_active')->default(true)->after('role');
        });
        Schema::table('magangs', function (Blueprint $table) {
            $table->string('nomor_magang')->nullable()->unique()->after('id');
            $table->string('jenis_program')->default('magang')->after('dpl_id');
            $table->string('status')->default('draft')->change();
        });
    }

    public function down(): void
    {
        Schema::table('magangs', function (Blueprint $table) {
            $table->dropUnique(['nomor_magang']);
            $table->dropColumn(['nomor_magang', 'jenis_program']);
        });
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('is_active'));
    }
};
