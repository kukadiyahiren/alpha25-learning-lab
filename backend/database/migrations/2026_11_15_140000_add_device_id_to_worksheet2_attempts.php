<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('worksheet2_attempts')) {
            return;
        }

        Schema::table('worksheet2_attempts', function (Blueprint $table) {
            if (! Schema::hasColumn('worksheet2_attempts', 'device_id')) {
                $table->string('device_id', 64)->nullable()->after('student_name');
            }
            if (! Schema::hasColumn('worksheet2_attempts', 'student_key')) {
                $table->string('student_key', 140)->nullable()->after('device_id');
            }
        });

        Schema::table('worksheet2_attempts', function (Blueprint $table) {
            $table->index(['sheet_id', 'device_id']);
            $table->index(['sheet_id', 'student_key']);
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('worksheet2_attempts')) {
            return;
        }

        Schema::table('worksheet2_attempts', function (Blueprint $table) {
            $table->dropIndex(['sheet_id', 'device_id']);
            $table->dropIndex(['sheet_id', 'student_key']);
            if (Schema::hasColumn('worksheet2_attempts', 'device_id')) {
                $table->dropColumn('device_id');
            }
            if (Schema::hasColumn('worksheet2_attempts', 'student_key')) {
                $table->dropColumn('student_key');
            }
        });
    }
};
