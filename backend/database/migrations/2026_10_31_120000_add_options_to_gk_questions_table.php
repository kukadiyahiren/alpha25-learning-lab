<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('gk_questions', 'options')) {
            return;
        }

        Schema::table('gk_questions', function (Blueprint $table) {
            $table->json('options')->nullable()->after('answer');
        });
    }

    public function down(): void
    {
        Schema::table('gk_questions', function (Blueprint $table) {
            $table->dropColumn('options');
        });
    }
};
