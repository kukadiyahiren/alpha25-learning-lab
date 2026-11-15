<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('worksheet2_questions', function (Blueprint $table) {
            $table->string('type', 30)->default('mcq')->after('sheet_id');
            $table->string('section', 150)->nullable()->after('type');
            $table->string('answer_text', 500)->nullable()->after('answer_index');
            $table->json('meta')->nullable()->after('answer_text');
        });
    }

    public function down(): void
    {
        Schema::table('worksheet2_questions', function (Blueprint $table) {
            $table->dropColumn(['type', 'section', 'answer_text', 'meta']);
        });
    }
};
