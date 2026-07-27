<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $columns = ['target_role', 'recipient_email', 'token_hash', 'expires_at', 'revoked_at', 'used_ip', 'used_user_agent'];
        Schema::table('token_approvals', function (Blueprint $table) {
            if (! Schema::hasColumn('token_approvals', 'target_role')) {
                $table->string('target_role')->nullable();
            }
            if (! Schema::hasColumn('token_approvals', 'recipient_email')) {
                $table->string('recipient_email')->nullable();
            }
            if (! Schema::hasColumn('token_approvals', 'token_hash')) {
                $table->string('token_hash')->nullable()->index();
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
        Schema::table('token_approvals', function (Blueprint $table) {
            foreach (['target_role', 'recipient_email', 'token_hash', 'expires_at', 'revoked_at', 'used_ip', 'used_user_agent'] as $column) {
                if (Schema::hasColumn('token_approvals', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
