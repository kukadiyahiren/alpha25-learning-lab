<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('worksheet2_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sheet_id')->constrained('worksheet2_sheets')->cascadeOnDelete();
            $table->string('student_name', 120);
            $table->string('grade', 20)->nullable();
            $table->unsignedInteger('score')->default(0);
            $table->unsignedInteger('total')->default(0);
            $table->unsignedTinyInteger('percent')->default(0);
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['sheet_id', 'created_at']);
            $table->index('student_name');
        });

        Schema::create('worksheet2_attempt_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attempt_id')->constrained('worksheet2_attempts')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('worksheet2_questions')->cascadeOnDelete();
            $table->integer('answer_index')->nullable();
            $table->string('answer_text', 500)->nullable();
            $table->json('answer_meta')->nullable();
            $table->boolean('is_correct')->default(false);
            $table->timestamps();

            $table->unique(['attempt_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('worksheet2_attempt_answers');
        Schema::dropIfExists('worksheet2_attempts');
    }
};
