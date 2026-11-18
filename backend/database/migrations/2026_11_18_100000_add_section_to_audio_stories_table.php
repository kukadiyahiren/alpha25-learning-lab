<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('audio_stories')) {
            return;
        }

        if (! Schema::hasColumn('audio_stories', 'section')) {
            Schema::table('audio_stories', function (Blueprint $table) {
                $table->string('section', 40)->default('story')->after('id');
                $table->index(['section', 'sort_order']);
            });
        }

        DB::table('audio_stories')
            ->where(function ($query) {
                $query->whereNull('section')->orWhere('section', '');
            })
            ->update(['section' => 'story']);
    }

    public function down(): void
    {
        if (! Schema::hasTable('audio_stories') || ! Schema::hasColumn('audio_stories', 'section')) {
            return;
        }

        Schema::table('audio_stories', function (Blueprint $table) {
            $table->dropIndex(['section', 'sort_order']);
            $table->dropColumn('section');
        });
    }
};
