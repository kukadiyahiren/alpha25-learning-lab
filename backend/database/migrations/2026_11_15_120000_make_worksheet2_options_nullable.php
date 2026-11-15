<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('worksheet2_questions')) {
            return;
        }

        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE worksheet2_questions MODIFY options JSON NULL');
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('worksheet2_questions')) {
            return;
        }

        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE worksheet2_questions MODIFY options JSON NOT NULL');
        }
    }
};
