<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('group')->default('1-2');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grade_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('chapters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('body')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chapter_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->text('prompt');
            $table->text('answer')->nullable();
            $table->json('options')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('audio_stories', function (Blueprint $table) {
            $table->id();
            $table->string('language');
            $table->string('title');
            $table->text('body')->nullable();
            $table->string('audio_path')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('ebooks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('cover_path')->nullable();
            $table->string('file_path')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('worksheets', function (Blueprint $table) {
            $table->id();
            $table->string('grade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_path')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('gk_questions', function (Blueprint $table) {
            $table->id();
            $table->string('category');
            $table->text('question');
            $table->text('answer');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('spoken_english_lessons', function (Blueprint $table) {
            $table->id();
            $table->string('day_label');
            $table->string('topic');
            $table->text('script')->nullable();
            $table->string('audio_path')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('phonics_lessons', function (Blueprint $table) {
            $table->id();
            $table->string('day_label');
            $table->string('letter');
            $table->string('word');
            $table->string('audio_path')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phonics_lessons');
        Schema::dropIfExists('spoken_english_lessons');
        Schema::dropIfExists('gk_questions');
        Schema::dropIfExists('worksheets');
        Schema::dropIfExists('ebooks');
        Schema::dropIfExists('audio_stories');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('chapters');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('grades');
    }
};
