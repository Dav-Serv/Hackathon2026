<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('surat_pengantars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('magang_id')->constrained()->cascadeOnDelete();
            $table->string('file_path')->nullable();
            $table->string('status')->default('draft');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
        Schema::create('penilaian_cpmks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('klaim_konversi_id')->constrained()->cascadeOnDelete();
            $table->foreignId('cpmk_id')->constrained()->restrictOnDelete();
            $table->unsignedTinyInteger('nilai');
            $table->text('komentar')->nullable();
            $table->timestamps();
            $table->unique(['klaim_konversi_id', 'cpmk_id']);
        });
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->nullableMorphs('subject');
            $table->json('metadata')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });
        Schema::table('token_approvals', function (Blueprint $table) {
            if (! Schema::hasColumn('token_approvals', 'token_hash')) {
                $table->string('token_hash')->nullable()->unique();
            }
            if (! Schema::hasColumn('token_approvals', 'target_role')) {
                $table->string('target_role')->nullable();
            }
            if (! Schema::hasColumn('token_approvals', 'recipient_email')) {
                $table->string('recipient_email')->nullable();
            }
            if (! Schema::hasColumn('token_approvals', 'expires_at')) {
                $table->timestamp('expires_at')->nullable();
            }
            if (! Schema::hasColumn('token_approvals', 'revoked_at')) {
                $table->timestamp('revoked_at')->nullable();
            }
            if (! Schema::hasColumn('token_approvals', 'used_ip')) {
                $table->ipAddress('used_ip')->nullable();
            }
            if (! Schema::hasColumn('token_approvals', 'used_user_agent')) {
                $table->text('used_user_agent')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('penilaian_cpmks');
        Schema::dropIfExists('surat_pengantars');
        Schema::table('token_approvals', function (Blueprint $table) {
            $table->dropColumn(['token_hash', 'target_role', 'recipient_email', 'expires_at', 'revoked_at', 'used_ip', 'used_user_agent']);
        });
    }
};
