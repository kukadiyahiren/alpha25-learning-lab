<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('worksheet2_sheets', function (Blueprint $table) {
            $table->id();
            $table->string('grade', 20);
            $table->string('subject', 50);
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedInteger('marks')->default(20);
            $table->string('time_label')->default('20 મિનિટ');
            $table->string('icon', 16)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['grade', 'subject']);
        });

        Schema::create('worksheet2_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sheet_id')->constrained('worksheet2_sheets')->cascadeOnDelete();
            $table->text('question');
            $table->json('options');
            $table->unsignedTinyInteger('answer_index')->default(0);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('worksheet2_questions');
        Schema::dropIfExists('worksheet2_sheets');
    }
};
