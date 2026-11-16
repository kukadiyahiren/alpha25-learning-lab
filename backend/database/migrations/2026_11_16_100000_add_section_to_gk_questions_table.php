<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('gk_questions')) {
            return;
        }

        if (! Schema::hasColumn('gk_questions', 'section')) {
            Schema::table('gk_questions', function (Blueprint $table) {
                $table->string('section', 40)->default('general')->after('id');
                $table->index(['section', 'sort_order']);
            });
        }

        DB::table('gk_questions')
            ->where(function ($query) {
                $query->whereNull('section')->orWhere('section', '');
            })
            ->update(['section' => 'general']);
    }

    public function down(): void
    {
        if (! Schema::hasTable('gk_questions') || ! Schema::hasColumn('gk_questions', 'section')) {
            return;
        }

        Schema::table('gk_questions', function (Blueprint $table) {
            $table->dropIndex(['section', 'sort_order']);
            $table->dropColumn('section');
        });
    }
};
